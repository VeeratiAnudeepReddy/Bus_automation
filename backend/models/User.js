const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    avatar: {
      type: String,
      default: null,
      trim: true
    },
    phone: {
      type: String,
      default: 'N/A',
      trim: true
    },
    employeeId: {
      type: String,
      default: null,
      trim: true,
      uppercase: true
    },
    designation: {
      type: String,
      default: null,
      trim: true
    },
    department: {
      type: String,
      default: null,
      trim: true,
      index: true
    },
    joiningDate: {
      type: Date,
      default: null
    },
    lastLogin: {
      type: Date,
      default: null
    },
    balance: {
      type: Number,
      default: 1000,
      min: 0
    },
    role: {
      type: String,
      enum: [
        // Old role strings (kept for transition window, deprecated)
        'user', 'admin', 'fare_manager',
        // New role strings (preferred, aligned with 07_Role_Hierarchy.md)
        'customer', 'conductor', 'price_manager',
        // Full role hierarchy (existing implementation + reserved)
        'super_admin', 'org_owner', 'org_admin', 'regional_admin', 'depot_manager', 'fleet_manager',
        'finance_manager', 'operations_manager', 'dispatcher', 'scheduler', 'bus_manager', 'driver', 'support'
      ],
      default: 'customer'
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'PENDING', 'INVITED', 'SUSPENDED', 'DEACTIVATED', 'ARCHIVED'],
      default: 'ACTIVE',
      index: true
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    },
    deletedAt: {
      type: Date,
      default: null
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    notes: {
      type: String,
      default: null,
      trim: true
    },
    emergencyContact: {
      name: { type: String, default: null, trim: true },
      phone: { type: String, default: null, trim: true },
      relation: { type: String, default: null, trim: true }
    },
    address: {
      line1: { type: String, default: null, trim: true },
      line2: { type: String, default: null, trim: true },
      city: { type: String, default: 'Hyderabad', trim: true },
      state: { type: String, default: 'Telangana', trim: true },
      pincode: { type: String, default: null, trim: true },
      country: { type: String, default: 'India', trim: true }
    },
    dateOfBirth: {
      type: Date,
      default: null
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'non_binary', 'prefer_not_to_say', null],
      default: null
    },
    language: {
      type: String,
      default: 'en',
      trim: true
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata',
      trim: true
    },
    preferences: {
      theme: { type: String, enum: ['system', 'light', 'dark'], default: 'system' },
      compactMode: { type: Boolean, default: false }
    },
    notificationSettings: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true },
      operations: { type: Boolean, default: true },
      finance: { type: Boolean, default: true }
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    clerkUserId: {
      type: String,
      sparse: true,
      unique: true,
      index: true
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

// Add index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ clerkUserId: 1 });
userSchema.index({ organizationId: 1, role: 1, createdAt: -1 });
userSchema.index({ organizationId: 1, status: 1, createdAt: -1 });
userSchema.index({ organizationId: 1, email: 1 });
userSchema.index({ organizationId: 1, employeeId: 1 }, { sparse: true });
userSchema.index({ organizationId: 1, department: 1, designation: 1 });
userSchema.index({ organizationId: 1, isActive: 1, isDeleted: 1 });

module.exports = mongoose.model('User', userSchema);
