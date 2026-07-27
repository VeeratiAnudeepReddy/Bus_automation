const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', default: null, index: true },
    busId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', default: null, index: true },
    routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', default: null, index: true },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['breakdown', 'traffic', 'accident', 'medical', 'passenger', 'vehicle', 'other'],
      required: true,
      index: true
    },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium', index: true },
    status: { type: String, enum: ['open', 'acknowledged', 'resolved', 'closed'], default: 'open', index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: null, trim: true },
    location: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
      label: { type: String, default: null, trim: true }
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    resolvedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

incidentSchema.index({ organizationId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Incident', incidentSchema);
