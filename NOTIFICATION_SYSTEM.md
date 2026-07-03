# Notification System

Notifications support user, role, and organization audiences with read state, categories, channels, and preferences.

Routes:
- `GET /api/notifications`
- `PATCH /api/notifications/read`
- `PATCH /api/notifications/read-all`
- `GET /api/notifications/preferences`
- `PATCH /api/notifications/preferences`
- `DELETE /api/notifications/:id`

Current delivery is in-app. Email and push providers remain production integrations.
