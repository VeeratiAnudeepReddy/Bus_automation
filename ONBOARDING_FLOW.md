# Onboarding Flow

## First Run
When no non-archived organizations exist, the frontend redirects users to `/setup`.

The setup wizard creates the first organization, creates the first app user, assigns `org_owner`, links ownership, and redirects to `/organization`.

## Existing Platform
Public signup lands at `/register`, where users choose:
- Customer: creates a `customer` account and redirects through profile completion.
- Employee: requires an invite token at `/accept-invite`.
- Organization Owner: opens `/organizations/new` and creates a pending organization unless the creator is super admin.

Generic Clerk signup no longer creates a customer automatically.
