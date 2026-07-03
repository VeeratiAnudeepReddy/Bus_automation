# 15 Setup Guide

## Overview
Local setup requires Node/npm, MongoDB connection, Clerk keys, and separate backend/frontend installs.

## Detailed explanation
Prerequisites:
- Node.js/npm.
- MongoDB URI.
- Clerk development application.

Backend setup:
```bash
cd backend
npm install
npm start
```

Backend env:
- `MONGO_URI`
- `PORT`
- `FARE`
- `CLERK_SECRET_KEY`
- `FRONTEND_URL`

Frontend setup:
```bash
cd frontend
npm install
npm run dev
```

Frontend env:
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_FARE`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`

Maps:
Current Leaflet/OpenStreetMap implementation requires no API key.

Razorpay:
NOT IMPLEMENTED. No setup exists.

Seed/migration scripts:
- `node backend/migrations/001_backfill_default_org.js`
- `node backend/migrations/002_translate_roles.js`
- `node backend/verify-migration.js`
- `node backend/verify-organization.js`

## Code references
`backend/config.js`, `frontend/lib/api.ts`, `frontend/proxy.ts`.

## File references
`README.md`, `QUICKSTART.md`, `ENVIRONMENT_SETUP_COMPLETE.md`, `ENV_SETUP_VERIFICATION.md`.

## API references
Backend base URL defaults to `http://localhost:5001/api`. Frontend default dev URL is `http://localhost:3000`.

## Screens
Open `/` after starting frontend.

## Dependencies
See both package files.

## Current status
Documented setup exists, but backend tests and current schema/controller mismatches need attention.

## Recommendations
Use a native Linux path without spaces for Next/Turbopack, rotate any exposed dev secrets before sharing, and run migration verification before manual testing.
