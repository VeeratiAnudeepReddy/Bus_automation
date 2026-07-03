# 04 Role Access Matrix

## Overview
The code contains old roles and a newer planned hierarchy. Only a few roles are actually usable through UI/API today.

## Detailed explanation
| Requested role | Code role value | Exists in enum | UI support | API support | Status |
|---|---|---:|---:|---:|---|
| Super Admin | `super_admin` | Yes | No | Org approve/suspend | Partial |
| Organization Owner | `org_owner` | Yes | No | Org update/invite, admin route APIs | Partial |
| Admin | `admin` | Yes old role | Yes | Translates to conductor | Implemented legacy |
| Manager | NOT IMPLEMENTED | No exact role | No | No | NOT IMPLEMENTED |
| Dispatcher | `dispatcher` | Yes reserved | No | No dedicated APIs | NOT IMPLEMENTED |
| Driver | `driver` | Yes reserved | No | No dedicated APIs | NOT IMPLEMENTED |
| Conductor | `conductor` | Yes | No frontend checks | Ticket scan via backend | Partial |
| Finance | `finance_manager` | Yes | No | No finance APIs | NOT IMPLEMENTED |
| Ticket Manager | NOT IMPLEMENTED | No exact role | No | No | NOT IMPLEMENTED |
| Price Manager | `price_manager` | Yes | No frontend checks | Fare APIs via backend | Partial |
| Customer | `customer` | Yes | No frontend checks | User routes if record exists | Partial |
| Guest | unauthenticated | N/A | Home sign-in/sign-up | No API except `/auth/sync` | Partial |

Legacy roles:
- `user`: frontend type and old backend default in sync controller.
- `admin`: frontend admin/scanner role.
- `fare_manager`: frontend fare manager role.

Permissions:
- `requireAdmin`: `conductor`, `org_owner`, `super_admin`, plus old `admin`.
- `requireFareManagerOrAdmin`: `price_manager`, `org_owner`, `super_admin`, plus old `fare_manager`/`admin`.
- `requireSuperAdmin`: exact `super_admin`.
- `requireRole`: exact or translated role comparison.

Limitations:
- Frontend checks only `admin` and `fare_manager`; it does not recognize `conductor`, `price_manager`, `org_owner`, or `super_admin` for dashboard branching.
- No inheritance model beyond hardcoded middleware lists.
- No UI exists for role assignment except organization invite API response token.
- No pages exist for super admin, org owner, driver, dispatcher, finance, support, or ticket manager.

## Code references
`backend/models/User.js`, `backend/middleware/permissions.js`, `backend/middleware/adminMiddleware.js`, `frontend/lib/api.ts`, `frontend/app/admin/page.tsx`, `frontend/app/admin/fares/page.tsx`.

## File references
`07_Role_Hierarchy.md`, `18_Implementation_Checklist.md`, `PHASE1_COMPLETION_REPORT.md`.

## API references
Role-gated APIs: `/api/tickets/scan`, `/api/admin/analytics`, `/api/admin/routes*`, `/api/organizations/:id`, `/api/organizations/:id/approve`, `/api/organizations/:id/suspend`, `/api/organizations/:id/invites`.

## Screens
Implemented role screens: customer pages, legacy admin dashboard, legacy fare management page. Other requested dashboards: NOT IMPLEMENTED.

## Dependencies
No external RBAC package. Custom middleware only.

## Current status
RBAC is partially implemented and inconsistent between backend and frontend.

## Recommendations
Define one canonical role set, migrate frontend checks, add role management UI/API, and add organization isolation tests.
