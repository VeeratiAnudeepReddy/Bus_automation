const mongoose = require('mongoose');

const offlineQueueSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    entityType: { type: String, enum: ['trip', 'location', 'incident', 'maintenance', 'ticket'], required: true },
    entityId: { type: mongoose.Schema.Types.ObjectId, default: null },
    action: { type: String, required: true, trim: true },
    payload: mongoose.Schema.Types.Mixed,
    status: { type: String, enum: ['pending', 'synced', 'failed'], default: 'pending', index: true },
    attempts: { type: Number, default: 0, min: 0 },
    lastError: { type: String, default: null, trim: true },
    syncedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

offlineQueueSchema.index({ organizationId: 1, userId: 1, status: 1, createdAt: 1 });

module.exports = mongoose.model('OfflineQueue', offlineQueueSchema);
