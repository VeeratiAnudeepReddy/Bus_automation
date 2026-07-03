# Backup Strategy

`backend/services/backupService.js` records backup metadata in `BackupRecord`.

Production physical backup should use:
- MongoDB Atlas backups, or
- scheduled `mongodump`, or
- volume snapshots.

Backup records track id, type, path, status, checksum, retention date, and metadata.
