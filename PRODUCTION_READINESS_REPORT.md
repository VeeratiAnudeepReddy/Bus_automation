# Production Readiness Report — 2026-07-27

Certification pass covering Phases A–F of the production hardening prompt.  
Evidence-backed only — unchecked items are explicitly open.

---

## Executive verdict

**Not fully production-certified yet.** Core API/auth/payment foundations are stronger after this pass, CI is defined, and several critical security hygiene issues were fixed. Launch is still blocked by: **secret rotation** (keys that were in git history), **browser Hosted Checkout verification**, **email/push providers**, and a **maps realtime architecture decision**.

Backend automated tests: **9 suites / 61 passed**.  
Frontend: **eslint clean**, **tsc --noEmit clean**.

---

## Phase A — Bug sweep (checkpoint)

### Fixed (with evidence)
| Item | Evidence |
|---|---|
| Committed Clerk/Mongo secrets in markdown | Scrubbed 8 docs to placeholders; CI secret-scan job added |
| Booking create omitted `lifecycle` | `bookingController.js` now returns `lifecycle`; regression test in `Sprint9FinancialIntegrity.test.js` |
| JWKS fetch hang risk | `clerkJwt.js` 8s AbortController timeout |
| Invite validate over-shared PII | Minimal invite payload in `authController.validateInvite` |
| Payment list/get unhandled errors | try/catch + `next(error)` |
| Driver GPS hardcoded Hyderabad | Driver dashboard now uses `navigator.geolocation` (no silent fake coords) |

### Deferred
| Item | Reason |
|---|---|
| Hosted Checkout capture E2E | Needs browser/Playwright |
| Route `acc_…` on Default Org | Human must create Razorpay linked account |
| Stub background jobs | Non-blocking; documented |
| Binary PDF/Excel | Package selection needed |
| uuid major upgrade | Breaking; moderate advisory only |
| qs/express moderate advisory | Prefer coordinated express upgrade later |

### Needs human
1. **Rotate** Clerk secret and MongoDB password that previously appeared in tracked markdown (git history still contains them until history rewrite).
2. Confirm maps path (below).

---

## Phase B — Security findings

| Severity | Finding | Status | Evidence |
|---|---|---|---|
| Critical | Secrets in tracked docs | **Mitigated in tree** / **rotate required** | Scrub + secret-scan CI; rotation is human |
| High | Webhook secret optional in prod | **Fixed** | `config.validateConfig` requires `RAZORPAY_WEBHOOK_SECRET` in production; webhook path logs + 503 if missing |
| High | JWKS no timeout | **Fixed** | AbortController 8s |
| Medium | CORS loose outside allowlist | **Fixed** | Production exact allowlist only |
| Medium | Health/metrics ops leakage | **Fixed** | Production health redacted; `/metrics` requires `METRICS_PUBLIC=true` or auth context |
| Medium | Invite peek PII | **Fixed** | Minimal fields |
| Medium | Fleet routes auth-only | **Accepted** | Controller-level `MANAGE_ROLES` / `canDispatch` checks present |
| Medium | Razorpay HMAC + webhook verify | **Confirmed** | `verifyPayment` / `verifyWebhook`; unverified webhooks not processed |
| Medium | mongoose advisory | **Fixed** | Upgraded to 7.8.10 |
| Low | In-memory rate limiter | Deferred | Fine single-instance; Redis needed multi-node |
| Info | CSRF | Accepted | Bearer JSON APIs; documented in SECURITY_GUIDE |

Role checks: payment refunds use `requireRole(...)`; fleet mutations check roles in controller (server-side). Frontend hide-only nav is **not** treated as security.

---

## Phase C — CI/CD

### What exists
- `.github/workflows/ci.yml` — on push/PR: backend `npm ci` + `npm test`, frontend lint + **tsc** + build, **secret-scan** job.
- `.github/workflows/deploy.yml` — `workflow_dispatch` / tag `v*`: test gate, docker compose prod build, health check against `secrets.PRODUCTION_HEALTH_URL` (skips cleanly if unset).

### PR run vs deploy run
| | CI (`ci.yml`) | Deploy (`deploy.yml`) |
|---|---|---|
| Trigger | push, pull_request | manual / version tags |
| Tests | Backend jest | Backend jest |
| Frontend | lint, typecheck, build | — |
| Secret scan | Yes | — |
| Docker | — | `docker-compose.prod.yml build` |
| Health | — | `GET {PRODUCTION_HEALTH_URL}/live` + `/ready` |

### Real run confirmation
**Not triggered from this environment** (no push to GitHub Actions). Local equivalent ran: backend 61/61, frontend lint+tsc pass. After you push, confirm Actions is green.

---

## Phase D — UI/UX + maps

### Screen findings (sample)
| Screen | Before | After / status |
|---|---|---|
| Driver | No loading; fake GPS heartbeat; unlabeled actions | Loading + ErrorState + EmptyState; real geolocation; labeled actions |
| Dispatcher | Stats showed `0` while loading | Shows `—` while loading; ErrorState; EmptyState for trips/incidents |
| Booking/wallet/finance/payments/customer | Ad-hoc empties; toast-only errors; unlabeled inputs | Documented debt — not all screens polished this pass |
| Track | REST poll ~7s; Google Maps render | Confirmed not Fleet Engine / not WS |

### Maps decision — **awaiting human confirmation**

| Option | Pros | Cons |
|---|---|---|
| **A. Custom SSE/WebSocket + Google Maps render** (recommended) | Matches existing GPS APIs + in-memory SSE; cheaper; faster to harden | You own reliability/scaling (Redis pub/sub later) |
| **B. Google Fleet Engine** | Managed fleet state, ETA-grade infra | Higher cost, JWT/backend setup, overkill for current poll/stub |

**Do not build full Fleet Engine until confirmed.** Lightweight PoC path A is already partially present (poll + SSE foundation).

---

## Phase E — Testing

| Suite | Result |
|---|---|
| Backend jest | **9 suites, 61 tests passed** |
| Frontend eslint | **passed** |
| Frontend tsc | **passed** |
| Wired into CI | **Yes** (`ci.yml`) |

### Coverage
- Unit/schema/signature: strong for pricing, payment HMAC, org, fleet models, Sprint 9 integrity, production config.
- Integration API with real Mongo: limited (memory/schema-focused).
- Browser E2E Playwright: **gap** (Clerk Hosted Checkout still open).
- Regression added: booking `lifecycle` contract; production webhook secret validation; Route transfer payload tests (prior pass).

### Gaps remaining
- Playwright role matrix
- Full API integration suite against memory Mongo
- Operator journey E2E (dispatch → GPS → complete) automated

---

## Phase F — Checklist & launch split

### Updated `PRODUCTION_CHECKLIST.md` (verified vs aspirational)
See file — only verified items marked.

### Blocks production launch
1. Rotate Clerk + Mongo credentials (history exposure).
2. Production Clerk domains + live Razorpay webhook URL with secret.
3. Browser Hosted Checkout capture verified in test mode.
4. Email provider for invites (or accept manual-link ops forever).
5. Human maps architecture choice before claiming “live tracking.”

### Can ship and fix after
- Binary PDF/Excel exports
- Stub job implementations
- Redis SSE multi-instance
- Permission editor UI
- Full Playwright matrix
- Accounting period close workflows
- Chargeback evidence UI

---

## Guardrail compliance
- Payment/auth changes were additive (config, webhook gate, JWKS timeout, Route already present).
- Maps architecture **not** unilaterally chosen.
- Docs updated alongside code (`SECURITY_GUIDE`, `CI_CD_GUIDE`, `HEALTH_ENDPOINTS`, `PRODUCTION_CHECKLIST`, this report).

---

## Follow-up — Close launch blockers (2026-07-27 evening)

**Maps decision locked:** Option A (custom SSE + Maps JS). Fleet Engine deferred.

**Credential rotation:** still deliberately deferred — remains a launch blocker / open security exposure until done.

### 1. Hosted Checkout capture
| Done | Evidence |
|---|---|
| Booking UI opens Razorpay Hosted Checkout after seat hold | `frontend/lib/razorpayCheckout.ts` + `CustomerBookingPageContent` / booking detail Pay now |
| Real Razorpay test order created | `order_TIb8an4ahHXFO9` |
| Verify + webhook + tickets ACTIVE | `HOSTED_CHECKOUT_LOOP_OK` booking `BK-1785170817102-98413c0c`, payment `captured`, webhook `verified: true`, tickets `['ACTIVE']` |
| Script | `backend/scripts/e2e-hosted-checkout-loop.js` |

**Gap (honest):** loop uses Checkout-equivalent HMAC (same formula Checkout returns) rather than a human/Playwright card fill inside the Razorpay iframe. UI calls `checkout.open()`; interactive card completion in the modal still needs a browser session with test cards.

### 3. Webhooks + email
| Done | Evidence |
|---|---|
| Razorpay bad sig → 400 `verified:false`; good sig → 200 `verified:true` | `WEBHOOK_SIGNATURE_CHECKS_OK` |
| Unverified webhook cannot poison duplicate retry | `paymentService.processWebhook` only short-circuits on `existing.verified` |
| Clerk webhook endpoint + Svix verify | `POST /api/webhooks/clerk`; rejects without `CLERK_WEBHOOK_SECRET` / bad headers |
| Prod config requires `CLERK_WEBHOOK_SECRET` | Jest + `validateConfig` |
| Real email delivery (Ethereal SMTP) | `EMAIL_DELIVERY_OK` status `sent`; preview URLs returned for booking_confirmation + receipt |
| Payment finalize queues booking_confirmation + receipt | `finalizeVerifiedPayment` → `queueEmail` |

**Still open for prod wiring:** point public URLs at Razorpay/Clerk dashboards; set `FEATURE_EMAIL=true` + real `EMAIL_PROVIDER=smtp` (not ethereal) for production; set `CLERK_WEBHOOK_SECRET` in env.

### 4. Realtime Option A
| Done | Evidence |
|---|---|
| GPS ingest already publishes SSE | `updateTripLocation` → `realtimeBus.publish` |
| Auth SSE client | `frontend/lib/realtime.ts` |
| Track page live stream + interpolate | `/track/[tripId]` + `animateMarker` |
| Multi-vehicle | `MULTI_VEHICLE_SSE_OK` trip_1 + trip_2 (4 events) |
| Docs | `GPS_TRACKING.md`, `MAP_INTEGRATION.md`, `MAPS_INTEGRATION_GUIDE.md`, `REALTIME_ARCHITECTURE.md` |
| Maps key | `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` only (referrer restriction = human GCP console step) |

### 5. GitHub Actions CI
| Done | Evidence |
|---|---|
| Real Actions run on push to `v1` | **success** — https://github.com/VeeratiAnudeepReddy/Bus_automation/actions/runs/30286888537 |
| Jobs | `secret-scan` ✓ · `test` (backend tests, frontend lint/tsc/build) ✓ |

### Launch blockers after this follow-up
1. **Rotate Clerk + Mongo credentials** (git history exposure) — deferred by instruction, still open.
2. Interactive Hosted Checkout card completion in a real browser (UI wired; HMAC loop proven).
3. Production public webhook URLs + live secrets for Razorpay/Clerk.
4. Production SMTP (Ethereal is proof-of-delivery only).
5. Restrict Maps API key by HTTP referrer in GCP.
