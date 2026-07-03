# Route Audit

## Status
Frontend build generated 69 routes successfully.

## Redirects
- `/dashboard` redirects using `dashboardForRole`.
- `/` redirects authenticated users through `AuthGate` and dashboard routing.
- Unauthorized access goes to `/403`.

## Reachability
All implemented module groups are reachable from one or more of:
- enterprise sidebar
- topbar utility links
- role dashboard shortcuts
- onboarding checklist
- global search

## Duplicate Navigation
Legacy admin pages remain for backward compatibility:
- `/admin`
- `/admin/fares`
- `/admin/pricing*`

They are linked only for scanner/pricing/fare-management roles.

## Known Remaining Gaps
- Full browser loop testing with real Clerk users is pending.
- Some detail views route to module list pages when no dedicated detail page exists.
