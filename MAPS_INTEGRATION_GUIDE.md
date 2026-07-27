# Maps Integration Guide

## Setup
1. Enable **Maps JavaScript API** (and Directions if used) in Google Cloud.
2. Create a **browser** API key.
3. Restrict key: HTTP referrers for `http://localhost:3000/*` and your production origin(s).
4. Set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in `frontend/.env.local` (never commit the real key).

## Runtime architecture
```
Driver app → POST /trips/:id/location → Mongo GPSLocation
                                   ↘ realtimeBus.publish(location_updated)
Passenger /track/[tripId] ← GET /realtime/events (SSE) ← animate marker
```

## Local verification
1. Start backend + frontend.
2. Open `/track/<tripId>` while authenticated.
3. POST location updates for that trip (driver UI heartbeat or API).
4. Confirm marker moves smoothly (900ms ease) rather than snapping.
5. Run `node backend/scripts/simulate-multi-vehicle-sse.js` for two-vehicle fan-out.

## Scaling note
In-memory SSE is single-process. For multi-instance deploy, replace `realtimeBus` with Redis pub/sub.
