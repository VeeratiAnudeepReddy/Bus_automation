# UI Audit

## Scope
Frontend-only audit of `frontend/app`. Backend APIs, authentication, authorization, payments, Razorpay, realtime, dispatcher logic, trip engine, booking engine, GPS, and notification backend code were not modified.

## Classification
| Route | Current state | Missing widgets/API/interactions | Priority |
|---|---|---|---|
| `/` | Production UI | Could use richer public landing media | Low |
| `/403` | Utility page | None critical | Low |
| `/accept-invite` | Production onboarding UI | None critical | Medium |
| `/admin` | Production legacy scanner | More scanner analytics charts | Medium |
| `/admin/fares` | Production fare UI | Map preview per route | Medium |
| `/admin/coupons` | Generated CRUD page | Dedicated coupon analytics and campaign builder | High |
| `/admin/coupons/[id]` | Generated detail page | Coupon usage chart, audit trail | High |
| `/admin/coupons/new` | Generated form page | Campaign wizard | High |
| `/admin/pricing` | Generated CRUD page | Pricing analytics, approval workflow UI | High |
| `/admin/pricing/history` | Generated list page | Timeline and diff view | High |
| `/admin/pricing/new` | Generated form page | Pricing rule wizard | High |
| `/admin/pricing/simulator` | Generated form page | Rich fare simulator | High |
| `/audit` | Generated data page | Filters, actor drilldown, export controls | Medium |
| `/boarding` | Production operations UI | More live map detail | Medium |
| `/booking` | Production restored customer UI | Real bus images from backend when available | Critical |
| `/bookings` | Production restored customer UI | More invoice/refund actions | Critical |
| `/bookings/[id]` | Production restored customer detail | PDF invoice rendering when backend supports it | Critical |
| `/buses` | Production CRUD/ops UI | Better fleet map and document previews | Medium |
| `/calendar` | Production operations UI | Drag/drop scheduling | Medium |
| `/choose-account` | Production onboarding UI | None critical | Medium |
| `/complete-profile` | Production onboarding UI | More role-specific validation | Medium |
| `/conductor` | Production dashboard | More live map widgets | Medium |
| `/conductors` | Production CRUD/ops UI | Roster calendar | Medium |
| `/customer` | Production restored customer dashboard | Weather API unavailable in current backend | Critical |
| `/dashboard` | Routing shell | None; AuthGate owns destination | Low |
| `/dispatcher` | Production dashboard | More dispatch map layering | Medium |
| `/driver` | Production dashboard | More offline controls | Medium |
| `/drivers` | Production CRUD/ops UI | Driver route map | Medium |
| `/finance` | Generated data page | Dedicated finance dashboard UI | High |
| `/fleet` | Placeholder dashboard | Dedicated fleet KPIs and map | High |
| `/fuel` | Incomplete form/list UI | Charts, filters, cost analytics | Medium |
| `/generate` | Production legacy booking | Should be consolidated with `/booking` | Medium |
| `/help` | Utility page | Searchable help center | Low |
| `/incidents` | Production operations UI | Incident map and SLA charts | Medium |
| `/leave` | Production operations UI | Approval calendar | Medium |
| `/maintenance` | Production operations UI | Maintenance charts and timeline | Medium |
| `/my-trips` | Incomplete alias to trips | Customer-focused trip history | High |
| `/notifications` | Production restored customer UI | Preference controls inline | High |
| `/onboarding` | Utility/generated page | More guided progress | Low |
| `/operations` | Production dashboard | More maps/charts | Medium |
| `/organization` | Production organization UI | Some sections dense/admin-like | Medium |
| `/organization/users` | Production user management | None critical | Medium |
| `/organization/users/[id]` | Production detail UI | More profile analytics | Medium |
| `/organization/users/new` | Production create UI | None critical | Medium |
| `/organizations/new` | Production setup wizard | None critical | Medium |
| `/payments` | Generated data page | Dedicated payments console | High |
| `/payments/[id]` | Generated detail page | Payment timeline and receipt view | High |
| `/payments/history` | Generated data page | Reconciliation filters | High |
| `/payments/new` | Generated form page | Payment intent wizard | High |
| `/posts` | Production collaboration UI | Customer offer carousel now surfaced on dashboard | Medium |
| `/posts/[id]` | Production collaboration detail | Rich media | Medium |
| `/posts/new` | Production collaboration form | Media upload | Medium |
| `/pricing` | Generated data page | Customer-facing fare explorer | High |
| `/profile` | Production restored customer profile | Inline edit mode | High |
| `/refunds` | Generated data page | Customer refund center | High |
| `/register` | Production onboarding UI | None critical | Medium |
| `/reports` | Generated data page | Dedicated report dashboard | High |
| `/reports/*` | Production report modules | More chart visualization | Medium |
| `/scanner` | Production informational page | Direct scanner component if role allows | Low |
| `/schedules` | Production operations UI | Map/timeline enhancements | Medium |
| `/search` | Production restored global search | Result cards can be specialized per entity | High |
| `/settings` | Production restored settings surface | Persist every preference when APIs exist | High |
| `/setup` | Production setup wizard | None critical | Medium |
| `/sign-in` | Production Clerk UI | None critical | Low |
| `/sign-up` | Production Clerk UI | None critical | Low |
| `/super-admin` | Placeholder dashboard | Dedicated platform admin workspace | High |
| `/support` | Production restored customer support | SLA timeline | High |
| `/support/[id]` | Production support detail | More customer polish | Medium |
| `/support/new` | Production support form | Now less central because `/support` has create form | Medium |
| `/tickets` | Production customer ticket list | Filters and ticket wallet grouping | Medium |
| `/tickets/[ticketId]` | Production ticket detail | Route map and refund action | Medium |
| `/track/[tripId]` | Production map page | Traffic/polyline data depends on backend/provider | Medium |
| `/trip-status/[id]` | Production status page | More customer polish | Medium |
| `/trips` | Production operations trips page | Separate customer trip history | Medium |
| `/wallet` | Production restored customer wallet | Live Razorpay requires configured keys | Critical |
| `/wallet/history` | Production restored wallet UI | Dedicated ledger export when backend supports it | Critical |
| `/wallet/recharge` | Production restored wallet UI | Live Razorpay requires configured keys | Critical |
| `/wallet/transactions` | Production restored wallet UI | More statement formats | Critical |

## Generic Components Removed
`EnterpriseDataPage`, `EnterpriseActionPage`, `EnterpriseDetailPage`, and `RoleDashboard` have been removed after their route usage was replaced by restored module-specific pages. `UtilityPages` remains for simple utility surfaces only and is not part of the enterprise module restoration set.

## Detailed Stabilization Issues

| Issue | Priority | Affected files | Proposed fix |
|---|---|---|---|
| Generic finance dashboard | Critical | `frontend/app/finance/page.tsx`, `frontend/components/EnterpriseDataPage.tsx` | Replace with finance-specific revenue, refunds, payments, ledger, reconciliation charts and tables using existing finance APIs. |
| Generic payments pages | Critical | `frontend/app/payments/*`, `frontend/components/EnterpriseDataPage.tsx`, `frontend/components/EnterpriseActionPage.tsx`, `frontend/components/EnterpriseDetailPage.tsx` | Build dedicated payments console, payment timeline, reconciliation filters, receipts, refunds, and provider status panels without changing payment APIs. |
| Generic pricing/coupon pages | High | `frontend/app/admin/pricing/*`, `frontend/app/admin/coupons/*`, `frontend/app/pricing/page.tsx` | Replace form/list scaffolds with rule builder, fare simulator, approval timeline, coupon campaign analytics, and customer fare explorer. |
| Super admin placeholder dashboard | High | `frontend/app/super-admin/page.tsx`, `frontend/components/RoleDashboard.tsx` | Build platform admin workspace with organizations, pending approvals, system health, audit, payments, and support modules. |
| Fleet fallback dashboard | High | `frontend/app/fleet/page.tsx`, `frontend/components/RoleDashboard.tsx` | Build fleet command center with buses, drivers, conductors, maintenance, fuel, documents, route assignments, and map. |
| Report landing page is generic | High | `frontend/app/reports/page.tsx`, `frontend/components/EnterpriseDataPage.tsx` | Replace with report catalog, charts, saved exports, and module cards. |
| Operations pages have inconsistent tables | Medium | `frontend/app/buses/page.tsx`, `frontend/app/drivers/page.tsx`, `frontend/app/conductors/page.tsx`, `frontend/app/schedules/page.tsx`, `frontend/app/trips/page.tsx` | Introduce shared `TableCard`, `FilterBar`, `ActionToolbar`, pagination, export, sticky headers, and bulk actions. |
| Maps are uneven | Medium | `frontend/app/operations/page.tsx`, `frontend/app/dispatcher/page.tsx`, `frontend/app/driver/page.tsx`, `frontend/app/conductor/page.tsx`, `frontend/app/trip-status/[id]/page.tsx`, `frontend/app/track/[tripId]/page.tsx` | Standardize lazy-loaded map cards with bus marker, route, stops, ETA, and offline fallback. |
| Loading/error states inconsistent | Medium | Most route files under `frontend/app` | Replace plain text loading with skeletons, retry panels, support actions, and API-specific error messaging. |
| Generic collaboration pages | Medium | `frontend/app/posts/*`, `frontend/components/CollaborationPages.tsx` | Split customer offers/announcements from internal posts; add media cards, filters, read receipts, comments polish. |
| Settings persistence incomplete | Medium | `frontend/app/settings/page.tsx`, `frontend/components/CustomerExperience.tsx` | Connect settings sections to existing org/user/preference APIs where available; leave disabled controls only when API does not exist. |
| Local storage activity remains | Low | `frontend/lib/activity.ts`, legacy pages using it | Replace remaining local-only activity with backend-driven audit/history views where APIs exist. |

## Dependency Graph
See `FRONTEND_DEPENDENCY_GRAPH.md`.

## Phase 2 Update
Route usage and source definitions for `EnterpriseDataPage`, `EnterpriseActionPage`, `EnterpriseDetailPage`, and `RoleDashboard` have been removed. Restored module pages now live in `frontend/components/RestoredEnterpriseModules.tsx`.
