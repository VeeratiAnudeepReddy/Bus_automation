# 05 User Creation Guide

## Overview
Users are primarily created through Clerk sign-up plus backend sync. Admin/team roles require manual DB changes or incomplete organization invite APIs.

## Detailed explanation
### Passenger / Customer
UI: sign up through Clerk, then visit `/register` or any page using `useAppRole`.
API: `POST /api/auth/sync`.
Required fields: `clerkUserId`, `email`; optional `name`, `phone`.
Current blocker: `User.organizationId` is required, but sync does not set it. User creation may fail unless schema/data differs or the code is fixed.

### Admin / Conductor
No UI to create directly. Possible only by manual Mongo update to old `admin` or new `conductor`, or by org invite API if an org owner exists and invite token is accepted.
Dashboard: `/admin` works for old `admin` in frontend. New `conductor` is backend-authorized but frontend does not treat it as admin.

### Price Manager / Fare Manager
No UI to create directly. Manual Mongo update to old `fare_manager` or new `price_manager`, or org invite API. Frontend only recognizes old `fare_manager`.

### Super Admin
No seed script and no UI. Manual database insert/update only.
Example concept:
```js
db.users.updateOne({ email: "owner@example.com" }, { $set: { role: "super_admin" } })
```
Exact insert requires valid `organizationId` unless schema is changed.

### Organization
API exists: `POST /api/organizations` by an authenticated user. It creates a pending org and sets user role to `org_owner`.
UI: NOT IMPLEMENTED.

### Manager
NOT IMPLEMENTED. No exact role.

### Conductor
Partial. Role exists and backend middleware supports it; frontend does not recognize it.

### Driver
Role enum exists. Creation flow, dashboard, APIs: NOT IMPLEMENTED.

### Ticket Manager
NOT IMPLEMENTED. No exact role exists.

### Finance Manager
Enum exists. Creation UI/API and dashboard: NOT IMPLEMENTED.

### Seed scripts
No general seed script exists. Migration scripts exist:
- `backend/migrations/001_backfill_default_org.js`
- `backend/migrations/002_translate_roles.js`
These are migration helpers, not complete user seeders.

## Code references
`frontend/app/register/page.tsx`, `frontend/lib/useAppRole.ts`, `backend/controllers/authController.js`, `backend/controllers/organizationController.js`, `backend/migrations/*.js`.

## File references
`USER_FLOW_GUIDE.md`, `ADMIN_USER_SYSTEM.md`, `07_Role_Hierarchy.md`.

## API references
`POST /api/auth/sync`, `POST /api/organizations`, `POST /api/organizations/:id/invites`, `POST /api/invites/:token/accept`.

## Screens
Passenger registration exists at `/register`. Organization/team onboarding screens: NOT IMPLEMENTED.

## Dependencies
Clerk for identity; MongoDB for app user rows.

## Current status
User creation is fragile because current schema requires organization ownership/context earlier than the frontend registration flow supplies it.

## Recommendations
Add a supported bootstrap path for default org/customer creation, super admin seed, and role assignment UI/API.
