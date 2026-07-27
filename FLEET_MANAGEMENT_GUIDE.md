# Fleet Management Guide

Use `/buses` to manage organization buses. The page supports search, status filtering, create, maintenance visibility, document alert fields, CSV export, and JSON import through the backend.

Primary APIs:
- `GET /api/buses`
- `POST /api/buses`
- `PATCH /api/buses/:id`
- `DELETE /api/buses/:id`
- `PATCH /api/buses/:id/status`
- `PATCH /api/buses/:id/maintenance`
- `GET /api/buses/export`
- `POST /api/buses/import`

Every bus is organization-scoped and contains registration, capacity, amenities, images, document, maintenance, odometer, GPS, and service-reminder fields.
