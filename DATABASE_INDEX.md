# Database Index

## Sprint 9 Financial Integrity Models

| Collection/Model | File | Status |
|---|---|---|
| SeatLock | `backend/models/SeatLock.js` | Implemented expiring route-seat locks with active-seat uniqueness |
| BookingTransaction | `backend/models/BookingTransaction.js` | Implemented booking lifecycle, transitions, amount, seats, expiry, and idempotency key |
| FinancialLedger | `backend/models/FinancialLedger.js` | Implemented immutable finance ledger with category, debit/credit direction, periods, and idempotency |
| WalletLedger | `backend/models/WalletLedger.js` | Extended with opening balance, closing balance, actor, reference, and reason |
| Payment | `backend/models/Payment.js` | Extended with expanded production statuses and status history |
| Refund | `backend/models/Refund.js` | Extended with production workflow statuses |

## Sprint 8.5 Payment Extensions

| Collection/Model | File | Status |
|---|---|---|
| Payment | `backend/models/Payment.js` | Extended with provider mode, receipt, method split, wallet/gateway amounts, coupon, expiry, failure metadata |
| PaymentWebhook | `backend/models/PaymentWebhook.js` | Extended with event idempotency, duplicate flag, and processing errors |
| Refund | `backend/models/Refund.js` | Extended with gateway refund id, source, and approval status |
| Invoice | `backend/models/Invoice.js` | Extended with fare/coupon/wallet/payment breakdown metadata |
| Receipt | `backend/models/Receipt.js` | Extended with printable HTML and Razorpay payment id |

## Sprint 8 Production Models

| Collection/Model | File | Status |
|---|---|---|
| JobHistory | `backend/models/JobHistory.js` | Implemented for background job runs, status, attempts, and errors |
| BackupRecord | `backend/models/BackupRecord.js` | Implemented for backup metadata, verification, retention, and restore status |
| ProviderDelivery | `backend/models/ProviderDelivery.js` | Implemented for queued email, push, and storage provider delivery metadata |

| Collection/Model | File | Status |
|---|---|---|
| User | `backend/models/User.js` | Implemented with enterprise profile, avatar, employee fields, status lifecycle, soft delete, preferences, notification settings, metadata, and org/search indexes |
| Organization | `backend/models/Organization.js` | Implemented with profile, address, GST, branding, settings, subscription, and archive status |
| OrganizationInvite | `backend/models/OrganizationInvite.js` | Implemented with persistent hashed invite tokens, status, expiry, inviter, and accepted user |
| Bus | `backend/models/Bus.js` | Implemented with registration, capacity, documents, maintenance, amenities, images, status, and org indexes |
| DriverProfile | `backend/models/DriverProfile.js` | Implemented with license, medical/police docs, assignments, attendance, rating, and org indexes |
| ConductorProfile | `backend/models/ConductorProfile.js` | Implemented with employee profile, assignments, shift, collections, scanner metrics, and org indexes |
| Stop | `backend/models/Stop.js` | Implemented with route order, coordinates, fare stage, landmark, zone, shelter, and org indexes |
| Schedule | `backend/models/Schedule.js` | Implemented with route/bus/driver/conductor assignment, recurring days, status, effective dates, and conflict indexes |
| Trip | `backend/models/Trip.js` | Implemented for one execution of a schedule with lifecycle, delay, occupancy, and revenue |
| GPSLocation | `backend/models/GPSLocation.js` | Implemented for live trip coordinates, speed, heading, ETA, device, and location history |
| TripEvent | `backend/models/TripEvent.js` | Implemented for driver/conductor/dispatcher actions and live timeline events |
| OfflineQueue | `backend/models/OfflineQueue.js` | Implemented for offline driver/conductor sync receipt and retry state |
| MaintenanceRecord | `backend/models/MaintenanceRecord.js` | Implemented for preventive maintenance, breakdowns, document work, vendor, cost, and status |
| FuelRecord | `backend/models/FuelRecord.js` | Implemented for fuel fill, mileage, vendor, distance, cost, and efficiency |
| LeaveRequest | `backend/models/LeaveRequest.js` | Implemented for driver/conductor leave and approval status |
| Incident | `backend/models/Incident.js` | Implemented for operational incident reporting, severity, location, assignment, and resolution |
| Route | `backend/models/Route.js` | Implemented; seed/create/list/update/delete/toggle are organization-scoped |
| Ticket | `backend/models/Ticket.js` | Implemented; booking now writes organization |
| FareHistory | `backend/models/FareHistory.js` | Implemented; fare updates now write organization |
| FareRule | `backend/models/FareRule.js` | Implemented for dynamic pricing rules, approval status, versioning, and publish lifecycle |
| Coupon | `backend/models/Coupon.js` | Implemented for discount codes, limits, route/passenger constraints, and usage tracking |
| FareVersion | `backend/models/FareVersion.js` | Implemented for pricing version history |
| PriceApproval | `backend/models/PriceApproval.js` | Implemented for pricing approval queue |
| BookingHistory | `backend/models/BookingHistory.js` | Implemented for booking lifecycle audit |
| Refund | `backend/models/Refund.js` | Implemented for booking/payment refund records |
| Invoice | `backend/models/Invoice.js` | Implemented for booking/payment invoices |
| Receipt | `backend/models/Receipt.js` | Implemented for wallet/payment receipts |
| WalletTransaction | `backend/models/WalletTransaction.js` | Implemented for transaction-based wallet accounting |
| WalletLedger | `backend/models/WalletLedger.js` | Implemented for wallet debit/credit ledger |
| Payment | `backend/models/Payment.js` | Implemented for Razorpay order/payment state and idempotency |
| PaymentWebhook | `backend/models/PaymentWebhook.js` | Implemented for webhook signature payload recording |
| Notification | `backend/models/Notification.js` | Implemented for in-app/email/push notification records |
| NotificationPreference | `backend/models/NotificationPreference.js` | Implemented for per-user notification settings |
| Post | `backend/models/Post.js` | Implemented for announcements, comments, likes, visibility, pinning, attachments, read receipts, and history |
| SupportTicket | `backend/models/SupportTicket.js` | Implemented for helpdesk tickets, replies, assignments, escalation, SLA, and history |
| AuditLog | `backend/models/AuditLog.js` | Implemented; includes organization and user management actions |
| ValidationLog | `backend/models/ValidationLog.js` | Model only, not used by live routes |

## Missing Collections
- VehicleHealth and performance analytics collections are not standalone yet; Sprint 7 uses Trip, GPSLocation, FuelRecord, MaintenanceRecord, DriverProfile, and ConductorProfile data.
- Attendance standalone model; driver/conductor attendance remains embedded.
- Assignment standalone model; route and schedule assignments remain direct references.
- BookingCancellation standalone model; cancellation data is embedded on Ticket and Refund.
- Post
- PostComment
- PostLike
- Notification
- ReportExport
- Permission
- RolePermission
