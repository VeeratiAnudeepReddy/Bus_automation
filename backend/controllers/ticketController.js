const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const config = require('../config');
const User = require('../models/User');
const Ticket = require('../models/Ticket');
const Route = require('../models/Route');
const { resolveOrganizationId } = require('../utils/defaultOrganization');
const { calculateFare } = require('../services/pricingService');
const { recordWalletTransaction } = require('../services/walletService');
const BookingHistory = require('../models/BookingHistory');
const Invoice = require('../models/Invoice');
const Receipt = require('../models/Receipt');

const TICKET_PRICE = Number(config.FARE) || 20;
const MAX_TICKETS_PER_BOOKING = 20;
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const uuidExtractRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
const normalizeStop = (value) => String(value || '').trim();
const normalizeStopLower = (value) => normalizeStop(value).toLowerCase();

const parseTicketCoords = (coords, fallbackCoords = null) => {
  const input = coords || fallbackCoords;
  if (!input || typeof input !== 'object') {
    return null;
  }

  const lat = Number(input.lat);
  const lng = Number(input.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  return { lat, lng };
};

const parseTicketIdFromScan = (input) => {
  if (!input || typeof input !== 'string') {
    return null;
  }

  const trimmedInput = input.trim();
  if (uuidRegex.test(trimmedInput)) {
    return trimmedInput;
  }

  const directMatch = trimmedInput.match(uuidExtractRegex);
  if (directMatch) {
    return directMatch[0];
  }

  try {
    const parsed = JSON.parse(trimmedInput);
    if (parsed && typeof parsed.ticketId === 'string') {
      const parsedTicketId = parsed.ticketId.trim();
      if (uuidRegex.test(parsedTicketId)) {
        return parsedTicketId;
      }
      const parsedMatch = parsedTicketId.match(uuidExtractRegex);
      return parsedMatch ? parsedMatch[0] : null;
    }
  } catch {
    return null;
  }

  return null;
};

exports.bookTickets = async (req, res) => {
  const session = await mongoose.startSession();
  let n = 1;
  let ticketFare = TICKET_PRICE;
  let totalAmount = 0;

  try {
    n = Number(req.body.count ?? 1);
    if (!Number.isInteger(n) || n <= 0) {
      return res.status(400).json({ error: 'count must be a positive integer' });
    }
    if (n > MAX_TICKETS_PER_BOOKING) {
      return res.status(400).json({ error: `count cannot exceed ${MAX_TICKETS_PER_BOOKING}` });
    }

    let selectedRoute = null;
    let from = null;
    let to = null;
    let fromCoords = null;
    let toCoords = null;

    const routeId = normalizeStop(req.body.routeId);
    const fromInput = normalizeStop(req.body.from);
    const toInput = normalizeStop(req.body.to);
    const wantsRouteAwareBooking = Boolean(routeId || fromInput || toInput);
    const organizationId = await resolveOrganizationId(req.user);

    if (wantsRouteAwareBooking) {
      if (routeId) {
        selectedRoute = await Route.findOne({ _id: routeId, active: true, organizationId }).lean();
      } else if (fromInput && toInput) {
        selectedRoute = await Route.findOne({
          organizationId,
          active: true,
          fromNormalized: normalizeStopLower(fromInput),
          toNormalized: normalizeStopLower(toInput)
        }).lean();
      }

      if (!selectedRoute) {
        return res.status(400).json({ error: 'Selected route is unavailable' });
      }

      ticketFare = selectedRoute.fare;
      from = selectedRoute.from;
      to = selectedRoute.to;
      fromCoords = parseTicketCoords(req.body.fromCoords, selectedRoute.fromCoords);
      toCoords = parseTicketCoords(req.body.toCoords, selectedRoute.toCoords);
    }

    const passengerType = req.body.passengerType || 'adult';
    const pricing = await calculateFare({
      organizationId,
      baseFare: ticketFare,
      routeId: selectedRoute?._id || null,
      passengerType,
      couponCode: req.body.couponCode || null,
      userId: req.user._id,
      count: n
    });
    if (!pricing.valid) {
      return res.status(400).json({ error: pricing.error });
    }

    ticketFare = pricing.fare;
    totalAmount = pricing.totalAmount;
    const bookingId = `BK-${Date.now()}-${uuidv4().slice(0, 8)}`;
    const qrExpiresAt = new Date(Date.now() + 30 * 60 * 1000);
    const nowIso = new Date().toISOString();

    const ticketDrafts = Array.from({ length: n }, () => {
      const ticketId = uuidv4();
      return {
        ticketId,
        bookingId,
        userId: req.user._id,
        routeId: selectedRoute?._id || null,
        organizationId,
        from,
        to,
        passengerType,
        status: 'ACTIVE',
        fare: ticketFare,
        qrExpiresAt,
        fromCoords,
        toCoords,
        qrPayload: {
          ticketId,
          userId: String(req.user._id),
          timestamp: nowIso,
          routeId: selectedRoute ? String(selectedRoute._id) : null,
          from,
          to,
          fare: ticketFare,
          expiresAt: qrExpiresAt.toISOString(),
          encrypted: true
        }
      };
    });

    const qrImages = await Promise.all(
      ticketDrafts.map((t) =>
        QRCode.toDataURL(JSON.stringify(t.qrPayload), {
          errorCorrectionLevel: 'H',
          type: 'image/png',
          width: 300,
          margin: 2
        })
      )
    );

    let walletTransaction;
    let createdTickets = [];

    await session.withTransaction(async () => {
      walletTransaction = await recordWalletTransaction({
        organizationId,
        userId: req.user._id,
        type: 'debit',
        amount: totalAmount,
        referenceType: 'booking',
        referenceId: bookingId,
        notes: 'Ticket booking',
        session
      });
      createdTickets = await Ticket.insertMany(ticketDrafts, { session });
      await BookingHistory.create(
        [{ organizationId, bookingId, userId: req.user._id, action: 'created', after: { count: n, pricing } }],
        { session }
      );
      await Invoice.create(
        [{
          organizationId,
          bookingId,
          userId: req.user._id,
          invoiceNumber: `INV-${Date.now()}`,
          subtotal: pricing.subtotal,
          tax: 0,
          total: pricing.totalAmount,
          lineItems: [{ label: from && to ? `${from} to ${to}` : 'Bus ticket', quantity: n, amount: pricing.totalAmount }]
        }],
        { session }
      );
      await Receipt.create(
        [{ organizationId, bookingId, userId: req.user._id, receiptNumber: `RCT-${Date.now()}`, amount: pricing.totalAmount, method: 'wallet' }],
        { session }
      );
    });

    return res.status(200).json({
      ticketPrice: ticketFare,
      count: n,
      totalAmount,
      discount: pricing.discount,
      coupon: pricing.coupon,
      bookingId,
      balance: walletTransaction.balanceAfter,
      tickets: createdTickets.map((ticket, index) => ({
        ticketId: ticket.ticketId,
        bookingId: ticket.bookingId,
        userId: ticket.userId,
        routeId: ticket.routeId,
        from: ticket.from,
        to: ticket.to,
        passengerType: ticket.passengerType,
        status: ticket.status,
        fare: ticket.fare,
        fromCoords: ticket.fromCoords,
        toCoords: ticket.toCoords,
        createdAt: ticket.createdAt,
        qrPayload: ticket.qrPayload,
        qr: qrImages[index]
      }))
    });
  } catch (error) {
    if (error.message === 'INSUFFICIENT_BALANCE') {
      const latestUser = await User.findById(req.user._id).select('balance').lean();
      return res.status(400).json({
        error: 'Insufficient balance',
        balance: latestUser?.balance ?? 0,
        required: totalAmount || n * ticketFare
      });
    }

    console.error('Book tickets error:', error.message);
    return res.status(500).json({ error: 'Failed to book tickets' });
  } finally {
    await session.endSession();
  }
};

exports.getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    const ticketsWithQr = await Promise.all(
      tickets.map(async (ticket) => ({
        ticketId: ticket.ticketId,
        bookingId: ticket.bookingId,
        userId: ticket.userId,
        routeId: ticket.routeId,
        from: ticket.from || null,
        to: ticket.to || null,
        passengerType: ticket.passengerType || 'adult',
        status: ticket.status,
        fare: ticket.fare,
        fromCoords: ticket.fromCoords || null,
        toCoords: ticket.toCoords || null,
        createdAt: ticket.createdAt,
        scannedAt: ticket.scannedAt,
        qrPayload: ticket.qrPayload,
        qr: await QRCode.toDataURL(JSON.stringify(ticket.qrPayload), {
          errorCorrectionLevel: 'H',
          type: 'image/png',
          width: 300,
          margin: 2
        })
      }))
    );

    return res.status(200).json({
      balance: req.user.balance,
      total: ticketsWithQr.length,
      tickets: ticketsWithQr
    });
  } catch (error) {
    console.error('Get my tickets error:', error.message);
    return res.status(500).json({ error: 'Failed to fetch tickets' });
  }
};

exports.scanTicket = async (req, res) => {
  try {
    const ticketId = parseTicketIdFromScan(req.body.scannedData);
    if (!ticketId) {
      return res.status(400).json({ error: 'Invalid QR payload' });
    }

    const scannedAt = new Date();
    const gps = parseTicketCoords(req.body.gps);
    const updated = await Ticket.findOneAndUpdate(
      { ticketId, status: 'ACTIVE' },
      {
        $set: { status: 'USED', scannedAt, scannedBy: req.user._id },
        $push: {
          scanHistory: {
            scannedAt,
            scannedBy: req.user._id,
            deviceId: req.body.deviceId || null,
            ip: req.ip,
            gps,
            result: 'VALID'
          }
        }
      },
      { new: true, select: 'ticketId userId status scannedAt createdAt' }
    ).lean();

    if (updated) {
      const ticketUser = await User.findById(updated.userId).select('name').lean();
      return res.status(200).json({
        result: 'VALID',
        ticket: {
          ...updated,
          passengerName: ticketUser?.name || null
        }
      });
    }

    const existing = await Ticket.findOne({ ticketId }).select('status').lean();
    if (!existing) {
      return res.status(200).json({ result: 'INVALID' });
    }

    return res.status(200).json({ result: 'REJECT' });
  } catch (error) {
    console.error('Scan ticket error:', error.message);
    return res.status(500).json({ error: 'Failed to scan ticket' });
  }
};
