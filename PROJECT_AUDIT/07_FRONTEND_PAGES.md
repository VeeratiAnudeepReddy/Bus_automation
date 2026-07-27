# 07 Frontend Pages

## Overview
The frontend uses Next.js App Router under `frontend/app`.

## Detailed explanation
| URL | File | Purpose | Role | API calls | Status |
|---|---|---|---|---|---|
| `/` | `app/page.tsx` | Home, auth CTA, wallet/ticket summary | Guest/customer; redirects old admin/fare_manager | `/auth/sync`, `/tickets/my` | Implemented |
| `/sign-in` | `app/sign-in/[[...sign-in]]/page.tsx` | Clerk sign in | Guest | Clerk | Implemented |
| `/sign-up` | `app/sign-up/[[...sign-up]]/page.tsx` | Clerk sign up | Guest | Clerk | Implemented |
| `/register` | `app/register/page.tsx` | Profile sync | Authenticated | `/auth/sync` | Implemented but may fail schema |
| `/wallet` | `app/wallet/page.tsx` | Wallet balance/top-up/history | Customer | `/tickets/my`, `/wallet/add` | Implemented |
| `/generate` | `app/generate/page.tsx` | Select route/map and book ticket | Customer | `/tickets/my`, `/routes`, `/tickets/book` | Implemented |
| `/tickets` | `app/tickets/page.tsx` | Ticket list | Customer | `/tickets/my` | Implemented |
| `/tickets/[ticketId]` | `app/tickets/[ticketId]/page.tsx` | QR detail, download/share | Customer | `/tickets/my`, `/auth/sync` | Implemented |
| `/admin` | `app/admin/page.tsx` | Scanner and analytics | old `admin`, old `fare_manager` | `/admin/analytics`, `/tickets/scan` | Implemented legacy |
| `/admin/fares` | `app/admin/fares/page.tsx` | Route/fare CRUD | old `admin`, old `fare_manager` | `/admin/routes*` | Implemented legacy |
| `/dashboard` | `app/dashboard/page.tsx` | Redirect to `/` | Protected | none | Implemented redirect |
| `/scanner` | `app/scanner/page.tsx` | Redirect to `/admin` | Protected | none | Implemented redirect |

Navigation:
- `Navbar` links to `/`.
- `BottomTabBar` links to `/`, `/tickets`, `/wallet`.
- Home links to `/wallet`, `/generate`, `/tickets`.
- Admin links to `/admin/fares`.
- Ticket cards link to `/tickets/[ticketId]`.

Missing pages:
- Organization onboarding/admin pages: NOT IMPLEMENTED.
- Invite accept page `/accept-invite`: NOT IMPLEMENTED.
- Super admin dashboard: NOT IMPLEMENTED.
- Driver/dispatcher/finance dashboards: NOT IMPLEMENTED.
- Posts, payments, buses, assignments: NOT IMPLEMENTED.

## Code references
`frontend/app/**/page.tsx`, `frontend/components/Navbar.tsx`, `frontend/components/BottomTabBar.tsx`.

## File references
`frontend/README.md`, `README.md`.

## API references
See table.

## Screens
All implemented routes listed above. No screenshots were generated during this audit.

## Dependencies
Next.js App Router, Clerk, Axios, Leaflet, html5-qrcode.

## Current status
Core passenger/admin legacy pages exist. Enterprise admin pages are NOT IMPLEMENTED.

## Recommendations
Align role checks with backend canonical roles and add missing org/team management pages.
