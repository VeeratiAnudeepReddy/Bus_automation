# Email System

Outbound email is implemented in `backend/services/emailService.js` and queued through `providerServices.queueEmail`.

## Providers (`EMAIL_PROVIDER`)
| Value | Behavior |
|---|---|
| `console` (default) | Logs message body; marks delivery `sent` in-process (no SMTP) |
| `ethereal` / `test` | Real SMTP to Ethereal test inbox; stores `previewUrl` on `ProviderDelivery.payload` |
| `smtp` | Real SMTP via `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM` |

## Feature flag
- `FEATURE_EMAIL=true` required to send (otherwise status `skipped`)
- Scripts may set `EMAIL_FORCE=true` to send even when validating adapters

## Templates
- welcome, invite, booking_confirmation, receipt, refund, support_update, maintenance_reminder, dispatcher_alert

## Payment wiring
`finalizeVerifiedPayment` sends:
1. `booking_confirmation` when `payment.bookingId` is set
2. `receipt` for every captured payment

Recipient = `User.email` for the payer.

## Verify delivery
```bash
cd backend
FEATURE_EMAIL=true EMAIL_PROVIDER=ethereal node scripts/send-test-emails.js
```
Look for `EMAIL_DELIVERY_OK` with `previewUrl` — open that URL to confirm inbox content.

## Production
Set `EMAIL_PROVIDER=smtp` (or a future Resend adapter), `FEATURE_EMAIL=true`, and real SMTP credentials. Do not leave `console`/`ethereal` in production.
