const mongoose = require('mongoose');

const providerDeliverySchema = new mongoose.Schema(
  {
    provider: { type: String, enum: ['email', 'push', 'storage'], required: true, index: true },
    channel: { type: String, default: null },
    recipient: { type: String, default: null },
    template: { type: String, default: null },
    status: { type: String, enum: ['queued', 'sent', 'failed', 'skipped'], default: 'queued', index: true },
    attempts: { type: Number, default: 0 },
    payload: mongoose.Schema.Types.Mixed,
    error: { type: String, default: null },
    sentAt: { type: Date, default: null }
  },
  { timestamps: true }
);

providerDeliverySchema.index({ provider: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('ProviderDelivery', providerDeliverySchema);
