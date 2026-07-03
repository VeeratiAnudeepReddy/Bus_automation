# Security Guide

## Implemented
- Clerk bearer JWT verification.
- Request IDs.
- Security headers and CSP.
- CORS allowlist.
- Request body limit.
- Mongo operator/key sanitization.
- Configurable rate limiting.
- Standard error responses without production stack traces.

## Remaining
- CSRF is not enabled for bearer-token JSON APIs.
- File virus scanning is a placeholder through provider abstraction.
- External WAF/reverse proxy rules are recommended.
