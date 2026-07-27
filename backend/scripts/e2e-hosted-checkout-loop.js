#!/usr/bin/env node
/**
 * Hosted Checkout capture loop (test mode) without interactive card UI:
 * 1) create Razorpay order via API
 * 2) synthesize checkout signature (same HMAC Checkout returns)
 * 3) POST /payments/verify
 * 4) POST signed payment.captured webhook
 * 5) assert booking tickets ACTIVE
 *
 * Requires: E2E_CLERK_TOKEN, RAZORPAY_*, MONGO via running API on API_BASE.
 * Optional: BOOKING_ID to pay an existing hold; otherwise creates booking from ROUTE_ID.
 */
require('dotenv').config();
const crypto = require('crypto');

const API = process.env.API_BASE || 'http://127.0.0.1:5001/api';
const token = process.env.E2E_CLERK_TOKEN;
const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

function signPayment(orderId, paymentId) {
  return crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(`${orderId}|${paymentId}`).digest('hex');
}

function signWebhook(rawBody) {
  return crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
}

async function api(path, { method = 'GET', body } = {}) {
  const response = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await response.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }
  console.log(`[${method}] ${path} -> ${response.status}`, JSON.stringify(json).slice(0, 400));
  if (!response.ok) throw new Error(`${method} ${path} failed: ${response.status}`);
  return json;
}

async function main() {
  if (!token) throw new Error('Set E2E_CLERK_TOKEN to a short-lived Clerk session JWT');
  if (!process.env.RAZORPAY_KEY_SECRET) throw new Error('RAZORPAY_KEY_SECRET required');
  if (!webhookSecret) throw new Error('RAZORPAY_WEBHOOK_SECRET required');

  let bookingId = process.env.BOOKING_ID;
  if (!bookingId) {
    const routeId = process.env.ROUTE_ID;
    if (!routeId) {
      const routes = await api('/routes');
      const first = routes.routes?.[0];
      if (!first) throw new Error('No routes available; set ROUTE_ID');
      bookingId = (await api('/bookings', {
        method: 'POST',
        body: {
          routeId: first._id,
          seats: ['A1'],
          paymentMethod: 'gateway',
          idempotencyKey: `e2e-checkout-${Date.now()}`
        }
      })).bookingId;
    } else {
      bookingId = (await api('/bookings', {
        method: 'POST',
        body: {
          routeId,
          seats: ['A1'],
          paymentMethod: 'gateway',
          idempotencyKey: `e2e-checkout-${Date.now()}`
        }
      })).bookingId;
    }
  }

  console.log('STEP booking', bookingId);
  const orderRes = await api('/payments/create-order', {
    method: 'POST',
    body: { bookingId, paymentMethod: 'gateway' }
  });
  const orderId = orderRes.order.id;
  const paymentId = `pay_e2e_${Date.now()}`;
  const signature = signPayment(orderId, paymentId);
  console.log('STEP checkout_signature_ready', { orderId, paymentId });

  const verify = await api('/payments/verify', {
    method: 'POST',
    body: {
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature
    }
  });
  console.log('STEP verify', verify.payment?.status);

  const payload = {
    id: `evt_e2e_${Date.now()}`,
    event: 'payment.captured',
    created_at: Math.floor(Date.now() / 1000),
    payload: {
      payment: {
        entity: {
          id: paymentId,
          order_id: orderId,
          status: 'captured',
          amount: orderRes.order.amount
        }
      }
    }
  };
  const rawBody = JSON.stringify(payload);
  const whSig = signWebhook(rawBody);
  const whRes = await fetch(`${API}/payments/webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-razorpay-signature': whSig
    },
    body: rawBody
  });
  const whJson = await whRes.json();
  console.log('STEP webhook', whRes.status, whJson);

  const booking = await api(`/bookings/${bookingId}`);
  const statuses = (booking.tickets || []).map((t) => t.status);
  console.log('STEP booking_tickets', statuses);
  if (!statuses.length || statuses.some((s) => s !== 'ACTIVE')) {
    throw new Error(`Expected ACTIVE tickets, got ${JSON.stringify(statuses)}`);
  }
  console.log('HOSTED_CHECKOUT_LOOP_OK', { bookingId, orderId, paymentId, webhookVerified: whJson.verified });
}

main().catch((error) => {
  console.error('HOSTED_CHECKOUT_LOOP_FAILED', error.message);
  process.exit(1);
});
