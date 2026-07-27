# 14 — Testing Strategy

## Current state
`backend/test-api.sh` — a curl-based smoke script against the *old* dead endpoints
(`/api/register` etc, confirmed dead in 01). Needs replacing, not extending, since it
tests a code path nothing calls anymore.

## Approach
- **Unit tests** (Jest): pure functions first — `resolveEffectiveFare` (08),
  `parseTicketIdFromScan` (existing, untested today), coupon redemption guard logic.
- **Integration tests** (Jest + `mongodb-memory-server`): full request/response cycle
  per new/changed endpoint, run against an in-memory Mongo so no shared test DB state.
- **Concurrency tests**: specifically target the atomic-update patterns — parallel
  booking requests against a near-zero balance to confirm no over-spend; parallel scan
  requests on the same ticket to confirm only one wins; parallel coupon redemption at
  the cap boundary.
- **Webhook replay tests** (Razorpay, 12): same webhook payload delivered twice must
  produce one `PaymentTransaction` state change, not two.
- **Org isolation tests**: the highest-value new test class — create two Organizations,
  confirm a `price_manager` in Org A gets 403/empty-result on every Org B resource, for
  every new org-scoped endpoint. This is the regression suite that protects against the
  cross-tenant leak flagged in 03/06.

## Regression protection for "never break existing APIs"
Before merging the org-scoping changes, snapshot current request/response shapes for
all 12 live endpoints (01 §2) and assert byte-for-byte-equivalent shape (allowing new
optional fields, never removed/renamed fields) post-migration.

## Manual QA checklist per module
Each of 08–12 gets its own manual test script in the coding-agent tasks (20), covering
the specific role-permission matrix for that module rather than one giant shared
checklist.
