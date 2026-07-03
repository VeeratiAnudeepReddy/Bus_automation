const ProviderDelivery = require('../models/ProviderDelivery');
const logger = require('../utils/logger');

async function queueEmail({ recipient, template, payload }) {
  const delivery = await ProviderDelivery.create({ provider: 'email', channel: 'email', recipient, template, payload, status: 'queued' });
  logger.info('email_queued', { deliveryId: delivery._id, recipient, template });
  return delivery;
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
