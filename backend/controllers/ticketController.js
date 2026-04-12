const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const User = require('../models/User');
const Ticket = require('../models/Ticket');

const TICKET_PRICE = 20;
const MAX_TICKETS_PER_BOOKING = 20;

const parseTicketIdFromScan = (input) => {
  if (!input || typeof input !== 'string') {
    return null;
  }

  try {
    const parsed = JSON.parse(input);
    if (parsed && typeof parsed.ticketId === 'string') {
      return parsed.ticketId;
    }
  } catch {
    return null;
  }

  return null;
};

exports.bookTickets = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const n = Number(req.body.count);
    if (!Number.isInteger(n) || n <= 0) {
      return res.status(400).json({ error: 'count must be a positive integer' });
    }
    if (n > MAX_TICKETS_PER_BOOKING) {
      return res.status(400).json({ error: `count cannot exceed ${MAX_TICKETS_PER_BOOKING}` });
    }

    const totalAmount = n * TICKET_PRICE;
    const nowIso = new Date().toISOString();

    const ticketDrafts = Array.from({ length: n }, () => {
      const ticketId = uuidv4();
      return {
        ticketId,
        userId: req.user._id,
        status: 'ACTIVE',
        fare: TICKET_PRICE,
        qrPayload: {
          ticketId,
          userId: String(req.user._id),
          timestamp: nowIso
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

    let updatedUser;
    let createdTickets = [];

    await session.withTransaction(async () => {
      updatedUser = await User.findOneAndUpdate(
        { _id: req.user._id, balance: { $gte: totalAmount } },
        { $inc: { balance: -totalAmount } },
        { new: true, session, select: '_id balance' }
      );

      if (!updatedUser) {
        throw new Error('INSUFFICIENT_BALANCE');
      }

      createdTickets = await Ticket.insertMany(ticketDrafts, { session });
    });

    return res.status(200).json({
      ticketPrice: TICKET_PRICE,
      count: n,
      totalAmount,
      balance: updatedUser.balance,
      tickets: createdTickets.map((ticket, index) => ({
        ticketId: ticket.ticketId,
        userId: ticket.userId,
        status: ticket.status,
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
        required: Number(req.body.count) * TICKET_PRICE
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
        userId: ticket.userId,
        status: ticket.status,
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
    const updated = await Ticket.findOneAndUpdate(
      { ticketId, status: 'ACTIVE' },
      { $set: { status: 'USED', scannedAt } },
      { new: true, select: 'ticketId userId status scannedAt createdAt' }
    ).lean();

    if (updated) {
      return res.status(200).json({
        result: 'VALID',
        ticket: updated
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
