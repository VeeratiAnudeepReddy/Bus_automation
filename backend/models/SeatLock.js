const mongoose = require('mongoose');

const seatLockSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true, index: true },
    seatNumber: { type: String, required: true, trim: true, index: true },
    bookingId: { type: String, required: true, index: true },
    lockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: { type: String, enum: ['active', 'released', 'expired', 'captured'], default: 'active', index: true },
    paymentStatus: { type: String, enum: ['pending', 'authorized', 'captured', 'failed', 'expired', 'refunded'], default: 'pending', index: true },
    lockTime: { type: Date, default: Date.now },
    expirationTime: { type: Date, required: true, index: true },
    releasedAt: { type: Date, default: null },
    reason: { type: String, default: null }
  },
  { timestamps: true }
);

seatLockSchema.index(
  { organizationId: 1, routeId: 1, seatNumber: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'active' } }
);
seatLockSchema.index({ organizationId: 1, bookingId: 1 });

module.exports = mongoose.model('SeatLock', seatLockSchema);
