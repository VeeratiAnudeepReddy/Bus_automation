# 18 Route Audit

## Overview
This audit covers frontend routes under `frontend/app`.

## Detailed explanation
| Route | File | Protected by Clerk proxy | Required role | Status |
|---|---|---:|---|---|
| `/` | `app/page.tsx` | No | Guest/customer | Works by source; sync risk |
| `/sign-in` | `app/sign-in/[[...sign-in]]/page.tsx` | No | Guest | Implemented |
| `/sign-up` | `app/sign-up/[[...sign-up]]/page.tsx` | No | Guest | Implemented |
| `/register` | `app/register/page.tsx` | Yes | Authenticated | Implemented; backend schema risk |
| `/wallet` | `app/wallet/page.tsx` | Yes | Customer | Implemented |
| `/generate` | `app/generate/page.tsx` | Yes | Customer | Implemented |
| `/tickets` | `app/tickets/page.tsx` | Yes | Customer | Implemented |
| `/tickets/[ticketId]` | `app/tickets/[ticketId]/page.tsx` | Yes | Customer | Implemented |
| `/admin` | `app/admin/page.tsx` | Yes | old `admin`/`fare_manager` in frontend | Implemented legacy |
| `/admin/fares` | `app/admin/fares/page.tsx` | Yes | old `admin`/`fare_manager` in frontend | Implemented legacy |
| `/dashboard` | `app/dashboard/page.tsx` | Yes | Authenticated | Redirects to `/` |
| `/scanner` | `app/scanner/page.tsx` | Yes | Authenticated | Redirects to `/admin` |

Missing routes:
- `/accept-invite`: NOT IMPLEMENTED.
- `/posts`: NOT IMPLEMENTED.
- `/payments`: NOT IMPLEMENTED.
- `/organizations`: NOT IMPLEMENTED.
- `/super-admin`: NOT IMPLEMENTED.
- `/drivers`, `/dispatch`, `/finance`, `/buses`: NOT IMPLEMENTED.

## Code references
`frontend/app`, `frontend/proxy.ts`.

## File references
`frontend/README.md`.

## API references
Page/API mapping is documented in `07_FRONTEND_PAGES.md`.

## Screens
No screenshots captured in this audit.

## Dependencies
Next.js App Router, Clerk middleware.

## Current status
Core routes exist and auth routes exist. Enterprise routes are NOT IMPLEMENTED.

## Recommendations
Do not add new route features until role naming and backend data consistency are fixed.
