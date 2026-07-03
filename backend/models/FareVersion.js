const mongoose = require('mongoose');

const fareVersionSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    fareRuleId: { type: mongoose.Schema.Types.ObjectId, ref: 'FareRule', required: true, index: true },
    version: { type: Number, required: true },
    action: { type: String, enum: ['created', 'updated', 'published', 'archived'], required: true },
    snapshot: { type: mongoose.Schema.Types.Mixed, required: true },
    reason: { type: String, default: null },
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

fareVersionSchema.index({ organizationId: 1, fareRuleId: 1, version: -1 });

module.exports = mongoose.model('FareVersion', fareVersionSchema);
