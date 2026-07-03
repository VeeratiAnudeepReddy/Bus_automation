const mongoose = require('mongoose');

const financialLedgerSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    bookingId: { type: String, default: null, index: true },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', default: null, index: true },
    refundId: { type: mongoose.Schema.Types.ObjectId, ref: 'Refund', default: null, index: true },
    walletTransactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'WalletTransaction', default: null, index: true },
    routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', default: null, index: true },
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', default: null, index: true },
    category: {
      type: String,
      enum: ['revenue', 'gateway', 'wallet', 'refund', 'tax', 'coupon', 'driver_collection', 'conductor_collection', 'adjustment'],
      required: true,
      index: true
    },
    direction: { type: String, enum: ['debit', 'credit'], required: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    idempotencyKey: { type: String, required: true, index: true },
    period: {
      day: { type: String, required: true, index: true },
      month: { type: String, required: true, index: true },
      year: { type: String, required: true, index: true }
    },
    reason: { type: String, default: null },
    metadata: mongoose.Schema.Types.Mixed
  },
  { timestamps: true }
);

financialLedgerSchema.index({ organizationId: 1, idempotencyKey: 1 }, { unique: true });
financialLedgerSchema.index({ organizationId: 1, category: 1, createdAt: -1 });
financialLedgerSchema.index({ organizationId: 1, 'period.day': 1, category: 1 });

module.exports = mongoose.model('FinancialLedger', financialLedgerSchema);
