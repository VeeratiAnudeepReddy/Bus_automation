# First Run Setup

## Route
`/setup`

## Wizard Steps
Welcome, platform setup, organization information, business information, logo, address, GST, timezone, working hours, administrator information, review, create organization, done.

## Backend Endpoint
`POST /api/auth/setup`

This endpoint is only valid when organization count is zero. It creates the organization and first `org_owner`.
