const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    profileType: { type: String, enum: ['driver', 'conductor'], required: true, index: true },
    profileId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    fromDate: { type: Date, required: true, index: true },
    toDate: { type: Date, required: true, index: true },
    reason: { type: String, required: true, trim: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'cancelled'], default: 'pending', index: true },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt: { type: Date, default: null },
    reviewNote: { type: String, default: null, trim: true }
  },
  { timestamps: true }
);

leaveRequestSchema.index({ organizationId: 1, status: 1, fromDate: 1 });

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);
