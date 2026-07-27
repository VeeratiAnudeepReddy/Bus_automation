# Background Jobs

`backend/services/jobService.js` registers jobs and stores run history in `JobHistory`.

On boot (`server.js`), jobs that declare `intervalMs` are started with `startScheduledJobs()` when `FEATURE_FLAGS.jobs` is enabled (disabled under `NODE_ENV=test`).

## Implemented (real work)
- `ticket_expiration` — expires seat locks, pending payments (including null-`expiresAt` age fallback), held tickets / booking transactions. Auto-scheduled every 60s.
- `cleanup` — same expiry helper. Auto-scheduled every 5 minutes.

## Stubs (registered, `implemented: false`, return zero counters)
- wallet reconciliation
- payment verification
- notification retry
- report generation
- expired invite cleanup
- audit archival
- daily summary
- monthly report

Manual run (super_admin): `POST /api/jobs/:name/run`
