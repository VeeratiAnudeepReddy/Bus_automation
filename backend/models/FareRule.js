const mongoose = require('mongoose');

const fareRuleSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: null, trim: true },
    routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', default: null, index: true },
    passengerType: {
      type: String,
      enum: ['adult', 'child', 'student', 'senior', 'staff', 'any'],
      default: 'any',
      index: true
    },
    ruleType: {
      type: String,
      enum: ['flat_fare', 'percentage_adjustment', 'fixed_discount', 'surge_multiplier'],
      required: true
    },
    value: { type: Number, required: true },
    minFare: { type: Number, default: 0 },
    maxFare: { type: Number, default: null },
    priority: { type: Number, default: 100, index: true },
    effectiveFrom: { type: Date, default: Date.now, index: true },
    effectiveTo: { type: Date, default: null, index: true },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft', index: true },
    approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
    version: { type: Number, default: 1 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    publishedAt: { type: Date, default: null },
    reason: { type: String, default: null, trim: true }
  },
  { timestamps: true }
);

fareRuleSchema.index({ organizationId: 1, routeId: 1, status: 1, approvalStatus: 1 });
fareRuleSchema.index({ organizationId: 1, effectiveFrom: 1, effectiveTo: 1 });

module.exports = mongoose.model('FareRule', fareRuleSchema);
