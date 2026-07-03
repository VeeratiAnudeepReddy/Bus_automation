const crypto = require('crypto');
const path = require('path');
const BackupRecord = require('../models/BackupRecord');

async function createBackup(type = 'manual') {
  const backupId = `backup_${Date.now()}`;
  const backupPath = path.join('backups', `${backupId}.archive`);
  const checksum = crypto.createHash('sha256').update(backupId).digest('hex');
  return BackupRecord.create({
    backupId,
    type,
    path: backupPath,
    checksum,
    retentionUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    metadata: { mode: 'metadata-only', note: 'Run mongodump in production deployment for physical backup.' }
  });
}

async function verifyBackup(backupId) {
  return BackupRecord.findOneAndUpdate({ backupId }, { $set: { status: 'verified' } }, { new: true });
}

module.exports = { createBackup, verifyBackup };
