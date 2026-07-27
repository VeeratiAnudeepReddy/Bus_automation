const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    url: { type: String, default: null, trim: true },
    number: { type: String, default: null, trim: true },
    issuedAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null },
    status: { type: String, enum: ['valid', 'expiring', 'expired', 'missing'], default: 'missing' },
    version: { type: Number, default: 1 }
  },
  { _id: false }
);

const busSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    busNumber: { type: String, required: true, trim: true, uppercase: true, index: true },
    registrationNumber: { type: String, required: true, trim: true, uppercase: true, index: true },
    registrationState: { type: String, default: 'TS', trim: true, uppercase: true },
    vehicleType: { type: String, enum: ['standard', 'mini', 'midi', 'double_decker', 'electric'], default: 'standard' },
    category: { type: String, enum: ['ordinary', 'metro_express', 'deluxe', 'ac', 'airport'], default: 'ordinary' },
    manufacturer: { type: String, default: null, trim: true },
    model: { type: String, default: null, trim: true },
    year: { type: Number, default: null, min: 1980 },
    capacity: { type: Number, required: true, min: 1 },
    seatLayout: { type: String, default: null, trim: true },
    standingCapacity: { type: Number, default: 0, min: 0 },
    fuelType: { type: String, enum: ['diesel', 'cng', 'electric', 'hybrid', 'petrol'], default: 'diesel' },
    fuelTankCapacity: { type: Number, default: 0, min: 0 },
    mileage: { type: Number, default: 0, min: 0 },
    color: { type: String, default: null, trim: true },
    engineNumber: { type: String, default: null, trim: true },
    chassisNumber: { type: String, default: null, trim: true },
    gpsDeviceId: { type: String, default: null, trim: true, index: true },
    currentOdometer: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ['active', 'inactive', 'maintenance', 'assigned', 'retired'],
      default: 'active',
      index: true
    },
    images: [{ type: String, trim: true }],
    amenities: [{ type: String, trim: true }],
    insurance: { type: documentSchema, default: () => ({ name: 'Insurance' }) },
    fitnessCertificate: { type: documentSchema, default: () => ({ name: 'Fitness Certificate' }) },
    pollutionCertificate: { type: documentSchema, default: () => ({ name: 'Pollution Certificate' }) },
    permit: { type: documentSchema, default: () => ({ name: 'Permit' }) },
    roadTax: { type: documentSchema, default: () => ({ name: 'Road Tax' }) },
    documents: [documentSchema],
    maintenanceStatus: {
      type: String,
      enum: ['ok', 'due', 'overdue', 'in_service'],
      default: 'ok',
      index: true
    },
    purchaseDate: { type: Date, default: null },
    purchasePrice: { type: Number, default: 0, min: 0 },
    lastServiceDate: { type: Date, default: null },
    nextServiceDate: { type: Date, default: null, index: true },
    notes: { type: String, default: null, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    isDeleted: { type: Boolean, default: false, index: true }
  },
  { timestamps: true }
);

busSchema.index({ organizationId: 1, registrationNumber: 1 }, { unique: true });
busSchema.index({ organizationId: 1, busNumber: 1 }, { unique: true });
busSchema.index({ organizationId: 1, status: 1, createdAt: -1 });
busSchema.index({ organizationId: 1, maintenanceStatus: 1, nextServiceDate: 1 });

module.exports = mongoose.model('Bus', busSchema);
