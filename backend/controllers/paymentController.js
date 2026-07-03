const Payment = require('../models/Payment');
const PaymentWebhook = require('../models/PaymentWebhook');
const Ticket = require('../models/Ticket');
const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');
const {
  createOrderForPayment,
  finalizeVerifiedPayment,
  failPayment,
  processWebhook,
  refundPayment,
  getPaymentProvider
} = require('../services/paymentService');
const { resolveOrganizationId } = require('../utils/defaultOrganization');

async function auditPayment(req, action, payment, metadata = {}) {
  await AuditLog.create({
    organizationId: payment?.organizationId || await resolveOrganizationId(req.user),
    actorId: req.user?._id || null,
    action,
    targetType: 'Payment',
    targetId: payment?._id || null,
    metadata
  });
}

exports.createOrder = async (req, res, next) => {
  try {
    const organizationId = await resolveOrganizationId(req.user);
    const bookingId = req.body.bookingId || null;
    const idempotencyKey = req.headers['idempotency-key'] || req.body.idempotencyKey || (bookingId ? `booking:${bookingId}` : null);
    const existingCaptured = bookingId ? await Payment.findOne({ organizationId, bookingId, status: { $in: ['authorized', 'captured'] } }).lean() : null;
    if (existingCaptured) return res.status(409).json({ error: 'Payment already exists for this booking', payment: existingCaptured });

    let amount = Number(req.body.amount || 0);
    let ticketCount = 0;
    if (bookingId) {
      const tickets = await Ticket.find({ organizationId, bookingId }).lean();
      ticketCount = tickets.length;
      if (tickets.length) amount = tickets.reduce((sum, ticket) => sum + Number(ticket.fare || 0), 0);
    }
    if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ error: 'amount or valid bookingId is required' });

    const requestedMethod = req.body.paymentMethod || 'gateway';
    const walletAmount = Math.min(requestedMethod === 'wallet' && req.body.walletAmount == null ? amount : Number(req.body.walletAmount || 0), amount);
    const result = await createOrderForPayment({
      organizationId,
      user: req.user,
      bookingId,
      amount,
      coupon: req.body.coupon || req.body.couponCode || null,
      walletAmount,
      paymentMethod: requestedMethod || (walletAmount >= amount ? 'wallet' : walletAmount > 0 ? 'wallet_gateway' : 'gateway'),
      metadata: { ...req.body.metadata, ticketCount, pricing: { totalAmount: amount, walletAmount, gatewayAmount: amount - walletAmount } },
      idempotencyKey
    });
    await auditPayment(req, 'payment_processed', result.payment, { stage: 'order_created', bookingId });
    res.status(201).json({
      payment: result.payment,
      order: {
        id: result.order.id,
        order_id: result.order.id,
        amount: result.order.amount,
        currency: result.order.currency,
        receipt: result.order.receipt,
        bookingId,
        organizationId,
        expiry: result.payment.expiresAt
      },
      keyId: process.env.RAZORPAY_KEY_ID || null
    });
  } catch (error) {
    next(error);
  }
};

exports.verify = async (req, res, next) => {
  try {
    const organizationId = await resolveOrganizationId(req.user);
    const orderId = req.body.razorpay_order_id || req.body.razorpayOrderId;
    const paymentId = req.body.razorpay_payment_id || req.body.razorpayPaymentId;
    const signature = req.body.razorpay_signature || req.body.razorpaySignature;
    const payment = await Payment.findOne({ organizationId, razorpayOrderId: orderId });
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    if (payment.status === 'captured') return res.json({ payment, alreadyProcessed: true });
    if (payment.expiresAt && payment.expiresAt < new Date()) {
      payment.status = 'expired';
      await payment.save();
      return res.status(400).json({ error: 'Payment order expired' });
    }

    const provider = getPaymentProvider();
    const verified = payment.paymentMethod === 'wallet'
      ? true
      : provider.verifyPayment({ orderId, paymentId, signature });
    if (!verified) {
      await failPayment(payment, 'Invalid Razorpay signature');
      logger.security('payment_signature_failed', { requestId: req.requestId, orderId, paymentId, user: req.user._id });
      await auditPayment(req, 'payment_signature_failed', payment, { orderId, paymentId });
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    const finalized = await finalizeVerifiedPayment({ payment, razorpayPaymentId: paymentId, razorpaySignature: signature, actorId: req.user._id });
    await auditPayment(req, 'payment_processed', finalized, { stage: 'verified', orderId, paymentId });
    res.json({ payment: finalized });
  } catch (error) {
    next(error);
  }
};

exports.webhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'] || null;
    const rawBody = req.rawBody || JSON.stringify(req.body);
    const result = await processWebhook({ rawBody, signature, payload: req.body });
    res.status(result.verified ? 200 : 400).json({ webhookId: result.webhook._id, verified: result.verified, duplicate: result.duplicate });
  } catch (error) {
    next(error);
  }
};

exports.listPayments = async (req, res) => {
  const organizationId = await resolveOrganizationId(req.user);
  const query = { organizationId };
  if (req.user.role === 'customer' || req.user.role === 'user') query.userId = req.user._id;
  const payments = await Payment.find(query).sort({ createdAt: -1 }).limit(200).lean();
  res.json({ payments });
};

exports.getPayment = async (req, res) => {
  const organizationId = await resolveOrganizationId(req.user);
  const payment = await Payment.findOne({ _id: req.params.id, organizationId }).lean();
  if (!payment) return res.status(404).json({ error: 'Payment not found' });
  const webhooks = await PaymentWebhook.find({ organizationId, 'payload.payload.payment.entity.order_id': payment.razorpayOrderId }).sort({ createdAt: -1 }).limit(20).lean();
  res.json({ payment, webhooks });
};

exports.refund = async (req, res, next) => {
  try {
    const organizationId = await resolveOrganizationId(req.user);
    const payment = await Payment.findOne({ _id: req.params.id, organizationId });
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    if (!['captured', 'authorized'].includes(payment.status)) return res.status(400).json({ error: 'Only successful payments can be refunded' });
    const refund = await refundPayment({ payment, amount: req.body.amount, reason: req.body.reason, actorId: req.user._id });
    await auditPayment(req, 'payment_refunded', payment, { refundId: refund.refundId, amount: refund.amount });
    res.json({ payment, refund });
  } catch (error) {
    next(error);
  }
};
