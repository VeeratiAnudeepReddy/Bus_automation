# Driver API Reference

- `GET /drivers`: list/search/filter driver profiles.
- `POST /drivers`: create driver profile for an existing user.
- `PATCH /drivers/:id`: update license, medical, attendance, rating, and notes.
- `DELETE /drivers/:id`: delete driver profile.
- `POST /drivers/:id/assign-bus`: assign driver to bus with availability, maintenance, and license checks.

Driver profiles are organization-scoped and linked to `User`.
