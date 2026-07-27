const mongoose = require('mongoose');

const gpsLocationSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true, index: true },
    busId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', default: null, index: true },
    latitude: { type: Number, required: true, min: -90, max: 90 },
    longitude: { type: Number, required: true, min: -180, max: 180 },
    accuracy: { type: Number, default: null },
    speed: { type: Number, default: 0, min: 0 },
    heading: { type: Number, default: 0, min: 0, max: 360 },
    distanceTravelledKm: { type: Number, default: 0, min: 0 },
    remainingDistanceKm: { type: Number, default: 0, min: 0 },
    estimatedArrival: { type: Date, default: null },
    deviceInfo: { type: String, default: null, trim: true },
    recordedAt: { type: Date, default: Date.now, index: true }
  },
  { timestamps: true }
);

gpsLocationSchema.index({ organizationId: 1, tripId: 1, recordedAt: -1 });

module.exports = mongoose.model('GPSLocation', gpsLocationSchema);
