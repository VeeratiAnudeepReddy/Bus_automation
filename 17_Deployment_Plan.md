# 17 — Deployment Plan

## Current deployment (assumed, not yet confirmed — repo has no CI/CD config visible)
No `.github/workflows`, `Dockerfile`, or deploy config found in the repo audit — flagging
that I don't actually know how this currently gets deployed (Vercel for frontend given
Next.js? manual `npm start` for backend?). Confirm before finalizing this doc in detail —
what follows is written as recommendations, not a description of an existing pipeline.

## Recommended pipeline
1. **Backend**: containerize (Dockerfile, not present today) → deploy to Railway/Render
   as the docs' own aspirational notes already suggested, or your existing host if
   different from the doc suggestions.
2. **Frontend**: Vercel (natural fit for Next.js App Router).
3. **New infra**: Redis/Agenda for the job runner (04) — smallest managed instance is
   sufficient at this scale.
4. **Environment separation**: staging environment with a separate Mongo DB + separate
   Razorpay test keys, mandatory before payments module (12) goes live — testing
   webhook signature verification against production keys is not acceptable risk.

## Rollout sequence
1. Deploy dead-code removal (15 step 1) — no user-facing change, safe canary.
2. Deploy org backfill (15 steps 2–3) during a low-traffic window; confirm via
   `AuditLog`-style migration log that row counts match pre/post.
3. Deploy role migration (15 step 4).
4. Deploy each module (08–12) behind its own PR, in the stated order, each independently
   tested in staging with the org-isolation test suite (14) before merge.

## Health checks
Extend the existing `GET /` health check to also report Mongo connection state and
(once added) job runner connection state — currently it just returns a static message
regardless of DB connectivity, which is a gap worth closing cheaply.
