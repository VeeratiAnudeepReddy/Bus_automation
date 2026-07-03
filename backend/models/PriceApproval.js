const mongoose = require('mongoose');

const priceApprovalSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    fareRuleId: { type: mongoose.Schema.Types.ObjectId, ref: 'FareRule', required: true, index: true },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
    reason: { type: String, default: null },
    comments: { type: String, default: null },
    decidedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

priceApprovalSchema.index({ organizationId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('PriceApproval', priceApprovalSchema);
