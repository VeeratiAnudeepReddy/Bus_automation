# Route And Schedule Guide

Route records now include fleet operations metadata: route code, direction, polyline, distance, duration, ETA label, color, zone, operating days, operating hours, priority, bus assignment, driver assignment, and conductor assignment.

Stops:
- `GET /api/routes/:routeId/stops`
- `POST /api/routes/:routeId/stops`
- `PATCH /api/routes/:routeId/stops/:stopId`
- `DELETE /api/routes/:routeId/stops/:stopId`

Schedules:
- `GET /api/schedules`
- `POST /api/schedules`
- `PATCH /api/schedules/:id`
- `DELETE /api/schedules/:id`
- `POST /api/schedules/conflicts`

Schedule creation checks bus, driver, and conductor overlap.
