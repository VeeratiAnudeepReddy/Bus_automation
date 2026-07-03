const mongoose = require('mongoose');

const transitionSchema = new mongoose.Schema(
  {
    from: { type: String, default: null },
    to: { type: String, required: true },
    reason: { type: String, default: null },
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    at: { type: Date, default: Date.now },
    metadata: mongoose.Schema.Types.Mixed
  },
  { _id: false }
);

const bookingTransactionSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    bookingId: { type: String, required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    idempotencyKey: { type: String, default: null, index: true },
    lifecycle: {
      type: String,
      enum: ['draft', 'seat_hold', 'payment_pending', 'payment_authorized', 'payment_captured', 'ticket_generated', 'completed', 'cancelled', 'expired', 'refunded'],
      default: 'draft',
      index: true
    },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', default: null, index: true },
    amount: { type: Number, default: 0 },
    seats: [{ type: String }],
    expiresAt: { type: Date, default: null, index: true },
    transitions: [transitionSchema],
    metadata: mongoose.Schema.Types.Mixed
  },
  { timestamps: true }
);

bookingTransactionSchema.index({ organizationId: 1, bookingId: 1 }, { unique: true });
bookingTransactionSchema.index({ organizationId: 1, idempotencyKey: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('BookingTransaction', bookingTransactionSchema);
