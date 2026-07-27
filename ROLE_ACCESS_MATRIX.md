# Role Access Matrix

## Sprint 9 Finance and Booking Access

- Customers can create wallet/gateway bookings, recover their booking state, and read their invoices/receipts through authenticated booking APIs.
- Finance roles can view ledger-backed dashboard/report data.
- Organization owners, organization admins, and super admins continue to inherit finance/report visibility through existing RBAC.
- Super admins remain the escalation role for operational and finance troubleshooting.

| Role | Purpose | Dashboard | Current Support | Target Support |
|---|---|---|---|---|
| Guest | Public visitor | `/`, `/sign-in`, `/sign-up` | Partial | Public auth and marketing/help screens |
| Customer | Passenger | `/customer`, `/`, `/booking`, `/bookings`, `/wallet` | Booking/wallet/dashboard foundation | Booking, wallet, invoices, refunds, support |
| Conductor | Ticket validation staff | `/conductor`, `/admin` legacy | Scanner plus dashboard foundation | Dedicated conductor dashboard |
| Driver | Vehicle operator | `/driver`, `/drivers` | Driver profile/assignment/dashboard foundation | Driver trips, attendance, documents |
| Bus Manager | Bus/fleet data manager | `/buses`, `/operations` | Bus CRUD, maintenance, documents | Bus CRUD, maintenance, documents |
| Scheduler | Schedule planner | `/schedules`, `/operations` | Schedule CRUD and conflict detection | Schedules, route timings |
| Dispatcher | Operations dispatch | `/dispatcher`, `/drivers`, `/conductors`, `/schedules` | Assignments and dispatcher dashboard | Live operations, assignments |
| Ticket Price Manager | Fares/pricing | `/admin/fares`, `/admin/pricing`, `/admin/coupons` | Fare rules, approvals, coupons foundation | Fare rules, approvals, coupons |
| Finance Manager | Payments/refunds/reports | `/finance`, `/payments`, `/reports`, `/audit` | Finance/payment/reporting foundation | Razorpay, refunds, revenue, invoices |
| Fleet Manager | Fleet oversight | `/fleet`, `/buses`, `/drivers`, `/conductors` | Fleet CRUD, assignments, maintenance | Buses, drivers, assignments, maintenance |
| Operations Manager | Org operations | `/operations`, `/organization/users` read-only | Operations dashboard and user read access | Route, schedule, dispatcher oversight |
| Organization Admin | Admin for an organization | `/organization`, `/organization/users` | Organization and user management | User/role/org operations |
| Organization Owner | Organization owner | `/organization`, `/organization/users` | Organization and user management | Full organization dashboard/settings |
| Support | Moderation/help | `/support`, `/posts`, `/notifications` | Support desk, posts moderation foundation, notifications | Users, posts moderation, support tickets |
| Super Admin | Platform owner | `/organization`, `/organization/users` | Organization and user management APIs/UI | Platform org/user/payment oversight |

## Current Compatibility Roles
- `user` maps to `customer`.
- `admin` maps to `conductor`.
- `fare_manager` maps to `price_manager`.

## Current Problem
Frontend now uses shared role helpers for route access, role landing redirects, and navigation. Backend accepts both old and new values through middleware. Dedicated landing pages exist for the main role families, with deeper role-specific workflows still evolving.

## Sprint 5 Additions
- Customers, drivers, conductors, and staff can read scoped posts.
- Support, org admins, org owners, and super admins can manage posts and support tickets.
- Report routes remain limited to report, finance, operations, and organization management roles.

## Sprint 5.5 Refinement
- `fleet_manager` and `bus_manager` now land on `/fleet`.
- `dispatcher` now lands on `/dispatcher`.
- `scheduler` lands on `/schedules`.
- Drivers and conductors can reach schedules/reports that appear in their role navigation.
- Profile completion is role-specific and no longer shows all employee fields to customers.
# Sprint 6 Operations Access

| Module | Primary roles | Notes |
|---|---|---|
| Dispatcher control center | `dispatcher`, `operations_manager`, `org_admin`, `org_owner`, `super_admin` | Live trip and incident control. |
| Trips | `dispatcher`, `operations_manager`, `driver`, `conductor` | Dispatchers create/update; crew can execute status updates. |
| Maintenance | `fleet_manager`, `bus_manager`, `operations_manager`, `org_admin`, `org_owner`, `super_admin` | Fleet-owned work orders and vehicle health. |
| Fuel | `fleet_manager`, `bus_manager`, `operations_manager`, `org_admin`, `org_owner`, `super_admin` | Fuel and mileage records. |
| Leave | `driver`, `conductor`, `dispatcher`, `fleet_manager`, `operations_manager` | Crew requests; managers review. |
| Incidents | Operations staff, drivers, conductors, support | Crew report; dispatch/fleet/support update. |
| Calendar | Operations/fleet/dispatch/crew read roles | Combined trips, schedules, maintenance, leave, and incidents. |

# Sprint 7 Live Operations Access

| Module | Primary roles | Notes |
|---|---|---|
| Live trip actions | `driver`, `conductor`, `dispatcher`, `operations_manager`, `super_admin` | Driver/conductor execute; dispatcher supervises. |
| GPS updates | `driver`, `conductor`, `dispatcher` | Authenticated and organization-scoped. |
| Passenger tracking | `customer`, `user`, staff roles | Authenticated trip status lookup. |
| SSE event stream | Authenticated organization users | Organization-scoped real-time updates. |
| Offline sync | `driver`, `conductor`, staff roles | Stores replayed offline events for audit/sync. |
# Sprint 8 Infrastructure Access

| Module | Primary roles | Notes |
|---|---|---|
| Runtime config | `super_admin` | `/api/runtime-config` |
| Job registry/run | `super_admin` | `/api/jobs`, `/api/jobs/:name/run` |
| Manual backup metadata | `super_admin` | `/api/backups` |
| Health/ready/live/metrics | Public/internal network | Protect at reverse proxy in production if required. |
