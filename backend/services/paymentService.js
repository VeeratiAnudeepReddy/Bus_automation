const crypto = require('crypto');
const Razorpay = require('razorpay');
const Payment = require('../models/Payment');
const PaymentWebhook = require('../models/PaymentWebhook');
const Refund = require('../models/Refund');
const SeatLock = require('../models/SeatLock');
const Ticket = require('../models/Ticket');
const Invoice = require('../models/Invoice');
const Receipt = require('../models/Receipt');
const BookingHistory = require('../models/BookingHistory');
const Notification = require('../models/Notification');
const Organization = require('../models/Organization');
const logger = require('../utils/logger');
const { recordWalletTransaction } = require('./walletService');
const { transitionBooking } = require('./bookingIntegrityService');
const { recordFinancialEntry } = require('./financialLedgerService');

class PaymentProvider {
  createOrder() { throw new Error('createOrder not implemented'); }
  verifyPayment() { throw new Error('verifyPayment not implemented'); }
  verifyWebhook() { throw new Error('verifyWebhook not implemented'); }
  refundPayment() { throw new Error('refundPayment not implemented'); }
  fetchPayment() { throw new Error('fetchPayment not implemented'); }
  fetchOrder() { throw new Error('fetchOrder not implemented'); }
  fetchRefund() { throw new Error('fetchRefund not implemented'); }
  paymentStatus() { throw new Error('paymentStatus not implemented'); }
}

function timingSafeCompare(left, right) {
  if (!left || !right || left.length !== right.length) return false;
  return crypto.timingSafeEqual(Buffer.from(left), Buffer.from(right));
}

function verifyRazorpaySignature({ orderId, paymentId, signature, secret }) {
  if (!orderId || !paymentId || !signature || !secret) return false;
  const expected = crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');
  return timingSafeCompare(expected, signature);
}

function verifyWebhookSignature({ rawBody, signature, secret }) {
  if (!rawBody || !signature || !secret) return false;
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  return timingSafeCompare(expected, signature);
}

class RazorpayProvider extends PaymentProvider {
  constructor({ keyId, keySecret, webhookSecret, mode = 'test' } = {}) {
    super();
    this.keyId = keyId || process.env.RAZORPAY_KEY_ID;
    this.keySecret = keySecret || process.env.RAZORPAY_KEY_SECRET;
    this.webhookSecret = webhookSecret || process.env.RAZORPAY_WEBHOOK_SECRET;
    this.mode = mode || process.env.RAZORPAY_MODE || 'test';
    this.client = this.keyId && this.keySecret ? new Razorpay({ key_id: this.keyId, key_secret: this.keySecret }) : null;
  }

  async createOrder({ amount, currency = 'INR', receipt, notes, transfers = null }) {
    if (!this.client) throw new Error('RAZORPAY_NOT_CONFIGURED');
    const payload = {
      amount,
      currency,
      receipt,
      notes,
      payment_capture: 1,
      partial_payment: false
    };
    if (Array.isArray(transfers) && transfers.length > 0) {
      payload.transfers = transfers;
    }
    return this.client.orders.create(payload);
  }

  verifyPayment(payload) {
    return verifyRazorpaySignature({ ...payload, secret: this.keySecret });
  }

  verifyWebhook({ rawBody, signature }) {
    return verifyWebhookSignature({ rawBody, signature, secret: this.webhookSecret });
  }

  async refundPayment(paymentId, { amount, notes }) {
    if (!this.client) throw new Error('RAZORPAY_NOT_CONFIGURED');
    return this.client.payments.refund(paymentId, { amount, notes });
  }

  async fetchPayment(paymentId) {
    if (!this.client) throw new Error('RAZORPAY_NOT_CONFIGURED');
    return this.client.payments.fetch(paymentId);
  }

  async fetchOrder(orderId) {
    if (!this.client) throw new Error('RAZORPAY_NOT_CONFIGURED');
    return this.client.orders.fetch(orderId);
  }

  async fetchRefund(paymentId, refundId) {
    if (!this.client) throw new Error('RAZORPAY_NOT_CONFIGURED');
    return this.client.payments.fetchRefund(paymentId, refundId);
  }

  paymentStatus(payment) {
    return payment?.status || 'unknown';
  }
}

function getPaymentProvider() {
  return new RazorpayProvider();
}

function createReceiptId(prefix) {
  return `${prefix}-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

/**
 * Resolve Razorpay Route settlement for an organization.
 * Active linkedAccountId → transfer on order create.
 * Otherwise → platform account fallback (never block payment) + structured log.
 */
async function resolveRouteSettlement(organizationId) {
  const organization = await Organization.findById(organizationId)
    .select('name slug razorpayRoute')
    .lean();

  const linkedAccountId = organization?.razorpayRoute?.linkedAccountId || null;
  const routeStatus = organization?.razorpayRoute?.status || 'none';
  const canRoute = Boolean(linkedAccountId && routeStatus === 'active');

  if (canRoute) {
    return {
      routeSettlement: 'linked_account',
      linkedAccountId,
      organizationSlug: organization?.slug || null
    };
  }

  logger.payment('razorpay_route_platform_fallback', {
    organizationId: String(organizationId),
    organizationSlug: organization?.slug || null,
    organizationName: organization?.name || null,
    routeStatus,
    linkedAccountId: linkedAccountId || null,
    reason: linkedAccountId
      ? `linked account status is "${routeStatus}" (need active)`
      : 'organization has no Razorpay Route linkedAccountId'
  });

  return {
    routeSettlement: 'platform_fallback',
    linkedAccountId: null,
    organizationSlug: organization?.slug || null
  };
}

function buildRouteTransfers({ linkedAccountId, amountPaise, currency, organizationId, bookingId }) {
  return [
    {
      account: linkedAccountId,
      amount: amountPaise,
      currency,
      notes: {
        organizationId: String(organizationId),
        bookingId: bookingId || null
      },
      linked_account_notes: ['organizationId'],
      on_hold: false
    }
  ];
}

async function createOrderForPayment({ organizationId, user, bookingId, amount, coupon, walletAmount = 0, paymentMethod = 'gateway', currency = 'INR', metadata = {}, idempotencyKey }) {
  const gatewayAmount = Math.max(0, Number(amount) - Number(walletAmount || 0));
  const existing = idempotencyKey ? await Payment.findOne({ organizationId, idempotencyKey }) : null;
  if (existing) {
    return {
      payment: existing,
      order: {
        id: existing.razorpayOrderId,
        amount: existing.gatewayAmount * 100,
        currency: existing.currency,
        receipt: existing.receipt
      },
      routeSettlement: existing.routeSettlement || 'platform_fallback'
    };
  }

  const walletOnly = gatewayAmount === 0 || paymentMethod === 'wallet';
  const receipt = createReceiptId('RZP');
  const provider = getPaymentProvider();
  const route = await resolveRouteSettlement(organizationId);
  const amountPaise = Math.round(gatewayAmount * 100);
  const transfers = !walletOnly && route.routeSettlement === 'linked_account'
    ? buildRouteTransfers({
      linkedAccountId: route.linkedAccountId,
      amountPaise,
      currency,
      organizationId,
      bookingId
    })
    : null;

  const order = walletOnly
    ? { id: `wallet_${crypto.randomBytes(12).toString('hex')}`, amount: 0, currency, receipt }
    : await provider.createOrder({
      amount: amountPaise,
      currency,
      receipt,
      notes: {
        bookingId: bookingId || null,
        organizationId: String(organizationId),
        routeSettlement: route.routeSettlement
      },
      transfers
    });

  const payment = await Payment.create({
    organizationId,
    userId: user._id,
    bookingId,
    razorpayOrderId: order.id,
    amount: Number(amount),
    currency,
    providerMode: provider.mode,
    routeSettlement: route.routeSettlement,
    razorpayLinkedAccountId: route.linkedAccountId,
    receipt,
    paymentMethod: walletOnly ? 'wallet' : (walletAmount > 0 ? 'wallet_gateway' : 'gateway'),
    walletAmount,
    gatewayAmount,
    couponCode: coupon || null,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    idempotencyKey,
    metadata: {
      ...metadata,
      routeSettlement: route.routeSettlement,
      razorpayLinkedAccountId: route.linkedAccountId
    }
  });

  logger.payment('razorpay_order_created', {
    paymentId: String(payment._id),
    organizationId: String(organizationId),
    bookingId: bookingId || null,
    routeSettlement: route.routeSettlement,
    linkedAccountId: route.linkedAccountId,
    gatewayAmount,
    orderId: order.id
  });

  return { payment, order, routeSettlement: route.routeSettlement };
}

async function finalizeVerifiedPayment({ payment, razorpayPaymentId, razorpaySignature, actorId }) {
  if (payment.status === 'captured') return payment;
  const previousStatus = payment.status;
  payment.razorpayPaymentId = razorpayPaymentId || payment.razorpayPaymentId;
  payment.razorpaySignature = razorpaySignature || payment.razorpaySignature;
  payment.status = 'captured';
  payment.statusHistory.push({ from: previousStatus, to: 'captured', actorId, reason: 'payment_verified' });
  payment.verifiedAt = new Date();
  await payment.save();

  if (payment.walletAmount > 0) {
    await recordWalletTransaction({
      organizationId: payment.organizationId,
      userId: payment.userId,
      type: 'debit',
      amount: payment.walletAmount,
      referenceType: 'payment',
      referenceId: String(payment._id),
      notes: 'Wallet contribution for Razorpay booking',
      idempotencyKey: `wallet-payment:${payment._id}`
    });
  }

  await Receipt.findOneAndUpdate(
    { organizationId: payment.organizationId, paymentId: payment._id },
    {
      $setOnInsert: {
        organizationId: payment.organizationId,
        bookingId: payment.bookingId,
        paymentId: payment._id,
        userId: payment.userId,
        receiptNumber: createReceiptId('RCT'),
        amount: payment.amount,
        method: payment.paymentMethod === 'wallet' ? 'wallet' : 'razorpay',
        razorpayPaymentId: payment.razorpayPaymentId,
        fareBreakdown: payment.metadata?.pricing || null,
        printableHtml: `<h1>Receipt</h1><p>Booking ${payment.bookingId || ''}</p><p>Amount ${payment.amount}</p>`
      }
    },
    { upsert: true, new: true }
  );

  await Invoice.findOneAndUpdate(
    { organizationId: payment.organizationId, bookingId: payment.bookingId, paymentId: payment._id },
    {
      $setOnInsert: {
        organizationId: payment.organizationId,
        bookingId: payment.bookingId,
        paymentId: payment._id,
        userId: payment.userId,
        invoiceNumber: createReceiptId('INV'),
        subtotal: payment.amount,
        tax: 0,
        total: payment.amount,
        fareBreakdown: payment.metadata?.pricing || null,
        couponBreakdown: payment.couponCode ? { code: payment.couponCode } : null,
        walletContribution: payment.walletAmount,
        razorpayPaymentId: payment.razorpayPaymentId,
        paymentMethod: payment.paymentMethod,
        lineItems: [{ label: `Booking ${payment.bookingId || payment._id}`, quantity: 1, amount: payment.amount }]
      }
    },
    { upsert: true, new: true }
  );

  if (payment.bookingId) {
    await Ticket.updateMany({ organizationId: payment.organizationId, bookingId: payment.bookingId, status: 'HELD' }, { $set: { status: 'ACTIVE' } });
    await SeatLock.updateMany({ organizationId: payment.organizationId, bookingId: payment.bookingId, status: 'active' }, { $set: { status: 'captured', paymentStatus: 'captured', releasedAt: new Date(), reason: 'payment_captured' } });
    await transitionBooking({ organizationId: payment.organizationId, bookingId: payment.bookingId, to: 'completed', actorId, reason: 'payment_captured', metadata: { paymentId: payment._id, razorpayPaymentId } });
    await BookingHistory.create({ organizationId: payment.organizationId, bookingId: payment.bookingId, userId: payment.userId, action: 'payment_captured', after: { paymentId: payment._id, razorpayPaymentId } });
  }

  if (payment.gatewayAmount > 0) {
    await recordFinancialEntry({
      organizationId: payment.organizationId,
      userId: payment.userId,
      bookingId: payment.bookingId,
      paymentId: payment._id,
      category: 'gateway',
      direction: 'credit',
      amount: payment.gatewayAmount,
      idempotencyKey: `gateway-capture:${payment._id}`,
      reason: 'Razorpay payment captured',
      metadata: { razorpayPaymentId: payment.razorpayPaymentId, paymentMethod: payment.paymentMethod }
    });
  }
  await recordFinancialEntry({
    organizationId: payment.organizationId,
    userId: payment.userId,
    bookingId: payment.bookingId,
    paymentId: payment._id,
    category: 'revenue',
    direction: 'credit',
    amount: payment.amount,
    idempotencyKey: `revenue:${payment._id}`,
    reason: 'Booking revenue recognized',
    metadata: { walletAmount: payment.walletAmount, gatewayAmount: payment.gatewayAmount }
  });

  await Notification.create({
    organizationId: payment.organizationId,
    userId: payment.userId,
    audience: 'user',
    title: 'Payment successful',
    message: `Payment ${payment.razorpayPaymentId || payment.razorpayOrderId} captured.`,
    category: 'payment'
  });

  try {
    const User = require('../models/User');
    const { queueEmail } = require('./providerServices');
    const user = await User.findById(payment.userId).lean();
    const recipient = user?.email || null;
    if (recipient) {
      if (payment.bookingId) {
        await queueEmail({
          recipient,
          template: 'booking_confirmation',
          payload: {
            name: user?.name,
            bookingId: payment.bookingId,
            amount: payment.amount,
            currency: payment.currency || 'INR',
            razorpayPaymentId: payment.razorpayPaymentId
          }
        });
      }
      await queueEmail({
        recipient,
        template: 'receipt',
        payload: {
          name: user?.name,
          bookingId: payment.bookingId,
          amount: payment.amount,
          currency: payment.currency || 'INR',
          orderId: payment.razorpayOrderId,
          razorpayPaymentId: payment.razorpayPaymentId
        }
      });
    }
  } catch (error) {
    logger.error('payment_email_notify_failed', { paymentId: payment._id, error: error.message });
  }

  return payment;
}

async function failPayment(payment, reason) {
  const previousStatus = payment.status;
  payment.status = 'failed';
  payment.statusHistory.push({ from: previousStatus, to: 'failed', reason });
  payment.failedAt = new Date();
  payment.failureReason = reason;
  await payment.save();
  if (payment.bookingId) {
    await SeatLock.updateMany({ organizationId: payment.organizationId, bookingId: payment.bookingId, status: 'active' }, { $set: { status: 'released', paymentStatus: 'failed', releasedAt: new Date(), reason: 'payment_failed' } });
    await transitionBooking({ organizationId: payment.organizationId, bookingId: payment.bookingId, to: 'cancelled', reason: 'payment_failed', metadata: { paymentId: payment._id } });
    await Ticket.updateMany({ organizationId: payment.organizationId, bookingId: payment.bookingId, status: 'HELD' }, { $set: { status: 'CANCELLED' } });
  }
  return payment;
}

async function processWebhook({ rawBody, signature, payload }) {
  const provider = getPaymentProvider();
  if (process.env.NODE_ENV === 'production' && !process.env.RAZORPAY_WEBHOOK_SECRET) {
    logger.security('razorpay_webhook_secret_missing', { event: payload?.event || null });
    const error = new Error('RAZORPAY_WEBHOOK_SECRET is required in production');
    error.statusCode = 503;
    throw error;
  }
  const verified = provider.verifyWebhook({ rawBody, signature });
  const eventId = payload.id || payload.event_id || payload.created_at && `${payload.event}:${payload.created_at}`;
  const existing = eventId ? await PaymentWebhook.findOne({ eventId }) : null;
  if (existing?.verified) return { webhook: existing, duplicate: true, verified: true };
  if (existing && !verified) {
    return { webhook: existing, duplicate: true, verified: false };
  }

  let webhook = existing;
  if (!webhook) {
    webhook = await PaymentWebhook.create({ eventId, event: payload.event || 'unknown', payload, signature, verified, processedAt: new Date() });
  } else {
    webhook.signature = signature;
    webhook.verified = verified;
    webhook.payload = payload;
    webhook.processedAt = new Date();
    webhook.processingError = null;
    await webhook.save();
  }
  if (!verified) {
    webhook.processingError = 'Invalid Razorpay webhook signature';
    await webhook.save();
    return { webhook, duplicate: false, verified };
  }

  const paymentEntity = payload.payload?.payment?.entity;
  const orderEntity = payload.payload?.order?.entity;
  const refundEntity = payload.payload?.refund?.entity;
  const orderId = paymentEntity?.order_id || orderEntity?.id;
  const payment = orderId ? await Payment.findOne({ razorpayOrderId: orderId }) : null;
  if (payment) {
    webhook.organizationId = payment.organizationId;
    if (['payment.authorized'].includes(payload.event)) {
      payment.statusHistory.push({ from: payment.status, to: 'authorized', reason: 'webhook_authorized' });
      payment.status = 'authorized';
      if (payment.bookingId) await transitionBooking({ organizationId: payment.organizationId, bookingId: payment.bookingId, to: 'payment_authorized', reason: 'webhook_authorized', metadata: { paymentId: payment._id } });
      await payment.save();
    }
    if (['payment.captured', 'order.paid'].includes(payload.event)) {
      await finalizeVerifiedPayment({ payment, razorpayPaymentId: paymentEntity?.id || payment.razorpayPaymentId });
    }
    if (payload.event === 'payment.failed') await failPayment(payment, paymentEntity?.error_description || 'Webhook payment failed');
    if (payload.event === 'dispute.created') {
      payment.statusHistory.push({ from: payment.status, to: 'disputed', reason: 'webhook_dispute_created' });
      payment.status = 'disputed';
      await payment.save();
    }
    if (payload.event === 'dispute.closed' && payment.status === 'disputed') {
      payment.statusHistory.push({ from: payment.status, to: 'captured', reason: 'webhook_dispute_closed' });
      payment.status = 'captured';
      await payment.save();
    }
    if (refundEntity && payload.event.startsWith('refund.')) {
      await Refund.findOneAndUpdate({ gatewayRefundId: refundEntity.id }, { $set: { status: payload.event === 'refund.processed' ? 'completed' : 'processing' } });
    }
    await webhook.save();
  }
  return { webhook, duplicate: false, verified };
}

async function refundPayment({ payment, amount, reason, actorId }) {
  const provider = getPaymentProvider();
  const refundAmount = Number(amount || payment.amount);
  let gatewayRefund = null;
  if (payment.razorpayPaymentId && payment.gatewayAmount > 0) {
    gatewayRefund = await provider.refundPayment(payment.razorpayPaymentId, { amount: Math.round(Math.min(refundAmount, payment.gatewayAmount) * 100), notes: { reason } });
  }
  const nextStatus = refundAmount >= payment.amount ? 'refunded' : 'partially_refunded';
  payment.statusHistory.push({ from: payment.status, to: nextStatus, actorId, reason: reason || 'refund_processed' });
  payment.status = nextStatus;
  await payment.save();
  const refund = await Refund.create({
    organizationId: payment.organizationId,
    refundId: createReceiptId('RF-PAY'),
    bookingId: payment.bookingId || `payment:${payment._id}`,
    ticketIds: [],
    userId: payment.userId,
    amount: refundAmount,
    type: refundAmount < payment.amount ? 'partial' : 'full',
    reason: reason || 'Payment refund',
    status: 'completed',
    source: payment.paymentMethod,
    approvalStatus: 'approved',
    gatewayRefundId: gatewayRefund?.id || null,
    paymentId: payment._id,
    processedBy: actorId,
    processedAt: new Date()
  });
  await recordFinancialEntry({
    organizationId: payment.organizationId,
    userId: payment.userId,
    bookingId: payment.bookingId,
    paymentId: payment._id,
    refundId: refund._id,
    category: 'refund',
    direction: 'debit',
    amount: refundAmount,
    idempotencyKey: `refund:${refund._id}`,
    reason: reason || 'Payment refund',
    metadata: { gatewayRefundId: refund.gatewayRefundId, source: refund.source }
  });
  if (payment.bookingId && nextStatus === 'refunded') {
    await Ticket.updateMany({ organizationId: payment.organizationId, bookingId: payment.bookingId, status: { $in: ['ACTIVE', 'HELD'] } }, { $set: { status: 'REFUNDED' } });
    await transitionBooking({ organizationId: payment.organizationId, bookingId: payment.bookingId, to: 'refunded', actorId, reason: reason || 'payment_refunded', metadata: { refundId: refund._id } });
  }
  return refund;
}

module.exports = {
  PaymentProvider,
  RazorpayProvider,
  getPaymentProvider,
  createOrderForPayment,
  finalizeVerifiedPayment,
  failPayment,
  processWebhook,
  refundPayment,
  verifyRazorpaySignature,
  verifyWebhookSignature,
  resolveRouteSettlement,
  buildRouteTransfers
};
