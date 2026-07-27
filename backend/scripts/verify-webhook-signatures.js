#!/usr/bin/env node
/**
 * Verifies Razorpay webhook HMAC enforcement and Clerk Svix rejection without valid headers.
 */
require('dotenv').config();
const crypto = require('crypto');

const API = process.env.API_BASE || 'http://127.0.0.1:5001/api';

async function main() {
  const payload = {
    id: `evt_sig_${Date.now()}`,
    event: 'payment.captured',
    payload: { payment: { entity: { id: 'pay_x', order_id: 'order_x' } } }
  };
  const raw = JSON.stringify(payload);

  const bad = await fetch(`${API}/payments/webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-razorpay-signature': 'deadbeef' },
    body: raw
  });
  const badJson = await bad.json();
  console.log('RAZORPAY_WEBHOOK_BAD_SIG', bad.status, badJson);
  if (bad.status !== 400 || badJson.verified !== false) {
    throw new Error('Expected unverified Razorpay webhook to return 400 verified:false');
  }

  if (!process.env.RAZORPAY_WEBHOOK_SECRET) throw new Error('RAZORPAY_WEBHOOK_SECRET required for positive path');
  const goodSig = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET).update(raw).digest('hex');
  const good = await fetch(`${API}/payments/webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-razorpay-signature': goodSig },
    body: raw
  });
  const goodJson = await good.json();
  console.log('RAZORPAY_WEBHOOK_GOOD_SIG', good.status, goodJson);
  if (good.status !== 200 || goodJson.verified !== true) {
    throw new Error('Expected verified Razorpay webhook');
  }

  const clerk = await fetch(`${API}/webhooks/clerk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'user.updated', data: { id: 'user_x' } })
  });
  const clerkJson = await clerk.json().catch(() => ({}));
  console.log('CLERK_WEBHOOK_NO_SIG', clerk.status, clerkJson);
  if (clerk.status !== 400 && clerk.status !== 503) {
    throw new Error('Expected Clerk webhook without signature to be rejected');
  }

  console.log('WEBHOOK_SIGNATURE_CHECKS_OK');
}

main().catch((error) => {
  console.error('WEBHOOK_SIGNATURE_CHECKS_FAILED', error.message);
  process.exit(1);
});
