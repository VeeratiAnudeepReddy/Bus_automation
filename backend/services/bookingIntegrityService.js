const BookingTransaction = require('../models/BookingTransaction');
const SeatLock = require('../models/SeatLock');
const Ticket = require('../models/Ticket');
const Payment = require('../models/Payment');

async function transitionBooking({ organizationId, bookingId, to, actorId = null, reason = null, metadata = null, session = null }) {
  const booking = await BookingTransaction.findOne({ organizationId, bookingId }).session(session);
  if (!booking) return null;
  const from = booking.lifecycle;
  booking.lifecycle = to;
  booking.transitions.push({ from, to, actorId, reason, metadata });
  await booking.save({ session });
  return booking;
}

async function expireSeatLocksAndPayments() {
  const now = new Date();
  // Payments created without expiresAt (pre-Sprint-9 rows) still stall forever unless we
  // apply a fallback age cutoff aligned with the 15-minute hold window.
  const fallbackCreatedBefore = new Date(now.getTime() - 15 * 60 * 1000);
  const expiredLocks = await SeatLock.updateMany(
    { status: 'active', expirationTime: { $lte: now } },
    { $set: { status: 'expired', paymentStatus: 'expired', releasedAt: now, reason: 'hold_expired' } }
  );
  const expiredPayments = await Payment.updateMany(
    {
      status: 'created',
      $or: [
        { expiresAt: { $lte: now } },
        { expiresAt: null, createdAt: { $lte: fallbackCreatedBefore } },
        { expiresAt: { $exists: false }, createdAt: { $lte: fallbackCreatedBefore } }
      ]
    },
    { $set: { status: 'expired', failedAt: now, failureReason: 'payment_timeout' } }
  );
  const expiredBookings = await BookingTransaction.find({ lifecycle: { $in: ['seat_hold', 'payment_pending'] }, expiresAt: { $lte: now } });
  for (const booking of expiredBookings) {
    const from = booking.lifecycle;
    booking.lifecycle = 'expired';
    booking.transitions.push({ from, to: 'expired', reason: 'booking_timeout', at: now });
    await booking.save();
    await Ticket.updateMany({ organizationId: booking.organizationId, bookingId: booking.bookingId, status: 'HELD' }, { $set: { status: 'EXPIRED' } });
  }
  return { expiredLocks: expiredLocks.modifiedCount, expiredPayments: expiredPayments.modifiedCount, expiredBookings: expiredBookings.length };
}

module.exports = { transitionBooking, expireSeatLocksAndPayments };
