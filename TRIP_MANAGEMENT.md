# Trip Management

## Purpose
A trip is one execution of a schedule on a service date.

## Lifecycle
`scheduled` -> `preparing` -> `boarding` -> `in_progress` -> `completed`

Trips can also become `cancelled`.

## Data
Model: `backend/models/Trip.js`

Tracks schedule, route, bus, driver, conductor, planned and actual times, delay, occupancy, revenue, cancellation reason, and notes.

## APIs
- `GET /api/trips`
- `POST /api/trips`
- `PATCH /api/trips/:id/status`
