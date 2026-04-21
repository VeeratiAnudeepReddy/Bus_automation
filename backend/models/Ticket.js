const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'USED'],
      default: 'ACTIVE',
      index: true
    },
    fare: {
      type: Number,
      required: true
    },
    scannedAt: {
      type: Date,
      default: null
    },
    scannedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    qrPayload: {
      ticketId: {
        type: String,
        required: true
      },
      userId: {
        type: String,
        required: true
      },
      timestamp: {
        type: String,
        required: true
      }
    }
  },
  {
    timestamps: true
  }
);

ticketSchema.index({ userId: 1, createdAt: -1 });
ticketSchema.index({ scannedBy: 1, scannedAt: -1 });

module.exports = mongoose.model('Ticket', ticketSchema);
