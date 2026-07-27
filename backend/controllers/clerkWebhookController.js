const { Webhook } = require('svix');
const logger = require('../utils/logger');
const User = require('../models/User');

/**
 * Clerk webhooks (Svix-signed). Configure endpoint:
 * POST /api/webhooks/clerk
 * Events: user.created, user.updated, user.deleted (as needed)
 */
exports.handleClerkWebhook = async (req, res) => {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    logger.security('clerk_webhook_secret_missing', {});
    if (process.env.NODE_ENV === 'production') {
      return res.status(503).json({ error: 'CLERK_WEBHOOK_SECRET not configured' });
    }
    return res.status(400).json({ error: 'CLERK_WEBHOOK_SECRET required' });
  }

  const payload = req.rawBody || JSON.stringify(req.body);
  const headers = {
    'svix-id': req.headers['svix-id'],
    'svix-timestamp': req.headers['svix-timestamp'],
    'svix-signature': req.headers['svix-signature']
  };

  let event;
  try {
    const wh = new Webhook(secret);
    event = wh.verify(payload, headers);
  } catch (error) {
    logger.security('clerk_webhook_signature_failed', { error: error.message });
    return res.status(400).json({ error: 'Invalid Clerk webhook signature' });
  }

  const type = event.type;
  const data = event.data || {};
  logger.info('clerk_webhook_received', { type, clerkUserId: data.id });

  try {
    if (type === 'user.updated' || type === 'user.created') {
      const email = data.email_addresses?.[0]?.email_address || data.primary_email_address || null;
      if (data.id) {
        await User.findOneAndUpdate(
          { clerkUserId: data.id },
          {
            $set: {
              ...(email ? { email } : {}),
              ...(data.first_name || data.last_name
                ? { name: [data.first_name, data.last_name].filter(Boolean).join(' ') }
                : {})
            }
          }
        );
      }
    }
    if (type === 'user.deleted' && data.id) {
      await User.findOneAndUpdate({ clerkUserId: data.id }, { $set: { status: 'archived' } });
    }
  } catch (error) {
    logger.error('clerk_webhook_handler_failed', { type, error: error.message });
    return res.status(500).json({ error: 'Webhook processing failed' });
  }

  return res.json({ ok: true, type });
};
