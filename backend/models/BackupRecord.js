const mongoose = require('mongoose');

const backupRecordSchema = new mongoose.Schema(
  {
    backupId: { type: String, required: true, unique: true, index: true },
    type: { type: String, enum: ['manual', 'scheduled'], default: 'manual' },
    status: { type: String, enum: ['created', 'verified', 'failed', 'restored'], default: 'created', index: true },
    path: { type: String, required: true },
    sizeBytes: { type: Number, default: 0 },
    checksum: { type: String, default: null },
    retentionUntil: { type: Date, default: null },
    metadata: mongoose.Schema.Types.Mixed
  },
  { timestamps: true }
);

module.exports = mongoose.model('BackupRecord', backupRecordSchema);
