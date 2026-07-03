const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[a-z0-9-]+$/,
      index: true
    },
    city: {
      type: String,
      default: 'Hyderabad',
      trim: true,
      index: true
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'suspended', 'archived'],
      default: 'pending',
      index: true
    },
    ownerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    billingContact: {
      name: { type: String, default: null },
      email: { type: String, default: null },
      phone: { type: String, default: null }
    },
    contact: {
      email: { type: String, default: null, trim: true, lowercase: true },
      phone: { type: String, default: null, trim: true },
      supportEmail: { type: String, default: null, trim: true, lowercase: true }
    },
    address: {
      line1: { type: String, default: null, trim: true },
      line2: { type: String, default: null, trim: true },
      city: { type: String, default: 'Hyderabad', trim: true },
      state: { type: String, default: 'Telangana', trim: true },
      pincode: { type: String, default: null, trim: true },
      country: { type: String, default: 'India', trim: true }
    },
    businessDetails: {
      legalName: { type: String, default: null, trim: true },
      gstNumber: {
        type: String,
        default: null,
        trim: true,
        uppercase: true,
        match: [/^$|^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/, 'Invalid GST number']
      },
      registrationNumber: { type: String, default: null, trim: true },
      website: { type: String, default: null, trim: true }
    },
    branding: {
      logoUrl: { type: String, default: null, trim: true },
      primaryColor: {
        type: String,
        default: '#111827',
        match: [/^#[0-9A-Fa-f]{6}$/, 'Invalid primary color']
      },
      secondaryColor: {
        type: String,
        default: '#f59e0b',
        match: [/^#[0-9A-Fa-f]{6}$/, 'Invalid secondary color']
      },
      accentColor: {
        type: String,
        default: '#0f766e',
        match: [/^#[0-9A-Fa-f]{6}$/, 'Invalid accent color']
      }
    },
    settings: {
      timezone: { type: String, default: 'Asia/Kolkata', trim: true },
      currency: { type: String, default: 'INR', trim: true, uppercase: true },
      ticketPrefix: { type: String, default: 'BUS', trim: true, uppercase: true },
      allowPublicBooking: { type: Boolean, default: true }
    },
    subscription: {
      plan: { type: String, enum: ['trial', 'standard', 'enterprise'], default: 'trial' },
      status: { type: String, enum: ['trialing', 'active', 'past_due', 'cancelled'], default: 'trialing' },
      renewsAt: { type: Date, default: null }
    }
  },
  {
    timestamps: true
  }
);

// Add index for faster lookups
organizationSchema.index({ slug: 1 }, { unique: true });
organizationSchema.index({ status: 1, createdAt: -1 });
organizationSchema.index({ city: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Organization', organizationSchema);
