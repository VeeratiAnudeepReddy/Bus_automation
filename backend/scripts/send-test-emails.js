#!/usr/bin/env node
/**
 * Sends a real email via Ethereal (or SMTP if EMAIL_PROVIDER=smtp).
 * Evidence: ProviderDelivery status=sent + previewUrl for Ethereal.
 */
require('dotenv').config();
process.env.FEATURE_EMAIL = 'true';
process.env.EMAIL_FORCE = 'true';
if (!process.env.EMAIL_PROVIDER || process.env.EMAIL_PROVIDER === 'console') {
  process.env.EMAIL_PROVIDER = 'ethereal';
}

const mongoose = require('mongoose');
const config = require('../config');
const { deliverEmail } = require('../services/emailService');

async function main() {
  const to = process.env.EMAIL_TEST_TO || 'passenger-test@example.com';
  await mongoose.connect(config.MONGO_URI);
  const booking = await deliverEmail({
    recipient: to,
    template: 'booking_confirmation',
    payload: { name: 'E2E Passenger', bookingId: `BK-EMAIL-${Date.now()}`, amount: 40, currency: 'INR' }
  });
  const receipt = await deliverEmail({
    recipient: to,
    template: 'receipt',
    payload: {
      name: 'E2E Passenger',
      bookingId: booking.payload?.bookingId,
      amount: 40,
      currency: 'INR',
      orderId: `order_email_${Date.now()}`,
      razorpayPaymentId: `pay_email_${Date.now()}`
    }
  });
  console.log('EMAIL_DELIVERY_OK', {
    booking: { id: String(booking._id), status: booking.status, previewUrl: booking.payload?.previewUrl, provider: booking.payload?.providerUsed },
    receipt: { id: String(receipt._id), status: receipt.status, previewUrl: receipt.payload?.previewUrl, provider: receipt.payload?.providerUsed }
  });
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error('EMAIL_DELIVERY_FAILED', error.message);
  try { await mongoose.disconnect(); } catch { /* ignore */ }
  process.exit(1);
});
