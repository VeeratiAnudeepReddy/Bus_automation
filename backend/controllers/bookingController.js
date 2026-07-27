const mongoose = require('mongoose');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const Ticket = require('../models/Ticket');
const Route = require('../models/Route');
const Refund = require('../models/Refund');
const Invoice = require('../models/Invoice');
const Receipt = require('../models/Receipt');
const Payment = require('../models/Payment');
const BookingHistory = require('../models/BookingHistory');
const BookingTransaction = require('../models/BookingTransaction');
const SeatLock = require('../models/SeatLock');
const { calculateFare } = require('../services/pricingService');
const { recordWalletTransaction } = require('../services/walletService');
const { resolveOrganizationId } = require('../utils/defaultOrganization');

const publicTicket = async (ticket) => ({
  ticketId: ticket.ticketId,
  bookingId: ticket.bookingId,
  routeId: ticket.routeId,
  from: ticket.from,
  to: ticket.to,
  seatNumber: ticket.seatNumber,
  passengerType: ticket.passengerType,
  status: ticket.status,
  fare: ticket.fare,
  createdAt: ticket.createdAt,
  scannedAt: ticket.scannedAt,
  qrPayload: ticket.qrPayload,
  qr: await QRCode.toDataURL(JSON.stringify(ticket.qrPayload), { errorCorrectionLevel: 'H', width: 300, margin: 2 })
});

exports.seatAvailability = async (req, res) => {
  const organizationId = await resolveOrganizationId(req.user);
  const [booked, locks] = await Promise.all([
    Ticket.find({
      organizationId,
      routeId: req.query.routeId,
      status: { $in: ['HELD', 'ACTIVE', 'USED'] }
    }).select('seatNumber status').lean(),
    SeatLock.find({
      organizationId,
      routeId: req.query.routeId,
      status: 'active',
      expirationTime: { $gt: new Date() }
    }).select('seatNumber expirationTime').lean()
  ]);
  const occupied = [...new Set([
    ...booked.map((ticket) => ticket.seatNumber).filter(Boolean),
    ...locks.map((lock) => lock.seatNumber).filter(Boolean)
  ])];
  res.json({ occupied, availableCount: Math.max(0, 40 - occupied.length) });
};

exports.createBooking = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const organizationId = await resolveOrganizationId(req.user);
    const idempotencyKey = req.headers['idempotency-key'] || req.body.idempotencyKey || null;
    if (idempotencyKey) {
      const existing = await BookingTransaction.findOne({ organizationId, idempotencyKey }).lean();
      if (existing) {
        const tickets = await Ticket.find({ organizationId, bookingId: existing.bookingId }).lean();
        return res.status(200).json({ bookingId: existing.bookingId, lifecycle: existing.lifecycle, pricing: existing.metadata?.pricing, paymentRequired: ['seat_hold', 'payment_pending'].includes(existing.lifecycle), tickets: await Promise.all(tickets.map(publicTicket)) });
      }
    }
    const route = await Route.findOne({ _id: req.body.routeId, organizationId, active: true }).lean();
    if (!route) return res.status(400).json({ error: 'Selected route is unavailable' });

    const seats = Array.isArray(req.body.seats) && req.body.seats.length ? req.body.seats : [null];
    const passengerType = req.body.passengerType || 'adult';
    const paymentMethod = req.body.paymentMethod || 'wallet';
    const requiresGatewayPayment = ['gateway', 'wallet_gateway'].includes(paymentMethod);
    const pricing = await calculateFare({
      organizationId,
      baseFare: route.fare,
      routeId: route._id,
      passengerType,
      couponCode: req.body.couponCode || null,
      userId: req.user._id,
      count: seats.length
    });
    if (!pricing.valid) return res.status(400).json({ error: pricing.error });

    const bookingId = `BK-${Date.now()}-${uuidv4().slice(0, 8)}`;
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    const nowIso = new Date().toISOString();
    const ticketDrafts = seats.map((seatNumber) => {
      const ticketId = uuidv4();
      return {
        ticketId,
        bookingId,
        userId: req.user._id,
        routeId: route._id,
        organizationId,
        from: route.from,
        to: route.to,
        seatNumber,
        passengerType,
        status: requiresGatewayPayment ? 'HELD' : 'ACTIVE',
        fare: pricing.fare,
        qrExpiresAt: expiresAt,
        fromCoords: route.fromCoords,
        toCoords: route.toCoords,
        qrPayload: {
          ticketId,
          userId: String(req.user._id),
          timestamp: nowIso,
          routeId: String(route._id),
          from: route.from,
          to: route.to,
          fare: pricing.fare,
          expiresAt: expiresAt.toISOString(),
          encrypted: true
        }
      };
    });

    let tickets;
    let walletTxn = null;
    await session.withTransaction(async () => {
      const namedSeats = seats.filter(Boolean);
      if (namedSeats.length) {
        await SeatLock.create(namedSeats.map((seatNumber) => ({
          organizationId,
          routeId: route._id,
          seatNumber,
          bookingId,
          lockedBy: req.user._id,
          expirationTime: expiresAt,
          paymentStatus: requiresGatewayPayment ? 'pending' : 'captured'
        })), { session });
      }
      await BookingTransaction.create([{
        organizationId,
        bookingId,
        userId: req.user._id,
        idempotencyKey,
        lifecycle: requiresGatewayPayment ? 'payment_pending' : 'completed',
        amount: pricing.totalAmount,
        seats: namedSeats,
        expiresAt,
        transitions: [
          { from: null, to: 'draft', actorId: req.user._id, reason: 'booking_requested' },
          { from: 'draft', to: namedSeats.length ? 'seat_hold' : 'payment_pending', actorId: req.user._id, reason: 'booking_created' },
          { from: namedSeats.length ? 'seat_hold' : 'payment_pending', to: requiresGatewayPayment ? 'payment_pending' : 'completed', actorId: req.user._id, reason: requiresGatewayPayment ? 'awaiting_payment' : 'wallet_paid' }
        ],
        metadata: { pricing, passengerType, paymentMethod }
      }], { session });
      if (!requiresGatewayPayment) {
        walletTxn = await recordWalletTransaction({
          organizationId,
          userId: req.user._id,
          type: 'booking_debit',
          amount: pricing.totalAmount,
          referenceType: 'booking',
          referenceId: bookingId,
          notes: 'Ticket booking',
          session
        });
      }
      tickets = await Ticket.insertMany(ticketDrafts, { session });
      await BookingHistory.create([{ organizationId, bookingId, userId: req.user._id, action: 'created', after: { tickets: tickets.length, pricing, paymentMethod, status: requiresGatewayPayment ? 'payment_pending' : 'paid' } }], { session });
      if (!requiresGatewayPayment) {
        await Invoice.create([{ organizationId, bookingId, userId: req.user._id, invoiceNumber: `INV-${Date.now()}`, subtotal: pricing.subtotal, tax: 0, total: pricing.totalAmount, lineItems: [{ label: `${route.from} to ${route.to}`, quantity: tickets.length, amount: pricing.totalAmount }] }], { session });
        await Receipt.create([{ organizationId, bookingId, userId: req.user._id, receiptNumber: `RCT-${Date.now()}`, amount: pricing.totalAmount, method: 'wallet' }], { session });
      }
      if (!requiresGatewayPayment && namedSeats.length) {
        await SeatLock.updateMany({ organizationId, bookingId, status: 'active' }, { $set: { status: 'captured', paymentStatus: 'captured', releasedAt: new Date(), reason: 'wallet_booking_completed' } }, { session });
      }
    });

    res.status(201).json({
      bookingId,
      lifecycle: requiresGatewayPayment ? 'payment_pending' : 'completed',
      pricing,
      balance: walletTxn?.balanceAfter ?? null,
      paymentRequired: requiresGatewayPayment,
      tickets: await Promise.all(tickets.map(publicTicket))
    });
  } catch (error) {
    if (error.message === 'INSUFFICIENT_BALANCE') return res.status(400).json({ error: 'Insufficient balance' });
    if (error.code === 11000) return res.status(409).json({ error: 'One or more selected seats are temporarily locked or already booked' });
    console.error('Create booking error:', error.message);
    res.status(500).json({ error: 'Failed to create booking' });
  } finally {
    await session.endSession();
  }
};

exports.listBookings = async (req, res) => {
  const organizationId = await resolveOrganizationId(req.user);
  const query = { organizationId };
  if (req.user.role === 'customer' || req.user.role === 'user') query.userId = req.user._id;
  const tickets = await Ticket.find(query).sort({ createdAt: -1 }).limit(200).lean();
  const grouped = tickets.reduce((acc, ticket) => {
    const key = ticket.bookingId || ticket.ticketId;
    if (!acc[key]) acc[key] = { bookingId: key, tickets: [], totalAmount: 0, status: ticket.status, createdAt: ticket.createdAt };
    acc[key].tickets.push(ticket);
    acc[key].totalAmount += ticket.fare || 0;
    return acc;
  }, {});
  res.json({ bookings: Object.values(grouped) });
};

exports.getBooking = async (req, res) => {
  const organizationId = await resolveOrganizationId(req.user);
  const tickets = await Ticket.find({ organizationId, bookingId: req.params.id }).lean();
  if (!tickets.length) return res.status(404).json({ error: 'Booking not found' });
  const history = await BookingHistory.find({ organizationId, bookingId: req.params.id }).sort({ createdAt: -1 }).lean();
  res.json({ bookingId: req.params.id, tickets: await Promise.all(tickets.map(publicTicket)), history });
};

exports.recoverBooking = async (req, res) => {
  const organizationId = await resolveOrganizationId(req.user);
  const [booking, tickets, locks, payment, invoice, receipt, history] = await Promise.all([
    BookingTransaction.findOne({ organizationId, bookingId: req.params.id }).lean(),
    Ticket.find({ organizationId, bookingId: req.params.id }).lean(),
    SeatLock.find({ organizationId, bookingId: req.params.id }).lean(),
    Payment.findOne({ organizationId, bookingId: req.params.id }).sort({ createdAt: -1 }).lean(),
    Invoice.findOne({ organizationId, bookingId: req.params.id }).sort({ createdAt: -1 }).lean(),
    Receipt.findOne({ organizationId, bookingId: req.params.id }).sort({ createdAt: -1 }).lean(),
    BookingHistory.find({ organizationId, bookingId: req.params.id }).sort({ createdAt: -1 }).limit(25).lean()
  ]);
  if (!booking && !tickets.length) return res.status(404).json({ error: 'Booking not found' });
  res.json({
    bookingId: req.params.id,
    lifecycle: booking?.lifecycle || null,
    amount: booking?.amount || tickets.reduce((sum, ticket) => sum + (ticket.fare || 0), 0),
    expiresAt: booking?.expiresAt || null,
    paymentStatus: payment?.status || null,
    lockStatus: locks.map((lock) => ({ seatNumber: lock.seatNumber, status: lock.status, paymentStatus: lock.paymentStatus, expiresAt: lock.expirationTime })),
    documents: {
      invoiceNumber: invoice?.invoiceNumber || null,
      receiptNumber: receipt?.receiptNumber || null
    },
    tickets: await Promise.all(tickets.map(publicTicket)),
    history
  });
};

exports.getInvoice = async (req, res) => {
  const organizationId = await resolveOrganizationId(req.user);
  const invoice = await Invoice.findOne({ organizationId, bookingId: req.params.id }).lean();
  if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
  if (req.query.format === 'html') {
    res.setHeader('Content-Type', 'text/html');
    return res.send(`<!doctype html><html><head><title>${invoice.invoiceNumber}</title></head><body><h1>Invoice ${invoice.invoiceNumber}</h1><p>Booking: ${invoice.bookingId}</p><p>Subtotal: ${invoice.subtotal}</p><p>Tax: ${invoice.tax}</p><p>Total: ${invoice.total}</p></body></html>`);
  }
  res.json({ invoice });
};

exports.getReceipt = async (req, res) => {
  const organizationId = await resolveOrganizationId(req.user);
  const receipt = await Receipt.findOne({ organizationId, bookingId: req.params.id }).lean();
  if (!receipt) return res.status(404).json({ error: 'Receipt not found' });
  if (req.query.format === 'html') {
    res.setHeader('Content-Type', 'text/html');
    return res.send(receipt.printableHtml || `<!doctype html><html><head><title>${receipt.receiptNumber}</title></head><body><h1>Receipt ${receipt.receiptNumber}</h1><p>Booking: ${receipt.bookingId}</p><p>Amount: ${receipt.amount}</p><p>Method: ${receipt.method}</p></body></html>`);
  }
  res.json({ receipt });
};

exports.cancelBooking = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const organizationId = await resolveOrganizationId(req.user);
    let refund;
    await session.withTransaction(async () => {
      const tickets = await Ticket.find({ organizationId, bookingId: req.params.id, status: 'ACTIVE' }).session(session);
      if (!tickets.length) throw new Error('NO_ACTIVE_TICKETS');
      const amount = tickets.reduce((sum, ticket) => sum + (ticket.fare || 0), 0);
      await Ticket.updateMany(
        { organizationId, bookingId: req.params.id, status: 'ACTIVE' },
        { $set: { status: 'CANCELLED', cancellation: { cancelledAt: new Date(), cancelledBy: req.user._id, reason: req.body.reason || 'Customer cancellation', refundAmount: amount } } },
        { session }
      );
      const walletTxn = await recordWalletTransaction({ organizationId, userId: req.user._id, type: 'refund', amount, referenceType: 'booking', referenceId: req.params.id, notes: 'Booking cancellation refund', session });
      [refund] = await Refund.create([{ organizationId, refundId: `RF-${Date.now()}`, bookingId: req.params.id, ticketIds: tickets.map((t) => t.ticketId), userId: req.user._id, amount, type: 'full', reason: req.body.reason || null, status: 'processed', walletTransactionId: walletTxn._id, processedBy: req.user._id, processedAt: new Date() }], { session });
      await BookingHistory.create([{ organizationId, bookingId: req.params.id, userId: req.user._id, action: 'cancelled', after: { refundId: refund.refundId, amount } }], { session });
    });
    res.json({ refund });
  } catch (error) {
    if (error.message === 'NO_ACTIVE_TICKETS') return res.status(400).json({ error: 'No active tickets to cancel' });
    console.error('Cancel booking error:', error.message);
    res.status(500).json({ error: 'Failed to cancel booking' });
  } finally {
    await session.endSession();
  }
};

exports.listRefunds = async (req, res) => {
  const organizationId = await resolveOrganizationId(req.user);
  const query = { organizationId };
  if (req.user.role === 'customer' || req.user.role === 'user') query.userId = req.user._id;
  const refunds = await Refund.find(query).sort({ createdAt: -1 }).limit(200).lean();
  res.json({ refunds });
};
