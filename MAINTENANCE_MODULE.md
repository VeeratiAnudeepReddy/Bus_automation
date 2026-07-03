# Maintenance Module

## Purpose
Fleet managers track preventive service, breakdowns, tyre, battery, engine, fitness, insurance, permit, pollution, and other work.

## Data
Model: `backend/models/MaintenanceRecord.js`

Fields include bus, type, status, priority, title, schedule date, vendor, odometer, cost, and completion.

## APIs
- `GET /api/maintenance`
- `POST /api/maintenance`
- `PATCH /api/maintenance/:id`

## Screen
`/maintenance`
