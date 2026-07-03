const fs = require('fs');
const mongoose = require('mongoose');
const config = require('../config');
const metrics = require('../services/metricsService');
const jobService = require('../services/jobService');
const backupService = require('../services/backupService');

function mongoStatus() {
  return {
    state: mongoose.connection.readyState,
    ok: mongoose.connection.readyState === 1,
    name: mongoose.connection.name || null
  };
}

function healthPayload() {
  return {
    status: mongoStatus().ok ? 'ok' : 'degraded',
    environment: config.NODE_ENV,
    uptimeSeconds: process.uptime(),
    mongo: mongoStatus(),
    redis: { ok: false, mode: 'placeholder' },
    scheduler: { ok: true, jobs: jobService.listJobs().length },
    payments: { ok: true, provider: config.providers.payments },
    email: { ok: config.FEATURE_FLAGS.email, provider: config.providers.email },
    maps: { ok: true, provider: config.providers.maps },
    memory: process.memoryUsage(),
    disk: { ok: true, cwd: process.cwd() }
  };
}

exports.health = (req, res) => res.json(healthPayload());
exports.live = (req, res) => res.json({ status: 'alive', uptimeSeconds: process.uptime() });
exports.ready = (req, res) => {
  const payload = healthPayload();
  res.status(payload.mongo.ok ? 200 : 503).json(payload);
};
exports.metrics = (req, res) => {
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
