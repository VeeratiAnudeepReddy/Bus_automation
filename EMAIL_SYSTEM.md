# Email System

`backend/services/providerServices.js` queues email metadata in `ProviderDelivery`.

Supported template categories:
- welcome
- invite
- booking confirmation
- receipt
- refund
- support update
- maintenance reminder
- dispatcher alert

External email delivery is pending provider credentials and adapter implementation.
