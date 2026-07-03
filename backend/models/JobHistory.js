const mongoose = require('mongoose');

const jobHistorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
    status: { type: String, enum: ['queued', 'running', 'success', 'failed', 'retrying'], default: 'queued', index: true },
    attempts: { type: Number, default: 0, min: 0 },
    startedAt: { type: Date, default: null },
    finishedAt: { type: Date, default: null },
    error: { type: String, default: null },
    metadata: mongoose.Schema.Types.Mixed
  },
  { timestamps: true }
);

jobHistorySchema.index({ name: 1, createdAt: -1 });

module.exports = mongoose.model('JobHistory', jobHistorySchema);
