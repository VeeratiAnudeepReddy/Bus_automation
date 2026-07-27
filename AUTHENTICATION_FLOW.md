# Authentication Flow

Clerk remains the identity provider. Backend APIs continue to verify Clerk bearer JWTs.

`GET /api/auth/me` checks whether a Clerk user already has an app user record without creating one.

Explicit account creation endpoints:
- `POST /api/auth/setup`
- `POST /api/auth/customer`
- `POST /api/auth/organization-owner`
- `POST /api/auth/invites/:token/accept`

Legacy `POST /api/auth/sync` no longer creates users automatically. If no account exists, it returns an account-type-required response.
