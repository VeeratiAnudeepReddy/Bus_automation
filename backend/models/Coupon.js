const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: null, trim: true },
    discountType: { type: String, enum: ['flat', 'percentage'], required: true },
    discountValue: { type: Number, required: true },
    maxDiscount: { type: Number, default: null },
    minFare: { type: Number, default: 0 },
    minBookingAmount: { type: Number, default: 0 },
    routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', default: null, index: true },
    passengerTypes: [{ type: String, enum: ['adult', 'child', 'student', 'senior', 'staff'] }],
    usageLimit: { type: Number, default: null },
    usedCount: { type: Number, default: 0 },
    perUserLimit: { type: Number, default: 1 },
    startsAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, default: null },
    status: { type: String, enum: ['draft', 'active', 'archived'], default: 'active', index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
  },
  { timestamps: true }
);

couponSchema.index({ organizationId: 1, code: 1 }, { unique: true });
couponSchema.index({ organizationId: 1, status: 1, expiresAt: 1 });

module.exports = mongoose.model('Coupon', couponSchema);
