# 16 Operation Manual

## Overview
This manual documents only operations possible in the current code. Missing workflows are marked NOT IMPLEMENTED.

## Detailed explanation
### Create an organization
UI: NOT IMPLEMENTED.
API:
1. Sign up with Clerk.
2. Ensure a backend `User` exists.
3. Call `POST /api/organizations` with `name`, `slug`, `city`.
4. The org starts `pending`; user becomes `org_owner`.
Current risk: user sync may fail before this because `organizationId` is required.

### Create admins
UI: NOT IMPLEMENTED.
Options:
- Manually update Mongo user role to old `admin` for current frontend scanner UI.
- Or use org invite API with role `conductor`, but frontend will not recognize `conductor` as admin.

### Add conductors
Partial through `POST /api/organizations/:id/invites`, then `POST /api/invites/:token/accept`.
Email sending and accept page: NOT IMPLEMENTED.

### Add drivers
NOT IMPLEMENTED.

### Add buses
NOT IMPLEMENTED. No Bus model exists.

### Assign buses
NOT IMPLEMENTED.

### Assign routes
Route creation exists, but bus/driver assignment is NOT IMPLEMENTED.

### Manage prices
1. User must have old `admin` or `fare_manager` for UI, or backend-supported price role for API.
2. Open `/admin/fares`.
3. Use Add Route/Edit/Enable/Disable/Delete.
4. Backend endpoints are under `/api/admin/routes`.
Current risk: route creation/update fare history omit required `organizationId`.

### Create ticket managers
NOT IMPLEMENTED.

### Create finance managers
NOT IMPLEMENTED except enum value and possible manual DB role.

### Create posts
NOT IMPLEMENTED.

### Use maps
1. Open `/generate`.
2. Select or type from/to stops.
3. Use map click or current location.
4. Generate ticket for an available route.

### Book tickets
1. Sign in.
2. Ensure app user exists and has balance.
3. Open `/generate`.
4. Select available route.
5. Click Generate Ticket.

### Scan tickets
1. Sign in as old `admin`.
2. Open `/admin`.
3. Start camera scanner or enter ticket ID manually.
4. Ticket becomes `USED` if active.

### Approve users
NOT IMPLEMENTED.

### Manage permissions
UI: NOT IMPLEMENTED.
API: partial through org invite role assignment.
Manual Mongo updates are currently the practical method.

### Access dashboards
- Customer: `/`, `/wallet`, `/generate`, `/tickets`.
- Legacy admin: `/admin`.
- Legacy fare manager: `/admin`, `/admin/fares`.
- Super admin/org owner/driver/finance dashboards: NOT IMPLEMENTED.

### Recover data
NOT IMPLEMENTED. No backup/restore tools.

### Reset passwords
Handled by Clerk's hosted account/auth flows, not by this app.

### Onboard a new company
Partial API only:
1. Create app user.
2. `POST /api/organizations`.
3. Manually create/assign super admin.
4. Super admin approves org with `POST /api/organizations/:id/approve`.
5. Org owner invites users.
No UI/email/persistent invite storage exists.

## Code references
Routes/controllers/pages documented throughout this folder.

## File references
`USER_FLOW_GUIDE.md`, `ADMIN_USER_SYSTEM.md`, `PHASE1_COMPLETION_REPORT.md`.

## API references
See `03_API_DOCUMENTATION.md`.

## Screens
Current usable screens are listed in `07_FRONTEND_PAGES.md`.

## Dependencies
Clerk, MongoDB, Next.js, Express.

## Current status
Passenger and legacy admin/fare flows are partially operable; enterprise operations are mostly NOT IMPLEMENTED.

## Recommendations
Build missing management UIs only after fixing data consistency and auth security.
