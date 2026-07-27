# 08 — Ticket Pricing Module

## Feature overview
Moves pricing from a single flat `Route.fare` number to a rule-based system:
base fare + optional modifiers (peak/weekend/festival multipliers, student/employee
discounts, coupons), with approval workflow and full history/rollback.

## Why needed
Flat per-route fare doesn't match how real Hyderabad private operators price (time-of-day
surcharges, student concessions are near-universal). Also the master prompt requires it.

## Existing integration points
- `Route.fare` — stays as the *cached current effective base fare*, read by
  `ticketController.bookTickets` exactly as today for the hot path (no perf regression
  on booking — the expensive rule resolution happens only when the manager sets a
  price, not on every purchase).
- `FareHistory` — kept, still written on every fare change (see 05).
- `requireFareManagerOrAdmin` → becomes `requireRole('price_manager','org_owner','super_admin')`
  via the shim in 06 — zero call-site changes needed in `adminRoutes.js`.

## Database changes
`FareRule` collection (full schema in 05_Database_Changes.md).

## Backend changes
New `controllers/pricingController.js`:
- `createRule` — validates `activeFrom < activeTo` (or null for indefinite), amount
  sanity checks (flat fares > 0, multipliers between 0.5–3.0 as a sane guard band —
  configurable, not hardcoded blind), writes as `status: draft`.
- `submitForApproval` / `approve` — maker-checker: **open question from 02 (#1)** on the
  exact ₹ threshold that requires approval vs. auto-activates; until answered, default
  implemented is "any change requires org_owner approval," which is the safe default and
  easy to loosen later.
- `resolveEffectiveFare(routeId, timestamp, userSegment)` — pure function, called by
  `bookTickets` at purchase time to compute the actual fare from active rules stacked
  in a defined precedence order: base → peak/weekend/festival multiplier →
  student/employee discount → coupon (coupon applied last, after all multipliers).
- Cron-driven activation: job runner (04) flips `pending`→`active` and previous
  `active`→`archived` exactly at `activeFrom`, so scheduled future pricing doesn't need
  a person online at midnight.

## Frontend changes
- Extend existing admin routes UI (wherever `admin/routes` is rendered — under
  `frontend/app`) with a "Pricing Rules" tab per route rather than a new top-level page,
  since it's conceptually part of route management.
- Price Manager dashboard: pending approvals queue, history timeline (reuses
  `FareHistory` + `AuditLog` data).

## Validation
- No overlapping `active` rules of the same `type` for the same route/time window.
- Coupons: min/max redemption count enforced at redemption time via atomic
  `findOneAndUpdate` with a `$lt` guard (same transactional pattern as wallet balance
  check) to prevent race-condition over-redemption.

## Authorization
`price_manager`/`org_owner` create/edit; `org_owner`/`super_admin` approve;
all org members read.

## Edge cases
- Ticket already booked before a fare rule retroactively changes — booked tickets keep
  their `fare` value as stored (never recalculated after purchase; this is already true
  today since `Ticket.fare` is a snapshot).
- Timezone: `activeFrom`/`activeTo` stored UTC, compared against server time — flagged
  because IST vs UTC off-by-one on date-only festival rules is a common real bug; tests
  in 14 explicitly cover midnight-boundary IST cases.

## Testing / Performance / Security
Standard suite — see 14_Testing_Strategy.md for the shared test plan. Security: rule
approval actions logged to `AuditLog`; rate limit rule creation to prevent spam pricing
changes.
