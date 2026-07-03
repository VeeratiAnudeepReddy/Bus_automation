# Maps Integration Guide

Current implementation:
- Customer route selection still uses Leaflet/OpenStreetMap.
- `/operations` includes a Google Maps embed preview for Hyderabad bus operations.
- `POST /api/routes/:id/optimize` returns stop sequence, estimated distance, duration, and ETA minutes from stored stops.

Production requirements:
- Add Google Maps browser key restrictions.
- Add server-side Directions API and Distance Matrix API keys.
- Cache route calculations.
- Store decoded polylines and traffic-aware ETA snapshots.
