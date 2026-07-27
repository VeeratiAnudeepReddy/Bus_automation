# 19 API Test Results

## Overview
This file records tests attempted during the audit and source-based API status. Full endpoint execution requires a running backend, MongoDB connection, and seeded users.

## Detailed explanation
Automated command results:
- `cd backend && npm test`: FAIL. `jest: command not found`.
- `cd frontend && npm run lint`: PASS, no lint errors printed.
- `cd frontend && npm run build`: FAIL in sandbox with Turbopack internal error while processing `leaflet/dist/leaflet.css`, caused by process/port `EPERM`. Previous escalated build in this workspace had succeeded, so this is environment-sensitive.

Endpoint source-test matrix:
| Endpoint | Source status | Runtime status | Reason |
|---|---|---|---|
| `GET /` | Implemented | Not retested this turn | No backend server launched |
| `POST /api/auth/sync` | Implemented | Not executed | Requires Clerk user data; schema risk |
| `POST /api/wallet/add` | Implemented | Not executed | Requires user record/header |
| `POST /api/tickets/book` | Implemented | Not executed | Requires user, balance, DB transaction |
| `GET /api/tickets/my` | Implemented | Not executed | Requires user record/header |
| `POST /api/tickets/scan` | Implemented | Not executed | Requires admin/conductor user and ticket |
| `GET /api/admin/analytics` | Implemented | Not executed | Requires admin/conductor user |
| `GET /api/routes` | Implemented | Not executed | Requires user; seed route org risk |
| `GET /api/admin/routes` | Implemented | Not executed | Requires fare/admin role |
| `POST /api/admin/routes/create` | Implemented | Not executed | Required `organizationId` risk |
| `PUT /api/admin/routes/:id` | Implemented | Not executed | FareHistory org/action risk |
| `DELETE /api/admin/routes/:id` | Implemented | Not executed | Requires route and role |
| `PATCH /api/admin/routes/:id/toggle` | Implemented | Not executed | Requires route and role |
| `GET /api/admin/routes/fare-history` | Implemented | Not executed | Requires role |
| `POST /api/organizations` | Implemented | Not executed | Requires valid user |
| `GET /api/organizations/:id` | Implemented | Not executed | Requires org membership |
| `PATCH /api/organizations/:id` | Implemented | Not executed | AuditLog enum risk |
| `POST /api/organizations/:id/approve` | Implemented | Not executed | Requires super admin |
| `POST /api/organizations/:id/suspend` | Implemented | Not executed | Requires super admin |
| `POST /api/organizations/:id/invites` | Implemented | Not executed | In-memory token only |
| `POST /api/invites/:token/accept` | Implemented | Not executed | Requires token and user |

## Code references
`backend/routes`, `backend/controllers`, `backend/package.json`.

## File references
`backend/test-api.sh`, `backend/__tests__/Organization.test.js`.

## API references
All live endpoints listed above.

## Screens
Frontend route tests were not repeated here except lint/build command checks.

## Dependencies
Backend tests require Jest and mongodb-memory-server but they are missing from package.json.

## Current status
API test suite is not operational.

## Recommendations
Add missing test dependencies, seed fixtures, and run endpoint tests against an isolated test database.
