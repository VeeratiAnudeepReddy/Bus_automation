const crypto = require('crypto');
const mongoose = require('mongoose');
const FareRule = require('../models/FareRule');
const Coupon = require('../models/Coupon');
const WalletTransaction = require('../models/WalletTransaction');
const Payment = require('../models/Payment');
const PaymentWebhook = require('../models/PaymentWebhook');
const Refund = require('../models/Refund');
const Invoice = require('../models/Invoice');
const Receipt = require('../models/Receipt');
const { applyRule } = require('../services/pricingService');
const { RazorpayProvider, verifyRazorpaySignature, verifyWebhookSignature } = require('../services/paymentService');

describe('Sprint 4 pricing, wallet, and payment foundations', () => {
  const organizationId = new mongoose.Types.ObjectId();
  const userId = new mongoose.Types.ObjectId();

  test('FareRule supports approval-aware enterprise pricing', async () => {
    const rule = new FareRule({
      organizationId,
      name: 'Student discount',
      passengerType: 'student',
      ruleType: 'fixed_discount',
      value: 5,
      status: 'published',
      approvalStatus: 'approved',
      createdBy: userId
    });

    await expect(rule.validate()).resolves.toBeUndefined();
    expect(applyRule(25, rule)).toBe(20);
  });

  test('Coupon model normalizes code and supports usage controls', async () => {
    const coupon = new Coupon({
      organizationId,
      code: 'save10',
      name: 'Save 10',
      discountType: 'percentage',
      discountValue: 10,
      usageLimit: 100,
      createdBy: userId
    });

    await expect(coupon.validate()).resolves.toBeUndefined();
    expect(coupon.code).toBe('SAVE10');
    expect(coupon.status).toBe('active');
  });

  test('Wallet transaction captures before and after balances', async () => {
    const transaction = new WalletTransaction({
      organizationId,
      userId,
      type: 'debit',
      amount: 20,
      balanceBefore: 100,
      balanceAfter: 80,
      referenceType: 'booking',
      referenceId: 'BK-1'
    });

    await expect(transaction.validate()).resolves.toBeUndefined();
    expect(transaction.status).toBe('completed');
  });

  test('Payment model stores idempotent Razorpay order state', async () => {
    const payment = new Payment({
      organizationId,
      userId,
      razorpayOrderId: 'order_local',
      amount: 250,
      idempotencyKey: 'idem-1'
    });

    await expect(payment.validate()).resolves.toBeUndefined();
    expect(payment.currency).toBe('INR');
    expect(payment.status).toBe('created');
    expect(payment.provider).toBe('razorpay');
    expect(payment.paymentMethod).toBe('gateway');
  });

  test('Razorpay signature verification uses order and payment IDs', () => {
    const secret = 'test_secret';
    const orderId = 'order_123';
    const paymentId = 'pay_123';
    const signature = crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');

    expect(verifyRazorpaySignature({ orderId, paymentId, signature, secret })).toBe(true);
    expect(verifyRazorpaySignature({ orderId, paymentId, signature: 'bad', secret })).toBe(false);
  });

  test('Razorpay webhook signature verification uses raw body', () => {
    const secret = 'webhook_secret';
    const rawBody = JSON.stringify({ event: 'payment.captured', payload: { payment: { entity: { id: 'pay_1' } } } });
    const signature = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

    expect(verifyWebhookSignature({ rawBody, signature, secret })).toBe(true);
    expect(verifyWebhookSignature({ rawBody, signature: 'bad', secret })).toBe(false);
  });

  test('Razorpay provider exposes production interface methods', () => {
    const provider = new RazorpayProvider({ keyId: 'rzp_test_key', keySecret: 'secret', webhookSecret: 'webhook', mode: 'test' });
    expect(typeof provider.createOrder).toBe('function');
    expect(typeof provider.verifyPayment).toBe('function');
    expect(typeof provider.verifyWebhook).toBe('function');
    expect(typeof provider.refundPayment).toBe('function');
    expect(provider.paymentStatus({ status: 'captured' })).toBe('captured');
  });

  test('Route transfer payload uses linked account and order amount in paise', () => {
    const { buildRouteTransfers } = require('../services/paymentService');
    const transfers = buildRouteTransfers({
      linkedAccountId: 'acc_test_linked',
      amountPaise: 25000,
      currency: 'INR',
      organizationId,
      bookingId: 'BK-ROUTE-1'
    });
    expect(transfers).toHaveLength(1);
    expect(transfers[0]).toMatchObject({
      account: 'acc_test_linked',
      amount: 25000,
      currency: 'INR',
      on_hold: false
    });
  });

  test('Payment model defaults routeSettlement to platform_fallback', async () => {
    const payment = new Payment({
      organizationId,
      userId,
      razorpayOrderId: 'order_route_default',
      amount: 100
    });
    await expect(payment.validate()).resolves.toBeUndefined();
    expect(payment.routeSettlement).toBe('platform_fallback');
  });

  test('Organization razorpayRoute accepts active linked account binding', async () => {
    const Organization = require('../models/Organization');
    const org = new Organization({
      name: 'Route Org',
      slug: `route-org-${Date.now()}`,
      ownerUserId: userId,
      status: 'active',
      razorpayRoute: {
        linkedAccountId: 'acc_test_123',
        status: 'active',
        onboardedAt: new Date()
      }
    });
    await expect(org.validate()).resolves.toBeUndefined();
    expect(org.razorpayRoute.linkedAccountId).toBe('acc_test_123');
    expect(org.razorpayRoute.status).toBe('active');
  });

  test('Payment webhook stores idempotency event identifier', async () => {
    const webhook = new PaymentWebhook({
      eventId: 'evt_123',
      event: 'payment.captured',
      payload: { event: 'payment.captured' },
      signature: 'sig',
      verified: true
    });

    await expect(webhook.validate()).resolves.toBeUndefined();
    expect(webhook.duplicate).toBe(false);
  });

  test('Refund, invoice, and receipt support Razorpay production metadata', async () => {
    const paymentId = new mongoose.Types.ObjectId();
    const refund = new Refund({
      organizationId,
      refundId: 'RF-1',
      bookingId: 'BK-1',
      userId,
      amount: 25,
      paymentId,
      gatewayRefundId: 'rfnd_123',
      source: 'gateway',
      approvalStatus: 'approved'
    });
    const invoice = new Invoice({
      organizationId,
      invoiceNumber: 'INV-1',
      bookingId: 'BK-1',
      userId,
      subtotal: 100,
      total: 100,
      walletContribution: 10,
      razorpayPaymentId: 'pay_123',
      paymentMethod: 'wallet_gateway',
      lineItems: [{ label: 'Ticket', quantity: 1, amount: 100 }]
    });
    const receipt = new Receipt({
      organizationId,
      receiptNumber: 'RCT-1',
      bookingId: 'BK-1',
      userId,
      amount: 100,
      method: 'razorpay',
      razorpayPaymentId: 'pay_123',
      printableHtml: '<h1>Receipt</h1>'
    });

    await expect(refund.validate()).resolves.toBeUndefined();
    await expect(invoice.validate()).resolves.toBeUndefined();
    await expect(receipt.validate()).resolves.toBeUndefined();
  });
});
