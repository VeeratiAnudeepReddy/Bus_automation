# 08 Maps Documentation

## Overview
The project implements Leaflet/OpenStreetMap map pinning for route-based ticket booking. Google Maps and Mapbox are NOT IMPLEMENTED.

## Detailed explanation
Implementation:
- `frontend/components/RouteMapPicker.tsx` imports `leaflet/dist/leaflet.css`.
- Uses `react-leaflet` `MapContainer`, `TileLayer`, `CircleMarker`, `Polyline`, and click events.
- Tile provider: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`.
- `/generate` allows choosing from/to stops, pinning on map, and using browser geolocation.
- Stops and route coordinates come from `GET /api/routes`.

Current capabilities:
- Show stop markers.
- Select source/destination by map click.
- Show from/to markers and a straight polyline.
- Use current browser geolocation.
- Snap typed/pinned points to nearest known stop within 2 km.

Missing capabilities:
- Google Maps: NOT IMPLEMENTED.
- Mapbox: NOT IMPLEMENTED.
- Turn-by-turn routing: NOT IMPLEMENTED.
- Live GPS buses: NOT IMPLEMENTED.
- Driver tracking: NOT IMPLEMENTED.
- ETA calculation: NOT IMPLEMENTED.
- Route alternatives/circular routes: NOT IMPLEMENTED.

Configuration:
No API key is required for current OpenStreetMap tile usage. No maps env var exists.

## Code references
`frontend/components/RouteMapPicker.tsx`, `frontend/app/generate/page.tsx`, `backend/controllers/routeController.js`, `backend/models/Route.js`.

## File references
`10_Maps_Module.md`, `11_Routing_Module.md`.

## API references
`GET /api/routes`, admin route CRUD endpoints.

## Screens
Map appears on `/generate`.

## Dependencies
`leaflet`, `react-leaflet`, browser geolocation.

## Current status
Basic map pinning is implemented. Advanced maps/routing are NOT IMPLEMENTED.

## Recommendations
Keep OSM for low-cost dev or add a selected provider with restricted browser keys, route API, ETA cache, and clear billing controls.
