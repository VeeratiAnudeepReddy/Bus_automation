const mongoose = require('mongoose');
const config = require('../config');
const metrics = require('../services/metricsService');
const jobService = require('../services/jobService');
const backupService = require('../services/backupService');

function boolEnv(name, fallback = false) {
  const value = process.env[name];
  if (value == null || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

function mongoStatus() {
  return {
    state: mongoose.connection.readyState,
    ok: mongoose.connection.readyState === 1,
    name: mongoose.connection.name || null
  };
}

function paymentsHealth() {
  const configured = Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
  return {
    ok: configured,
    configured,
    provider: config.providers.payments,
    mode: process.env.RAZORPAY_MODE || 'test',
    webhookSecretConfigured: Boolean(process.env.RAZORPAY_WEBHOOK_SECRET),
    note: configured
      ? 'Keys present; live checkout/webhook settlement still requires runtime verification'
      : 'RAZORPAY_KEY_ID/SECRET missing'
  };
}

function healthPayload({ publicView = false } = {}) {
  const jobs = jobService.listJobs();
  const payments = paymentsHealth();
  const payload = {
    status: mongoStatus().ok ? 'ok' : 'degraded',
    environment: config.NODE_ENV,
    uptimeSeconds: process.uptime(),
    mongo: {
      ok: mongoStatus().ok,
      ...(publicView ? {} : { state: mongoStatus().state, name: mongoStatus().name })
    },
    redis: { ok: false, mode: 'placeholder' },
    scheduler: {
      ok: true,
      jobs: jobs.length,
      implementedJobs: jobs.filter((job) => job.implemented).length,
      scheduledJobs: jobs.filter((job) => job.scheduled).length,
      ...(publicView ? {} : { stubJobs: jobs.filter((job) => !job.implemented).map((job) => job.name) })
    },
    payments: publicView
      ? { ok: payments.ok, provider: payments.provider }
      : payments,
    email: { ok: config.FEATURE_FLAGS.email, provider: publicView ? undefined : config.providers.email },
    maps: { ok: true, provider: publicView ? undefined : config.providers.maps },
    memory: publicView ? undefined : process.memoryUsage(),
    disk: publicView ? undefined : { ok: true, cwd: process.cwd() }
  };
  return payload;
}

exports.health = (req, res) => res.json(healthPayload({ publicView: config.NODE_ENV === 'production' }));
exports.live = (req, res) => res.json({ status: 'alive', uptimeSeconds: process.uptime() });
exports.ready = (req, res) => {
  const payload = healthPayload({ publicView: config.NODE_ENV === 'production' });
  res.status(payload.mongo.ok ? 200 : 503).json(payload);
};
exports.metrics = (req, res) => {
  if (config.NODE_ENV === 'production' && !req.user) {
    // Allow metrics scrape only when METRICS_PUBLIC=true; otherwise require prior auth middleware.
    if (!boolEnv('METRICS_PUBLIC', false)) {
      return res.status(401).json({ error: 'Metrics require authentication or METRICS_PUBLIC=true' });
    }
  }
  res.setHeader('Content-Type', 'text/plain; version=0.0.4');
  res.send(metrics.prometheus());
};
exports.apiMetadata = (req, res) => {
  res.json({ name: 'BusQR API', version: config.API_VERSION, legacyPathsSupported: true, environment: config.NODE_ENV });
};
exports.runtimeConfig = (req, res) => {
  res.json({ environment: config.NODE_ENV, featureFlags: config.FEATURE_FLAGS, providers: config.providers });
};
exports.jobs = (req, res) => res.json({ jobs: jobService.listJobs() });
exports.runJob = async (req, res, next) => {
  try {
    const history = await jobService.runJob(req.params.name, req.body || {});
    res.status(202).json({ job: history });
  } catch (error) {
    next(error);
  }
};
exports.createBackup = async (req, res, next) => {
  try {
    const backup = await backupService.createBackup(req.body?.type || 'manual');
    res.status(201).json({ backup });
  } catch (error) {
    next(error);
  }
};
