# Security Guide

## Implemented
- Clerk bearer JWT verification (JWKS, RS256) with fetch timeout.
- Request IDs.
- Security headers and CSP.
- Production CORS exact allowlist (no arbitrary Origin reflection).
- Request body limit.
- Mongo operator/key sanitization.
- Configurable rate limiting.
- Standard error responses without production stack traces.
- Razorpay HMAC payment verification + webhook signature verification.
- Production config requires Razorpay keys + webhook secret (+ Clerk JWKS/secret).
- Production `/health`/`/ready` redacted; `/metrics` gated unless `METRICS_PUBLIC=true`.
- Public invite validate returns minimal fields only.
- CI secret-scan job for tracked files.

## Remaining
- Rotate any credentials that ever appeared in git history.
- CSRF is not enabled for bearer-token JSON APIs (acceptable for SPA bearer pattern).
- File virus scanning is a placeholder through provider abstraction.
- In-memory rate limiter is single-instance only — use Redis/edge limits for multi-node.
- External WAF/reverse proxy rules are recommended.
- uuid/qs moderate dependency advisories — schedule coordinated upgrades.
