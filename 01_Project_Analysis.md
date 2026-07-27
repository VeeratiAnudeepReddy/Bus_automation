# 01 — Project Analysis

Source: live audit of github.com/VeeratiAnudeepReddy/Bus_automation (code, not just docs —
the markdown files in the repo were found to be stale in places, see §4).

## 1. Stack

- Backend: Node/Express, MongoDB via Mongoose, deployed as a single service on :5001
- Frontend: Next.js 16 (App Router), React 19, TS, Tailwind 4, Clerk for identity
- No queue, no cache layer, no background worker, no file storage abstraction today

## 2. Live API surface (confirmed via server.js mount list)

```
POST /api/auth/sync
POST /api/wallet/add                    [auth]
POST /api/tickets/book                  [auth]
GET  /api/tickets/my                    [auth]
POST /api/tickets/scan                  [auth, admin]
GET  /api/admin/analytics               [auth, admin]
GET  /api/admin/routes                  [auth, fare_manager|admin]
POST /api/admin/routes/create           [auth, fare_manager|admin]
PUT  /api/admin/routes/:id              [auth, fare_manager|admin]
DELETE /api/admin/routes/:id            [auth, fare_manager|admin]
PATCH /api/admin/routes/:id/toggle      [auth, fare_manager|admin]
GET  /api/admin/routes/fare-history     [auth, fare_manager|admin]
GET  /api/routes                        [auth]
```

## 3. Data model (live)

- **User**: name, email (unique), phone, balance (default 1000), role
  (`user`/`admin`/`fare_manager`), clerkUserId (sparse unique index)
- **Route**: from/to + normalized lowercase variants, fare, city (default Hyderabad),
  active flag, fromCoords/toCoords, unique on `{city, fromNormalized, toNormalized}`
- **Ticket**: ticketId (UUID), userId, routeId, from/to, status (`ACTIVE`/`USED`), fare,
  scannedAt/scannedBy, coords, embedded qrPayload
- **FareHistory**: routeId, previousFare, newFare, updatedBy — audit trail already exists
- **ValidationLog**: legacy model, no longer written to by live code path (see §4)

## 4. Confirmed dead code (zero references from server.js or frontend)

`routes/tickets.js`, `routes/wallet.js`, `routes/validationRoutes.js`,
`routes/userRoutes.js`, `controllers/validationController.js`,
`controllers/userController.js`, `middleware/auth.js` — 377 lines total. These are
earlier-generation implementations (userId-in-URL style, no auth) superseded by the
current `req.user`-based, transactional versions. Recommend deletion in the migration
task (15_Migration_Strategy.md) rather than deleting speculatively here.

## 5. What's actually solid (extend, don't rewrite, per your instruction)

- `ticketController.bookTickets` — uses a Mongo session transaction, atomic
  balance-check-and-decrement (`findOneAndUpdate` with `balance: {$gte: total}`),
  batch booking up to 20 tickets, route-aware fare resolution. This is production-grade
  logic; nothing here needs touching.
- `Route`/`FareHistory` — normalized fields, audit trail on every fare change, city-scoped
  uniqueness. Good bones for the pricing module.
- `ticketController.scanTicket` — atomic `findOneAndUpdate` on status transition
  (ACTIVE→USED), correctly distinguishes INVALID (never existed) from REJECT
  (already used) from VALID.

## 6. Confirmed gaps (detail in 03_Gap_Analysis.md)

1. Auth is spoofable — no server-side Clerk token verification (deferred per your
   instruction, tracked as its own task, blocking before production).
2. No multi-tenancy — being added now (07_Role_Hierarchy.md).
3. No role-assignment mechanism at all — no endpoint promotes anyone.
4. No pricing beyond a flat per-route fare — no time-based/discount/coupon logic.
5. No Post module in the live backend despite being listed as "already exists" in the
   master prompt — not found in this repo. Treated as net-new in 09_Post_Module.md, not
   an extension.
6. No maps/routing beyond storing lat/lng on Route — no live tracking, no polylines, no
   ETA.
7. No payment gateway — wallet balance is manually added via `/wallet/add` with a
   ₹50,000 "testing limit" hardcoded, clearly a placeholder pending Razorpay.
