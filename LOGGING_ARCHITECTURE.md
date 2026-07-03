# Logging Architecture

`backend/utils/logger.js` emits JSON lines with timestamp, level, message, and metadata.

Request logs include request id, route, status, latency, user, organization, and IP.

Log categories include HTTP, database, scheduler, payments, GPS, dispatcher, authentication, audit, security, error, and critical.
