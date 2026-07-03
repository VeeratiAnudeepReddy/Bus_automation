const mongoose = require('mongoose');

const coordsSchema = new mongoose.Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  { _id: false }
);

const routeSchema = new mongoose.Schema(
  {
    from: { type: String, required: true, trim: true },
    to: { type: String, required: true, trim: true },
    fromNormalized: { type: String, required: true, trim: true, index: true },
    toNormalized: { type: String, required: true, trim: true, index: true },
    fare: { type: Number, required: true, min: 1 },
    routeCode: { type: String, default: null, trim: true, uppercase: true, index: true },
    direction: { type: String, enum: ['UP', 'DOWN', 'LOOP', null], default: null },
    polyline: { type: String, default: null },
    distanceKm: { type: Number, default: 0, min: 0 },
    durationMinutes: { type: Number, default: 0, min: 0 },
    estimatedTime: { type: String, default: null, trim: true },
    routeColor: { type: String, default: '#0f766e', match: /^#[0-9A-Fa-f]{6}$/ },
    zone: { type: String, default: null, trim: true, index: true },
    operatingDays: [{ type: String, enum: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] }],
    operatingHours: {
      start: { type: String, default: '05:00' },
      end: { type: String, default: '23:00' }
    },
    pricingZones: [{ name: String, fare: Number }],
    priority: { type: Number, default: 0, index: true },
    assignedBus: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', default: null, index: true },
    assignedDriver: { type: mongoose.Schema.Types.ObjectId, ref: 'DriverProfile', default: null, index: true },
    assignedConductor: { type: mongoose.Schema.Types.ObjectId, ref: 'ConductorProfile', default: null, index: true },
    city: { type: String, required: true, default: 'Hyderabad', trim: true, index: true },
    active: { type: Boolean, default: true, index: true },
    fromCoords: { type: coordsSchema, required: true },
    toCoords: { type: coordsSchema, required: true },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true
    }
  },
  { timestamps: true }
);

routeSchema.index(
  { organizationId: 1, city: 1, fromNormalized: 1, toNormalized: 1 },
  { unique: true }
);
routeSchema.index({ organizationId: 1, routeCode: 1 }, { sparse: true });
routeSchema.index({ organizationId: 1, active: 1, priority: -1 });

module.exports = mongoose.model('Route', routeSchema);
