# Dashboard Architecture

Every role has one landing dashboard.

| Role | Dashboard | Purpose |
|---|---|---|
| Customer | `/customer` | bookings, wallet, tickets, notifications, support |
| Organization Owner | `/organization` | organization overview, users, fleet, pricing, finance, reports |
| Organization Admin | `/organization` | organization management and operations |
| Operations Manager | `/operations` | operational health, schedules, assignments |
| Fleet Manager | `/fleet` | buses, drivers, conductors, maintenance |
| Bus Manager | `/fleet` | bus inventory and readiness |
| Dispatcher | `/dispatcher` | dispatch board, schedules, assignments |
| Scheduler | `/schedules` | schedule planning |
| Finance Manager | `/finance` | revenue, payments, refunds, reports |
| Pricing Manager | `/pricing` | rules, coupons, fare simulation |
| Driver | `/driver` | assigned schedule, route, incident/support |
| Conductor | `/conductor` | trips, scanner, passenger validation |
| Support | `/support` | tickets, replies, announcements |
| Super Admin | `/super-admin` | platform organizations, users, payments, logs |

Dashboards include role badge, organization context, metrics, shortcuts, search, notifications, and recent activity surfaces.
