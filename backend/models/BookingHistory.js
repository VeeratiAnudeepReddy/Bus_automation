const mongoose = require('mongoose');

const bookingHistorySchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    bookingId: { type: String, required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: {
      type: String,
      enum: ['created', 'confirmed', 'payment_captured', 'cancelled', 'refunded', 'ticket_reprinted', 'qr_regenerated'],
      required: true
    },
    before: { type: mongoose.Schema.Types.Mixed, default: null },
    after: { type: mongoose.Schema.Types.Mixed, default: null },
    notes: { type: String, default: null }
  },
  { timestamps: true }
);

bookingHistorySchema.index({ organizationId: 1, createdAt: -1 });

module.exports = mongoose.model('BookingHistory', bookingHistorySchema);
