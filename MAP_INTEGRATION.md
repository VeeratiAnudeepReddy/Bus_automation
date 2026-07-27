# Map Integration

## Decision (2026-07-27)
**Option A:** custom SSE + Google Maps JavaScript API.  
Not Fleet Engine (cost/setup not justified for internal org fleet).

## Frontend
- `frontend/components/maps/MapView.tsx` — Maps JS loader from `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`, marker interpolation, `TripTrackerMap`, `MultiVehicleMap`
- `frontend/app/track/[tripId]/page.tsx` — SSE subscription + poll fallback
- `frontend/lib/realtime.ts` — authenticated SSE client

## Backend
- GPS ingest: `POST /api/trips/:id/location`
- Broadcast: `backend/services/realtimeBus.js` → `GET /api/realtime/events`

## Security
API keys only from env; restrict Maps key by HTTP referrer in GCP.
