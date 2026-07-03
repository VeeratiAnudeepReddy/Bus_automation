const mongoose = require('mongoose');

const tripEventSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true, index: true },
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    type: {
      type: String,
      enum: ['started', 'paused', 'resumed', 'completed', 'delayed', 'breakdown', 'accident', 'stop_skipped', 'note_added', 'boarding_opened', 'boarding_closed', 'ticket_validated', 'overcrowding', 'fare_issue', 'location_updated', 'emergency'],
      required: true,
      index: true
    },
    message: { type: String, default: null, trim: true },
    metadata: mongoose.Schema.Types.Mixed
  },
  { timestamps: true }
);

tripEventSchema.index({ organizationId: 1, tripId: 1, createdAt: -1 });

module.exports = mongoose.model('TripEvent', tripEventSchema);
