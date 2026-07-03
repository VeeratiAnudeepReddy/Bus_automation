# Deployment Guide

## Assets
- `backend/Dockerfile`
- `frontend/Dockerfile`
- `docker-compose.yml`
- `docker-compose.prod.yml`
- `nginx.conf`
- `ecosystem.config.cjs`
- `busqr-backend.service`
- `.github/workflows/ci.yml`

## Basic Production Flow
1. Create `backend/.env.production` and `frontend/.env.production`.
2. Set `NODE_ENV=production`, `MONGO_URI`, `FRONTEND_URL`, `CORS_ORIGINS`, Clerk keys, and provider keys.
3. Build with `docker compose -f docker-compose.prod.yml build`.
4. Start with `docker compose -f docker-compose.prod.yml up -d`.
5. Verify `/health`, `/ready`, and `/metrics`.
