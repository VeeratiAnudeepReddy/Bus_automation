# 03 API Documentation

## Overview
All live backend endpoints are mounted under `/api` in `backend/server.js`. Authentication is implemented by `requireAuth`, which trusts `x-clerk-user-id` and loads a Mongo `User`.

## Detailed explanation
### GET /
Purpose: health check. Auth: none. Controller: inline in `server.js`. Response: `{ "message": "QR Bus Ticketing System API is running" }`.

Example:
```bash
curl http://localhost:5001/
```

### POST /api/auth/sync
Purpose: sync a Clerk user into Mongo. Auth: none at route level. Controller: `authController.syncClerkUser`.
Body: `clerkUserId` required, `email` required, `name`, `phone`.
Database: `User.findOne`, `User.create`.
Frontend callers: `useAppRole`, `/register`, ticket detail.
Errors: `400` missing IDs/email or duplicate email; `500` failed sync.
Important issue: creates user without required `organizationId`.

Example:
```bash
curl -X POST http://localhost:5001/api/auth/sync -H "Content-Type: application/json" -d '{"clerkUserId":"user_x","email":"user@example.com","name":"User"}'
```

### POST /api/wallet/add
Purpose: add test wallet balance. Auth: `requireAuth`. Role: any authenticated user.
Body: `amount` positive number, max `50000`.
Controller: `walletController.addBalance`.
Database: `User.findByIdAndUpdate($inc)`.
Frontend callers: `/wallet`.
Errors: `400` invalid amount or too high; `401`; `500`.

### POST /api/tickets/book
Purpose: book one or more QR tickets and debit wallet. Auth: `requireAuth`. Role: any authenticated user.
Body: `count`, optional `routeId`, `from`, `to`, `fromCoords`, `toCoords`.
Controller: `ticketController.bookTickets`.
Database: `Route.findOne`, `User.findOneAndUpdate`, `Ticket.insertMany` inside transaction.
Frontend callers: `/generate`.
Errors: `400` invalid count, unavailable route, insufficient balance; `500`.
Important issue: inserts tickets without required `organizationId`.

### GET /api/tickets/my
Purpose: list current user's recent tickets and wallet balance. Auth: `requireAuth`.
Controller: `ticketController.getMyTickets`.
Database: `Ticket.find({ userId })`.
Frontend callers: `/`, `/wallet`, `/generate`, `/tickets`, `/tickets/[ticketId]`.
Errors: `401`; `500`.

### POST /api/tickets/scan
Purpose: scan/validate a QR payload. Auth: `requireAuth`, `requireAdmin`.
Required role: backend accepts `conductor`, `org_owner`, `super_admin`, and old `admin` through translation.
Body: `scannedData`.
Controller: `ticketController.scanTicket`.
Database: atomic `Ticket.findOneAndUpdate({ ticketId, status: 'ACTIVE' })`, fallback `Ticket.findOne`.
Frontend callers: `/admin`.
Responses: `VALID`, `INVALID`, or `REJECT`.

### GET /api/admin/analytics
Purpose: scanner analytics for current staff user. Auth: `requireAuth`, `requireAdmin`.
Controller: `adminController.getAnalytics`.
Database: `Ticket.countDocuments`, `Ticket.aggregate`.
Frontend callers: `/admin`.

### GET /api/routes
Purpose: active route list, stops, and popular routes. Auth: `requireAuth`.
Query: `city`, `from`, `to`.
Controller: `routeController.getRoutesForUser`.
Database: seeds Hyderabad routes, then `Route.find`.
Frontend callers: `/generate`.
Important issue: seed route creation lacks required `organizationId`.

### GET /api/admin/routes
Purpose: admin fare route list. Auth: `requireAuth`, `requireFareManagerOrAdmin`.
Required role: `price_manager`, `org_owner`, `super_admin`, old `fare_manager`, old `admin`.
Query: `city`, `search`, `status`.
Controller: `routeController.getAdminRoutes`.
Frontend callers: `/admin/fares`.

### POST /api/admin/routes/create
Purpose: create route/fare. Auth: `requireAuth`, `requireFareManagerOrAdmin`.
Body: `from`, `to`, `fare`, `fromCoords`, `toCoords`, optional `city`, `active`.
Controller: `routeController.createRoute`.
Important issue: creates route without required `organizationId`.

### PUT /api/admin/routes/:id
Purpose: update route/fare. Auth: `requireAuth`, `requireFareManagerOrAdmin`.
Path: `id`.
Controller: `routeController.updateRoute`.
Database: `Route.findById`, `Route.findByIdAndUpdate`, optional `FareHistory.create`.
Important issue: fare history create lacks required `organizationId`.

### DELETE /api/admin/routes/:id
Purpose: delete route. Auth: `requireAuth`, `requireFareManagerOrAdmin`.
Controller: `routeController.deleteRoute`.
Database: `Route.findByIdAndDelete`.

### PATCH /api/admin/routes/:id/toggle
Purpose: toggle active status. Auth: `requireAuth`, `requireFareManagerOrAdmin`.
Controller: `routeController.toggleRoute`.

### GET /api/admin/routes/fare-history
Purpose: route fare history. Auth: `requireAuth`, `requireFareManagerOrAdmin`.
Query: optional `routeId`.
Controller: `routeController.getFareHistory`.
Database: `FareHistory.find`, populate route and user.

### POST /api/organizations
Purpose: authenticated user creates one pending organization and becomes `org_owner`.
Auth: `requireAuth`.
Controller: `organizationController.createOrganization`.
Body: `name`, `slug`, optional `city`.
Database: `Organization.create`, `AuditLog.create`, `User.updateOne`.

### GET /api/organizations/:id
Purpose: organization details. Auth: `requireAuth`.
Access: organization member or `super_admin`.
Controller: `organizationController.getOrganization`.

### PATCH /api/organizations/:id
Purpose: update organization. Auth: `requireAuth`, `requireRole('org_owner')`.
Body: `name`, `city`, `billingContact`.
Controller: `organizationController.updateOrganization`.
Important issue: controller allows `super_admin`, but route middleware only permits `org_owner`; audit action `org_updated` is not in enum.

### POST /api/organizations/:id/approve
Purpose: approve pending organization. Auth: `requireAuth`, `requireSuperAdmin`.
Controller: `organizationController.approveOrganization`.

### POST /api/organizations/:id/suspend
Purpose: suspend organization. Auth: `requireAuth`, `requireSuperAdmin`.
Controller: `organizationController.suspendOrganization`.

### POST /api/organizations/:id/invites
Purpose: create in-memory team invite token. Auth: `requireAuth`, `requireRole('org_owner')`.
Body: `email`, `role`.
Controller: `organizationController.sendInvite`.
Status: email sending NOT IMPLEMENTED; token store is in-memory only.

### POST /api/invites/:token/accept
Purpose: accept an invite after Clerk signup. Auth: `requireAuth`.
Controller: `organizationController.acceptInvite`.
Database: `Organization.findById`, `User.updateOne`, `AuditLog.create`.
Status: no frontend page exists for `/accept-invite`.

## Code references
`backend/routes/*.js`, `backend/controllers/*.js`, `backend/middleware/*.js`, `frontend/lib/api.ts`.

## File references
`backend/server.js`, `backend/API_SUMMARY.md`, `06_API_Changes.md`.

## API references
The endpoints above are the complete live API surface found in mounted route files.

## Screens
Frontend callers are listed per endpoint. Organization APIs currently have no implemented UI.

## Dependencies
Express, Mongoose, qrcode, uuid, Axios.

## Current status
Ticket/wallet/admin route APIs exist but several write paths conflict with required multi-tenant fields.

## Recommendations
Add JWT verification, org scoping in every query, request validation, API tests, and fix required `organizationId` writes.
