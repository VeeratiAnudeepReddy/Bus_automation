# 09 — Post Module

## Correction vs. master prompt
The master prompt says "a Post feature already exists." The code audit (01) found no
Post model, controller, or route anywhere in the live repo. Treating this as **net-new**,
not an extension — flagging explicitly so this isn't silently built twice if it does
exist somewhere I haven't seen (e.g. a separate branch). Worth a quick confirmation.

## Feature overview
Org-scoped announcements/posts with draft→approval→publish→archive lifecycle,
comments, likes, attachments, pinning, scheduled publish.

## Database
`Post`, `PostComment`, `PostLike` — schemas in 05.

## Backend
`controllers/postController.js`, `routes/postRoutes.js` (new, mounted under `/api/posts`
in `server.js` alongside the existing five route files — one more `app.use('/api', ...)`
line, doesn't touch any existing mount).

- `createPost` — defaults to `draft`.
- `publish` — role-gated per open question 02 #5; scheduled posts get `publishAt` set
  and flip via the same job runner used for pricing activation (04) — reusing
  infrastructure rather than building a second scheduler.
- Comments/likes as separate collections with counters denormalized onto `Post`
  (`likeCount`/`commentCount`) updated via `$inc` on write — avoids a count() query on
  every post list render.

## Frontend
New `/posts` page + `PostCard`, `PostComposer` components following existing component
conventions (`Card.tsx` glass style, `Button.tsx` primary orange).

## Authorization
- Draft/edit: author + org_owner
- Publish: org_owner (default; loosen to Support per client answer)
- Delete: org_owner, soft-delete via `status: archived`, never hard-delete (preserves
  audit trail)
- Read: all org members; guest/customer visibility may need a "public" flag if some
  announcements should be visible pre-login — flagged as an open question if needed,
  not assumed.

## Attachments
Routed through the new storage abstraction (04). Images only for v1 per the safer
default; video support is a flagged extension (02 #7) since it changes storage cost and
needs transcoding consideration, not something to silently include.

## Edge cases
- Pinned posts: cap at a small number (e.g. 3) enforced server-side, oldest pin
  auto-unpins, to prevent the feed becoming all-pinned over time.
- Comment moderation: `support` role can delete any comment within their org
  (soft-delete, logged to AuditLog).
