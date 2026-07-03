# Dispatcher Module

## Purpose
The dispatcher control center is the live operations room for assigning and monitoring trips, buses, drivers, conductors, delays, cancellations, incidents, and leave.

## Screens
- `/dispatcher`
- `/trips`
- `/calendar`
- `/incidents`
- `/leave`

## APIs
- `GET /api/dispatcher/dashboard`
- `GET /api/trips`
- `POST /api/trips`
- `PATCH /api/trips/:id/status`
- `GET /api/incidents`
- `POST /api/incidents`
- `PATCH /api/incidents/:id`

## Roles
Primary access: `dispatcher`, `operations_manager`, `org_admin`, `org_owner`, `super_admin`.

## Notes
Schedule conflict prevention continues to use `backend/services/assignmentService.js`.
