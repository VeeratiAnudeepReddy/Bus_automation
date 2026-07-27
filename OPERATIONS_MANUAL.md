# Operations Manual

Open `/operations` for fleet status, active buses, duty counts, trips, maintenance alerts, quick actions, and a Google Maps preview.

Operational modules:
- `/buses`: bus CRUD and maintenance status.
- `/drivers`: driver profiles, license expiry, assignment to buses.
- `/conductors`: conductor profiles, shifts, collections, scanner workflow.
- `/schedules`: recurring trips and conflict detection.
- `/admin/fares`: existing route/fare screen, now backed by route assignment and stop APIs.

Protected fleet endpoints require Clerk bearer auth and derive organization context server-side.
