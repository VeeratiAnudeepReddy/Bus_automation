# 12 Missing Features

## Overview
This compares root implementation plans against actual code.

## Detailed explanation
Missing or incomplete features:
- Full enterprise role dashboards: NOT IMPLEMENTED.
- Super admin UI: NOT IMPLEMENTED.
- Organization owner UI: NOT IMPLEMENTED.
- Manager/dispatcher/driver/finance/ticket manager dashboards: NOT IMPLEMENTED.
- Role assignment UI: NOT IMPLEMENTED.
- Persistent invite storage: NOT IMPLEMENTED.
- Invite email delivery: NOT IMPLEMENTED.
- `/accept-invite` page: NOT IMPLEMENTED.
- Post module (`Post`, comments, likes, attachments): NOT IMPLEMENTED.
- Razorpay module and `PaymentTransaction`: NOT IMPLEMENTED.
- Refunds and financial reconciliation: NOT IMPLEMENTED.
- Google Maps/Mapbox integration: NOT IMPLEMENTED.
- ETA, live GPS, bus tracking, bus assignment: NOT IMPLEMENTED.
- Buses model: NOT IMPLEMENTED.
- Drivers/conductors assignment to buses/routes: NOT IMPLEMENTED.
- Pricing rules beyond fixed route fare: NOT IMPLEMENTED.
- Price approval workflow: NOT IMPLEMENTED.
- Notifications beyond UI toasts: NOT IMPLEMENTED.
- Webhooks for Clerk or payments: NOT IMPLEMENTED.
- JWT verification on backend: NOT IMPLEMENTED.
- CI/CD: NOT IMPLEMENTED.
- Production deployment config: NOT IMPLEMENTED.

Broken/inconsistent implemented areas:
- `User.organizationId` required but `/auth/sync` does not provide it.
- `Route.organizationId` required but seed/create route code omits it.
- `Ticket.organizationId` required but ticket booking omits it.
- `FareHistory.organizationId` required but fare update omits it.
- `AuditLog.action` lacks `org_updated` used by controller.
- Frontend role checks use old roles only.
- Backend test script references missing `jest`.

## Code references
See files listed in other audit documents.

## File references
Planning docs: `05_Database_Changes.md`, `06_API_Changes.md`, `08_Ticket_Pricing_Module.md`, `09_Post_Module.md`, `10_Maps_Module.md`, `11_Routing_Module.md`, `12_Razorpay_Module.md`, `19_Future_Roadmap.md`.

## API references
Missing planned APIs include `/api/posts*`, `/api/payments*`, advanced maps/routing APIs, buses/assignments APIs, and user role-management APIs.

## Screens
Missing planned screens include posts, payments, org onboarding, super admin, role management, bus/fleet/driver dashboards.

## Dependencies
No Razorpay/Stripe/email/SMS/maps provider SDKs are installed.

## Current status
The repo is between Phase 1 migration and later planned phases.

## Recommendations
Treat planning docs as backlog, not current capability. Fix current breakages first.
