# Vehicle Documents

## Current Implementation
Vehicle document fields are stored on `backend/models/Bus.js`:
- insurance
- fitnessCertificate
- pollutionCertificate
- permit
- roadTax
- documents

Each document supports name, URL, number, issue date, expiry date, status, and version.

## Alerts
Operations dashboard alerts surface expired or due insurance, permit, and service dates.

## Future Work
Production file upload/storage and renewal history UI are pending.
