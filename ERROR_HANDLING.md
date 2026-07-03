# Error Handling

`backend/middleware/errorHandler.js` normalizes:
- validation errors
- duplicate key errors
- invalid IDs
- unexpected exceptions

Responses include:
- error id
- code
- message
- request id

Production responses do not expose raw stack traces.
