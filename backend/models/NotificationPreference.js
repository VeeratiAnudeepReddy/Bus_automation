const mongoose = require('mongoose');

const notificationPreferenceSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    inApp: { type: Boolean, default: true },
    booking: { type: Boolean, default: true },
    payment: { type: Boolean, default: true },
    refund: { type: Boolean, default: true },
    assignment: { type: Boolean, default: true },
    maintenance: { type: Boolean, default: true }
  },
  { timestamps: true }
);

notificationPreferenceSchema.index({ organizationId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('NotificationPreference', notificationPreferenceSchema);
