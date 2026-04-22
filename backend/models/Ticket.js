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
    routeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Route',
      default: null,
      index: true
    },
    from: {
      type: String,
      default: null,
      trim: true
    },
    to: {
      type: String,
      default: null,
      trim: true
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
    fromCoords: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null }
    },
    toCoords: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null }
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
      },
      routeId: {
        type: String,
        default: null
      },
      from: {
        type: String,
        default: null
      },
      to: {
        type: String,
        default: null
      },
      fare: {
        type: Number,
        default: null
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
