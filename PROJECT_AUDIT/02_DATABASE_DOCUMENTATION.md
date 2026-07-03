# 02 Database Documentation

## Overview
The live database layer uses Mongoose models in `backend/models`. Collections documented below are the only collections implemented in code.

## Detailed explanation
### User
File: `backend/models/User.js`

Fields:
- `name`: String, required.
- `email`: String, required, unique.
- `phone`: String, default `N/A`.
- `balance`: Number, default `1000`, minimum `0`.
- `role`: String enum. Implemented enum values include old roles `user`, `admin`, `fare_manager`; preferred roles `customer`, `conductor`, `price_manager`; reserved roles `super_admin`, `org_owner`, `regional_admin`, `depot_manager`, `fleet_manager`, `finance_manager`, `operations_manager`, `dispatcher`, `driver`, `support`.
- `clerkUserId`: String, sparse unique, indexed.
- `organizationId`: ObjectId ref `Organization`, required, indexed.
- timestamps: `createdAt`, `updatedAt`.

Indexes: `email`, `clerkUserId`, and schema-level unique constraints.

Sample:
```json
{
  "name": "Passenger",
  "email": "user@example.com",
  "phone": "9999999999",
  "balance": 1000,
  "role": "customer",
  "clerkUserId": "user_xxx",
  "organizationId": "ObjectId"
}
```

Important issue: `authController.syncClerkUser` creates users without `organizationId`, which conflicts with the required schema.

### Organization
File: `backend/models/Organization.js`

Fields:
- `name`: String, required, trim.
- `slug`: String, required, unique, lowercase, trim, regex `/^[a-z0-9-]+$/`, indexed.
- `city`: String, default `Hyderabad`, indexed.
- `status`: enum `pending`, `active`, `suspended`, default `pending`, indexed.
- `ownerUserId`: ObjectId ref `User`, required, indexed.
- `billingContact.name/email/phone`: nullable strings.
- timestamps.

Indexes: `{ slug: 1 }` unique, `{ status: 1, createdAt: -1 }`.

### Route
File: `backend/models/Route.js`

Fields:
- `from`, `to`: String, required, trim.
- `fromNormalized`, `toNormalized`: String, required, trim, indexed.
- `fare`: Number, required, min `1`.
- `city`: String, required, default `Hyderabad`, indexed.
- `active`: Boolean, default `true`, indexed.
- `fromCoords`, `toCoords`: embedded `{ lat, lng }`, both required numbers.
- `organizationId`: ObjectId ref `Organization`, required, indexed.
- timestamps.

Unique index: `{ organizationId, city, fromNormalized, toNormalized }`.

Important issue: `routeController.ensureHyderabadSeedRoutes` and `createRoute` create routes without `organizationId`, conflicting with the required schema.

### Ticket
File: `backend/models/Ticket.js`

Fields:
- `ticketId`: String, required, unique, indexed.
- `userId`: ObjectId ref `User`, required, indexed.
- `routeId`: ObjectId ref `Route`, nullable, indexed.
- `from`, `to`: nullable String.
- `status`: enum `ACTIVE`, `USED`, default `ACTIVE`, indexed.
- `fare`: Number, required.
- `scannedAt`: Date, nullable.
- `scannedBy`: ObjectId ref `User`, nullable, indexed.
- `fromCoords`, `toCoords`: nullable lat/lng objects.
- `qrPayload`: embedded ticket data with required `ticketId`, `userId`, `timestamp`.
- `organizationId`: ObjectId ref `Organization`, required, indexed.
- timestamps.

Indexes: `{ userId: 1, createdAt: -1 }`, `{ scannedBy: 1, scannedAt: -1 }`.

Important issue: `ticketController.bookTickets` inserts tickets without `organizationId`.

### FareHistory
File: `backend/models/FareHistory.js`

Fields:
- `routeId`: ObjectId ref `Route`, required, indexed.
- `previousFare`: Number, required.
- `newFare`: Number, required.
- `updatedBy`: ObjectId ref `User`, required.
- `organizationId`: ObjectId ref `Organization`, required, indexed.
- timestamps.

Index: `{ routeId: 1, createdAt: -1 }`.

Important issue: `routeController.updateRoute` creates fare history without `organizationId`.

### AuditLog
File: `backend/models/AuditLog.js`

Fields:
- `organizationId`: ObjectId ref `Organization`, nullable, indexed.
- `actorId`: ObjectId ref `User`, nullable.
- `action`: required enum.
- `targetType`: enum `User`, `Organization`, `Route`, `FareRule`, `Post`, `PaymentTransaction`, null.
- `targetId`: ObjectId, nullable, indexed.
- `before`, `after`, `metadata`: Mixed.
- timestamps.

Indexes: `{ organizationId, createdAt }`, `{ action, createdAt }`, `{ targetType, targetId, createdAt }`.

Important issue: `organizationController.updateOrganization` writes action `org_updated`, but `org_updated` is not in the enum.

### ValidationLog
File: `backend/models/ValidationLog.js`

Fields:
- `ticketId`: String, required, indexed.
- `userId`: ObjectId ref `User`, nullable.
- `status`: enum `VALID`, `INVALID`, `ALREADY_USED`, required.
- `scannedAt`: Date, default now, indexed.
- timestamps.

Status: Model exists, but no live route/controller mounts it.

## Code references
`backend/models/User.js`, `Organization.js`, `Route.js`, `Ticket.js`, `FareHistory.js`, `AuditLog.js`, `ValidationLog.js`.

## File references
Planning references: `05_Database_Changes.md`, `07_Role_Hierarchy.md`, `15_Migration_Strategy.md`.

## API references
Database operations are used by auth sync, wallet add, ticket book/list/scan, route CRUD, admin analytics, and organization endpoints.

## Screens
Database-backed screens: home, register, wallet, generate, tickets, ticket detail, admin, fares.

## Dependencies
Mongoose and MongoDB.

## Current status
Schema layer is partially migrated to multi-tenancy, but controllers are not consistently updated for required `organizationId`.

## Recommendations
Run migration verification before use; fix all record creation paths to include `organizationId`; add integration tests for required field validation.
