const mongoose = require('mongoose');

const organizationInviteSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true
    },
    role: {
      type: String,
      required: true,
      enum: [
        'org_admin',
        'operations_manager',
        'fleet_manager',
        'finance_manager',
        'price_manager',
        'dispatcher',
        'scheduler',
        'bus_manager',
        'driver',
        'conductor',
        'support',
        'customer',
        'admin',
        'fare_manager',
        'user'
      ]
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'cancelled', 'expired'],
      default: 'pending',
      index: true
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    acceptedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    acceptedAt: {
      type: Date,
      default: null
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

organizationInviteSchema.index({ organizationId: 1, status: 1, createdAt: -1 });
organizationInviteSchema.index({ organizationId: 1, email: 1, status: 1 });

module.exports = mongoose.model('OrganizationInvite', organizationInviteSchema);
