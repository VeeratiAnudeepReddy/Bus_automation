const mongoose = require('mongoose');

const conductorProfileSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    employeeId: { type: String, required: true, trim: true, uppercase: true, index: true },
    assignedBus: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', default: null, index: true },
    assignedRoutes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Route' }],
    attendance: [{ date: Date, status: { type: String, enum: ['present', 'absent', 'leave'], default: 'present' } }],
    shift: {
      name: { type: String, default: 'General' },
      start: { type: String, default: '06:00' },
      end: { type: String, default: '14:00' }
    },
    performance: {
      rating: { type: Number, default: 0, min: 0, max: 5 },
      incidents: { type: Number, default: 0, min: 0 }
    },
    collections: [{ date: Date, amount: Number, method: String }],
    cashCollected: { type: Number, default: 0, min: 0 },
    ticketsValidated: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ['available', 'assigned', 'on_leave', 'suspended', 'inactive'], default: 'available', index: true },
    documents: [{ name: String, url: String, expiresAt: Date, status: String }],
    notes: { type: String, default: null }
  },
  { timestamps: true }
);

conductorProfileSchema.index({ organizationId: 1, userId: 1 }, { unique: true });
conductorProfileSchema.index({ organizationId: 1, employeeId: 1 }, { unique: true });
conductorProfileSchema.index({ organizationId: 1, status: 1, updatedAt: -1 });

module.exports = mongoose.model('ConductorProfile', conductorProfileSchema);
