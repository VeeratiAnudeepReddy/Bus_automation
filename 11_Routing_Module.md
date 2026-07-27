# 11 — Routing System

## Scope note
Same reservation principle as 10: Trip/Schedule/Bus-assignment/Driver-assignment
require models that don't exist and aren't in your four mandatory features. This doc
extends what exists (Route CRUD) with what's clearly in-scope (alternative/circular
routes, versioning) and reserves the rest.

## Extending existing Route CRUD (not replacing)
`routeController.createRoute/updateRoute/deleteRoute/toggleRoute` stay exactly as they
are. Additions:

- `alternateOf: ObjectId(Route) | null` — links a route to a "primary" route it's an
  alternative to, so the search endpoint (10) can surface both under one search result
  with a "2 options" affordance, without a data model overhaul.
- `isCircular: Boolean` — when true, `to` is allowed to equal `from` in validation
  (currently probably implicitly disallowed by the fromNormalized/toNormalized unique
  pair being identical — worth an explicit check either way).
- `version` + `previousVersionId` — every `updateRoute` call that changes stops/coords
  (not just fare, which already has FareHistory) creates a new version rather than
  mutating in place, so historical tickets can still resolve which route-shape they were
  bought against. This is additive: reads default to the latest active version unless a
  ticket references an older `routeId` directly (already true today via `Ticket.routeId`).

## Reserved, not built now
Schedules, Trips, Bus assignment, Driver assignment, conflict detection — all need a
Bus/Driver/Trip model. Reserved as a documented phase in 19_Future_Roadmap.md, matching
the reserved role slots (Depot Manager, Fleet Manager, Dispatcher/Scheduler) from 07 —
this is deliberate, not an oversight: building schedules without knowing bus capacity/
driver rostering constraints would produce something that has to be redone anyway.

## Backend/DB changes
`Route` schema gains the three fields above (`alternateOf`, `isCircular`, `version`/
`previousVersionId`) — additive, no migration needed for existing rows beyond a default
`version: 1` backfill.

## Validation
- Circular routes: `from === to` allowed only when `isCircular: true`, rejected
  otherwise (prevents accidental zero-distance routes from bad data entry).
- `alternateOf` must reference a route in the same organization — cross-org linkage
  rejected at the validation layer.
