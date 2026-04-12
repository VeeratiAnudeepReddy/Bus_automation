const mongoose = require('mongoose');

const validationLogSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    status: {
      type: String,
      enum: ['VALID', 'INVALID', 'ALREADY_USED'],
      required: true
    },
    scannedAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

validationLogSchema.index({ status: 1, scannedAt: -1 });

module.exports = mongoose.model('ValidationLog', validationLogSchema);
