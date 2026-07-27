const FinancialLedger = require('../models/FinancialLedger');

function period(date = new Date()) {
  const iso = date.toISOString();
  return {
    day: iso.slice(0, 10),
    month: iso.slice(0, 7),
    year: iso.slice(0, 4)
  };
}

async function recordFinancialEntry({
  organizationId,
  userId = null,
  bookingId = null,
  paymentId = null,
  refundId = null,
  walletTransactionId = null,
  routeId = null,
  tripId = null,
  category,
  direction,
  amount,
  currency = 'INR',
  idempotencyKey,
  reason = null,
  metadata = null,
  session = null
}) {
  const existing = await FinancialLedger.findOne({ organizationId, idempotencyKey }).session(session);
  if (existing) return existing;
  const [entry] = await FinancialLedger.create([{
    organizationId,
    userId,
    bookingId,
    paymentId,
    refundId,
    walletTransactionId,
    routeId,
    tripId,
    category,
    direction,
    amount,
    currency,
    idempotencyKey,
    period: period(),
    reason,
    metadata
  }], { session });
  return entry;
}

module.exports = { recordFinancialEntry, period };
