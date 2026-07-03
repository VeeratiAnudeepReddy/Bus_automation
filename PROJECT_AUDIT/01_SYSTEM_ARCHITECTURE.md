# 01 System Architecture

## Overview
Bus_automation is a mobile-first bus ticketing application with a Next.js frontend, an Express/Mongoose backend, Clerk authentication, MongoDB persistence, QR ticket generation, QR scanning, wallet balance simulation, route/fare CRUD, and partial multi-tenant organization groundwork.

## Detailed explanation
The repository is split into `backend/` and `frontend/`. Root markdown files `01_...20_...` describe a planned larger enterprise system, but the live code implements a smaller subset.

Backend flow:
1. `backend/server.js` loads `.env`, creates an Express app, enables JSON parsing and CORS.
2. It attempts a Mongoose connection using `config.MONGO_URI`.
3. It mounts all API route modules under `/api`.
4. Controllers read/write Mongoose models.

Frontend flow:
1. `frontend/app/layout.tsx` wraps the App Router in `ClerkProvider`.
2. `frontend/proxy.ts` protects feature routes through Clerk middleware.
3. Client pages call `frontend/lib/useAppRole.ts`, which syncs Clerk users to the backend through `POST /api/auth/sync`.
4. API calls use `frontend/lib/api.ts` with `NEXT_PUBLIC_API_URL` and `x-clerk-user-id`.

Authentication flow:
Clerk handles browser sign-in/sign-up. The backend does not verify Clerk JWTs. Backend auth trusts `x-clerk-user-id`, looks up `User.clerkUserId`, and attaches the user to `req.user`.

Authorization flow:
Backend role middleware lives in `backend/middleware/permissions.js` and `backend/middleware/adminMiddleware.js`. Frontend pages use `role === 'admin'` and `role === 'fare_manager'`, which is inconsistent with newer backend normalized roles such as `conductor` and `price_manager`.

Database flow:
Mongoose models: `User`, `Organization`, `Route`, `Ticket`, `FareHistory`, `AuditLog`, `ValidationLog`. `organizationId` is required on `User`, `Route`, `Ticket`, and `FareHistory`, but some controllers still create records without it.

Request lifecycle:
Browser -> Clerk session -> Next page -> `apiService` -> Express route -> `requireAuth` where used -> role middleware where used -> controller -> Mongoose -> JSON response.

Deployment flow:
No CI/CD or deployment manifests exist. Local setup uses `npm install`, backend `npm start`, frontend `npm run dev`. Production requires MongoDB, Clerk production keys, and API URL configuration.

## Code references
- `backend/server.js`
- `backend/config.js`
- `backend/routes/*.js`
- `backend/controllers/*.js`
- `backend/models/*.js`
- `frontend/app/layout.tsx`
- `frontend/proxy.ts`
- `frontend/lib/api.ts`
- `frontend/lib/useAppRole.ts`

## File references
- Root planning docs: `01_Project_Analysis.md` through `20_Coding_Agent_Tasks.md`
- Frontend docs: `frontend/README.md`, `frontend/CLERK_SETUP.md`
- Backend docs: `backend/README.md`, `backend/API_SUMMARY.md`

## API references
Live API is mounted under `/api`: auth sync, wallet, tickets, routes, admin routes, admin analytics, and organizations. See `03_API_DOCUMENTATION.md`.

## Screens
Implemented screens: `/`, `/sign-in`, `/sign-up`, `/register`, `/wallet`, `/generate`, `/tickets`, `/tickets/[ticketId]`, `/admin`, `/admin/fares`, `/dashboard` redirect, `/scanner` redirect.

## Dependencies
Backend: Express, Mongoose, MongoDB driver, CORS, dotenv, qrcode, uuid. Frontend: Next.js 16, React 19, Clerk, Axios, Framer Motion, Leaflet, React Leaflet, html5-qrcode, Lucide, react-hot-toast.

## Current status
Partially implemented. Core ticket/wallet/routes/scanner flows exist. Enterprise modules in planning docs are mostly NOT IMPLEMENTED.

## Recommendations
Fix backend auth to verify Clerk tokens, resolve `organizationId` creation gaps, align frontend/backend role names, add real tests, and complete production payment/security work before deployment.
