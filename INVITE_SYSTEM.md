# Invite System

Organization managers create invites from organization user management.

Invite links use `/accept-invite?token=...`.

The frontend validates the token, requires Clerk signup/sign-in with the invited email, then calls `POST /api/auth/invites/:token/accept`.

Supported employee roles: driver, conductor, dispatcher, fleet manager, operations manager, finance manager, price manager, support, bus manager, organization admin, and scheduler.

Expired, cancelled, inactive-organization, mismatched-email, and invalid-role invites are rejected.
