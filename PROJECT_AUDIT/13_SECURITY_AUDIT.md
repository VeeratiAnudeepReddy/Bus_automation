# 13 Security Audit

## Overview
Security posture is development-stage. Clerk protects frontend routes, but backend API authorization is not production-safe.

## Detailed explanation
Authentication:
- Frontend Clerk integration is implemented.
- Backend does not verify Clerk JWTs.
- `x-clerk-user-id` can be forged by any client unless protected elsewhere.

Authorization:
- Backend RBAC exists but is partial.
- Organization scoping middleware exists but is not applied consistently to route queries.
- Frontend role checks are inconsistent with backend roles.

Input validation:
- Some validation exists for amounts, count, route coordinates, route slugs.
- No central validation library is used.
- No request schema validation.

Password handling:
- App does not store passwords; Clerk handles identity.

API security:
- CORS is open with default `cors()`.
- No rate limiting.
- No helmet/security headers on backend.
- No CSRF design for API.
- No audit for all sensitive actions.
- Secrets appear in `.env` files and also in generated documentation files in this workspace; these must not be committed.

Organization isolation:
- Planned but incomplete.
- Some schemas require `organizationId`, but controllers omit it.
- Many queries are not org-scoped.

OWASP issues:
- Broken access control risk: high.
- Identification/authentication failure risk: high for backend API.
- Security misconfiguration risk: medium/high.
- Injection risk: Mongoose is used, but regex search uses raw user input in route search.

## Code references
`backend/middleware/authMiddleware.js`, `backend/middleware/permissions.js`, `backend/server.js`, `frontend/proxy.ts`, controllers.

## File references
`16_Risk_Assessment.md`, `ENVIRONMENT_SETUP_COMPLETE.md`, `ENV_SETUP_VERIFICATION.md`.

## API references
All authenticated APIs that trust `x-clerk-user-id`.

## Screens
All protected screens depend on Clerk frontend protection.

## Dependencies
Clerk, Express, CORS.

## Current status
Not production-ready.

## Recommendations
Verify Clerk JWTs server-side, restrict CORS, add rate limiting and security headers, sanitize/validate input, complete org scoping, rotate exposed secrets before production.
