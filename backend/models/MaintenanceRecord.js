const mongoose = require('mongoose');

const maintenanceRecordSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    busId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: true, index: true },
    type: {
      type: String,
      enum: ['preventive', 'breakdown', 'tyre', 'battery', 'engine', 'fitness', 'insurance', 'permit', 'pollution', 'other'],
      default: 'preventive',
      index: true
    },
    status: { type: String, enum: ['open', 'scheduled', 'in_progress', 'completed', 'overdue'], default: 'open', index: true },
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium', index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: null, trim: true },
    scheduledFor: { type: Date, default: null, index: true },
    completedAt: { type: Date, default: null },
    odometer: { type: Number, default: 0, min: 0 },
    cost: { type: Number, default: 0, min: 0 },
    vendor: { type: String, default: null, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
  },
  { timestamps: true }
);

maintenanceRecordSchema.index({ organizationId: 1, busId: 1, scheduledFor: 1 });

module.exports = mongoose.model('MaintenanceRecord', maintenanceRecordSchema);
