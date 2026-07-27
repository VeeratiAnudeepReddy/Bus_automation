# Quick Start — Bus Automation Platform

## Start in 3 steps

### 1. Backend
```bash
cd backend
npm install
npm start
```
Backend: **http://localhost:5001**

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend: **http://localhost:3000**

### 3. Open the app
Visit **http://localhost:3000** and sign in with Clerk.

---

## Current auth / API surface (not the old MVP)

Legacy unauthenticated endpoints such as `POST /api/register` and `POST /api/recharge` are **removed**. Protected APIs expect a Clerk bearer token:

```bash
# Health (public)
curl http://localhost:5001/health
curl http://localhost:5001/ready

# Protected example (requires real Clerk session JWT)
curl http://localhost:5001/api/tickets/my \
  -H "Authorization: Bearer <CLERK_SESSION_JWT>"
```

First-run / account creation flows:
- `/setup` — first organization
- `/register` — choose customer / employee / org owner
- `/accept-invite` — employee invite
- `POST /api/auth/sync` — sync existing app user after Clerk login

---

## Prerequisites
- Node.js 18+
- MongoDB (Atlas URI in `backend/.env` as `MONGO_URI`)
- Clerk keys in `frontend/.env.local` and backend Clerk secret / JWKS access
- Optional: Razorpay test keys for payment checkout

## Useful docs
- `KNOWN_ISSUES.md` — remaining production gaps
- `API_INDEX.md` — API inventory
- `FIRST_RUN_SETUP.md` — onboarding
- `STATE_OF_PROJECT_2026-07-27.md` — latest audit ground truth (after Phase 5)

## Troubleshooting
- **Port in use**: change `PORT` in `backend/.env`
- **Mongo connection error**: check `MONGO_URI` and Atlas IP allowlist
- **401 Missing bearer token**: expected without a Clerk JWT — not a server crash
