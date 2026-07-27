# GPS Tracking

## Model
`backend/models/GPSLocation.js`

## Ingestion APIs
- `POST /api/trips/:id/location` — driver/conductor/dispatcher GPS heartbeat (auth + crew/dispatch roles)
- `GET /api/trips/:id/location` — latest point
- `GET /api/trips/:id/history` — recent trail
- `GET /api/trips/:id/passenger-status` (passenger trip status) — trip + location + events

Each successful location write:
1. Persists `GPSLocation`
2. Updates `Trip.liveLocation` / heartbeat fields
3. Creates `TripEvent` `location_updated`
4. Publishes SSE via `realtimeBus.publish(organizationId, 'location_updated', { trip, location })`

## Realtime push (Option A — custom SSE + Maps JS)
- Stream: `GET /api/realtime/events` (Bearer auth; org-scoped in-memory SSE)
- Frontend: `frontend/lib/realtime.ts` uses fetch + ReadableStream (EventSource cannot send Authorization)
- Passenger UI: `/track/[tripId]` subscribes to SSE, updates markers with interpolation (`animateMarker`), falls back to polling if stream drops
- Multi-vehicle: same org stream can carry multiple trip IDs; `MultiVehicleMap` renders concurrent markers

## Maps API key
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (browser key) — never hardcode
- Restrict by HTTP referrer in Google Cloud Console (localhost + production domains)

## Concurrent vehicle test
```bash
cd backend && node scripts/simulate-multi-vehicle-sse.js
```
Expect `MULTI_VEHICLE_SSE_OK` with two distinct `tripIds`.

## Not used
Google Fleet Engine — deferred unless the platform becomes a multi-operator marketplace.
