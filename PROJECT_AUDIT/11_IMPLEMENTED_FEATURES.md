# 11 Implemented Features

## Overview
This file lists features present in actual code, not merely in planning docs.

## Detailed explanation
Implemented:
- Next.js App Router frontend.
- Clerk sign-in/sign-up routes.
- Clerk route protection through `proxy.ts`.
- Home page with guest CTA and user summary.
- Backend user sync endpoint.
- Wallet balance display and test recharge.
- Ticket booking with QR payload and QR image generation.
- Ticket list and ticket detail QR display.
- Ticket download/share.
- Route selection by stops.
- Leaflet/OpenStreetMap pinning and geolocation support.
- Backend route listing with seeded Hyderabad route data intent.
- Backend route/fare CRUD endpoints.
- Fare management UI.
- Admin/scanner page using camera scanner and manual input.
- Ticket scan endpoint with atomic active-to-used update.
- Scanner analytics for current scanner.
- Organization model.
- Organization create/get/update/approve/suspend/invite/accept API code.
- Role middleware with legacy role translation.
- Migration scripts for default org and role translation.
- Organization model tests file.

## Code references
All implementation files in `backend/` and `frontend/`.

## File references
`PHASE1_COMPLETION_REPORT.md`, `18_Implementation_Checklist.md`.

## API references
All live endpoints in `03_API_DOCUMENTATION.md`.

## Screens
All implemented pages in `07_FRONTEND_PAGES.md`.

## Dependencies
Backend and frontend package dependencies as listed in their package files.

## Current status
Implemented features are usable only after resolving current schema/auth/role mismatches and environment setup.

## Recommendations
Prioritize stabilization of implemented features before adding planned modules.
