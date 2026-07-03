const mongoose = require('mongoose');
const SeatLock = require('../models/SeatLock');
const BookingTransaction = require('../models/BookingTransaction');
const FinancialLedger = require('../models/FinancialLedger');
const WalletLedger = require('../models/WalletLedger');
const Payment = require('../models/Payment');

describe('Sprint 9 production booking and financial integrity contracts', () => {
  const organizationId = new mongoose.Types.ObjectId();
  const userId = new mongoose.Types.ObjectId();
  const routeId = new mongoose.Types.ObjectId();

  test('SeatLock models an expiring active seat hold', async () => {
    const lock = new SeatLock({
      organizationId,
      routeId,
      seatNumber: 'A1',
      bookingId: 'BK-S9-1',
      lockedBy: userId,
      expirationTime: new Date(Date.now() + 15 * 60 * 1000)
    });

    await expect(lock.validate()).resolves.toBeUndefined();
    expect(lock.status).toBe('active');
    expect(lock.paymentStatus).toBe('pending');
  });

  test('BookingTransaction records lifecycle transitions and idempotency key', async () => {
    const booking = new BookingTransaction({
      organizationId,
      bookingId: 'BK-S9-2',
      userId,
      idempotencyKey: 'idem-s9-2',
      lifecycle: 'payment_pending',
      amount: 250,
      seats: ['A1', 'A2'],
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      transitions: [
        { from: null, to: 'draft', reason: 'booking_requested' },
        { from: 'draft', to: 'seat_hold', reason: 'seats_locked' },
        { from: 'seat_hold', to: 'payment_pending', reason: 'awaiting_gateway_payment' }
      ]
    });

    await expect(booking.validate()).resolves.toBeUndefined();
    expect(booking.transitions.map((transition) => transition.to)).toEqual(['draft', 'seat_hold', 'payment_pending']);
  });

  test('FinancialLedger requires immutable category, direction, period, and idempotency key', async () => {
    const ledger = new FinancialLedger({
      organizationId,
      userId,
      bookingId: 'BK-S9-3',
      category: 'gateway',
      direction: 'credit',
      amount: 300,
      idempotencyKey: 'gateway-capture:pay-s9-3',
      period: {
        day: '2026-07-03',
        month: '2026-07',
        year: '2026'
      },
      reason: 'gateway_payment_captured'
    });

    await expect(ledger.validate()).resolves.toBeUndefined();
    expect(ledger.currency).toBe('INR');
  });

  test('WalletLedger stores opening and closing balances for audit replay', async () => {
    const ledger = new WalletLedger({
      organizationId,
      userId,
      transactionId: new mongoose.Types.ObjectId(),
      openingBalance: 1000,
      debit: 150,
      credit: 0,
      closingBalance: 850,
      balance: 850,
      actorId: userId,
      referenceId: 'BK-S9-4',
      reason: 'booking_debit'
    });

    await expect(ledger.validate()).resolves.toBeUndefined();
    expect(ledger.openingBalance - ledger.debit + ledger.credit).toBe(ledger.closingBalance);
  });

  test('Payment status history captures production lifecycle movements', async () => {
    const payment = new Payment({
      organizationId,
      userId,
      bookingId: 'BK-S9-5',
      razorpayOrderId: 'order_s9_5',
      razorpayPaymentId: 'pay_s9_5',
      amount: 500,
      status: 'captured',
      statusHistory: [
        { from: 'created', to: 'authorized', reason: 'webhook_payment_authorized' },
        { from: 'authorized', to: 'captured', reason: 'checkout_signature_verified' }
      ]
    });

    await expect(payment.validate()).resolves.toBeUndefined();
    expect(payment.statusHistory).toHaveLength(2);
    expect(payment.statusHistory[1].to).toBe('captured');
  });
});
