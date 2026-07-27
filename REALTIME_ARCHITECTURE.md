# Realtime Architecture

## Decision
**Option A (selected):** Server-Sent Events + Google Maps JavaScript API.  
Fleet Engine deferred.

## Transport
`GET /api/realtime/events` — org-scoped SSE (Bearer auth).  
Client: `frontend/lib/realtime.ts` (fetch stream; EventSource cannot send Authorization).

## Service
`backend/services/realtimeBus.js` — in-memory org fan-out.

## Events
- `location_updated` (GPS)
- `started`, `completed`, `delayed`, `breakdown`, `accident`
- `boarding_opened`, `boarding_closed`
- `offline_sync`

## Passenger UI
`/track/[tripId]` subscribes to SSE, interpolates marker motion, shows other org vehicles on the same stream via `MultiVehicleMap`.

## Production Note
For horizontal scaling, replace the in-memory bus with Redis pub/sub or a managed realtime gateway.
