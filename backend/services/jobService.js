const JobHistory = require('../models/JobHistory');
const logger = require('../utils/logger');

const jobs = new Map();
const timers = new Map();
const DEFAULT_EXPIRY_INTERVAL_MS = 60_000;

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
  }, { intervalMs: DEFAULT_EXPIRY_INTERVAL_MS, implemented: true });
  registerJob('wallet_reconciliation', async () => ({ reconciled: 0, stub: true }), { implemented: false });
  registerJob('payment_verification', async () => ({ verified: 0, stub: true }), { implemented: false });
  registerJob('notification_retry', async () => ({ retried: 0, stub: true }), { implemented: false });
  registerJob('report_generation', async () => ({ generated: 0, stub: true }), { implemented: false });
  registerJob('cleanup', async () => {
    const { expireSeatLocksAndPayments } = require('./bookingIntegrityService');
    return expireSeatLocksAndPayments();
  }, { intervalMs: 5 * DEFAULT_EXPIRY_INTERVAL_MS, implemented: true });
  registerJob('expired_invite_cleanup', async () => ({ expired: 0, stub: true }), { implemented: false });
  registerJob('audit_archival', async () => ({ archived: 0, stub: true }), { implemented: false });
  registerJob('daily_summary', async () => ({ sent: 0, stub: true }), { implemented: false });
  registerJob('monthly_report', async () => ({ generated: 0, stub: true }), { implemented: false });
}

function listJobs() {
  return [...jobs.values()].map(({ name, options }) => ({
    name,
    options,
    scheduled: timers.has(name),
    implemented: options?.implemented !== false
  }));
}

/**
 * Start in-process intervals for jobs that declare intervalMs.
 * Disabled in test env to avoid open handles / side effects.
 */
function startScheduledJobs({ enabled = process.env.NODE_ENV !== 'test' } = {}) {
  if (!enabled) return { started: [] };
  const started = [];
  for (const [name, job] of jobs.entries()) {
    const intervalMs = Number(job.options?.intervalMs || 0);
    if (!intervalMs || timers.has(name)) continue;
    const timer = setInterval(() => {
      runJob(name, { trigger: 'interval' }).catch((error) => {
        logger.scheduler('job_interval_error', { name, error: error.message });
      });
    }, intervalMs);
    if (typeof timer.unref === 'function') timer.unref();
    timers.set(name, timer);
    started.push(name);
    logger.scheduler('job_scheduled', { name, intervalMs });
  }
  return { started };
}

function stopScheduledJobs() {
  for (const [name, timer] of timers.entries()) {
    clearInterval(timer);
    timers.delete(name);
    logger.scheduler('job_unscheduled', { name });
  }
}

module.exports = {
  registerJob,
  runJob,
  registerDefaultJobs,
  listJobs,
  startScheduledJobs,
  stopScheduledJobs
};
