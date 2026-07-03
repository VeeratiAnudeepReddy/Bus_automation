# Background Jobs

`backend/services/jobService.js` registers jobs and stores run history in `JobHistory`.

Default jobs:
- ticket expiration
- wallet reconciliation
- payment verification
- notification retry
- report generation
- cleanup
- expired invite cleanup
- audit archival
- daily summary
- monthly report
