# Assignment Engine Documentation

File: `backend/services/assignmentService.js`.

The assignment engine validates:
- Bus belongs to organization.
- Driver/conductor belongs to organization.
- Bus is not inactive, retired, or in maintenance.
- Maintenance status is not due, overdue, or in service.
- Driver license is not expired.
- Driver/conductor status allows assignment.
- Schedule conflicts do not overlap on date range, day set, and time interval.

Used by route assignment, bus assignment, and schedule creation/update.
