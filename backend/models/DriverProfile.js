const mongoose = require('mongoose');

const docSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    url: { type: String, default: null, trim: true },
    expiresAt: { type: Date, default: null },
    status: { type: String, enum: ['valid', 'expiring', 'expired', 'missing'], default: 'missing' }
  },
  { _id: false }
);

const driverProfileSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    licenseNumber: { type: String, required: true, trim: true, uppercase: true, index: true },
    licenseType: { type: String, default: 'transport', trim: true },
    expiryDate: { type: Date, required: true, index: true },
    experienceYears: { type: Number, default: 0, min: 0 },
    bloodGroup: { type: String, default: null, trim: true },
    medicalCertificate: { type: docSchema, default: () => ({ name: 'Medical Certificate' }) },
    policeVerification: { type: docSchema, default: () => ({ name: 'Police Verification' }) },
    documents: [docSchema],
    emergencyContact: {
      name: { type: String, default: null },
      phone: { type: String, default: null },
      relation: { type: String, default: null }
    },
    assignedBus: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', default: null, index: true },
    assignedRoutes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Route' }],
    attendance: [{ date: Date, status: { type: String, enum: ['present', 'absent', 'leave'], default: 'present' } }],
    leaveBalance: { type: Number, default: 0, min: 0 },
    joiningDate: { type: Date, default: null },
    status: { type: String, enum: ['available', 'assigned', 'on_leave', 'suspended', 'inactive'], default: 'available', index: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    violations: [{ date: Date, note: String }],
    accidents: [{ date: Date, note: String }],
    notes: { type: String, default: null }
  },
  { timestamps: true }
);

driverProfileSchema.index({ organizationId: 1, userId: 1 }, { unique: true });
driverProfileSchema.index({ organizationId: 1, licenseNumber: 1 }, { unique: true });
driverProfileSchema.index({ organizationId: 1, status: 1, expiryDate: 1 });

module.exports = mongoose.model('DriverProfile', driverProfileSchema);
