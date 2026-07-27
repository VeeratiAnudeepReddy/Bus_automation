const ProviderDelivery = require('../models/ProviderDelivery');
const logger = require('../utils/logger');
const { deliverEmail } = require('./emailService');

async function queueEmail({ recipient, template, payload }) {
  if (!recipient) {
    logger.info('email_skipped_no_recipient', { template });
    return null;
  }
  try {
    return await deliverEmail({ recipient, template, payload });
  } catch (error) {
    // Persist failure already logged in emailService; do not fail payment/booking path.
    logger.error('email_queue_failed', { recipient, template, error: error.message });
    return ProviderDelivery.findOne({ recipient, template }).sort({ createdAt: -1 });
  }
}

async function queuePush({ recipient, template, payload }) {
  const delivery = await ProviderDelivery.create({ provider: 'push', channel: 'web_push', recipient, template, payload, status: 'queued' });
  logger.info('push_queued', { deliveryId: delivery._id, recipient, template });
  return delivery;
}

async function recordStorageUpload({ path, contentType, sizeBytes, owner }) {
  return ProviderDelivery.create({ provider: 'storage', channel: 'local', recipient: owner || null, template: 'upload', payload: { path, contentType, sizeBytes }, status: 'sent', sentAt: new Date() });
}

module.exports = { queueEmail, queuePush, recordStorageUpload };
