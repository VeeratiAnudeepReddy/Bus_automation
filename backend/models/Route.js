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
    city: { type: String, required: true, default: 'Hyderabad', trim: true, index: true },
    active: { type: Boolean, default: true, index: true },
    fromCoords: { type: coordsSchema, required: true },
    toCoords: { type: coordsSchema, required: true }
  },
  { timestamps: true }
);

routeSchema.index({ city: 1, fromNormalized: 1, toNormalized: 1 }, { unique: true });

module.exports = mongoose.model('Route', routeSchema);
