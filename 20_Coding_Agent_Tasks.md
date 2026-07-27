# 20 — Coding Agent Tasks

Scoped to **Phase 0 + Phase 1** only (18_Implementation_Checklist.md) — the foundation
that must land before any later phase's tasks can be written with the same precision.
Phases 2–5 get their own task breakdown once Phase 1 is merged and the blocking
questions (02) are answered, since writing atomic tasks against an unsettled foundation
just produces rework.

---

### TASK-001: Remove confirmed dead code
**Objective**: delete unused legacy route/controller/middleware files.
**Background**: 01_Project_Analysis.md §4 — confirmed zero references from `server.js`
or frontend via grep audit.
**Files to delete**: `backend/routes/tickets.js`, `backend/routes/wallet.js`,
`backend/routes/validationRoutes.js`, `backend/routes/userRoutes.js`,
`backend/controllers/validationController.js`, `backend/controllers/userController.js`,
`backend/middleware/auth.js`
**Files to modify**: none (nothing imports these)
**Acceptance criteria**: `npm start` boots clean; all 12 live endpoints (01 §2) still
respond identically; `grep -r` for each deleted filename returns zero hits outside git
history.
**Testing**: existing manual smoke via `test-api.sh` equivalents for live endpoints only.
**Rollback**: `git revert`.
**Complexity**: trivial. **Dependencies**: none.

---

### TASK-002: Add Organization model
**Objective**: create the `Organization` schema.
**Files to create**: `backend/models/Organization.js`
**Schema**: per 05_Database_Changes.md §"New collections".
**Acceptance criteria**: model compiles, unique index on `slug` enforced (test: creating
two orgs with the same slug throws E11000).
**Unit tests**: schema validation tests (required fields, enum values).
**Complexity**: trivial. **Dependencies**: none.

---

### TASK-003: Add `organizationId` field to existing models (non-breaking)
**Objective**: extend `User`, `Route`, `Ticket`, `FareHistory` with optional
`organizationId` — NOT required yet.
**Files to modify**: `backend/models/User.js`, `Route.js`, `Ticket.js`,
`FareHistory.js`
**Database changes**: additive field only, `default: null`, `index: true`. Route's
existing unique index (`{city, fromNormalized, toNormalized}`) is left unchanged in
this task — changed in TASK-006, after backfill.
**Acceptance criteria**: existing endpoints (`/api/tickets/*`, `/api/wallet/add`,
`/api/admin/routes/*`) return byte-identical responses to their current shape (snapshot
test per 14_Testing_Strategy.md "Regression protection").
**Complexity**: trivial. **Dependencies**: TASK-002.

---

### TASK-004: Backfill migration script
**Objective**: create a default Organization and backfill all existing rows.
**Files to create**: `backend/migrations/001_backfill_default_org.js` (standalone
script, run via `node migrations/001_backfill_default_org.js`, not auto-run on boot).
**Logic**:
```js
// pseudocode
const org = await Organization.findOneAndUpdate(
  { slug: 'default' },
  { $setOnInsert: { name: 'Default Org', slug: 'default', status: 'active' } },
  { upsert: true, new: true }
);
for (const Model of [User, Route, Ticket, FareHistory]) {
  await Model.updateMany(
    { organizationId: null },
    { $set: { organizationId: org._id } }
  );
}
```
**Idempotency**: re-running is safe — `$setOnInsert` + `organizationId: null` filter
means already-migrated rows are untouched.
**Acceptance criteria**: after running against a copy of production data, every row in
all four collections has a non-null `organizationId`; running the script a second time
makes zero additional writes (verify via `updateMany` result `modifiedCount === 0` on
second run).
**Manual testing**: run against a staging DB snapshot first, verify row counts before/
after match.
**Rollback**: `db.<collection>.updateMany({}, {$unset: {organizationId: ""}})` + drop
the `Organization` collection.
**Complexity**: low. **Dependencies**: TASK-002, TASK-003.

---

### TASK-005: Deploy Phase-1a (dead code removal + additive org field + backfill)
**Objective**: ship TASK-001–004 together as one deploy, verify in production before
proceeding to the breaking changes in TASK-006+.
**Acceptance criteria**: 17_Deployment_Plan.md rollout step 1–2 checklist passes; no
error-rate change in monitoring post-deploy.
**Complexity**: low (deploy/verify, no new code). **Dependencies**: TASK-001–004.

---

### TASK-006: Make `organizationId` required + fix Route unique index
**Objective**: flip schema constraints now that backfill (TASK-004) has run in
production.
**Files to modify**: `User.js`, `Route.js`, `Ticket.js`, `FareHistory.js` (`required:
true` on `organizationId`); `Route.js` unique index →
`{organizationId, city, fromNormalized, toNormalized}`.
**Acceptance criteria**: attempting to create a Route without `organizationId` throws a
validation error; two orgs can now have identical `{city, from, to}` routes without
collision (integration test creating this exact scenario).
**Testing**: org-isolation test suite begins here (14) — this is the first task where
it becomes meaningful to run.
**Rollback**: revert `required: true` and index change — data already has the field so
reversible without data loss.
**Complexity**: low. **Dependencies**: TASK-005 (must run only after backfill is
confirmed complete in prod).

---

### TASK-007: New role enum + `requireRole`/`requireOrgScope` middleware
**Objective**: implement the composable permission primitives (07 §7, 04).
**Files to create**: `backend/middleware/permissions.js` (`requireRole`,
`requireOrgScope`, `requireSuperAdmin`)
**Files to modify**: `backend/models/User.js` (role enum extended to full 13-role list
from 07, with `admin`/`fare_manager`/`user` still valid enum values during transition),
`backend/middleware/adminMiddleware.js` (becomes the backward-compat shim per 06).
**Acceptance criteria**: existing `requireAdmin`/`requireFareManagerOrAdmin` importers
(`ticketRoutes.js`, `adminRoutes.js`) require zero changes and behave identically for
users still holding old role strings; new `requireRole(...)` works for both old and new
role strings during the transition window.
**Unit tests**: every role/route combination in the permission matrix (07 §4).
**Complexity**: medium. **Dependencies**: TASK-006.

---

### TASK-008: Role translation migration script
**Objective**: translate existing `admin`→`conductor`, `fare_manager`→`price_manager`,
`user`→`customer`, logging every change.
**Files to create**: `backend/migrations/002_translate_roles.js`
**Logic**: for each user with an old role string, update to new string, write an
`AuditLog` entry `{action: 'role_migration', before: oldRole, after: newRole}` for
rollback traceability.
**Acceptance criteria**: post-run, zero users have `role` in `['admin','fare_manager','user']`
(all translated); `AuditLog` has exactly one entry per translated user.
**Rollback**: reverse script reads its own `AuditLog` entries and writes `before` back.
**Complexity**: low. **Dependencies**: TASK-007, requires `AuditLog` model
(create as part of this task if not already done — trivial schema, see 05).

---

### TASK-009: Organization onboarding endpoints
**Objective**: implement self-service org creation + Super Admin approval + invites.
**Files to create**: `backend/controllers/organizationController.js`,
`backend/routes/organizationRoutes.js`
**Endpoints**: per 06 §"Organizations".
**Files to modify**: `server.js` (one new `app.use('/api', organizationRoutes)` line).
**Acceptance criteria**: full flow test — create org (pending) → super_admin approves
(active) → org_owner invites a new user by email → invitee signs up via Clerk → invitee
correctly bound to the org with the invited role.
**Edge cases**: duplicate slug rejected with clear error; inviting an email that already
belongs to a different org rejected (v1 has no cross-org membership, per 07 §2).
**Complexity**: medium. **Dependencies**: TASK-007.

---

## Not yet broken into tasks
Phases 2–5 (pricing, posts, maps/routing, payments) intentionally left as module-level
docs (08–12) rather than atomic tasks — several depend on open questions in
02_Questions_For_Client.md that change the actual task list (e.g. the Razorpay
single-account vs. marketplace decision changes TASK breakdown for Phase 5 entirely).
Will generate 21_Coding_Agent_Tasks_Phase2.md onward once Phase 1 ships and those
questions are answered.
