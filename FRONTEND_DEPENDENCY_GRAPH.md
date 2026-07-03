# Frontend Dependency Graph

## App Root
`frontend/app/layout.tsx`

Depends on:
- `@clerk/nextjs` `ClerkProvider`
- `frontend/components/AuthGate.tsx`
- `react-hot-toast`
- `frontend/app/globals.css`

## Auth And Routing
`AuthGate`

Depends on:
- `frontend/lib/api.ts`: `getPlatformStatus`, `getCurrentUser`
- `frontend/lib/auth-context.tsx`
- `frontend/lib/roles.ts`: `dashboardForRole`, `canAccessPath`
- Clerk client state

Consumers:
- `frontend/lib/useAppRole.ts`
- `EnterpriseShell`
- `BottomTabBar`
- customer/operations/admin pages

## Layout Shell
`PageShell`

Depends on:
- `EnterpriseSidebar`
- `EnterpriseTopbar`
- `BottomTabBar`
- `framer-motion`

Used by nearly every application route.

## Navigation
`EnterpriseShell`, `BottomTabBar`, `Navbar`

Depends on:
- `frontend/lib/roles.ts`: `navForRole`
- `frontend/lib/useAppRole.ts`
- Clerk `UserButton`

Risk:
- Navigation is role-aware and centralized, but role-specific IA still needs final product review.

## Customer Experience
`frontend/components/CustomerExperience.tsx`

Routes:
- `/customer`
- `/booking`
- `/bookings`
- `/bookings/[id]`
- `/wallet`
- `/wallet/history`
- `/wallet/recharge`
- `/wallet/transactions`
- `/notifications`
- `/search`
- `/settings`
- `/profile`
- `/support`
- `/support/new`
- `/support/[id]`

Depends on:
- `apiService.getMyTickets`
- `apiService.getRoutes`
- `apiService.createBooking`
- `apiService.listBookings`
- `apiService.getBooking`
- `apiService.getNotifications`
- `apiService.listPosts`
- `apiService.listSupportTickets`
- `apiService.createSupportTicket`
- `apiService.getSupportTicket`
- `apiService.globalSearch`
- `apiService.listPayments`
- `apiService.getWalletTransactions`
- `apiService.createPaymentOrder`
- `apiService.verifyPayment`
- Google Maps embed URLs

Status:
- Restored away from generated CRUD templates.

## Generic Templates
`EnterpriseDataPage`

Routes still depending on it:
- `/admin/coupons`
- `/admin/pricing`
- `/admin/pricing/history`
- `/audit`
- `/finance`
- `/payments`
- `/payments/history`
- `/pricing`
- `/refunds`
- `/reports`

`EnterpriseActionPage`

Routes still depending on it:
- `/admin/coupons/new`
- `/admin/pricing/new`
- `/admin/pricing/simulator`
- `/payments/new`

`EnterpriseDetailPage`

Routes still depending on it:
- `/admin/coupons/[id]`
- `/payments/[id]`

`RoleDashboard`

Routes:
- `/fleet`
- `/super-admin`

Status:
- Fake `Ready`/`0` metrics removed.
- Still a fallback dashboard, not a final product dashboard.

## Operations Modules
Dedicated route files:
- `/operations`
- `/dispatcher`
- `/driver`
- `/conductor`
- `/trips`
- `/track/[tripId]`
- `/trip-status/[id]`
- `/buses`
- `/drivers`
- `/conductors`
- `/schedules`
- `/maintenance`
- `/fuel`
- `/leave`
- `/incidents`
- `/calendar`

Depends on:
- existing operations/fleet/trip APIs through `apiService`
- some Google Maps embeds

Status:
- Mostly functional, but uneven UX depth and chart/table quality.

## Organization And User Management
Dedicated route files:
- `/organization`
- `/organization/users`
- `/organization/users/new`
- `/organization/users/[id]`
- `/organizations/new`

Depends on:
- organization APIs
- user-management APIs
- `SetupWizard`

Status:
- More complete than generic pages, but dense and admin-oriented.

## Collaboration
`CollaborationPages`

Routes:
- `/posts`
- `/posts/new`
- `/posts/[id]`

Status:
- Functional collaboration UI, not yet a polished offers/news/customer content experience.

## Reporting
`ReportModulePage`

Routes:
- `/reports/audit`
- `/reports/finance`
- `/reports/fleet`
- `/reports/revenue`
- `/reports/routes`
- `/reports/support`
- `/reports/users`

Status:
- API-backed report rows, but needs chart/table restoration.
