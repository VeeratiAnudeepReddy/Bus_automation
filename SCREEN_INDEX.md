# Screen Index

## Sprint 9 Payment and Finance Surfaces

| Screen | Route | File | Status |
|---|---|---|---|
| Booking recovery | `/api/bookings/:id/recover` | `backend/controllers/bookingController.js` | Implemented API surface |
| Booking invoice | `/api/bookings/:id/invoice` | `backend/controllers/bookingController.js` | Implemented JSON/printable HTML API |
| Booking receipt | `/api/bookings/:id/receipt` | `backend/controllers/bookingController.js` | Implemented JSON/printable HTML API |
| Finance dashboard ledger | `/finance` via `/api/finance/dashboard` | `frontend/app/finance/page.tsx`, `backend/controllers/reportingController.js` | Implemented ledger-backed data |

## Sprint 8 Infrastructure Endpoints

| Screen | Route | File | Status |
|---|---|---|---|
| Production health | `/health` | `backend/controllers/systemController.js` | Implemented API endpoint |
| Readiness | `/ready` | `backend/controllers/systemController.js` | Implemented API endpoint |
| Liveness | `/live` | `backend/controllers/systemController.js` | Implemented API endpoint |
| Metrics | `/metrics` | `backend/controllers/systemController.js` | Implemented Prometheus endpoint |

| Screen | Route | File | Status |
|---|---|---|---|
| Home/customer summary | `/` | `frontend/app/page.tsx` | Implemented |
| Sign in | `/sign-in` | `frontend/app/sign-in/[[...sign-in]]/page.tsx` | Implemented |
| Sign up | `/sign-up` | `frontend/app/sign-up/[[...sign-up]]/page.tsx` | Implemented |
| Register/profile sync | `/register` | `frontend/app/register/page.tsx` | Partial |
| First-run setup wizard | `/setup` | `frontend/app/setup/page.tsx` | Implemented |
| Choose account type | `/choose-account`, `/register` | `frontend/app/register/page.tsx` | Implemented |
| Accept invite | `/accept-invite` | `frontend/app/accept-invite/page.tsx` | Implemented |
| Complete profile | `/complete-profile` | `frontend/app/complete-profile/page.tsx` | Implemented |
| New organization wizard | `/organizations/new` | `frontend/app/organizations/new/page.tsx` | Implemented |
| Wallet | `/wallet` | `frontend/app/wallet/page.tsx` | Partial |
| Generate ticket | `/generate` | `frontend/app/generate/page.tsx` | Partial |
| Tickets list | `/tickets` | `frontend/app/tickets/page.tsx` | Implemented |
| Ticket details | `/tickets/[ticketId]` | `frontend/app/tickets/[ticketId]/page.tsx` | Implemented |
| Admin/scanner | `/admin` | `frontend/app/admin/page.tsx` | Legacy partial |
| Fare management | `/admin/fares` | `frontend/app/admin/fares/page.tsx` | Partial |
| Organization dashboard/profile/settings/members/invites | `/organization` | `frontend/app/organization/page.tsx` | Implemented |
| User management list/dashboard | `/organization/users` | `frontend/app/organization/users/page.tsx` | Implemented |
| Create user | `/organization/users/new` | `frontend/app/organization/users/new/page.tsx` | Implemented |
| User details/edit/activity | `/organization/users/[id]` | `frontend/app/organization/users/[id]/page.tsx` | Implemented |
| Fleet operations dashboard | `/operations` | `frontend/app/operations/page.tsx` | Implemented |
| Bus management | `/buses` | `frontend/app/buses/page.tsx` | Implemented |
| Driver management | `/drivers` | `frontend/app/drivers/page.tsx` | Implemented |
| Conductor management | `/conductors` | `frontend/app/conductors/page.tsx` | Implemented |
| Schedule management | `/schedules` | `frontend/app/schedules/page.tsx` | Implemented |
| Enterprise pricing | `/admin/pricing` | `frontend/app/admin/pricing/page.tsx` | Implemented foundation |
| New pricing rule | `/admin/pricing/new` | `frontend/app/admin/pricing/new/page.tsx` | Implemented foundation |
| Pricing history | `/admin/pricing/history` | `frontend/app/admin/pricing/history/page.tsx` | Implemented foundation |
| Pricing simulator | `/admin/pricing/simulator` | `frontend/app/admin/pricing/simulator/page.tsx` | Implemented foundation |
| Coupons | `/admin/coupons` | `frontend/app/admin/coupons/page.tsx` | Implemented foundation |
| New coupon | `/admin/coupons/new` | `frontend/app/admin/coupons/new/page.tsx` | Implemented foundation |
| Coupon detail | `/admin/coupons/[id]` | `frontend/app/admin/coupons/[id]/page.tsx` | Implemented foundation |
| Enterprise booking | `/booking` | `frontend/app/booking/page.tsx` | Implemented foundation |
| Bookings | `/bookings` | `frontend/app/bookings/page.tsx` | Implemented foundation |
| Booking detail | `/bookings/[id]` | `frontend/app/bookings/[id]/page.tsx` | Implemented foundation |
| Refunds | `/refunds` | `frontend/app/refunds/page.tsx` | Implemented foundation |
| Wallet history | `/wallet/history` | `frontend/app/wallet/history/page.tsx` | Implemented foundation |
| Wallet recharge | `/wallet/recharge` | `frontend/app/wallet/recharge/page.tsx` | Implemented foundation |
| Wallet transactions | `/wallet/transactions` | `frontend/app/wallet/transactions/page.tsx` | Implemented foundation |
| Finance dashboard | `/finance` | `frontend/app/finance/page.tsx` | Implemented foundation |
| Super admin dashboard | `/super-admin` | `frontend/app/super-admin/page.tsx` | Implemented foundation |
| Pricing dashboard alias | `/pricing` | `frontend/app/pricing/page.tsx` | Implemented foundation |
| Support dashboard | `/support` | `frontend/app/support/page.tsx` | Implemented foundation |
| Notifications | `/notifications` | `frontend/app/notifications/page.tsx` | Implemented foundation |
| Global search | `/search` | `frontend/app/search/page.tsx` | Implemented |
| Profile | `/profile` | `frontend/app/profile/page.tsx` | Implemented |
| Settings | `/settings` | `frontend/app/settings/page.tsx` | Implemented |
| Help center | `/help` | `frontend/app/help/page.tsx` | Implemented |
| Guided onboarding | `/onboarding` | `frontend/app/onboarding/page.tsx` | Implemented |
| Forbidden | `/403` | `frontend/app/403/page.tsx` | Implemented |
| Not found | `*` | `frontend/app/not-found.tsx` | Implemented |
| Fleet dashboard | `/fleet` | `frontend/app/fleet/page.tsx` | Implemented foundation |
| Dispatcher dashboard | `/dispatcher` | `frontend/app/dispatcher/page.tsx` | Implemented foundation |
| Maintenance dashboard | `/maintenance` | `frontend/app/maintenance/page.tsx` | Implemented foundation |
| Trip execution | `/trips` | `frontend/app/trips/page.tsx` | Implemented |
| Operations calendar | `/calendar` | `frontend/app/calendar/page.tsx` | Implemented |
| Fuel management | `/fuel` | `frontend/app/fuel/page.tsx` | Implemented |
| Leave and availability | `/leave` | `frontend/app/leave/page.tsx` | Implemented |
| Incident management | `/incidents` | `frontend/app/incidents/page.tsx` | Implemented |
| Posts | `/posts` | `frontend/app/posts/page.tsx` | Implemented foundation |
| New post | `/posts/new` | `frontend/app/posts/new/page.tsx` | Implemented foundation |
| Post detail | `/posts/[id]` | `frontend/app/posts/[id]/page.tsx` | Implemented foundation |
| Support ticket detail | `/support/[id]` | `frontend/app/support/[id]/page.tsx` | Implemented foundation |
| New support ticket | `/support/new` | `frontend/app/support/new/page.tsx` | Implemented foundation |
| Revenue report | `/reports/revenue` | `frontend/app/reports/revenue/page.tsx` | Implemented foundation |
| Fleet report | `/reports/fleet` | `frontend/app/reports/fleet/page.tsx` | Implemented foundation |
| Users report | `/reports/users` | `frontend/app/reports/users/page.tsx` | Implemented foundation |
| Routes report | `/reports/routes` | `frontend/app/reports/routes/page.tsx` | Implemented foundation |
| Finance report | `/reports/finance` | `frontend/app/reports/finance/page.tsx` | Implemented foundation |
| Support report | `/reports/support` | `frontend/app/reports/support/page.tsx` | Implemented foundation |
| Audit report | `/reports/audit` | `frontend/app/reports/audit/page.tsx` | Implemented foundation |
| Payments | `/payments` | `frontend/app/payments/page.tsx` | Implemented foundation |
| Payment detail | `/payments/[id]` | `frontend/app/payments/[id]/page.tsx` | Implemented foundation |
| Payment history | `/payments/history` | `frontend/app/payments/history/page.tsx` | Implemented foundation |
| Customer dashboard | `/customer` | `frontend/app/customer/page.tsx` | Implemented foundation |
| Conductor dashboard | `/conductor` | `frontend/app/conductor/page.tsx` | Implemented foundation |
| Driver dashboard | `/driver` | `frontend/app/driver/page.tsx` | Implemented foundation |
| Passenger live trips | `/my-trips` | `frontend/app/my-trips/page.tsx` | Implemented |
| Passenger trip status | `/trip-status/[id]` | `frontend/app/trip-status/[id]/page.tsx` | Implemented |
| Live bus tracking | `/track/[tripId]` | `frontend/app/track/[tripId]/page.tsx` | Implemented |
| Boarding view | `/boarding` | `frontend/app/boarding/page.tsx` | Implemented |
| Audit logs | `/audit` | `frontend/app/audit/page.tsx` | Implemented foundation |
| Reports | `/reports` | `frontend/app/reports/page.tsx` | Implemented foundation |
| Dashboard redirect | `/dashboard` | `frontend/app/dashboard/page.tsx` | Redirect |
| Scanner redirect | `/scanner` | `frontend/app/scanner/page.tsx` | Redirect |
| Role editor | TBD | Missing | Missing |
| Driver dashboard | `/driver` | `frontend/app/driver/page.tsx` | Implemented foundation |
| Conductor dashboard | `/conductor` | `frontend/app/conductor/page.tsx` | Implemented foundation |
| Finance dashboard | `/finance` | `frontend/app/finance/page.tsx` | Implemented foundation |
| Posts/announcements | TBD | Missing | Missing |
| Reports | `/reports` | `frontend/app/reports/page.tsx` | Implemented foundation |
| Settings | TBD | Missing | Missing |
