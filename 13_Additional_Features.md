# 13 — Additional Features

The master prompt lists a long "also identify and implement" catalog. Not all of it is
proportionate to build blind — triaged into now / soon / reserved.

## Now (needed to support the four mandatory modules)
- **Audit logging** — `AuditLog` collection (05), used by pricing approvals, post
  moderation, refunds. Already scoped into those modules, not separate work.
- **Rate limiting** — `express-rate-limit` on auth/booking/payment endpoints; cheap to
  add, meaningfully closes a gap flagged in 03.
- **Basic email notifications** — ticket purchase confirmation, org invite, price
  approval request. Using a transactional email provider (e.g. Resend/SES) — pick one
  when we get there; not blocking.
- **CSV export** — for Finance Manager transaction views and Price Manager fare history;
  low effort, high real-world value, uses data already modeled.

## Soon (real value, not blocking the four mandatory modules)
- SMS/WhatsApp notifications — needs provider selection (Q02 #14), cost implication for
  you to sign off on before building.
- Dashboard analytics beyond the existing `/api/admin/analytics` (which I haven't
  inspected the internals of yet — worth a follow-up read before designing v2 of it).
- Pagination on list endpoints (`getMyTickets` currently hardcodes `.limit(100)` with no
  cursor — fine at current scale, becomes a real UX problem once a heavy user has >100
  tickets).

## Reserved (real, but needs its own model work first — not silently scoped in)
- Bus maintenance, fuel tracking, driver documents/license expiry — all depend on the
  Bus/Driver models reserved in 07/11.
- Attendance, HR — depends on Driver/Staff models.
- Live tracking, push notifications tied to trip status — depends on Trip model (10).
- Multi-tenant billing/subscription for the platform itself (how does Anthropic— sorry,
  how does *this platform* charge each Organization for using it) — not mentioned in
  your four mandatory features at all; flagging because "multi-tenant" often implies it
  but it's a business-model question, not something to assume.

## Explicitly deferred infra items (real but not urgent)
- API versioning (`/api/v1/...`) — worth doing before the first breaking change is
  actually needed, not before. Currently zero consumers outside this one frontend, so
  premature.
- Feature flags — no evidence yet of a need (single frontend, controlled rollout via
  normal deploys is sufficient at this scale).
- GDPR/DPDP-style data retention policy — genuinely important for an Indian consumer app
  handling payment data, but it's a policy decision requiring your input (Q02 #15), not
  something to invent.
