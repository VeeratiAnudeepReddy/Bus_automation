const mongoose = require('mongoose');

const fareHistorySchema = new mongoose.Schema(
  {
    routeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Route',
      required: true,
      index: true
    },
    previousFare: { type: Number, required: true },
    newFare: { type: Number, required: true },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

fareHistorySchema.index({ routeId: 1, createdAt: -1 });

module.exports = mongoose.model('FareHistory', fareHistorySchema);
