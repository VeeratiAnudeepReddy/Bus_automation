# 14 Testing Guide

## Overview
Testing is minimal. Frontend lint passes. Backend test script fails because `jest` is missing.

## Detailed explanation
Observed checks:
```text
backend npm test -> sh: line 1: jest: command not found
frontend npm run lint -> passed with no lint output
frontend npm run build -> failed in sandbox with Turbopack/Leaflet CSS process EPERM
```

Backend feature tests:
1. Health: `curl http://localhost:5001/`.
2. Auth sync: `POST /api/auth/sync`.
3. Wallet: authenticated `POST /api/wallet/add`.
4. Routes: authenticated `GET /api/routes`.
5. Ticket booking: authenticated `POST /api/tickets/book`.
6. Ticket list: authenticated `GET /api/tickets/my`.
7. Scan: admin/conductor `POST /api/tickets/scan`.
8. Admin analytics: admin/conductor `GET /api/admin/analytics`.
9. Fare CRUD: price manager/org owner/super admin or old fare manager/admin endpoints under `/api/admin/routes`.
10. Organization APIs: use users with valid roles and organization IDs.

Frontend feature tests:
- Guest home.
- Clerk sign-up/sign-in.
- Registration profile sync.
- Wallet recharge.
- Route selection/map pinning.
- Ticket generation.
- Ticket list/detail.
- Admin scanning.
- Fare CRUD.

Role tests:
Use `17_ROLE_TEST_RESULTS.md` as checklist. Many roles are NOT IMPLEMENTED.

## Code references
`backend/__tests__/Organization.test.js`, `backend/package.json`, `frontend/package.json`.

## File references
`14_Testing_Strategy.md`, `backend/test-api.sh`.

## API references
All endpoints in `03_API_DOCUMENTATION.md`.

## Screens
All pages in `07_FRONTEND_PAGES.md`.

## Dependencies
Frontend lint uses ESLint. Backend test script requires Jest but dependency is absent. Test file requires `mongodb-memory-server`, also absent from `backend/package.json`.

## Current status
Automated testing is not ready for backend.

## Recommendations
Add Jest and mongodb-memory-server or update test tooling, then add integration tests for auth, org scoping, ticket flow, and fare CRUD.
