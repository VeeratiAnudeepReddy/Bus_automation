# 03 — Gap Analysis (current build vs. industry baseline)

Benchmarked conceptually against TSRTC/RedBus/AbhiBus/Chalo-style systems — not copying
their UX, just using them to sanity-check what "table stakes" looks like for
Indian public/private bus ticketing.

## Security
- **Critical**: unverified client-supplied identity header (see 01 §6.1). Nothing else
  matters if this stands — role checks are meaningless if identity is forgeable.
- No rate limiting on any endpoint (booking spam, scan brute-forcing possible).
- No audit log on role changes (there's no role-change mechanism at all yet).
- Route uniqueness index will silently corrupt data across tenants the moment a second
  org exists, until the org-scoping migration lands.

## Architecture / scalability
- Single Mongo instance, no read replicas or caching — fine at current scale, worth
  flagging as a v2 concern once ticket volume grows (index on `Ticket.userId+createdAt`
  and `scannedBy+scannedAt` already exist, which is good).
- No background job runner — fine today since nothing is async, but pricing schedules
  (activate a fare change at a future date) and payment webhook retries both need one.
- `/wallet/add` has a hardcoded ₹50,000 "testing limit" — needs replacing with the real
  Razorpay flow, not raised as a permanent ceiling.

## UX / feature gaps vs. industry norm
- No seat/route search UX beyond raw from/to text match — RedBus-style operators
  typically show route + time + price together; current model has no trip/schedule
  concept at all (see reserved roles note in 07).
- No ticket cancellation or refund path anywhere in the code.
- No notification on ticket booking/scan (industry norm: SMS/email confirmation).
- No multi-language support (Telugu is a reasonable expectation for a Hyderabad-first
  product) — flagged, not committed to a phase yet, needs a client decision.

## Permissions
- Only 3 flat roles, no assignment endpoint, no org boundary — addressed in 07.
- `requireAdmin` middleware name is misleading: it currently gates ticket *scanning*,
  which is a Conductor-level action, not organization administration. This naming
  collision would actively mislead a future developer. Renaming is part of 07's
  migration, done carefully to avoid breaking the mounted routes.

## Data model
- No soft-delete anywhere — Route `active` flag exists but Users/Tickets have no
  equivalent, meaning "delete" operations aren't yet designed. Deferred to the specific
  module docs since deletion semantics differ (a User shouldn't hard-delete due to
  Ticket foreign keys; a Route already has a safe toggle).
