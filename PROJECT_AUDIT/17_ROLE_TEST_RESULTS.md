# 17 Role Test Results

## Overview
Role testing was source-audited and partially command-verified. Full browser/API role testing requires working seeded users for each role.

## Detailed explanation
| Role | Exists? | Can be created? | Login works? | Dashboard exists? | Routes accessible? | Permissions working? | CRUD working? | Status |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| Super Admin | Enum yes | Manual only | Not tested | No | Org approve/suspend API | Partial | Org status only | Partial |
| Admin | Old enum yes | Manual/API sync old role not exposed in UI | Clerk works | `/admin` | Yes frontend | Yes legacy | Scanner only | Partial |
| Manager | No exact role | No | N/A | No | No | No | No | NOT IMPLEMENTED |
| Conductor | Enum yes | Manual/invite API | Not tested | No frontend role support | Backend scan allowed | Partial | Scan only | Partial |
| Driver | Enum yes | Manual only | Not tested | No | No | No | No | NOT IMPLEMENTED |
| Finance | `finance_manager` enum yes | Manual/invite API | Not tested | No | No | No finance APIs | No | NOT IMPLEMENTED |
| Passenger | old `user` and new `customer` | Intended via Clerk sync | Clerk works | Customer pages | Protected pages | Partial | Wallet/tickets | Partial |
| Organization Owner | Enum yes | Via org API | Not tested | No | Some backend APIs | Partial | Org/invites/routes APIs | Partial |
| Dispatcher | Enum yes | Manual only | Not tested | No | No | No | No | NOT IMPLEMENTED |
| Ticket Manager | No exact role | No | N/A | No | No | No | No | NOT IMPLEMENTED |
| Price Manager | Enum yes | Manual/invite API | Not tested | No frontend support | Backend fare APIs | Partial | Route CRUD | Partial |
| Guest | N/A | N/A | N/A | Home/auth | Public only | Clerk proxy redirects | No | Implemented |

Screens tested:
- Source verified all route files.
- Previous route verification showed `/sign-in` and `/sign-up` HTTP 200.
- No Playwright/browser screenshots were captured.

API tested:
- Automated endpoint testing was not completed because backend test tooling is missing and running real role tests requires seeded users.

## Code references
`backend/middleware/permissions.js`, `frontend/app/admin/page.tsx`, `frontend/app/admin/fares/page.tsx`.

## File references
`07_Role_Hierarchy.md`, `USER_FLOW_GUIDE.md`.

## API references
Role-gated APIs listed in `03_API_DOCUMENTATION.md`.

## Screens
Only customer, legacy admin, legacy fare manager screens exist.

## Dependencies
Clerk and MongoDB user records.

## Current status
Role system is not fully testable end-to-end without manual DB setup and fixes.

## Recommendations
Create seed users per role and add automated role access tests.
