# Frontend Stabilization Audit

Status: frontend-only stabilization pass. No backend API, schema, Clerk, payment, or Razorpay changes.

## Role And API Matrix

| Route | Role | Allowed | Backend endpoint | Purpose | Wrong API? | Wrong UI? | Wrong permissions? |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | Public/Auth redirect | Public | `/api/auth/platform-status`, `/api/auth/me` | Entry and role redirect | No | No | No |
| `/dashboard` | Role redirect | Authenticated | `/api/auth/me` | Send user to role home | No | No | No |
| `/customer` | Customer | Customer, Super Admin | `/api/routes`, `/api/bookings`, `/api/tickets/my`, `/api/notifications`, `/api/posts?status=published`, `/api/support/tickets` | Customer home | No | No | Fixed |
| `/booking` | Customer | Customer, Super Admin | `/api/routes`, `/api/bookings` | Book route and hold seats | No | No | Fixed |
| `/my-trips` | Customer | Customer | `/api/bookings`, `/api/tickets/my` | Customer trip history | Fixed: no `/api/trips`, no `/api/schedules` | Fixed | Fixed |
| `/bookings` | Customer | Customer, Super Admin | `/api/bookings` | Customer bookings | No | No | No |
| `/bookings/[id]` | Customer | Customer, Super Admin | `/api/bookings/:id` | Booking details | No | No | No |
| `/tickets` | Customer / Conductor | Customer sees own tickets; staff scans/views by role | `/api/tickets/my`, scanner endpoints for staff | Tickets and passenger QR | No | No | No |
| `/tickets/[ticketId]` | Customer / Conductor | Customer owns ticket; staff scans/views by role | `/api/tickets/my`, `/api/tickets/scan` | Ticket detail | No | No | No |
| `/wallet`, `/wallet/history`, `/wallet/recharge`, `/wallet/transactions` | Customer | Customer, Super Admin | `/api/tickets/my`, `/api/wallet/transactions` | Wallet balance and transactions | No | No | No |
| `/notifications` | Customer | Customer, Super Admin | `/api/notifications` | Travel alerts | No | No | No |
| `/posts` | Customer read-only; Admin manages | All authenticated readers; create UI only for Admin, Org Owner/Admin, Super Admin | `/api/posts?status=published` for readers; `/api/posts` for managers | Announcements/offers | No | Fixed | Fixed |
| `/posts/[id]` | Customer read-only; Admin manages | Readers view; managers comment/moderate | `/api/posts/:id`, comments only for managers | Announcement detail | No | Fixed | Fixed |
| `/posts/new` | Admin | Admin, Org Owner/Admin, Super Admin | `/api/posts` | Create announcement | No | No | Fixed |
| `/support`, `/support/new`, `/support/[id]` | Customer / Support | Customer, Driver, Conductor, Support, Org Admin/Owner, Super Admin | `/api/support/tickets` | Support tickets | No | No | No |
| `/profile` | Customer | Customer, Super Admin | `/api/auth/me` | User profile | No | No | No |
| `/settings` | Customer | Customer, Super Admin | local/auth context | Personal settings | No | No | Fixed |
| `/search` | Customer / Staff | Customer sees customer-safe result types; staff sees role-allowed search | `/api/search` | Global search cards | No | Fixed raw JSON | Fixed |
| `/driver` | Driver | Driver, Dispatcher, Fleet/Ops, Org Admin/Owner, Super Admin | `/api/trips` | Driver dashboard | No | No | No |
| `/conductor`, `/boarding` | Conductor | Conductor, Admin, Dispatcher, Fleet/Ops, Org Admin/Owner, Super Admin | `/api/trips`, `/api/tickets/scan` | Conductor and boarding workspace | No | No | Fixed |
| `/admin`, `/scanner` | Conductor/Admin | Conductor, Admin, permitted operations roles | `/api/tickets/scan`, `/api/admin/analytics` | QR scanner | No | No | No |
| `/dispatcher` | Dispatcher | Dispatcher, Ops/Fleet, Org Admin/Owner, Super Admin | `/api/dispatcher/dashboard` | Dispatch dashboard | No | No | No |
| `/operations` | Operations | Operations, Fleet, Dispatcher, Org Admin/Owner, Super Admin | `/api/operations/dashboard` | Operations command center | No | No | No |
| `/fleet` | Fleet Manager | Fleet, Operations, Org Admin/Owner, Super Admin | Fleet dashboard APIs | Fleet dashboard | No | No | No |
| `/buses` | Fleet Manager | Fleet, Operations, Dispatcher, Org Admin/Owner, Super Admin | `/api/buses` | Bus management | No | No | No |
| `/drivers` | Fleet Manager | Fleet, Operations, Dispatcher, Org Admin/Owner, Super Admin | `/api/drivers`, `/api/users` | Driver management | No | No | No |
| `/conductors` | Fleet Manager | Fleet, Operations, Dispatcher, Org Admin/Owner, Super Admin | `/api/conductors`, `/api/users` | Conductor management | No | No | No |
| `/schedules` | Scheduler/Dispatcher | Scheduler, Dispatcher, Fleet/Ops, Org Admin/Owner, Super Admin | `/api/schedules`, fleet assignment APIs | Schedule management | No | No | Fixed customer exclusion |
| `/trips` | Dispatcher/Operations | Dispatcher, Operations, Fleet, Driver/Conductor staff, Org Admin/Owner, Super Admin | `/api/trips`, `/api/schedules` | Trip operations | No | No | Fixed customer exclusion |
| `/track/[tripId]`, `/trip-status/[id]` | Driver/Conductor/Operations | Crew and operations roles only | `/api/trips/:id/location` | Operational tracking | No | No | Fixed customer exclusion |
| `/calendar` | Operations | Operations, Fleet, Dispatcher, Scheduler, Org Admin/Owner, Super Admin | `/api/calendar` | Operational calendar | No | No | Fixed customer exclusion |
| `/maintenance` | Fleet Manager | Fleet, Operations, Org Admin/Owner, Super Admin | `/api/maintenance`, `/api/buses` | Maintenance records | No | No | No |
| `/fuel` | Fleet Manager | Fleet, Operations, Org Admin/Owner, Super Admin | `/api/fuel`, `/api/buses` | Fuel records | No | No | No |
| `/incidents` | Operations/Crew | Crew, Dispatcher, Fleet/Ops, Org Admin/Owner, Super Admin | `/api/incidents` | Incident workflow | No | No | No |
| `/leave` | Operations/Crew | Crew self-service; operations approve | `/api/leave` | Leave workflow | No | No | No |
| `/pricing`, `/admin/pricing`, `/admin/pricing/new`, `/admin/pricing/history`, `/admin/pricing/simulator` | Price Manager | Price/Fare Manager, Ops/Fleet where route setup requires, Org Admin/Owner, Super Admin | `/api/pricing` | Fare and pricing management | No | No | No |
| `/admin/fares` | Price/Fleet Manager | Price/Fare Manager, Fleet/Ops, Org Admin/Owner, Super Admin | `/api/admin/routes` | Route management | No | No | Fixed customer exclusion |
| `/admin/coupons`, `/admin/coupons/new`, `/admin/coupons/[id]` | Price Manager | Price/Fare Manager, Org Admin/Owner, Super Admin | Coupon APIs | Coupon campaigns | No | No | No |
| `/finance` | Finance | Finance Manager, Org Admin/Owner, Super Admin | `/api/finance/dashboard` | Finance dashboard | No | No | Fixed customer exclusion |
| `/payments`, `/payments/new`, `/payments/history`, `/payments/[id]` | Finance | Finance Manager, Org Admin/Owner, Super Admin | `/api/payments` | Payment management | No | No | Fixed customer exclusion |
| `/refunds` | Finance | Finance Manager, Org Admin/Owner, Super Admin | `/api/refunds` | Refund management | No | No | Fixed customer exclusion |
| `/reports`, `/reports/*` | Operations/Finance/Admin | Finance/Ops/Fleet/Dispatcher/Support, Org Admin/Owner, Super Admin | `/api/reports`, `/api/reports/:module` | Reporting | No | No | Fixed customer exclusion |
| `/audit` | Admin | Finance/Ops/Fleet/Dispatcher/Support, Org Admin/Owner, Super Admin | `/api/audit` | Audit logs | No | No | Fixed customer exclusion |
| `/organization`, `/organization/users`, `/organization/users/new`, `/organization/users/[id]`, `/organizations/new` | Organization Owner | Org Owner/Admin, Super Admin | `/api/organizations`, `/api/users`, invites | Organization administration | No | No | No |
| `/super-admin` | Super Admin | Super Admin only | platform admin APIs | Platform administration | No | No | No |
| `/register`, `/choose-account`, `/complete-profile`, `/accept-invite`, `/setup`, `/onboarding` | Account setup | Auth/setup flow | auth, setup, invite APIs | Onboarding and account creation | No | Fixed raw preview | No |
| `/help`, `/403` | Shared utility | Public/help or denied users | none | Help and access denied | No | No | No |

## Customer API Permission Map

Customer pages may call:

- `/api/routes`
- `/api/bookings`
- `/api/bookings/:id`
- `/api/tickets/my`
- `/api/wallet/transactions`
- `/api/notifications`
- `/api/posts?status=published`
- `/api/support/tickets`
- `/api/search` with customer-safe rendering
- `/api/auth/me`

Customer pages must not call:

- `/api/trips`
- `/api/schedules`
- `/api/drivers`
- `/api/conductors`
- `/api/buses`
- `/api/fleet`
- `/api/admin/*`
- `/api/finance/*`
- `/api/payments` management screens
- `/api/reports/*`
- `/api/audit`

## Stabilization Fixes Applied

- `/my-trips` now uses customer bookings/tickets instead of the operations trips page.
- Customer navigation no longer links to operational trip tracking.
- Customer search renders cards for routes, trips, users, reports, support tickets, and payments instead of raw JSON.
- Customer search filters out staff/admin-only result groups.
- Posts are read-only for customers, drivers, and conductors.
- Post creation is restricted to Admin, Org Owner/Admin, and Super Admin.
- Google Maps iframe failures show a quiet map-unavailable panel and keep list view usable.
- Setup preview no longer displays raw JSON.
