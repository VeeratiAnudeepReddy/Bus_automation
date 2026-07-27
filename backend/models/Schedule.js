const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true, index: true },
    busId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: true, index: true },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'DriverProfile', required: true, index: true },
    conductorId: { type: mongoose.Schema.Types.ObjectId, ref: 'ConductorProfile', required: true, index: true },
    departureTime: { type: String, required: true },
    arrivalTime: { type: String, required: true },
    days: [{ type: String, enum: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] }],
    status: { type: String, enum: ['scheduled', 'active', 'cancelled', 'completed'], default: 'scheduled', index: true },
    frequency: { type: String, enum: ['once', 'daily', 'weekly'], default: 'daily' },
    tripNumber: { type: String, required: true, trim: true, uppercase: true },
    holidaySchedule: { type: Boolean, default: false },
    effectiveFrom: { type: Date, required: true, index: true },
    effectiveTo: { type: Date, default: null, index: true },
    notes: { type: String, default: null }
  },
  { timestamps: true }
);

scheduleSchema.index({ organizationId: 1, tripNumber: 1 }, { unique: true });
scheduleSchema.index({ organizationId: 1, busId: 1, departureTime: 1, effectiveFrom: 1 });
scheduleSchema.index({ organizationId: 1, driverId: 1, departureTime: 1, effectiveFrom: 1 });
scheduleSchema.index({ organizationId: 1, conductorId: 1, departureTime: 1, effectiveFrom: 1 });

module.exports = mongoose.model('Schedule', scheduleSchema);
