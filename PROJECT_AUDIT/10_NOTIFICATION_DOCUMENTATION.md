# 10 Notification Documentation

## Overview
Notifications are mostly NOT IMPLEMENTED.

## Detailed explanation
Implemented:
- UI toast notifications through `react-hot-toast`.
- Browser-native share/copy behavior on ticket detail.
- In-memory invite token response includes an `acceptLink`.

NOT IMPLEMENTED:
- Email sending.
- SMS.
- Push notifications.
- Websocket/real-time updates.
- Invite email delivery.
- Payment receipts.
- Operational alerts.

The organization invite controller contains a TODO for email sending and returns the token/link directly in the API response.

## Code references
`backend/controllers/organizationController.js`, `frontend/app/*`, `frontend/app/layout.tsx`.

## File references
`19_Future_Roadmap.md`, `13_Additional_Features.md`.

## API references
`POST /api/organizations/:id/invites` returns `acceptLink`; no notification API exists.

## Screens
Toast notifications appear across wallet, registration, ticket generation, scanner, and fare management screens.

## Dependencies
`react-hot-toast`. No email/SMS/websocket provider dependency exists.

## Current status
Only local UI notifications are implemented.

## Recommendations
Add durable invite storage and email delivery before relying on team onboarding.
