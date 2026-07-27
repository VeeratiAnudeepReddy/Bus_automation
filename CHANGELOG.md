# Changelog

## 2026-07-27

### Launch-blocker follow-up (maps = Option A)
- Wired Razorpay Hosted Checkout into booking + wallet; verified order→verify→webhook→ACTIVE tickets loop.
- Added Clerk Svix webhook endpoint; hardened Razorpay webhook duplicate handling; Ethereal email delivery proven.
- Passenger track page uses authenticated SSE + interpolated multi-vehicle markers.
- Credential rotation remains explicitly open / deferred.

### Production hardening sweep
- Scrubbed committed Clerk/Mongo secrets from tracked markdown; added CI secret-scan.
- Hardened production config (Razorpay webhook secret required), JWKS timeout, CORS, health redaction, metrics gate.
- Booking create returns `lifecycle`; driver GPS uses device geolocation; dispatcher loading/empty/error polish.
- Expanded CI (typecheck + secret scan) and added manual/tag deploy workflow with health check hook.
- Wrote `PRODUCTION_READINESS_REPORT.md` and refreshed production checklist.

### Follow-up (resolved decisions)
- Migration `005_promote_anudeep_org_owner.js`: `anudeepreddy016@…` `admin` → `org_owner` on Default Organization (not super_admin); AuditLog recorded.
- Razorpay Route: per-org linked accounts with platform fallback + structured `razorpay_route_platform_fallback` logs; docs updated; no historical payment remapping.
- E2E: real Clerk session JWT → auth → routes → gateway booking/order (fallback) → signature reject without checkout → wallet booking confirmation. Tests 59 passed.

### Fixed (audit ground-truth pass)
- Added `migrations/004_repair_user_tenancy.js` to backfill missing `organizationId`, fix null roles, and translate legacy `user` → `customer` (leaves legacy `admin` for human review).
- `resolveOrganizationId` now persists a default-org heal onto the user record when org binding is missing.
- Background jobs: `ticket_expiration` and `cleanup` now auto-schedule on boot; stub jobs are marked `implemented: false`.
- Pending payments without `expiresAt` older than 15 minutes are expired by cleanup (fixes stuck `created` rows).
- `/health` payments.ok now reflects whether Razorpay keys are configured; scheduler reports stub vs scheduled jobs.
- Ticket scan again writes `ValidationLog` (`VALID` / `INVALID` / `ALREADY_USED`).
- Replaced stale `QUICKSTART.md` MVP curl flow (`/api/register`) with current Clerk-auth quick start.
- Gitignored stray `files.zip` / `image.png` duplicates.

### Evidence
- Backend `npm test`: 9 suites (extended coverage for job registry + ValidationLog).
- Runtime: `/health`, `/ready`, auth 401 without bearer confirmed against live Mongo Atlas.

## 2026-07-03

### Sprint 9 Added
- Added `SeatLock`, `BookingTransaction`, and `FinancialLedger` models.
- Added booking idempotency, active seat-lock availability checks, gateway-held tickets, and booking recovery API.
- Added payment status history and expanded payment/refund lifecycle states.
- Added ledger-backed finance dashboard totals and report metrics.
- Added wallet ledger opening/closing balance replay fields.
- Added invoice and receipt JSON/printable HTML booking endpoints.
- Added stale seat-lock, pending payment, held-ticket, and booking expiry cleanup through background jobs.
- Added Sprint 9 financial integrity tests and documentation.

### Sprint 8.5 Added
- Added official Razorpay SDK integration behind a provider abstraction.
- Added server-created Razorpay orders, backend signature verification, webhook verification, idempotent webhook storage, and provider-backed refunds.
- Added wallet/gateway split metadata and payment finalization records for invoices, receipts, notifications, and booking history.
- Added frontend Razorpay Standard Checkout loading and backend verification call.
- Added Sprint 8.5 payment documentation.

### Sprint 8 Added
- Added centralized validated backend configuration.
- Added request IDs, JSON logging, security headers, request sanitization, CORS policy, rate limits, API version headers, and standard error middleware.
- Added `/api/v1` aliases while preserving legacy `/api` paths.
- Added `/health`, `/ready`, `/live`, and `/metrics`.
- Added background job, backup metadata, email/push/storage provider foundations.
- Added Docker, Compose, Nginx, PM2, systemd, GitHub Actions, and production smoke assets.
- Added Sprint 8 infrastructure tests and documentation.

### Added
- Added project audit and enterprise tracking documents.
- Added default organization resolver for compatibility while full organization management is incomplete.
- Added backend Clerk JWT verification middleware.
- Added backend auth middleware tests.
- Added frontend role helper utilities for old and newer role values.
- Added Sprint 1 organization management UI at `/organization`.
- Added organization dashboard, profile, settings, branding, member list, invite management, organization switching, and archive flows.
- Added super admin organization approve/suspend actions to the organization workspace.
- Added persistent `OrganizationInvite` model with hashed invite tokens.
- Added organization dashboard/list/member/invite/switch/archive APIs.
- Added Sprint 2 enterprise user management APIs and screens.
- Added `/organization/users`, `/organization/users/new`, and `/organization/users/[id]`.
- Added user CRUD, profile editing, role assignment, status actions, bulk actions, import/export, and activity timeline.
- Added enterprise user model tests.
- Added Sprint 3 fleet operations platform APIs and screens.
- Added Bus, DriverProfile, ConductorProfile, Stop, and Schedule models.
- Added assignment engine, schedule conflict checks, route stop APIs, and operations dashboard.
- Added `/operations`, `/buses`, `/drivers`, `/conductors`, and `/schedules`.
- Added Sprint 3 completion/reference documents.
- Added Sprint 4 enterprise pricing, coupons, booking, wallet ledger, Razorpay payment foundation, finance, reports, audit, notifications, and role dashboard foundation.
- Added Sprint 4 models: FareRule, Coupon, FareVersion, PriceApproval, BookingHistory, Refund, Invoice, Receipt, WalletTransaction, WalletLedger, Payment, PaymentWebhook, Notification, and NotificationPreference.
- Added Sprint 4 frontend routes for pricing, coupons, booking, bookings, refunds, wallet history/recharge/transactions, finance, payments, customer, conductor, driver, audit, and reports.
- Added Sprint 4 architecture and test result documents.
- Added Sprint 4.5 first-run setup, account decision, employee invite onboarding, profile completion, role routing, and role-aware navigation.
- Added `/setup`, `/register`, `/choose-account`, `/accept-invite`, `/complete-profile`, `/organizations/new`, `/super-admin`, `/pricing`, `/support`, and `/notifications`.
- Added Sprint 4.6 enterprise shell, sidebar/topbar, global search, profile, settings, help, onboarding, 403, custom 404, and reusable UX state components.
- Added Sprint 5 posts/announcements, support desk, notification read actions, module reports, backend global search, and shell-native pages.
- Added `Post` and `SupportTicket` models with focused tests.
- Added Sprint 5.5 fleet/dispatcher dashboards, role-specific profile completion, direct global-search result links, topbar breadcrumbs, and route-audit documentation.

### Changed
- Secured `POST /api/auth/sync` so the Clerk user id comes from the verified token instead of request body input.
- Updated frontend API calls to send Clerk bearer tokens.
- Updated user sync, route writes, ticket booking, and fare-history writes to include organization context.
- Updated project indexes and progress documents to reflect current implementation state.
- Expanded `Organization` with address, GST, business, branding, settings, and subscription fields.
- Expanded `User` roles/status/indexes for organization member management.
- Expanded `User` with enterprise profile, employee, soft-delete, preferences, notification, and audit fields.
- Replaced in-memory invite handling with persistent invite records.
- Extended `Route` with fleet assignment, stop/routing metadata, operating days, timing, color, zone, and priority.
- Extended `Ticket` with booking, seat, passenger, cancellation, QR expiry, fraud, and scan-history fields.
- Updated legacy wallet add and ticket booking flows to write wallet transactions and ledger entries.
- Changed auth sync to no longer auto-create `customer` users during generic Clerk signup.
- Replaced hardcoded navigation with role-aware navigation.
- Updated `PageShell` to provide a desktop enterprise layout while preserving mobile tabs.
- Expanded reporting and search APIs for organization-scoped daily-use workflows.
- Refined role dashboard routing so roles no longer collapse into generic operations pages.

### Removed
- Removed reliance on client-supplied `x-clerk-user-id` from the active frontend-to-backend API flow.

### Verification
- Backend syntax checks passed for edited backend files.
- Backend Jest tests passed.
- Frontend lint passed.
- Frontend production build passed outside the sandbox.
- Existing backend process on port 5001 returned HTTP 401 `Missing bearer token` for an unauthenticated protected route.
- Backend starts on temporary port 5011 and returns HTTP 200 for `/`.
- `/api/organizations` returns HTTP 401 without a bearer token.
- Frontend production build includes `/organization`.
- Frontend production build includes `/organization/users`, `/organization/users/new`, and `/organization/users/[id]`.
- Backend tests now pass with 3 suites and 22 tests.
- `/api/users` and `/api/users/export` return HTTP 401 without bearer tokens.
- Backend tests now pass with 4 suites and 27 tests.
- Frontend production build includes `/operations`, `/buses`, `/drivers`, `/conductors`, and `/schedules`.
- `/api/buses` and `/api/operations/dashboard` return HTTP 401 without bearer tokens.
- Backend tests now pass with 5 suites and 32 tests.
- Frontend production build includes 41 routes, including Sprint 4 routes.
- Backend starts cleanly on temporary port 5024 and connects to MongoDB.
- Backend tests now pass with 6 suites and 36 tests.
- Frontend production build now includes 50 routes, including Sprint 4.5 onboarding and role routes.
- Backend tests now pass with 7 suites and 39 tests.
- Frontend production build now includes 66 routes, including Sprint 5 collaboration/support/report routes.
- Frontend production build now includes 69 routes, including Sprint 5.5 fleet/dispatcher/maintenance routes.

### Not Complete
- Real Clerk-token browser verification is still pending for organization, user, fleet, and Sprint 4 workflows.
- The enterprise platform is not production-ready.
# Sprint 6

- Added persistent operations models: `Trip`, `MaintenanceRecord`, `FuelRecord`, `LeaveRequest`, and `Incident`.
- Added dispatcher dashboard, trip lifecycle APIs, maintenance/fuel APIs, leave approval APIs, incident APIs, and operations calendar API.
- Replaced generic dispatcher and maintenance pages with working operational screens.
- Added `/trips`, `/calendar`, `/fuel`, `/leave`, and `/incidents` screens.
- Updated centralized navigation and protected routes for Sprint 6 operations flows.
- Added Sprint 6 model validation coverage.

# Sprint 7

- Expanded trips with live status, location, ETA, heartbeat, boarding, and distance fields.
- Added `GPSLocation`, `TripEvent`, and `OfflineQueue` models.
- Added live trip actions, GPS update/history, passenger trip status, offline sync, and SSE event stream APIs.
- Rebuilt `/driver` and `/conductor` as operational dashboards.
- Added passenger tracking routes: `/my-trips`, `/trip-status/[id]`, `/track/[tripId]`, and `/boarding`.
- Updated route protection, role navigation, indexes, and Sprint 7 tests.
