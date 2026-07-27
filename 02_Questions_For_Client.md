# 02 — Questions For Client

Answered so far, recorded for traceability:

- Auth bypass: noted, fix deferred to its own task (not blocking current planning phase).
- Dead route/controller files: confirmed dead by code audit, safe to delete during migration.
- Role hierarchy: full enterprise depth (10+ roles), multi-tenant.
- Org onboarding: self-service.
- Defaulted (no objection raised): org signup is approval-gated by Super Admin before
  going active; reserved roles (Depot Manager, Regional Admin, Fleet Manager, Operations
  Manager, Dispatcher/Scheduler) get schema slots but no working routes yet; existing DB
  data gets backfilled into one default Organization rather than wiped.

## Still open — will block specific modules until answered

### Pricing (blocks 08)
1. Who can approve a price change above what threshold — is there always a
   maker-checker step, or only above a configurable ₹ delta?
2. Do student/employee discounts require document verification, or self-declared?
3. Coupons: single-use per user, or per-code global cap? Stackable with other discounts?
4. Peak/weekend/festival pricing — multiplier on base fare, or fully independent fare
   set per time window?

### Posts (blocks 09)
5. Who can publish without approval — Org Owner only, or also Support/Ops roles?
6. Are comments/likes needed for v1, or just announcements (one-way broadcast)?
7. File uploads for posts — images only, or video too? (affects storage abstraction scope)

### Maps/Routing (blocks 10, 11)
8. Google Maps or Mapbox — do you have an existing API key/billing account for one?
9. Is live GPS tracking in scope now, or is this pass just "better static route
   visualization + ETA estimate," with live tracking as a documented future phase?
10. Circular routes and alternative routes — needed now, or reserved like the Depot/Fleet
    roles?

### Payments (blocks 12)
11. Razorpay test or live keys available? Which entity is registered with Razorpay —
    the platform, or does each Organization need its own Razorpay sub-account (this
    changes the payout architecture significantly under multi-tenancy)?
12. Refunds — automatic on ticket cancellation, or manual approval by Finance Manager?
13. Is GST/tax invoicing a hard requirement for v1, or v2?

### Cross-cutting
14. Notifications: is SMS/WhatsApp a real requirement now (needs a paid provider — Twilio,
    MSG91, etc. — pick one), or is email + in-app enough for v1?
15. Any existing compliance requirement (data retention period, GDPR-equivalent for
    Indian users under the DPDP Act) I should design storage/deletion around?

These are called out again inline in each module's own doc so they're not buried here.
