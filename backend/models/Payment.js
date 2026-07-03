const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    bookingId: { type: String, default: null, index: true },
    razorpayOrderId: { type: String, required: true, index: true },
    razorpayPaymentId: { type: String, default: null, index: true },
    razorpaySignature: { type: String, default: null },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: { type: String, enum: ['pending', 'created', 'authorized', 'captured', 'failed', 'cancelled', 'expired', 'refund_pending', 'refunded', 'partially_refunded', 'chargeback', 'disputed'], default: 'created', index: true },
    statusHistory: [{
      from: { type: String, default: null },
      to: { type: String, required: true },
      at: { type: Date, default: Date.now },
      actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      reason: { type: String, default: null }
    }],
    provider: { type: String, enum: ['razorpay'], default: 'razorpay' },
    providerMode: { type: String, enum: ['test', 'live'], default: 'test' },
    receipt: { type: String, default: null, index: true },
    paymentMethod: { type: String, enum: ['wallet', 'gateway', 'wallet_gateway'], default: 'gateway' },
    walletAmount: { type: Number, default: 0, min: 0 },
    gatewayAmount: { type: Number, default: 0, min: 0 },
    couponCode: { type: String, default: null, trim: true },
    expiresAt: { type: Date, default: null, index: true },
    idempotencyKey: { type: String, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    verifiedAt: { type: Date, default: null },
    failedAt: { type: Date, default: null },
    failureReason: { type: String, default: null }
  },
  { timestamps: true }
);

paymentSchema.index({ organizationId: 1, idempotencyKey: 1 }, { sparse: true });
paymentSchema.index({ organizationId: 1, createdAt: -1 });
paymentSchema.index({ organizationId: 1, bookingId: 1, status: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
