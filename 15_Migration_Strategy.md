# 15 — Migration Strategy

## Ordering (each step is independently deployable and reversible)

1. **Dead code removal** — delete `routes/tickets.js`, `routes/wallet.js`,
   `routes/validationRoutes.js`, `routes/userRoutes.js`,
   `controllers/validationController.js`, `controllers/userController.js`,
   `middleware/auth.js`. Zero risk — confirmed zero references (01 §4). Do this first so
   subsequent diffs aren't cluttered by unrelated dead files.

2. **Organization + default-org backfill**
   - Create `Organization` collection.
   - Insert one `Organization { name: 'Default Org', slug: 'default', status: 'active' }`.
   - Backfill `organizationId = <default org id>` on every existing `User`, `Route`,
     `Ticket`, `FareHistory` row via a one-time script (`migrations/001_backfill_org.js`),
     run once, idempotent (checks `organizationId: null` before writing so re-running is
     safe).
   - Deploy with `organizationId` as optional in the schema still — don't flip to
     `required: true` in the same deploy as the backfill script, to avoid a race between
     new writes and the backfill.

3. **Flip `organizationId` to required**, update the `Route` unique index
   (`{organizationId, city, fromNormalized, toNormalized}`) — safe now that every row
   has the field.

4. **Role enum migration** — extend enum to include new role names, add a translation
   pass (`admin`→`conductor`, `fare_manager`→`price_manager`, `user`→`customer`) via
   script, keep the old middleware exports as shims (04) so route files don't need
   simultaneous changes.

5. **New modules** (08–12) — each ships independently once 1–4 are stable, in the order
   pricing → posts → maps/routing → payments, matching the master prompt's own stated
   preference for payments last.

## Rollback plan per step
- Steps 1: `git revert`, no data impact (files were unused).
- Step 2: backfill script only adds a field; rollback = drop the `organizationId` field
  via unset, drop the `Organization` collection. No data loss since nothing depended on
  it yet.
- Step 3: revert the required constraint and index change; data already has the field
  so this is safe either direction.
- Step 4: role strings are additive to the enum; rollback = revert the translation
  script's writes using its own logged before/after pairs (script writes an
  `AuditLog`-style record of every change it makes, specifically to make rollback
  scriptable rather than manual).

## Explicit non-goals of this migration pass
Not migrating `ValidationLog` data anywhere (nothing writes to it, nothing reads it,
leaving it untouched is correct). Not touching `Ticket.qrPayload` shape — no reason to.
