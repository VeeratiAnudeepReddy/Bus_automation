# 18 — Implementation Checklist

## Phase 0 — Cleanup (no new features, pure hygiene)
- [x] Delete confirmed dead files (15 step 1) **COMPLETED TASK-001**
- [ ] Rename `test-api.sh` target endpoints or replace with Jest suite (14)

## Phase 1 — Multi-tenancy foundation (blocks everything else)
- [x] `Organization` model + onboarding endpoints (07) **COMPLETED TASK-002, TASK-009**
- [x] Backfill migration (15 steps 2–3) **COMPLETED TASK-003, TASK-004**
- [x] Role enum migration + middleware shim (07, 15 step 4) **COMPLETED TASK-007, TASK-008**
- [x] Org-isolation test suite (14) **FOUNDATION COMPLETE (TASK-006 enables tests)**
- [x] AuditLog model + audit trail (05, 13) **COMPLETED TASK-008**

## Phase 2 — Pricing module (08)
- [ ] `FareRule` model
- [ ] `pricingController` + routes
- [ ] Job runner integration for scheduled activation
- [ ] Frontend pricing UI extension

## Phase 3 — Post module (09)
- [ ] `Post`/`PostComment`/`PostLike` models
- [ ] `postController` + routes
- [ ] Storage abstraction for attachments
- [ ] Frontend posts page + components

## Phase 4 — Maps + Routing (10, 11)
- [ ] Google Maps key setup (server + browser, separately restricted)
- [ ] ETA endpoint + caching
- [ ] Route search endpoint
- [ ] Route versioning/alternate/circular fields
- [ ] Frontend map embed

## Phase 5 — Razorpay (12) — last, per master prompt ordering
- [ ] Confirm single-account vs. Route/marketplace decision (blocking, 02 #11)
- [ ] `PaymentTransaction` model
- [ ] Order creation + webhook + signature verification
- [ ] Refund flow
- [ ] Staging environment with test keys (17)
- [ ] Webhook replay/idempotency test suite (14)

## Cross-cutting, done alongside relevant phase (not a separate phase)
- [x] Audit logging (05, 13) — done during Phase 1 **COMPLETED TASK-008 (AuditLog model + usage)**
- [ ] Rate limiting (13) — add during Phase 2 (Phase 1 foundation doesn't need it yet)
- [ ] CSV export (13) — add during Phase 2/5 where the exportable data actually exists

## Explicitly not in this checklist (reserved, see 07/10/11/13)
Depot/Fleet/Trip/Driver/Schedule features, live GPS tracking, SMS/WhatsApp
notifications, platform billing/subscription model.
