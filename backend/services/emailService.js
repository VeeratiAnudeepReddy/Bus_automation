const nodemailer = require('nodemailer');
const ProviderDelivery = require('../models/ProviderDelivery');
const config = require('../config');
const logger = require('../utils/logger');

const TEMPLATE_SUBJECTS = {
  welcome: 'Welcome to BusQR',
  invite: 'You are invited to BusQR',
  booking_confirmation: 'Booking confirmed',
  receipt: 'Payment receipt',
  refund: 'Refund update',
  support_update: 'Support ticket update',
  maintenance_reminder: 'Maintenance reminder',
  dispatcher_alert: 'Dispatcher alert'
};

function renderBody(template, payload = {}) {
  const lines = [
    `<h2>${TEMPLATE_SUBJECTS[template] || template}</h2>`,
    `<p>Hello${payload.name ? ` ${payload.name}` : ''},</p>`
  ];
  if (template === 'booking_confirmation') {
    lines.push(`<p>Your booking <strong>${payload.bookingId || ''}</strong> is confirmed.</p>`);
    lines.push(`<p>Amount: <strong>${payload.amount ?? ''}</strong> ${payload.currency || 'INR'}</p>`);
  } else if (template === 'receipt') {
    lines.push(`<p>Payment receipt for order <strong>${payload.orderId || payload.razorpayPaymentId || ''}</strong>.</p>`);
    lines.push(`<p>Amount: <strong>${payload.amount ?? ''}</strong> ${payload.currency || 'INR'}</p>`);
    if (payload.receiptNumber) lines.push(`<p>Receipt #: ${payload.receiptNumber}</p>`);
  } else if (template === 'invite') {
    lines.push(`<p>Accept your invite: <a href="${payload.inviteUrl || '#'}">${payload.inviteUrl || 'Open invite'}</a></p>`);
  } else {
    lines.push(`<pre>${JSON.stringify(payload, null, 2)}</pre>`);
  }
  lines.push('<p>— BusQR</p>');
  return lines.join('\n');
}

async function createTransport() {
  const provider = (config.providers.email || process.env.EMAIL_PROVIDER || 'console').toLowerCase();

  if (provider === 'smtp') {
    if (!process.env.SMTP_HOST) throw new Error('SMTP_HOST required for EMAIL_PROVIDER=smtp');
    return {
      provider: 'smtp',
      transport: nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: String(process.env.SMTP_SECURE || 'false') === 'true',
        auth: process.env.SMTP_USER
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined
      })
    };
  }

  if (provider === 'ethereal' || provider === 'test') {
    const account = await nodemailer.createTestAccount();
    return {
      provider: 'ethereal',
      transport: nodemailer.createTransport({
        host: account.smtp.host,
        port: account.smtp.port,
        secure: account.smtp.secure,
        auth: { user: account.user, pass: account.pass }
      }),
      preview: true
    };
  }

  if (provider === 'console') {
    return {
      provider: 'console',
      transport: {
        sendMail: async (mail) => {
          logger.info('email_console_delivery', {
            to: mail.to,
            subject: mail.subject,
            preview: String(mail.html || mail.text || '').slice(0, 240)
          });
          return { messageId: `console-${Date.now()}`, accepted: [mail.to] };
        }
      }
    };
  }

  throw new Error(`Unsupported EMAIL_PROVIDER: ${provider}`);
}

async function deliverEmail({ recipient, template, payload, from }) {
  const delivery = await ProviderDelivery.create({
    provider: 'email',
    channel: 'email',
    recipient,
    template,
    payload,
    status: 'queued'
  });

  if (!config.FEATURE_FLAGS.email && process.env.EMAIL_FORCE !== 'true') {
    delivery.status = 'skipped';
    delivery.error = 'FEATURE_EMAIL disabled';
    await delivery.save();
    logger.info('email_skipped_feature_flag', { deliveryId: delivery._id, recipient, template });
    return delivery;
  }

  try {
    const mailer = await createTransport();
    const info = await mailer.transport.sendMail({
      from: from || process.env.EMAIL_FROM || 'BusQR <noreply@busqr.local>',
      to: recipient,
      subject: TEMPLATE_SUBJECTS[template] || `BusQR: ${template}`,
      html: renderBody(template, payload)
    });
    delivery.status = 'sent';
    delivery.sentAt = new Date();
    delivery.attempts = (delivery.attempts || 0) + 1;
    delivery.payload = {
      ...payload,
      messageId: info.messageId,
      previewUrl: mailer.preview ? nodemailer.getTestMessageUrl(info) : null,
      providerUsed: mailer.provider
    };
    await delivery.save();
    logger.info('email_sent', {
      deliveryId: delivery._id,
      recipient,
      template,
      provider: mailer.provider,
      messageId: info.messageId,
      previewUrl: delivery.payload.previewUrl || null
    });
    return delivery;
  } catch (error) {
    delivery.status = 'failed';
    delivery.error = error.message;
    delivery.attempts = (delivery.attempts || 0) + 1;
    await delivery.save();
    logger.error('email_send_failed', { deliveryId: delivery._id, recipient, template, error: error.message });
    throw error;
  }
}

module.exports = {
  deliverEmail,
  renderBody,
  TEMPLATE_SUBJECTS
};
