# Master Implementation Plan

## Sprint 8 Infrastructure Addendum
Production hardening now includes validated runtime config, request-scoped logging, security middleware, API versioning, health/metrics endpoints, job registry, backup metadata, provider abstractions, deployment assets, and CI. Remaining production work is external-provider validation and staging deployment verification.

## Current Architecture
The current system is a two-app repository:

- `backend/`: Node.js + Express + Mongoose API.
- `frontend/`: Next.js App Router + Clerk + React client UI.
- `PROJECT_AUDIT/`: repository audit generated from the current implementation.

The app currently behaves like an MVP/prototype. Existing functionality is centered on passenger ticket purchase, wallet simulation, QR generation, scanner validation, basic route/fare management, Clerk frontend authentication, and partial organization/RBAC groundwork.

## Current Features
- Clerk frontend authentication with `/sign-in` and `/sign-up`.
- Protected frontend routes through `frontend/proxy.ts`.
- User sync endpoint: `POST /api/auth/sync`.
- Wallet top-up simulation: `POST /api/wallet/add`.
- Route-based ticket booking with QR payloads.
- Ticket list and ticket detail screens.
- QR scanner/manual validation for legacy admin users.
- Basic scanner analytics.
- Leaflet/OpenStreetMap map pinning.
- Route/fare CRUD API and fare management screen.
- Organization management APIs and `/organization` UI for dashboard, settings, branding, members, invites, archive, and switching.
- Enterprise user management APIs and `/organization/users` UI for CRUD, search, filters, pagination, profile editing, role/status actions, bulk actions, import/export, and activity.
- Fleet operations APIs and UI for buses, drivers, conductors, route stops, schedules, assignments, operations dashboard, maintenance/document alerts, and Google Maps preview.
- Partial role middleware with old-role compatibility.
- Migration scripts for default organization and role translation.

## Missing Features
The following enterprise modules are missing or incomplete:

- Full runtime verification of backend Clerk JWT verification.
- Centralized session/user middleware coverage for every protected endpoint.
- Organization working-hours automation.
- Production email delivery for organization invites.
- Multi-organization membership switching.
- Complete enterprise RBAC and permission editor.
- Role assignment UI.
- Binary CSV/Excel user upload parsing and PDF user export.
- Production Google Directions/Distance Matrix integration with API keys, traffic-aware ETA, and route-cache strategy.
- Bus management.
- Driver management.
- Conductor management beyond scanning.
- Route scheduling, stops management, ETA, distance, polyline optimization.
- Google Maps integration.
- Live GPS support.
- Fare rules, discounts, coupons, peak pricing, holiday pricing, student pricing.
- Price approval workflow.
- Booking cancellation/refund/invoice/receipt.
- Razorpay orders, checkout, webhooks, refunds, finance dashboard.
- Posts, announcements, comments, likes, pinned posts, attachments.
- Email, push, in-app notifications.
- Reporting exports: CSV, Excel, PDF.
- Dedicated dashboards for every role.
- Settings screens.
- Complete audit logging.
- Unit, integration, API, frontend, and regression test suites.

## Broken Features
- Backend Clerk JWT verification has been implemented, but real-token runtime verification is still pending.
- User, route, ticket, and fare-history write paths now attach an organization through the default organization resolver where the enterprise organization UI is not yet present.
- Frontend recognizes old and newer operational role values in the currently implemented screens.
- Backend test dependencies have been added and focused middleware/schema tests pass.
- RBAC is still incomplete and not yet production-grade.

## Database Status
Implemented collections:

- `User`
- `Organization`
- `OrganizationInvite`
- `Route`
- `Ticket`
- `FareHistory`
- `AuditLog`
- `ValidationLog`

Missing collections:

- `Bus`
- `DriverProfile`
- `ConductorProfile`
- `Schedule`
- `Stop`
- `FareRule`
- `Coupon`
- `BookingCancellation`
- `PaymentTransaction`
- `Invoice`
- `Post`
- `PostComment`
- `PostLike`
- `Notification`
- `ReportExport`
- `Permission`
- `RolePermission`

## Frontend Status
Implemented pages:

- `/`
- `/sign-in`
- `/sign-up`
- `/register`
- `/wallet`
- `/generate`
- `/tickets`
- `/tickets/[ticketId]`
- `/admin`
- `/admin/fares`
- `/organization`
- `/organization/users`
- `/organization/users/new`
- `/organization/users/[id]`
- `/operations`
- `/buses`
- `/drivers`
- `/conductors`
- `/schedules`
- `/dashboard` redirect
- `/scanner` redirect

Missing major screens:

- Super admin dashboard.
- Role and permission management.
- Fleet/bus management.
- Driver/conductor management.
- Route schedules/stops manager.
- Finance dashboard.
- Price manager dashboard beyond basic fare CRUD.
- Dispatcher/scheduler dashboards.
- Support dashboard.
- Customer booking history/cancel/refund/invoice screens.
- Posts/announcement center.
- Reports.
- Profile/settings/account management pages.

## Backend Status
Implemented API areas:

- Auth sync with verified Clerk bearer token.
- Backend Clerk JWT verification middleware.
- Wallet add.
- Ticket booking/list/scan.
- Admin analytics.
- Route listing and admin route CRUD.
- Organization lifecycle, dashboard, settings, branding, members, persistent invites, archive, and switching.

Missing API areas:

- Dedicated permission editor and RBAC matrix.
- Permission CRUD.
- Bus/fleet/driver/conductor CRUD.
- Schedules/stops/route optimization.
- Payment orders/webhooks/refunds.
- Posts/comments/likes.
- Notifications.
- Reports/exports.
- Audit-log querying.

## Authentication Status
Frontend Clerk integration works. Backend Clerk verification has been implemented with bearer tokens, JWKS lookup, RS256 signature checks, expiry/nbf checks, and optional audience validation. Frontend API calls now request a Clerk token and send it in the `Authorization` header.

Module 1 is not marked fully complete yet because runtime verification against a real Clerk session token and a fresh backend process is still pending.

## Authorization Status
RBAC exists as hardcoded middleware. It is incomplete, not consistently org-scoped, and frontend role logic is behind backend role migration.

## Organization Support
Sprint 1 organization management is implemented across database, backend, frontend, navigation, and focused tests. It includes dashboard statistics, profile/settings/branding, GST/address, member listing, persistent invite lifecycle, archive, and organization switching for the current single-organization user model and super admin context selection.

Remaining production gaps are real-user Clerk verification, production invite email delivery, working-hours rules, and multi-organization memberships.

## RBAC Status
Old roles and new roles coexist. Canonical target roles:

- `super_admin`
- `org_owner`
- `org_admin`
- `operations_manager`
- `fleet_manager`
- `finance_manager`
- `price_manager`
- `dispatcher`
- `scheduler`
- `bus_manager`
- `driver`
- `conductor`
- `support`
- `customer`
- guest/unauthenticated

## Maps Status
Leaflet/OpenStreetMap is implemented for basic pinning. Google Maps, search, bus location, ETA, route optimization, and live GPS are NOT IMPLEMENTED.

## Payments Status
Sprint 4 implemented payment order records, HMAC verification, webhook recording, refunds, invoices, receipts, payment history, wallet ledger, and finance dashboard foundations. Live Razorpay checkout/provider runtime and settlement reconciliation still need production configuration and testing.

## Testing Status
Frontend lint passes. Frontend production build passes when run outside the sandbox. Backend middleware/schema tests pass. API, integration, frontend, and regression tests are still mostly NOT IMPLEMENTED.

## Production Readiness
Not production-ready.

Blocking production issues:

- Backend auth now verifies Clerk JWTs, but real-token runtime verification is still pending.
- RBAC is incomplete.
- Real payments are missing.
- Required enterprise modules are missing.
- Automated tests are insufficient.
- Secrets must be rotated before production.
- No deployment/CI pipeline exists.

## Technical Debt
- Mixed old/new role model.
- Some controller write paths were repaired for default organization scope; deeper organization isolation and super-admin cross-org behavior still need implementation.
- No central validation layer.
- No centralized error handler.
- Backend auth token verification exists but needs end-to-end runtime verification and broader endpoint coverage tests.
- Organization isolation is implemented for organization endpoints and repaired ticket/route writes, but needs broader integration tests across every future module.
- Invite tokens are persistent and hashed; email delivery is still manual through returned accept links.
- Generated docs and implementation claims sometimes exceed live code.

## Estimated Completion %
Current MVP completion: 55%.

Enterprise platform completion: 48%.

Production readiness: 43%.

## Implementation Sequence
1. Stabilize foundation: auth verification, org-safe user sync, role constants, route protection.
2. Complete Sprint 1 organization runtime verification.
3. Complete Sprint 2 real-user workflow verification.
4. Harden RBAC and role dashboards.
5. Verify and harden Sprint 4 pricing, booking, wallet, payment, finance, reports, and notification foundations.
6. Add live Razorpay checkout/runtime, binary report exports, and provider-backed email/push.
7. Add posts and support workflows.
8. Deepen dashboards and role-specific workflows.
9. Standardize every CRUD page with the shared Sprint 4.6 UX primitives and add browser automation for role flows.
10. Sprint 6 should focus on production deployment, observability, performance, CI/CD, binary export providers, email/push providers, and browser automation.
9. Add comprehensive tests and production deployment hardening.

## Compatibility Rules
- Preserve existing ticket purchase, wallet, QR, scanner, and fare CRUD behavior.
- Keep old API routes working.
- Keep old roles accepted during migration.
- Add new routes and screens around existing modules.
- Refactor only when required for security, correctness, or shared enterprise behavior.
