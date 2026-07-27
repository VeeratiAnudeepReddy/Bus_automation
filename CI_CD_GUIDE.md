# CI/CD Guide

## Workflows
- `.github/workflows/ci.yml` — every push/PR
- `.github/workflows/deploy.yml` — manual `workflow_dispatch` or tag `v*`

## CI pipeline (PR/push)
1. Checkout + Node 20
2. Backend `npm ci` + `npm test` (`NODE_ENV=test`)
3. Frontend `npm ci` + `npm run lint` + `npx tsc --noEmit` + `npm run build`
4. Secret scan job fails if live-looking Clerk/Mongo credentials reappear in tracked files

## Deploy pipeline
1. Backend test gate
2. `docker compose -f docker-compose.prod.yml build`
3. Deploy step is a placeholder — wire SSH/kubectl/compose to your host using GitHub Secrets (`DEPLOY_HOST`, `DEPLOY_SSH_KEY`) without echoing values
4. If `PRODUCTION_HEALTH_URL` is set, require `/live` + `/ready` HTTP 200

## Local equivalent
```bash
cd backend && npm ci && npm test
cd ../frontend && npm ci && npm run lint && npx tsc --noEmit && npm run build
```

## Notes
- Secrets must live in GitHub Actions secrets / host env — never commit `.env`.
- Auto-deploy-on-merge is intentionally **not** enabled.
