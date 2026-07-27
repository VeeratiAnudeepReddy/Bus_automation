# Production Checklist

## Verified (2026-07-27 follow-up)
- [x] Backend automated tests pass (`npm test` → 9 suites / 62 tests).
- [x] Frontend lint passes (`npm run lint`).
- [x] Frontend typecheck passes (`npx tsc --noEmit`).
- [x] Clerk bearer JWT verification rejects missing/invalid tokens.
- [x] Razorpay order create works in test mode (platform fallback logged).
- [x] Razorpay payment verify rejects invalid signatures / accepts valid HMAC.
- [x] Razorpay webhook signature verification enforced (bad→400, good→200).
- [x] Clerk webhook endpoint rejects unsigned requests; prod requires `CLERK_WEBHOOK_SECRET`.
- [x] Booking → create-order → verify → webhook → tickets ACTIVE (API loop with real Razorpay order).
- [x] Hosted Checkout UI wired (`checkout.open()` on booking + wallet).
- [x] Email provider delivers real messages (Ethereal) with preview URLs for booking_confirmation + receipt.
- [x] Payment finalize queues booking confirmation + receipt emails.
- [x] SSE realtime + multi-vehicle fan-out (`MULTI_VEHICLE_SSE_OK`).
- [x] Track page uses SSE + marker interpolation (Option A).
- [x] Security headers, sanitize, rate limit, CORS allowlist present.
- [x] Production health payload redacts sensitive ops detail.
- [x] CI workflow includes tests, lint, typecheck, build, secret scan.
- [x] Deploy workflow exists (manual/tag) with optional post-deploy health check.
- [x] Tracked markdown secrets scrubbed to placeholders.
- [x] Maps architecture decided: Option A (custom SSE + Maps JS).

## Still open — launch blockers
- [ ] **Rotate Clerk secret and MongoDB password previously exposed in git history** (deferred by instruction — remains open).
- [ ] Interactive Razorpay Hosted Checkout card completion in a browser (test card) end-to-end.
- [ ] Set production Clerk keys/domains and `CLERK_WEBHOOK_SECRET`; register public Clerk webhook URL.
- [ ] Configure production MongoDB backups.
- [ ] Configure Razorpay live credentials and public webhook URL (test-mode secret already present locally).
- [ ] Bind org Razorpay Route linked accounts where payouts must settle to operators.
- [ ] Production SMTP (`EMAIL_PROVIDER=smtp`, `FEATURE_EMAIL=true`) — Ethereal is not production.
- [ ] Restrict `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` by HTTP referrer in Google Cloud Console.
- [x] GitHub Actions `ci.yml` green on real remote run: https://github.com/VeeratiAnudeepReddy/Bus_automation/actions/runs/30286888537
- [ ] Docker prod compose up + smoke in staging.
- [ ] Protect `/metrics` at network layer or set `METRICS_PUBLIC` intentionally.
- [ ] Playwright/browser role coverage.
- [ ] Configure push provider (or explicitly disable in prod).
- [ ] Configure Redis/pub-sub for realtime multi-instance.
