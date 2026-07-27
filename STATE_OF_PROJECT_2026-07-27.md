# State of Project — 2026-07-27

Ground-truth audit of `Bus_automation` against docs, code, live Mongo Atlas, and a running backend on `:5001`.  
Docs are **not** trusted when they conflict with code/logs.

Working notes during the pass: `_AUDIT_WORKING_NOTES.md` (gitignored).

---

## 1. What this system is

Multi-tenant bus-operator platform (BusQR): Clerk identity, Express/Mongo backend (`:5001`), Next.js 16 frontend (`:3000`). Roles span Super Admin / Org Owner through fleet, finance, pricing, dispatcher, driver, conductor, support, and customer. Original MVP was wallet QR ticketing; sprints 3–9 layered org/RBAC, fleet, pricing, Razorpay foundation, posts/support, dispatch/live tracking, and production infra.

---

## 2. Module status (doc vs code vs runtime)

| Module | Doc vs code | Runtime evidence |
|---|---|---|
| Auth (Clerk JWT) | **Confirmed** — JWKS verify in `clerkJwt.js` | 401 missing/invalid bearer; real Clerk session E2E still pending |
| Organizations / invites | **Confirmed** | 1 active `default` org; invite email not delivered |
| RBAC | **Confirmed / partial** | Middleware live; legacy `admin` left for human decision after migration 004 |
| Wallet | **Confirmed** | Legacy + enterprise routes |
| Ticketing / booking | **Confirmed** | 22 tickets in DB; scan now writes `ValidationLog` |
| Pricing / coupons | **Confirmed** (empty data) | Models/APIs exist; `fareRules` count was 0 |
| Payments / Razorpay | **Confirmed foundation** | Real SDK; keys configured; all prior payments were stuck `created` until expiry job |
| Finance / ledger | **Confirmed** | Ledger models/services present |
| Fleet | **Confirmed** (empty data) | APIs/pages exist; buses/trips were 0 |
| Dispatch / trips | **Confirmed** | Trip APIs under fleet routes |
| Live tracking / SSE | **Drifted** | In-memory SSE; Redis still placeholder |
| Maps | **Partial** | Leaflet + Google embed; no production Directions/Distance Matrix |
| Posts / notifications / support / reports | **Confirmed** | Mounted; mostly foundation UX depth |
| System health / jobs | **Was drifted → fixed** | Health honest; 2 jobs auto-scheduled; 8 stubs declared |
| ValidationLog | **Was drifted → fixed** | Written on scan again |
| Early MVP docs (README / PROJECT_SUMMARY / FINAL_STATUS / COMPLETION_REPORT) | **Drifted / stale** | Claim `/api/register` production-ready MVP — runtime 404 |
| Deployment assets | **Confirmed files** | Compose/nginx/pm2/systemd real; staging cluster not validated |

Artifacts: deleted unreferenced `files.zip` (duplicate of `01_`–`20_` docs) and `image.png`; both gitignored.

---

## 3. Prioritized backlog (Phase 3) — fixed vs deferred

| ID | Severity | Status | Notes |
|---|---|---|---|
| B1 | blocker | **Fixed** | Migration `004_repair_user_tenancy.js` backfilled 4 users’ `organizationId`; `resolveOrganizationId` now persists heal |
| B2 | blocker | **Fixed** | `ticket_expiration` (60s) + `cleanup` (5m) scheduled on boot; log: `job_scheduled` + `job_success` |
| B3 | major | **Partial** | null roles → customer; `user` → customer; **`admin` not auto-translated** (Q1) |
| B4 | major | **Fixed** | `/health` payments.ok keyed on Razorpay keys; stub jobs listed |
| B5 | major | **Mitigated** | Expiry query includes null-`expiresAt` age fallback; first interval run executed successfully |
| B6 | major | **Deferred** | Needs human Clerk browser session |
| B7 | minor | **Fixed** | `QUICKSTART.md` rewritten |
| B8 | minor | **Fixed** | Stray zip/png removed + gitignored |
| B9 | minor | **Fixed** | Scan writes `ValidationLog` |
| B10 | docs | **Partial** | CHANGELOG / KNOWN_ISSUES / HEALTH / BACKGROUND_JOBS / DATABASE_INDEX updated; sprawl consolidation flagged below |
| B11 | major | **Deferred** | Live Razorpay checkout/webhook/settlement |
| B12 | minor | **Deferred** | Invite email provider |
| Q1 | question | **Open** | Map live `admin` (anudeepreddy016@…) → `conductor` or `org_owner`? |
| Q2 | question | **Open** | Razorpay single-account vs Route marketplace |

### Validation evidence (Phase 5)
- `npm test`: **9 suites, 56 tests passed** (was 54; +job registry + ValidationLog assertions).
- Runtime `/health`: `implementedJobs: 2`, `scheduledJobs: 2`, payments configured note present.
- Auth still 401 without bearer.
- Scheduler log excerpt: `job_scheduled` ticket_expiration/cleanup → later `job_success` for ticket_expiration.

---

## 4. Trust index (docs)

### Verified-accurate (post this pass, for the areas they cover)
- `KNOWN_ISSUES.md` (updated)
- `CHANGELOG.md` (2026-07-27 section)
- `HEALTH_ENDPOINTS.md`, `BACKGROUND_JOBS.md`, `LOGGING_ARCHITECTURE.md` (stdout JSON)
- `QUICKSTART.md` (rewritten)
- `DATABASE_INDEX.md` ValidationLog row
- Live `server.js` mount list / route files
- Sprint 8–9 completion claims for **code existence** (not production certification)

### Aspirational / stale — do not trust as current truth
- `README.md`, `PROJECT_SUMMARY.md`, `FINAL_STATUS.md`, `COMPLETION_REPORT.txt`, `QUICK_REFERENCE.txt` — MVP “production ready” narrative
- `MASTER_IMPLEMENTATION_PLAN.md` trailing “Missing” lists (contradict sprint tables and code)
- `18_Implementation_Checklist.md` Phase 2–5 unchecked despite later sprints
- `FEATURE_MATRIX.md` / `API_INDEX.md` trailing Missing sections that name modules already Implemented above
- `PROJECT_AUDIT/*` mid-era security/schema findings (JWT forgeable, Jest missing) — largely superseded; use as historical signal only
- Sprint 6–7 completion reports — weaker verification (no suite counts)

### Consolidation candidates (delete or merge later)
| Cluster | Suggestion |
|---|---|
| MVP completion trio | Merge/archive `COMPLETION_REPORT.txt` + `QUICK_REFERENCE.txt` + `FINAL_STATUS.md` → single `ARCHIVE/mvp_status.md` |
| UI restoration set | Merge `UI_RESTORATION_REPORT.md`, `UI_RESTORATION_PHASE2.md`, `RESTORED_*`, `REMOVED_PLACEHOLDERS.md`, `STABILIZATION_REPORT.md`, `FRONTEND_STABILIZATION_AUDIT.md` |
| Overlapping audits | Prefer root `KNOWN_ISSUES.md` + this file; archive `PROJECT_AUDIT/20_FINAL_AUDIT_REPORT.md` as historical |
| Payment doc swarm | Merge `PAYMENT_*.md`, `RAZORPAY_INTEGRATION.md`, `12_Razorpay_Module.md` into one current payment doc |
| Architecture 01–20 | Keep as **intent** archive; mark header “planning intent, not runtime truth” |

---

## 5. Open questions for humans

1. ~~**Q1 — Role for `anudeepreddy016@gmail.com`**~~ → **Resolved:** `org_owner` on Default Organization (see §7).
2. ~~**Q2 — Razorpay architecture**~~ → **Resolved:** Razorpay Route per organization with platform fallback (see §7).
3. Should migration 004/005 be run in every environment as part of deploy, or one-shot only (already applied to current Atlas `busticket`)?
4. Approve deleting/archiving the stale MVP completion docs listed above?
5. ~~**E2E Clerk session**~~ → **Done** with Backend-API–minted session JWT (see §7). Remaining: browser Hosted Checkout capture (signature verify without checkout correctly fails).

---

## 6. Guardrail notes

- No payment/auth core rewrite: additive expiry, health honesty, ValidationLog write, org heal, scheduler only.
- Live Razorpay capture path untouched pending human review / test-mode penny test.
- New scope beyond `19_Future_Roadmap.md` was **not** invented.

---

## 7. Addendum — Resolved decisions (2026-07-27 evening)

### 7.1 Role fix — `anudeepreddy016@gmail.com`

**Found**
- Confirmed org before write: `organizationId=6a4783e7b2c7aceb7801c063` (Default Organization, `slug=default`, `status=active`).
- Before: `role=admin`, same orgId (already backfilled by migration 004).

**Changed**
- Migration: `backend/migrations/005_promote_anudeep_org_owner.js`
- After: `role=org_owner` (not `super_admin`); `ownerUserId` set to this user.
- AuditLog `6a6785ca17e8feec5325eec8` + structured log `role_promoted_org_owner`.

**Evidence**
```
BEFORE role=admin organizationId=6a4783e7b2c7aceb7801c063
AFTER  role=org_owner organizationId=6a4783e7b2c7aceb7801c063 ownerUserId=69d37a8f04896339c5c0d438
```

---

### 7.2 Razorpay Route (per-organization payouts)

**Changed (additive)**
- `Organization.razorpayRoute`: `{ linkedAccountId, status, onboardedAt, notes }`
- `Payment.routeSettlement`: `linked_account | platform_fallback`; `razorpayLinkedAccountId`
- `paymentService.resolveRouteSettlement` + `buildRouteTransfers`; order create passes `transfers` when active linked account exists
- Platform fallback never blocks payment; logs `razorpay_route_platform_fallback` with orgId/slug/reason
- Org update accepts `razorpayRoute` via `PATCH /api/organizations/:id`
- Docs: `PAYMENT_ARCHITECTURE.md`, `RAZORPAY_INTEGRATION.md`, `FINANCE_RECONCILIATION.md`, `PAYMENT_FLOW.md`
- Tests: +3 in `Sprint4Finance.test.js` (59 total suite pass)

**Not done (flagged, not decided unilaterally)**
- No remapping of historical `Payment` rows to Route linked accounts.

**Runtime evidence (E2E create-order)**
```
payments razorpay_route_platform_fallback organizationId=6a4783e7… slug=default routeStatus=none reason=no linkedAccountId
payments razorpay_order_created routeSettlement=platform_fallback orderId=order_TIamR9EVUIeZLB gatewayAmount=1300
```

---

### 7.3 E2E with real Clerk session

**Setup**
- Created real Clerk test user via Backend API (`user_3H5t2NAYdMTvn5J1WRSJjLg11OH` / `busqr.e2e.…@example.com`).
- Bound app user as `org_owner` on Default Organization `6a4783e7…`.
- Minted session JWT (exp ~60s); refreshed immediately before API calls.

**Flow vs docs**

| Step | Doc | Result | Status |
|---|---|---|---|
| Login / `GET /api/auth/me` | `AUTHENTICATION_FLOW.md` | 200, `exists=true`, `role=org_owner` | **Confirmed** |
| `POST /api/auth/sync` | sync does not auto-create | 200 for existing user | **Confirmed** |
| Routes list | search/browse | 200, 9 routes | **Confirmed** (shape `{city,routes,stops,popularRoutes}`) |
| Gateway booking | `BOOKING_LIFECYCLE.md` HELD until pay | 201, ticket `HELD`, `paymentRequired=true` | **Confirmed** behavior; **Drifted** response omits `lifecycle` field (stored as `payment_pending` in DB) |
| Razorpay test order | `PAYMENT_FLOW.md` | 201, real `order_TIamR9…`, `routeSettlement=platform_fallback` | **Confirmed** |
| Verify without Hosted Checkout | HMAC required | 400 `Invalid payment signature` + `payment_signature_failed` log | **Confirmed** (correct reject) |
| Wallet booking confirmation | wallet → ACTIVE | 201, ticket `ACTIVE`, recover `lifecycle=completed` | **Confirmed** |

**Stopped honestly on gateway capture:** Hosted Checkout was not driven in a browser; fake verify was rejected. Full gateway confirmation still needs a test-mode Checkout completion (or Razorpay payment simulation UI).

**HTTP log excerpts**
```
GET  /api/auth/me     200
POST /api/auth/sync   200
GET  /api/routes      200 user=6a678691… organization=6a4783e7…
POST /api/bookings    201
POST /api/payments/create-order 201
POST /api/payments/verify 400 (signature failed — expected)
POST /api/bookings    201 (wallet)
GET  /api/bookings/…/recover 200 lifecycle=completed
```

---

### 7.4 New open questions

1. ~~Should `POST /api/bookings` response include `lifecycle`?~~ **Resolved** — create booking now returns `lifecycle`.
2. When should Default Organization get a real Razorpay Route `acc_…` linked account (test mode) so E2E exercises `linked_account` instead of fallback?
3. Approve a browser/Playwright Hosted Checkout step for true gateway capture confirmation?
4. Historical payments remapping onto Route — still deferred; decide if ever needed.
5. **Maps realtime:** custom SSE/WebSocket + Maps JS (recommended) vs Google Fleet Engine — awaiting confirmation before full integration.

---

## 8. Production hardening (Phases A–F) — 2026-07-27

Full report: **`PRODUCTION_READINESS_REPORT.md`**.

**Verdict:** not fully launch-certified. Tests green locally (9/61 backend; frontend lint+tsc). CI/deploy workflows present; GitHub Actions run not yet confirmed from this environment. Secrets scrubbed in tree — **rotate** Clerk/Mongo credentials that were in git history. Maps architecture choice still blocked on human confirmation.
