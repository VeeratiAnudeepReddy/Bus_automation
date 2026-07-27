# 16 — Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Auth spoofing exploited before the fix lands | Medium (needs someone to try) | Critical — full account takeover, balance manipulation | Explicitly tracked, recommend prioritizing before public launch even though deferred in this planning pass per your instruction |
| Cross-tenant data leak between orgs before org-scoping ships | High once a 2nd org exists | High — one operator sees/edits another's routes/fares | Migration ordering (15) puts org-scoping before any second-org usage is expected |
| Razorpay webhook double-processing | Medium (retries are normal Razorpay behavior) | High — double credit to wallet or double refund | Idempotency key + atomic update pattern (12), explicit replay tests (14) |
| Scope creep into reserved roles (Depot/Fleet/Trip) mid-build | Medium — very tempting once the role hierarchy exists | Medium — timeline blowout, half-built Trip model | Explicit reservation, not silent scoping (07, 10, 11) |
| Coupon/discount abuse (race condition over-redemption) | Low-medium | Medium — revenue leak | Atomic guarded update, same pattern as wallet balance (08) |
| Maps API cost overrun | Low | Low-medium | Server-side caching, billing alerts, separate restricted keys (10) |
| Migration script partial failure mid-backfill | Low | Medium — inconsistent org assignment | Idempotent script design, checked before each write (15) |
| Job runner (new infra — Redis/Agenda) becomes a new single point of failure | Medium | Medium | Scheduled jobs (fare activation, post publish) degrade gracefully — a missed cron tick delays activation by one cycle, doesn't corrupt data; alerting on job runner health recommended in 17 |
