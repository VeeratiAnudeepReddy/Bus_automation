# API Index

## Sprint 9 Booking and Finance Integrity APIs

| Method | Endpoint | Status | Auth |
|---|---|---|---|
| GET | `/api/bookings/seats` | Includes active held tickets and active expiring seat locks | `requireAuth` |
| POST | `/api/bookings` | Creates idempotent wallet or gateway booking transaction | `requireAuth` |
| GET | `/api/bookings/:id/recover` | Returns lifecycle, lock, payment, document, ticket, and history state | `requireAuth` |
| GET | `/api/bookings/:id/invoice` | Returns invoice JSON | `requireAuth` |
| GET | `/api/bookings/:id/invoice?format=html` | Returns printable invoice HTML | `requireAuth` |
| GET | `/api/bookings/:id/receipt` | Returns receipt JSON | `requireAuth` |
| GET | `/api/bookings/:id/receipt?format=html` | Returns printable receipt HTML | `requireAuth` |
| GET | `/api/finance/dashboard` | Includes financial ledger totals and recent entries | Finance/report roles |
| GET | `/api/reports` | Includes ledger entry count and net ledger amount | Finance/report roles |

## Sprint 8.5 Payment APIs

| Method | Endpoint | Status | Auth |
|---|---|---|---|
| POST | `/api/payments/create-order` | Creates Razorpay order through provider abstraction | `requireAuth` |
| POST | `/api/payments/verify` | Verifies Razorpay HMAC and finalizes payment | `requireAuth` |
| POST | `/api/payments/webhook` | Verifies Razorpay webhook signature and processes idempotently | Public signed webhook |
| POST | `/api/payments/:id/refund` | Creates provider-backed refund | finance/org admin/org owner/super admin |

## Sprint 8 Production APIs

| Method | Endpoint | Status | Auth |
|---|---|---|---|
| GET | `/health` | Implemented production health | Public |
| GET | `/ready` | Implemented readiness check | Public |
| GET | `/live` | Implemented liveness check | Public |
| GET | `/metrics` | Implemented Prometheus-compatible metrics | Public/internal |
| GET | `/api/meta` | Implemented API metadata | Public |
| GET | `/api/v1/meta` | Implemented versioned API metadata | Public |
| GET | `/api/runtime-config` | Implemented runtime configuration view | super admin |
| GET | `/api/jobs` | Implemented job registry view | super admin |
| POST | `/api/jobs/:name/run` | Implemented manual job run | super admin |
| POST | `/api/backups` | Implemented backup metadata creation | super admin |

| Method | Endpoint | Status | Auth |
|---|---|---|---|
| GET | `/` | Implemented | Public |
| POST | `/api/auth/sync` | Implemented as lookup-only compatibility path; no automatic user creation | Verified Clerk bearer token |
| GET | `/api/auth/platform-status` | Implemented first-run organization count check | Public |
| GET | `/api/auth/me` | Implemented app-account status lookup without creating user | Verified Clerk bearer token |
| POST | `/api/auth/setup` | Implemented first-run organization + org owner creation | Verified Clerk bearer token |
| POST | `/api/auth/customer` | Implemented explicit customer account creation | Verified Clerk bearer token |
| POST | `/api/auth/organization-owner` | Implemented organization-owner organization creation | Verified Clerk bearer token |
| GET | `/api/auth/invites/:token` | Implemented invite token validation | Public |
| POST | `/api/auth/invites/:token/accept` | Implemented employee account creation from invite | Verified Clerk bearer token |
| PATCH | `/api/auth/profile` | Implemented profile completion | Verified Clerk bearer token |
| POST | `/api/wallet/add` | Implemented | Verified Clerk bearer token + local user |
| POST | `/api/tickets/book` | Implemented with organization write | Verified Clerk bearer token + local user |
| GET | `/api/tickets/my` | Implemented | `requireAuth` |
| POST | `/api/tickets/scan` | Implemented | `requireAuth`, scanner role |
| GET | `/api/admin/analytics` | Implemented | `requireAuth`, scanner role |
| GET | `/api/routes` | Implemented with default org seed fallback | `requireAuth` |
| GET | `/api/admin/routes` | Implemented | fare/admin role |
| POST | `/api/admin/routes/create` | Implemented with organization write | fare/admin role |
| PUT | `/api/admin/routes/:id` | Implemented with fare history organization write | fare/admin role |
| DELETE | `/api/admin/routes/:id` | Implemented | fare/admin role |
| PATCH | `/api/admin/routes/:id/toggle` | Implemented | fare/admin role |
| GET | `/api/admin/routes/fare-history` | Implemented | fare/admin role |
| GET | `/api/organizations` | Implemented with search/status pagination | `requireAuth` |
| POST | `/api/organizations` | Implemented with profile/settings payload | `requireAuth` |
| GET | `/api/organizations/:id` | Implemented | `requireAuth`, org scope in controller |
| PATCH | `/api/organizations/:id` | Implemented with audit logging | org owner/org admin/super admin |
| DELETE | `/api/organizations/:id` | Implemented as archive | org owner/org admin/super admin |
| GET | `/api/organizations/:id/dashboard` | Implemented stats and recent activity | `requireAuth`, org scope in controller |
| GET | `/api/organizations/:id/members` | Implemented with search/filter/pagination | `requireAuth`, org scope in controller |
| POST | `/api/organizations/:id/switch` | Implemented context selection | `requireAuth`, org scope in controller |
| POST | `/api/organizations/:id/approve` | Implemented with super admin UI action | super admin |
| POST | `/api/organizations/:id/suspend` | Implemented with super admin UI action | super admin |
| GET | `/api/organizations/:id/invites` | Implemented with persistent invite records | org owner/org admin/super admin |
| POST | `/api/organizations/:id/invites` | Implemented with persistent invite records | org owner/org admin/super admin |
| DELETE | `/api/organizations/:id/invites/:inviteId` | Implemented | org owner/org admin/super admin |
| POST | `/api/invites/:token/accept` | Implemented with persistent token hash | `requireAuth` |
| GET | `/api/users` | Implemented with search/filter/sort/pagination | user read roles |
| GET | `/api/users/search` | Implemented alias of list users | user read roles |
| GET | `/api/users/:id` | Implemented with activity timeline | scoped user/read roles/self |
| POST | `/api/users` | Implemented create user | org owner/org admin/super admin |
| PATCH | `/api/users/:id` | Implemented profile/admin edit | scoped self or org manager |
| DELETE | `/api/users/:id` | Implemented soft delete | org owner/org admin/super admin |
| POST | `/api/users/:id/archive` | Implemented | org owner/org admin/super admin |
| POST | `/api/users/:id/restore` | Implemented | org owner/org admin/super admin |
| POST | `/api/users/:id/suspend` | Implemented | org owner/org admin/super admin |
| POST | `/api/users/:id/activate` | Implemented | org owner/org admin/super admin |
| POST | `/api/users/:id/role` | Implemented role assignment | org owner/org admin/super admin |
| POST | `/api/users/:id/transfer` | Implemented | super admin |
| POST | `/api/users/bulk` | Implemented bulk suspend/activate/archive/delete/role/transfer | org manager, transfer super admin |
| GET | `/api/users/export` | Implemented CSV export | user read roles |
| POST | `/api/users/import` | Implemented JSON import with duplicate reporting and rollback option | org owner/org admin/super admin |
| GET | `/api/users/activity` | Implemented activity timeline | user read roles |
| POST | `/api/users/invites/:inviteId/resend` | Implemented invite resend metadata | org owner/org admin/super admin |
| POST | `/api/users/invites/:inviteId/reject` | Implemented invited user rejection | invitee |
| GET | `/api/operations/dashboard` | Implemented fleet status, duty counts, trips, alerts | fleet read roles |
| GET | `/api/dispatcher/dashboard` | Implemented live dispatch stats, trips, availability, incidents, leave queue | fleet/dispatch read roles |
| GET | `/api/calendar` | Implemented combined operations calendar | fleet/dispatch/read roles |
| GET | `/api/realtime/events` | Implemented Server-Sent Events stream | `requireAuth` |
| POST | `/api/offline/sync` | Implemented offline queue sync receipt | `requireAuth` |
| GET | `/api/buses` | Implemented search/filter/pagination | fleet read roles |
| GET | `/api/buses/:id` | Implemented with history | fleet read roles |
| POST | `/api/buses` | Implemented | fleet manager/org manager roles |
| PATCH | `/api/buses/:id` | Implemented | fleet manager/org manager roles |
| DELETE | `/api/buses/:id` | Implemented soft delete/retire | fleet manager/org manager roles |
| PATCH | `/api/buses/:id/status` | Implemented | fleet manager/org manager roles |
| PATCH | `/api/buses/:id/maintenance` | Implemented | fleet manager/org manager roles |
| GET | `/api/buses/:id/history` | Implemented | fleet read roles |
| GET | `/api/buses/export` | Implemented CSV export | fleet read roles |
| POST | `/api/buses/import` | Implemented JSON import | fleet manager/org manager roles |
| GET | `/api/drivers` | Implemented | fleet read roles |
| POST | `/api/drivers` | Implemented | fleet manager/org manager roles |
| PATCH | `/api/drivers/:id` | Implemented | fleet manager/org manager roles |
| DELETE | `/api/drivers/:id` | Implemented | fleet manager/org manager roles |
| POST | `/api/drivers/:id/assign-bus` | Implemented with assignment validation | dispatcher/fleet manager/org manager roles |
| GET | `/api/conductors` | Implemented | fleet read roles |
| POST | `/api/conductors` | Implemented | fleet manager/org manager roles |
| PATCH | `/api/conductors/:id` | Implemented | fleet manager/org manager roles |
| DELETE | `/api/conductors/:id` | Implemented | fleet manager/org manager roles |
| POST | `/api/conductors/:id/assign-bus` | Implemented with assignment validation | dispatcher/fleet manager/org manager roles |
| GET | `/api/routes/:routeId/stops` | Implemented | fleet read roles |
| POST | `/api/routes/:routeId/stops` | Implemented | scheduler/dispatcher/fleet roles |
| PATCH | `/api/routes/:routeId/stops/:stopId` | Implemented | scheduler/dispatcher/fleet roles |
| DELETE | `/api/routes/:routeId/stops/:stopId` | Implemented | scheduler/dispatcher/fleet roles |
| POST | `/api/routes/:id/assignments` | Implemented | dispatcher/scheduler/fleet roles |
| POST | `/api/routes/:id/optimize` | Implemented lightweight stop ETA/distance helper | fleet read roles |
| POST | `/api/routes/:id/clone` | Implemented | scheduler/dispatcher/fleet roles |
| POST | `/api/routes/:id/deactivate` | Implemented | scheduler/dispatcher/fleet roles |
| GET | `/api/schedules` | Implemented | fleet read roles |
| POST | `/api/schedules` | Implemented with conflict detection | scheduler/dispatcher/fleet roles |
| PATCH | `/api/schedules/:id` | Implemented with conflict detection | scheduler/dispatcher/fleet roles |
| DELETE | `/api/schedules/:id` | Implemented | scheduler/dispatcher/fleet roles |
| POST | `/api/schedules/conflicts` | Implemented conflict check | scheduler/dispatcher/fleet roles |
| GET | `/api/trips` | Implemented trip list | operations read roles |
| POST | `/api/trips` | Implemented create trip from schedule with assignment validation | dispatcher/operations roles |
| PATCH | `/api/trips/:id/status` | Implemented trip lifecycle updates | dispatcher/driver/conductor roles |
| POST | `/api/trips/:id/actions` | Implemented driver/conductor/dispatcher trip actions | dispatcher/driver/conductor roles |
| POST | `/api/trips/:id/location` | Implemented live GPS heartbeat update | dispatcher/driver/conductor roles |
| GET | `/api/trips/:id/location` | Implemented latest trip location lookup | operations read roles |
| GET | `/api/trips/:id/history` | Implemented GPS and trip event history | operations read roles |
| GET | `/api/trip-status/:id` | Implemented passenger live trip status | authenticated passenger/staff |
| GET | `/api/maintenance` | Implemented maintenance records | fleet read roles |
| POST | `/api/maintenance` | Implemented maintenance work creation and bus status update | fleet manager roles |
| PATCH | `/api/maintenance/:id` | Implemented maintenance work updates | fleet manager roles |
| GET | `/api/fuel` | Implemented fuel records | fleet read roles |
| POST | `/api/fuel` | Implemented fuel fill creation with efficiency calculation | fleet manager roles |
| GET | `/api/leave` | Implemented crew leave queue | operations read roles |
| POST | `/api/leave` | Implemented crew leave request | crew/operations roles |
| PATCH | `/api/leave/:id/review` | Implemented leave approval/rejection | dispatcher/fleet manager roles |
| GET | `/api/incidents` | Implemented incident list | operations read roles |
| POST | `/api/incidents` | Implemented incident reporting and notifications | operations read roles |
| PATCH | `/api/incidents/:id` | Implemented incident status/assignment updates | dispatcher/fleet/support roles |
| GET | `/api/pricing` | Implemented list fare rules | price manager/org admin/org owner/super admin |
| POST | `/api/pricing` | Implemented create approval-ready fare rule | price manager/org admin/org owner/super admin |
| PATCH | `/api/pricing/:id` | Implemented update/version fare rule | price manager/org admin/org owner/super admin |
| POST | `/api/pricing/:id/publish` | Implemented publish/approve fare rule | price manager/org admin/org owner/super admin |
| GET | `/api/pricing/history` | Implemented versions and approvals | price manager/org admin/org owner/super admin |
| POST | `/api/pricing/simulate` | Implemented dynamic fare simulation | price manager/org admin/org owner/super admin |
| GET | `/api/coupons` | Implemented coupon list | price manager/org admin/org owner/super admin |
| POST | `/api/coupons` | Implemented coupon create | price manager/org admin/org owner/super admin |
| GET | `/api/coupons/:id` | Implemented coupon detail | price manager/org admin/org owner/super admin |
| POST | `/api/coupons/validate` | Implemented coupon validation | `requireAuth` |
| GET | `/api/bookings/seats` | Implemented seat availability foundation | `requireAuth` |
| POST | `/api/bookings` | Implemented booking engine | `requireAuth` |
| GET | `/api/bookings` | Implemented booking history | `requireAuth` |
| GET | `/api/bookings/:id` | Implemented booking detail | `requireAuth` |
| POST | `/api/bookings/:id/cancel` | Implemented cancellation/refund | `requireAuth` |
| GET | `/api/refunds` | Implemented refunds list | `requireAuth` |
| POST | `/api/wallet/recharge` | Implemented ledger-backed recharge | `requireAuth` |
| GET | `/api/wallet/transactions` | Implemented transaction history | `requireAuth` |
| GET | `/api/wallet/ledger` | Implemented ledger history | `requireAuth` |
| POST | `/api/payments/create-order` | Implemented Razorpay order record | `requireAuth` |
| POST | `/api/payments/verify` | Implemented HMAC signature verification | `requireAuth` |
| POST | `/api/payments/webhook` | Implemented webhook signature recording | Public webhook signature |
| GET | `/api/payments` | Implemented payment list | `requireAuth` |
| GET | `/api/payments/:id` | Implemented payment detail | `requireAuth` |
| POST | `/api/payments/:id/refund` | Implemented finance refund | finance/org admin/org owner/super admin |
| GET | `/api/finance/dashboard` | Implemented finance KPIs | finance/org admin/org owner/super admin |
| GET | `/api/audit` | Implemented audit list/CSV | finance/org admin/org owner/super admin |
| GET | `/api/reports` | Implemented report summary/CSV-compatible export | finance/org admin/org owner/super admin |
| GET | `/api/notifications` | Implemented in-app notifications | `requireAuth` |
| POST | `/api/notifications` | Implemented notification create | finance/org admin/org owner/super admin |
| GET | `/api/notifications/preferences` | Implemented preferences bootstrap | `requireAuth` |
| PATCH | `/api/notifications/preferences` | Implemented preference update | `requireAuth` |
| PATCH | `/api/notifications/read` | Implemented mark selected read | `requireAuth` |
| PATCH | `/api/notifications/read-all` | Implemented mark all read | `requireAuth` |
| DELETE | `/api/notifications/:id` | Implemented notification delete | `requireAuth` |
| GET | `/api/posts` | Implemented announcement listing | `requireAuth`, org scope |
| POST | `/api/posts` | Implemented announcement create | org/support manager roles in controller |
| GET | `/api/posts/:id` | Implemented announcement detail | `requireAuth`, visibility check |
| PATCH | `/api/posts/:id` | Implemented announcement update | org/support manager roles in controller |
| DELETE | `/api/posts/:id` | Implemented soft delete | org/support manager roles in controller |
| POST | `/api/posts/:id/comments` | Implemented comments | `requireAuth`, visibility check |
| POST | `/api/posts/:id/like` | Implemented like | `requireAuth` |
| POST | `/api/posts/:id/pin` | Implemented pin | org/support manager roles in controller |
| GET | `/api/support/tickets` | Implemented support listing | `requireAuth`, org scope |
| POST | `/api/support/tickets` | Implemented support ticket create | `requireAuth` |
| GET | `/api/support/tickets/:id` | Implemented support detail | `requireAuth`, scoped requester/support |
| PATCH | `/api/support/tickets/:id` | Implemented status/assignment update | `requireAuth`, scoped requester/support |
| DELETE | `/api/support/tickets/:id` | Implemented close ticket | support/org manager |
| POST | `/api/support/tickets/:id/replies` | Implemented support replies | `requireAuth`, scoped requester/support |
| GET | `/api/reports/:module` | Implemented module reports | report roles |
| GET | `/api/search` | Implemented global search | `requireAuth`, org scope |

## Sprint 5.5 Routing Notes
- Sprint 5.5 did not add backend API families.
- It refined frontend routing, role navigation, profile completion payloads, and dashboard destinations while preserving existing APIs.

## Missing API Families
- Production Google Directions/Distance Matrix API endpoints with paid key.
- Binary Excel upload/parser and PDF exports.
- Roles and permissions.
- Buses.
- Drivers.
- Conductors.
- Stops and schedules.
- Binary Excel upload/parser and binary PDF exports for Sprint 4 reports.
- Posts/comments/likes.
- Notifications.
- Reports.
- Audit log search.
