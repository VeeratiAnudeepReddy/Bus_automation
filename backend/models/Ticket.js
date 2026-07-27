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
    bookingId: {
      type: String,
      default: null,
      index: true
    },
    seatNumber: {
      type: String,
      default: null,
      trim: true
    },
    passengerType: {
      type: String,
      enum: ['adult', 'child', 'student', 'senior', 'staff'],
      default: 'adult',
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
      enum: ['HELD', 'ACTIVE', 'USED', 'CANCELLED', 'EXPIRED', 'REFUNDED'],
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
    scanHistory: [
      {
        scannedAt: { type: Date, default: Date.now },
        scannedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        deviceId: { type: String, default: null },
        ip: { type: String, default: null },
        gps: {
          lat: { type: Number, default: null },
          lng: { type: Number, default: null }
        },
        result: { type: String, enum: ['VALID', 'INVALID', 'DUPLICATE', 'TAMPERED'], default: 'VALID' }
      }
    ],
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
      },
      expiresAt: {
        type: String,
        default: null
      },
      signature: {
        type: String,
        default: null
      },
      encrypted: {
        type: Boolean,
        default: false
      }
    },
    qrExpiresAt: {
      type: Date,
      default: null,
      index: true
    },
    qrSignature: {
      type: String,
      default: null
    },
    fraudFlags: [{ type: String }],
    cancellation: {
      cancelledAt: { type: Date, default: null },
      cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      reason: { type: String, default: null },
      refundAmount: { type: Number, default: 0 }
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

ticketSchema.index({ userId: 1, createdAt: -1 });
ticketSchema.index({ scannedBy: 1, scannedAt: -1 });
ticketSchema.index({ organizationId: 1, bookingId: 1 });

module.exports = mongoose.model('Ticket', ticketSchema);
