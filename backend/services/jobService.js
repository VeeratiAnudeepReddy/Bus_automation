const JobHistory = require('../models/JobHistory');
const logger = require('../utils/logger');

const jobs = new Map();

function registerJob(name, handler, options = {}) {
  jobs.set(name, { name, handler, options });
}

async function runJob(name, metadata = {}) {
  const job = jobs.get(name);
  if (!job) throw new Error(`Unknown job: ${name}`);
  const history = await JobHistory.create({ name, status: 'running', attempts: 1, startedAt: new Date(), metadata });
  try {
    const result = await job.handler(metadata);
    history.status = 'success';
    history.finishedAt = new Date();
    history.metadata = { ...metadata, result };
    await history.save();
    logger.scheduler('job_success', { name, jobId: history._id });
    return history;
  } catch (error) {
    history.status = 'failed';
    history.finishedAt = new Date();
    history.error = error.message;
    await history.save();
    logger.scheduler('job_failed', { name, jobId: history._id, error: error.message });
    throw error;
  }
}

function registerDefaultJobs() {
  registerJob('ticket_expiration', async () => {
    const { expireSeatLocksAndPayments } = require('./bookingIntegrityService');
    return expireSeatLocksAndPayments();
  });
  registerJob('wallet_reconciliation', async () => ({ reconciled: 0 }));
  registerJob('payment_verification', async () => ({ verified: 0 }));
  registerJob('notification_retry', async () => ({ retried: 0 }));
  registerJob('report_generation', async () => ({ generated: 0 }));
  registerJob('cleanup', async () => {
    const { expireSeatLocksAndPayments } = require('./bookingIntegrityService');
    return expireSeatLocksAndPayments();
  });
  registerJob('expired_invite_cleanup', async () => ({ expired: 0 }));
  registerJob('audit_archival', async () => ({ archived: 0 }));
  registerJob('daily_summary', async () => ({ sent: 0 }));
  registerJob('monthly_report', async () => ({ generated: 0 }));
}

function listJobs() {
  return [...jobs.values()].map(({ name, options }) => ({ name, options }));
}

module.exports = { registerJob, runJob, registerDefaultJobs, listJobs };
