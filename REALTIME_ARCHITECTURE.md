# Realtime Architecture

## Transport
Sprint 7 uses Server-Sent Events through `GET /api/realtime/events`.

## Service
`backend/services/realtimeBus.js` stores organization-scoped in-memory SSE clients and publishes events.

## Events
- `location_updated`
- `started`
- `completed`
- `delayed`
- `breakdown`
- `accident`
- `boarding_opened`
- `boarding_closed`
- `offline_sync`

## Production Note
For horizontal scaling, replace the in-memory bus with Redis pub/sub or a managed realtime gateway.
