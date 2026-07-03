# Offline Sync

## Model
`backend/models/OfflineQueue.js`

## API
`POST /api/offline/sync`

## Purpose
Drivers and conductors can replay queued trip, location, incident, maintenance, or ticket actions when connectivity returns.

## Future Work
Add client-side IndexedDB persistence and conflict replay UI.
