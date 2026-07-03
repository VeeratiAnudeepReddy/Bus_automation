const mongoose = require('mongoose');

const refundSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    refundId: { type: String, required: true, unique: true, index: true },
    bookingId: { type: String, required: true, index: true },
    ticketIds: [{ type: String }],
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    type: { type: String, enum: ['partial', 'full'], default: 'full' },
    reason: { type: String, default: null },
    status: { type: String, enum: ['requested', 'approved', 'processing', 'completed', 'processed', 'rejected', 'failed'], default: 'processed', index: true },
    gatewayRefundId: { type: String, default: null, index: true },
    source: { type: String, enum: ['wallet', 'gateway', 'wallet_gateway'], default: 'wallet' },
    approvalStatus: { type: String, enum: ['not_required', 'pending', 'approved', 'rejected'], default: 'not_required', index: true },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', default: null },
    walletTransactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'WalletTransaction', default: null },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    processedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

refundSchema.index({ organizationId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Refund', refundSchema);
