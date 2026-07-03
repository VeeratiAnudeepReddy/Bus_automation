const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
      index: true
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    action: {
      type: String,
      required: true,
      enum: [
        'role_migration',           // Used by role translation migration (TASK-008)
        'org_created',
        'org_updated',
        'org_approved',
        'org_suspended',
        'org_archived',
        'user_invited',
        'user_invite_cancelled',
        'user_invite_accepted',
        'user_created',
        'user_updated',
        'user_deleted',
        'user_archived',
        'user_restored',
        'user_suspended',
        'user_activated',
        'user_transferred',
        'user_imported',
        'user_exported',
        'user_profile_updated',
        'user_role_assigned',
        'bus_created',
        'bus_updated',
        'bus_deleted',
        'bus_status_changed',
        'bus_maintenance_updated',
        'driver_created',
        'driver_updated',
        'driver_deleted',
        'driver_assigned',
        'conductor_created',
        'conductor_updated',
        'conductor_deleted',
        'conductor_assigned',
        'route_assigned',
        'stop_created',
        'stop_updated',
        'stop_deleted',
        'schedule_created',
        'schedule_updated',
        'schedule_deleted',
        'assignment_conflict_detected',
        'trip_created',
        'trip_updated',
        'trip_status_changed',
        'trip_location_updated',
        'trip_event_created',
        'offline_sync_received',
        'maintenance_record_created',
        'maintenance_record_updated',
        'fuel_record_created',
        'leave_requested',
        'leave_reviewed',
        'incident_reported',
        'incident_updated',
        'pricing_rule_created',
        'pricing_rule_approved',
        'pricing_rule_activated',
        'pricing_rule_archived',
        'booking_created',
        'booking_cancelled',
        'wallet_transaction_created',
        'coupon_created',
        'coupon_updated',
        'report_exported',
        'notification_sent',
        'post_created',
        'post_published',
        'post_deleted',
        'comment_deleted',
        'support_ticket_created',
        'support_ticket_updated',
        'support_ticket_replied',
        'payment_processed',
        'payment_refunded',
        'payment_signature_failed',
        'payment_webhook_processed',
        'booking_transitioned',
        'seat_locked',
        'seat_lock_released',
        'financial_ledger_recorded'
      ],
      index: true
    },
    targetType: {
      type: String,
      default: null,
      enum: ['User', 'Organization', 'Route', 'Bus', 'DriverProfile', 'ConductorProfile', 'Stop', 'Schedule', 'Trip', 'GPSLocation', 'TripEvent', 'OfflineQueue', 'MaintenanceRecord', 'FuelRecord', 'LeaveRequest', 'Incident', 'FareRule', 'Coupon', 'Booking', 'BookingTransaction', 'SeatLock', 'FinancialLedger', 'Refund', 'WalletTransaction', 'Payment', 'Post', 'SupportTicket', 'PaymentTransaction', null]
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      index: true
    },
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed,
    metadata: mongoose.Schema.Types.Mixed
  },
  {
    timestamps: true
  }
);

// Indexes for common queries
auditLogSchema.index({ organizationId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
