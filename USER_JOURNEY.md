# User Journey

## Authentication
Clerk answers only: who is this person?

The app verifies the Clerk JWT, then calls `GET /api/auth/me` to check whether an application account exists.

## No App Account
Users go to `/register` and choose an identity path:
- I want to book bus tickets.
- I own or manage a transport organization.
- I was invited by my organization.

## Customer
Customer chooses bus-ticket booking, creates a customer app account, completes customer profile fields, then lands at `/customer`.

Customers do not see organization, fleet, finance, employee creation, buses, or drivers in navigation.

## Organization Owner
Owner chooses organization management, creates an organization through `/organizations/new`, completes owner/business profile, then lands at `/organization`.

## Employee
Employee receives an invite link, accepts it at `/accept-invite`, completes the minimal role-specific profile, receives the assigned role from the invite, then lands on the role dashboard.

Employees never manually choose driver, conductor, finance, dispatcher, or other roles.

## Super Admin
Super admin is not a public onboarding option. It must be seeded or created through controlled platform setup.
