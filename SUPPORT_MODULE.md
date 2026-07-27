# Support Module

Support tickets are organization-scoped with requester, assignee, category, priority, status, SLA due date, escalation timestamp, attachments, replies, and history.

Routes:
- `GET /api/support/tickets`
- `POST /api/support/tickets`
- `GET /api/support/tickets/:id`
- `PATCH /api/support/tickets/:id`
- `DELETE /api/support/tickets/:id`
- `POST /api/support/tickets/:id/replies`

Frontend:
- `/support`
- `/support/new`
- `/support/[id]`
