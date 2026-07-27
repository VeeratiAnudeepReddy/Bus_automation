const mongoose = require('mongoose');

const walletTransactionSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['credit', 'debit', 'refund', 'recharge', 'transfer', 'adjustment', 'lock', 'freeze', 'coupon_credit', 'reversal', 'booking_debit', 'gateway_adjustment'],
      required: true,
      index: true
    },
    amount: { type: Number, required: true, min: 0 },
    balanceBefore: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'approved', 'completed', 'failed'], default: 'completed', index: true },
    referenceType: { type: String, default: null },
    referenceId: { type: String, default: null },
    idempotencyKey: { type: String, default: null },
    notes: { type: String, default: null },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
  },
  { timestamps: true }
);

walletTransactionSchema.index({ organizationId: 1, userId: 1, createdAt: -1 });
walletTransactionSchema.index({ organizationId: 1, idempotencyKey: 1 }, { sparse: true });
walletTransactionSchema.index({ organizationId: 1, referenceType: 1, referenceId: 1 });

module.exports = mongoose.model('WalletTransaction', walletTransactionSchema);
