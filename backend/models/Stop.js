const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true, index: true },
    name: { type: String, required: true, trim: true },
    latitude: { type: Number, required: true, min: -90, max: 90 },
    longitude: { type: Number, required: true, min: -180, max: 180 },
    order: { type: Number, required: true, min: 0 },
    arrivalTime: { type: String, default: null },
    departureTime: { type: String, default: null },
    fareStage: { type: Number, default: 0, min: 0 },
    landmark: { type: String, default: null, trim: true },
    zone: { type: String, default: null, trim: true, index: true },
    shelter: { type: Boolean, default: false },
    active: { type: Boolean, default: true, index: true }
  },
  { timestamps: true }
);

stopSchema.index({ organizationId: 1, routeId: 1, order: 1 }, { unique: true });
stopSchema.index({ organizationId: 1, routeId: 1, name: 1 });

module.exports = mongoose.model('Stop', stopSchema);
