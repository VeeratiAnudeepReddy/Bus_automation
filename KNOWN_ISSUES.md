# Known Issues

## Sprint 9 Remaining Production Gaps
- Live Razorpay settlement reconciliation still needs production credentials and a real settlement export/API check.
- Invoice and receipt endpoints return printable HTML; binary PDF generation is not yet implemented.
- Chargeback and dispute statuses are tracked, but evidence submission and dispute operations workflow are not yet implemented.
- Finance dashboard includes ledger totals, but accounting-period close/lock workflows are not yet implemented.

## Sprint 8 Remaining Production Gaps
- Live Razorpay credentials and webhook URLs still require production validation.
- Email and push providers are abstraction/queue foundations; external delivery providers are not validated.
- SSE uses in-memory clients; multi-instance production needs Redis pub/sub or managed realtime.
- Backup service records metadata; production physical backups must run `mongodump` or managed MongoDB backup tooling.
- Docker and compose assets exist; full production cluster startup was not validated in a real staging environment.
- Monitoring endpoint exists; Prometheus/Grafana deployment is pending.

## Authentication Runtime Verification Pending
- Backend Clerk JWT verification has been implemented, but the module still needs end-to-end verification with a live backend process and a real Clerk session token.
- Sandbox `npm start` can fail with `listen EPERM 0.0.0.0:5001`.
- Unsandboxed backend start reports `EADDRINUSE :::5001` because an existing `MainThread` process is already listening on port 5001.
- The live port 5001 process returns HTTP 200 for `/` and HTTP 401 `Missing bearer token` for `/api/tickets/my` without auth, so the active process appears to be running the new bearer-token middleware.

## RBAC Is Incomplete
- Old and new role values still coexist.
- Frontend routing now centralizes role route access and dashboard redirects, but backend endpoint-level permission coverage still needs more integration tests.
- Enterprise permission management and role assignment UI are missing.

## Onboarding Remaining Gaps
- First-run setup, explicit customer creation, invite-only employee onboarding, and organization-owner creation are implemented.
- Full Playwright/browser coverage with real Clerk sessions is still pending.
- Multi-organization memberships are not modeled; organization owners can create additional organizations, but active user context remains single-organization.

## Organization Management Remaining Gaps
- Core organization dashboard, CRUD/archive, branding, settings, member listing, invite management, and switching UI are implemented.
- Invite records are persistent, but email delivery is not integrated yet; the API returns an accept link for operators to share manually.
- Organization switching is implemented for the current single-organization user model and super admin context selection. Multi-organization memberships are not implemented.
- Organization billing/subscription fields exist, but real billing automation is not implemented.

## Enterprise User Management Remaining Gaps
- Core user CRUD, profile editing, search, filters, sorting, pagination, role/status actions, bulk actions, import/export, and activity timeline are implemented.
- Import currently accepts JSON arrays. Binary CSV/Excel upload parsing and preview UI are not implemented.
- Export currently returns CSV. Excel and PDF export still need generator packages.
- User organization transfer is implemented as a super-admin API action; a dedicated transfer UI is still pending.

## Fleet Operations Remaining Gaps
- Core bus, driver, conductor, schedule, stop, assignment, operations dashboard, and document/status alert workflows are implemented.
- Google Maps is currently embedded for operations preview. Production Directions API, Distance Matrix API, traffic-aware ETA, and key/billing controls still need production configuration.
- Bus import currently accepts JSON arrays and exports CSV. Binary Excel upload/export is pending package selection.
- Drag-and-drop calendar scheduling is not implemented; current schedule UI is form/list based with backend conflict detection.
- Dedicated deep role dashboards are represented by functional module pages, but fully personalized dashboards for every fleet role still need refinement.

## Payments Need Live Provider Verification
- Wallet top-up and booking debits now write transaction and ledger records.
- Razorpay order records, HMAC payment verification, webhook signature recording, refunds, invoices, receipts, payment history, and finance reporting exist.
- Live Razorpay order creation through provider APIs, hosted checkout runtime, webhook replay testing, settlements, and production reconciliation are still pending.

## Maps Are Prototype-Level
- Current map support uses Leaflet/OpenStreetMap.
- Google Maps, ETA, live GPS, route optimization, and stop scheduling are missing.

## Test Coverage Is Limited
- Backend focused tests exist for auth middleware and selected schemas/models, including organization invites and enterprise user fields.
- Full API integration, frontend component, browser flow, and regression tests are not complete.
- Sprint 4 adds model/service/signature tests, but full API integration/browser coverage is still below the requested 90%.

## Sprint 4 Foundation Gaps
- Pricing approvals exist, but approval workflows are compact and need role-specific review UX.
- Seat selection accepts seat input, but a full visual seat map and hold-timeout UI are pending.
- Reports expose CSV-compatible data; binary Excel/PDF export generation is pending.
- Notifications are persisted in-app; email and push providers are pending.
- QR payloads include expiry/encrypted markers and scan history, but full cryptographic offline validation needs deeper implementation.

## Sprint 4.6 UX Remaining Gaps
- The enterprise shell and utility pages are implemented, but every CRUD page still needs deeper table parity for bulk actions, import/export UI, details drawers, and audit timelines.
- Full browser verification across all roles is still pending.
- Demo data seeding was not added as automatic behavior because onboarding now supports real setup without fake data.

## Sprint 5 Remaining Gaps
- Posts support structured content and attachment metadata, but a real binary upload provider and rich text editor package are not integrated.
- Reports expose chart-ready metrics and CSV-compatible exports; binary Excel/PDF generation remains pending.
- Notification delivery is in-app only; email and push providers remain pending.
- Playwright end-to-end coverage for every role is still pending.

## Production Secrets And Domains
- Development Clerk keys and localhost configuration are acceptable only for development.
- Production Clerk keys, allowed domains, webhook secrets, payment secrets, and deployment secrets must be configured before launch.
