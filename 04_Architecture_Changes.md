# 04 — Architecture Changes

## What stays exactly as-is
- Express + Mongoose + single-service deploy model — no move to microservices; not
  justified at this scale, and the master prompt says prefer extension over replacement.
- `ticketController.bookTickets`/`scanTicket` transaction pattern — this becomes the
  template other write-heavy controllers (pricing changes, refunds) should copy.
- Frontend Clerk integration, component structure (`Navbar`, `BottomTabBar`,
  `WalletCard`, `TicketCard`, `QRCard`, `ScannerCard`) — extend, don't replace.

## What's added

### New layers
1. **Organization context middleware** — resolves `req.user.organizationId` once per
   request; every subsequent controller reads from `req.organizationId`, never trusts a
   client-supplied org id on writes.
2. **Permission layer** — `requireRole(...roles)` + `requireOrgScope()` composable
   middleware, replacing the current `requireAdmin`/`requireFareManagerOrAdmin` pair
   (those two become thin wrappers calling the new primitives, so nothing that imports
   them today breaks — see 06_API_Changes.md for the exact shim).
3. **Job runner** — introducing a minimal queue (e.g. `bullmq` + Redis, or
   Mongo-backed `agenda` if you'd rather not add Redis as a new dependency — flagged as
   an open infra decision) for: scheduled fare activation, payment webhook retries,
   notification dispatch. Nothing else in the app currently needs Redis, so this is a
   real new piece of infrastructure, called out explicitly rather than slipped in.
4. **Storage abstraction** — thin wrapper (local disk in dev, S3-compatible bucket in
   prod) behind one interface, used by Post attachments and, later, driver documents.

### Non-breaking guarantees
- All new required fields (`organizationId` on Route/Ticket/FareHistory) ship with a
  migration script that backfills existing rows before the field becomes `required` in
  the schema — never a hard cutover in one deploy.
- Old role strings (`admin`, `fare_manager`, `user`) map onto new ones via an enum
  migration, not a breaking rename in place (`admin`→`conductor` for the scanning role,
  `fare_manager`→`price_manager`, `user`→`customer`); a compatibility read-path accepts
  both old and new strings for one deploy cycle in case of any missed migration row.

## Diagram (conceptual)

```
Clerk (identity) 
   │ verified session token (fixed later, tracked separately)
   ▼
Express API
   ├─ orgContext middleware  → req.organizationId
   ├─ requireRole/requireOrgScope
   ├─ controllers (existing + new)
   │     ├─ ticket/wallet/route  (existing, extended with org scoping)
   │     ├─ pricing (new)
   │     ├─ posts (new)
   │     ├─ maps/routing (new)
   │     └─ payments (new)
   ├─ job runner (new)  → scheduled pricing, webhook retries, notifications
   └─ storage abstraction (new) → post/driver attachments
   ▼
MongoDB (existing collections, extended) + Redis/Agenda (new, for jobs)
```
