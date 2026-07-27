const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    scheduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule', required: true, index: true },
    routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true, index: true },
    busId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: true, index: true },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'DriverProfile', required: true, index: true },
    conductorId: { type: mongoose.Schema.Types.ObjectId, ref: 'ConductorProfile', required: true, index: true },
    tripCode: { type: String, required: true, trim: true, uppercase: true },
    serviceDate: { type: Date, required: true, index: true },
    plannedDeparture: { type: String, required: true },
    plannedArrival: { type: String, required: true },
    actualDeparture: { type: Date, default: null },
    actualArrival: { type: Date, default: null },
    status: {
      type: String,
      enum: ['planned', 'assigned', 'scheduled', 'preparing', 'boarding', 'active', 'in_progress', 'delayed', 'paused', 'completed', 'cancelled', 'emergency'],
      default: 'scheduled',
      index: true
    },
    liveLocation: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
      accuracy: { type: Number, default: null },
      speed: { type: Number, default: 0 },
      heading: { type: Number, default: 0 },
      timestamp: { type: Date, default: null },
      deviceInfo: { type: String, default: null, trim: true }
    },
    distanceTravelledKm: { type: Number, default: 0, min: 0 },
    remainingDistanceKm: { type: Number, default: 0, min: 0 },
    estimatedArrival: { type: Date, default: null },
    lastHeartbeatAt: { type: Date, default: null },
    boardingOpen: { type: Boolean, default: false },
    delayMinutes: { type: Number, default: 0, min: 0 },
    cancellationReason: { type: String, default: null, trim: true },
    occupancy: { type: Number, default: 0, min: 0 },
    capacity: { type: Number, default: 0, min: 0 },
    revenue: { type: Number, default: 0, min: 0 },
    notes: { type: String, default: null, trim: true }
  },
  { timestamps: true }
);

tripSchema.index({ organizationId: 1, tripCode: 1, serviceDate: 1 }, { unique: true });
tripSchema.index({ organizationId: 1, status: 1, serviceDate: 1 });

module.exports = mongoose.model('Trip', tripSchema);
