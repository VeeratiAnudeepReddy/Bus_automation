const mongoose = require('mongoose');

const fuelRecordSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    busId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: true, index: true },
    filledAt: { type: Date, default: Date.now, index: true },
    litres: { type: Number, required: true, min: 0 },
    pricePerLitre: { type: Number, required: true, min: 0 },
    totalCost: { type: Number, required: true, min: 0 },
    odometer: { type: Number, default: 0, min: 0 },
    distanceKm: { type: Number, default: 0, min: 0 },
    efficiencyKmPerLitre: { type: Number, default: 0, min: 0 },
    vendor: { type: String, default: null, trim: true },
    notes: { type: String, default: null, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
  },
  { timestamps: true }
);

fuelRecordSchema.index({ organizationId: 1, busId: 1, filledAt: -1 });

module.exports = mongoose.model('FuelRecord', fuelRecordSchema);
