# 06 Authentication Documentation

## Overview
Frontend authentication uses Clerk. Backend authentication is not true Clerk JWT verification; it trusts an `x-clerk-user-id` request header.

## Detailed explanation
Clerk:
- `frontend/app/layout.tsx` wraps app in `<ClerkProvider>`.
- `/sign-in` renders `<SignIn />`.
- `/sign-up` renders `<SignUp />`.
- `SignInButton`, `SignUpButton`, and `UserButton` are used on home/navbar.

Protected routes:
`frontend/proxy.ts` protects `/dashboard`, `/admin`, `/register`, `/wallet`, `/generate`, `/tickets`, `/scanner`, and all nested paths matching those patterns.

Public routes:
`/`, `/sign-in`, `/sign-up`, static assets, and unlisted routes.

Backend auth:
`backend/middleware/authMiddleware.js` checks `x-clerk-user-id`, loads `User.findOne({ clerkUserId })`, and sets `req.user`.

JWT:
NOT IMPLEMENTED on backend. No Clerk JWT verification code was found.

Organization sync:
Partial. `POST /api/organizations` can assign `organizationId` and `org_owner`, but normal auth sync does not handle organization creation.

User sync:
`useAppRole` calls `/auth/sync` after Clerk loads. This may fail because `organizationId` is required by the schema.

Role assignment:
Partial. Org owner invite endpoint can assign a role on accept, but tokens are in-memory and no email or frontend accept page exists.

Session flow:
Browser Clerk session -> Next route allowed by proxy -> client sends Clerk user ID header -> backend loads user. This is insecure if API is exposed because clients can forge the header.

## Code references
`frontend/app/layout.tsx`, `frontend/app/sign-in/[[...sign-in]]/page.tsx`, `frontend/app/sign-up/[[...sign-up]]/page.tsx`, `frontend/proxy.ts`, `frontend/lib/useAppRole.ts`, `backend/middleware/authMiddleware.js`.

## File references
`frontend/CLERK_SETUP.md`, `CLERK_IMPLEMENTATION.md`, `CLERK_READY.md`.

## API references
`POST /api/auth/sync`, every `requireAuth` endpoint.

## Screens
`/sign-in`, `/sign-up`, `/register`, and all protected app pages.

## Dependencies
`@clerk/nextjs`.

## Current status
Frontend Clerk auth works. Backend API auth is not production-grade.

## Recommendations
Use Clerk server-side token verification, remove trust in raw `x-clerk-user-id`, and add webhook or secure sync flow.
