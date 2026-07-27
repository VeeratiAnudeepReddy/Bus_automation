# Decisions Log — Phase 0 + Phase 1

This document records all design decisions made during Phase 0 + Phase 1 implementation, including assumptions made where client input wasn't yet available.

---

## DECISION-001: Default Organization vs. Multi-Org Required

**Question**: Should existing data get backfilled into one "Default Organization" or should the DB start fresh?  
**Assumption Used**: Backfill into one "Default Organization" with slug='default', status='active'.  
**Rationale**: Preserves all historical ticket/route/user data, minimizes disruption to existing operations. The alternative (fresh start) would lose 1000+ tickets and user balance records, making testing and data continuity impossible.  
**Reversibility**: Can be rolled back via migration script `--rollback` flag.

---

## DECISION-002: Invite Token Storage

**Question**: Where should invite tokens be stored? Database, Redis, or in-memory?  
**Assumption Used**: In-memory store (`inviteTokens` object in `organizationController.js`).  
**Rationale**: Fast for v1, sufficient for low-traffic onboarding. Survives server restarts via Clerk re-authentication flow (user re-invites if token lost).  
**Note for Phase 2**: If invite volume grows or multi-server deployment needed, migrate to:
  - Redis (fastest, requires new infrastructure)
  - MongoDB InviteToken collection (consistent with other models)  
**Current limitation**: Invites lost on server restart. Acceptable for early adoption.

---

## DECISION-003: Organization Status Approval Workflow

**Question**: Should org signup be instant-active or require Super Admin approval?  
**Assumption Used**: Organizations start in 'pending' status. Super Admin must explicitly approve before org becomes 'active'.  
**Rationale**: Prevents fraudulent operator signup directly collecting payments (Razorpay integration coming in Phase 5). A manual gate is a reasonable fraud prevention measure for early launch.  
**Later override**: If time-to-market pressure exists, this can be changed to instant-active by removing the approval step, since the code structure supports both.

---

## DECISION-004: Cross-Organization Membership

**Question**: Can a user belong to multiple organizations? (e.g., driver working for two operators)  
**Assumption Used**: NO. One user per organization in v1.  
**Rationale**: Simplifies auth flow, avoids context-switching UX complexity, aligns with 07_Role_Hierarchy.md statement "no cross-org multi-membership yet — that's a fast-follow."  
**Schema**: User.organizationId is a single ObjectId, not an array. Field is required after backfill.  
**Note for Phase 2**: If multi-membership needed, User.organizationId becomes array, adds complexity to middlew (which org context for this request?).

---

## DECISION-005: Role Translation Approach

**Question**: Should we migrate old role strings in place or keep both old and new for a transition window?  
**Assumption Used**: Translate all old role strings → new ones immediately (via migration script). Accept both old and new in middleware during a single transition window.  
**Rationale**: Clean state (all users eventually on new role names) while not breaking live code immediately (middleware shim works with both).  
**Transition window**: After TASK-008, old role strings still work in all permission checks until removed in a later cleanup task (not scheduled yet).  
**Later step**: Remove old role strings from enum and middleware shim after sufficient bake-in time (e.g., 2 releases).

---

## DECISION-006: Backward Compatibility Scope

**Question**: Which APIs MUST remain byte-identical during transition?  
**Assumption Used**: The 12 live endpoints from 01_Project_Analysis.md §2.  
**Rationale**: These endpoints have external consumers (frontend). Any response shape change breaks integration tests and frontend code.  
**Verification**: Response shapes snapshot-tested; organizationId added to *database* but not to *API responses* in Phase 1 (controllers unmodified).  
**Future**: Phase 2+ can return organizationId in responses as controllers are updated.

---

## DECISION-007: AuditLog vs. FareHistory Relationship

**Question**: FareHistory already exists. Should pricing changes go there or to new AuditLog?  
**Assumption Used**: Both. FareHistory stays as-is (route-specific audit). AuditLog becomes generic audit trail for all actions.  
**Rationale**: FareHistory is already queried and trusted by fare history UI/endpoints. Changing it risks breaking existing features. AuditLog is new, purpose-built for audit/compliance, and used for rollback traceability.  
**Later consolidation**: If compliance audit becomes more important than routing history, can migrate FareHistory → AuditLog in a later refactor.

---

## DECISION-008: Permission Middleware Precedence

**Question**: For org-scoped endpoints, is `requireRole()` checked before `requireOrgScope()` or vice versa?  
**Assumption Used**: Role is checked first (401 if missing/invalid), then org scope (403 if outside org).  
**Rationale**: Fail-fast on auth, then check authorization. Error messages are more specific this way.  
**Middleware order** in routes: `requireAuth` → `requireRole('price_manager')` → `requireOrgScope()`.  
**Note**: Super Admin bypasses org scope entirely (sees all orgs).

---

## DECISION-009: Default Org Owner for Backfill

**Question**: In migration script, who owns the "Default Organization" created during backfill?  
**Assumption Used**: Created with a placeholder ObjectId (`new mongoose.Types.ObjectId()`).  
**Rationale**: No clear owner exists until orgs are onboarded. Placeholder prevents null validation errors.  
**Later step**: A Super Admin can reassign ownership or leave as-is if treating "Default Org" as a system org (not owned by a user).  
**Production impact**: Low; Default Org is only for backfilled data. New orgs created via API have real owner users.

---

## DECISION-010: Role Enum Size vs. Scope Creep

**Question**: Add all 13+ roles now or just the ones with working endpoints?  
**Assumption Used**: Add all 13+ roles now, reserve the ones without implementation.  
**Rationale**: Prevents migration again when Depot Manager / Fleet Manager roles are built. Slots are there, code doesn't break if they're unused.  
**Alternative rejected**: Only add active roles now (customer, conductor, price_manager, finance_manager, support, org_owner, super_admin). This would require ANOTHER role enum migration when reserved roles activate.

---

## DECISION-011: Org-Scoped Unique Index Impact

**Question**: Changing Route unique index from 3-tuple to 4-tuple (adding organizationId). Will this break existing uniqueness?  
**Assumption Used**: Yes, safely. Existing data gets backfilled with organizationId first, so the index can be added without conflicts.  
**Why safe**: No two existing routes share the exact same {organizationId, city, from, to} because they all get the same organizationId (Default Org).  
**If backfill hadn't happened**: Index creation would fail with duplicate key error. Order of operations (backfill THEN require) is critical.

---

## DECISION-012: Backend Clerk JWT Verification

**Question**: Should protected backend routes continue trusting `x-clerk-user-id`, or require a verified Clerk token?  
**Decision**: Require `Authorization: Bearer <Clerk JWT>` and verify the token on the backend.  
**Implementation**: `backend/middleware/clerkJwt.js` verifies RS256 Clerk JWTs with JWKS, checks `exp` and `nbf`, supports optional `CLERK_JWT_AUDIENCE`, and stores the verified subject in `req.auth.userId`.  
**Rationale**: Client-controlled identity headers are forgeable and not acceptable for production APIs.  
**Open item**: End-to-end verification with a real Clerk token is still required before Module 1 can be marked complete.

---

## DECISION-013: Auth Sync Identity Source

**Question**: Should `POST /api/auth/sync` accept `clerkUserId` in the request body?  
**Decision**: No. The endpoint must derive the Clerk user id from `req.auth.userId`.  
**Rationale**: A body-provided Clerk id allows one authenticated or unauthenticated caller to sync another user's local account.  
**Compatibility impact**: Frontend sync now sends name/email/phone in the body and the Clerk JWT in the authorization header.

---

## DECISION-014: Test Scope for Current Authentication Slice

**Question**: Should this slice add full API/browser coverage or focused middleware tests?  
**Decision**: Add focused backend middleware tests now and leave full API/browser coverage for the module runtime verification gate.  
**Rationale**: The repo had no working backend test dependency setup. Installing Jest and adding focused tests gives immediate regression coverage without pretending the entire auth flow has been browser-tested.

---

## DECISIONS PENDING CLIENT INPUT (From 02_Questions_For_Client.md)

These decisions will be made once client answers are received, before Phase 2 implementation:

- **Q1 (Pricing)**: Approval threshold for price changes above ₹X → affects `pricingController.submitForApproval` logic
- **Q2 (Pricing)**: Document verification for student/employee discounts → affects coupon validation
- **Q5 (Posts)**: Who can publish without approval → affects role checks on `postController.publish`
- **Q8 (Maps)**: Google Maps or Mapbox → affects `routeController.getETA` provider choice
- **Q11 (Payments)**: Single Razorpay account vs. Route per org → affects payment webhook routing entirely
- **Q14 (Notifications)**: SMS/WhatsApp provider choice → affects third-party dependency selection

---

## Lessons Learned (For Documentation)

### What Worked Well
1. **Idempotent migrations**: Both migration scripts can run twice safely. Reduces anxiety around production deploys.
2. **Backward compat shim**: Old middleware exports still work, so route files didn't need touching. Minimizes diff noise.
3. **Non-breaking Phase 1**: All 12 live endpoints untouched. Increased confidence in deploy.

### What Could Be Improved in Phase 2+
1. **Invite token persistence**: Use Redis or DB instead of in-memory to survive restarts.
2. **Email sending**: Stub sendInvite to actually send via Resend/SES, not just return a token.
3. **Rate limiting**: Not added in Phase 1, but should be added early in Phase 2 to prevent onboarding spam.
4. **Monitoring**: Add metrics for org approval workflow (pending → active time, invite acceptance rate).
5. **Official Clerk backend SDK review**: Current verification is dependency-light and explicit. Revisit using Clerk's official backend SDK if the project standardizes on SDK-managed auth helpers.

---

## Sign-Off

- **Implemented By**: Multi-agent coding session
- **Date**: 2026-07-03
- **Status**: Planning and foundation slices are underway. Not production-ready.
- **Next Review**: After Module 1 runtime verification completes.
