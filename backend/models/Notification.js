const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    audience: { type: String, enum: ['user', 'organization', 'role'], default: 'user' },
    role: { type: String, default: null },
    channel: { type: String, enum: ['in_app', 'email', 'push'], default: 'in_app' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    category: {
      type: String,
      enum: ['booking', 'payment', 'refund', 'assignment', 'maintenance', 'announcement', 'incident', 'leave', 'dispatch', 'operations', 'trip', 'delay', 'emergency', 'fuel', 'support'],
      default: 'announcement'
    },
    readAt: { type: Date, default: null }
  },
  { timestamps: true }
);

notificationSchema.index({ organizationId: 1, userId: 1, readAt: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
