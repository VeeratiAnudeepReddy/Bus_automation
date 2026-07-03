const mongoose = require('mongoose');

const paymentWebhookSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', default: null, index: true },
    eventId: { type: String, default: null, unique: true, sparse: true, index: true },
    event: { type: String, required: true, index: true },
    payload: { type: mongoose.Schema.Types.Mixed, required: true },
    signature: { type: String, default: null },
    verified: { type: Boolean, default: false, index: true },
    processedAt: { type: Date, default: null },
    duplicate: { type: Boolean, default: false },
    processingError: { type: String, default: null }
  },
  { timestamps: true }
);

paymentWebhookSchema.index({ event: 1, createdAt: -1 });

module.exports = mongoose.model('PaymentWebhook', paymentWebhookSchema);
