const mongoose = require('mongoose');
const { validateConfig } = require('../config');
const rateLimiter = require('../middleware/rateLimiter');
const metrics = require('../services/metricsService');
const BackupRecord = require('../models/BackupRecord');
const JobHistory = require('../models/JobHistory');
const ProviderDelivery = require('../models/ProviderDelivery');

function mockResponse() {
  return {
    headers: {},
    statusCode: 200,
    setHeader: jest.fn(function setHeader(key, value) {
      this.headers[key] = value;
    }),
    status: jest.fn(function status(code) {
      this.statusCode = code;
      return this;
    }),
    json: jest.fn()
  };
}

describe('Sprint 8 production infrastructure', () => {
  test('configuration validation rejects missing production Mongo URI', () => {
    expect(() => validateConfig({
      NODE_ENV: 'production',
      PORT: 5001,
      MONGO_URI: '',
      FRONTEND_URL: 'https://example.com',
      CORS_ORIGINS: ['https://example.com']
    })).toThrow('Invalid configuration');
  });

  test('configuration validation rejects production without Razorpay webhook secret', () => {
    const previous = {
      NODE_ENV: process.env.NODE_ENV,
      RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
      RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
      RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,
      CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET,
      CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
      CLERK_JWKS_URL: process.env.CLERK_JWKS_URL
    };
    process.env.NODE_ENV = 'production';
    process.env.RAZORPAY_KEY_ID = 'rzp_test_x';
    process.env.RAZORPAY_KEY_SECRET = 'secret';
    delete process.env.RAZORPAY_WEBHOOK_SECRET;
    process.env.CLERK_JWKS_URL = 'https://example.clerk.accounts.dev/.well-known/jwks.json';
    process.env.CLERK_WEBHOOK_SECRET = 'whsec_test';
    try {
      expect(() => validateConfig({
        NODE_ENV: 'production',
        PORT: 5001,
        MONGO_URI: 'mongodb://127.0.0.1:27017/busqr',
        FRONTEND_URL: 'https://example.com',
        CORS_ORIGINS: ['https://example.com']
      })).toThrow(/RAZORPAY_WEBHOOK_SECRET/);
    } finally {
      process.env.NODE_ENV = previous.NODE_ENV;
      process.env.RAZORPAY_KEY_ID = previous.RAZORPAY_KEY_ID;
      process.env.RAZORPAY_KEY_SECRET = previous.RAZORPAY_KEY_SECRET;
      if (previous.RAZORPAY_WEBHOOK_SECRET == null) delete process.env.RAZORPAY_WEBHOOK_SECRET;
      else process.env.RAZORPAY_WEBHOOK_SECRET = previous.RAZORPAY_WEBHOOK_SECRET;
      if (previous.CLERK_WEBHOOK_SECRET == null) delete process.env.CLERK_WEBHOOK_SECRET;
      else process.env.CLERK_WEBHOOK_SECRET = previous.CLERK_WEBHOOK_SECRET;
      process.env.CLERK_SECRET_KEY = previous.CLERK_SECRET_KEY;
      process.env.CLERK_JWKS_URL = previous.CLERK_JWKS_URL;
    }
  });

  test('configuration validation rejects production without Clerk webhook secret', () => {
    const previous = {
      NODE_ENV: process.env.NODE_ENV,
      RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
      RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
      RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,
      CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET,
      CLERK_JWKS_URL: process.env.CLERK_JWKS_URL
    };
    process.env.NODE_ENV = 'production';
    process.env.RAZORPAY_KEY_ID = 'rzp_test_x';
    process.env.RAZORPAY_KEY_SECRET = 'secret';
    process.env.RAZORPAY_WEBHOOK_SECRET = 'whsec_rzp';
    process.env.CLERK_JWKS_URL = 'https://example.clerk.accounts.dev/.well-known/jwks.json';
    delete process.env.CLERK_WEBHOOK_SECRET;
    try {
      expect(() => validateConfig({
        NODE_ENV: 'production',
        PORT: 5001,
        MONGO_URI: 'mongodb://127.0.0.1:27017/busqr',
        FRONTEND_URL: 'https://example.com',
        CORS_ORIGINS: ['https://example.com']
      })).toThrow(/CLERK_WEBHOOK_SECRET/);
    } finally {
      process.env.NODE_ENV = previous.NODE_ENV;
      process.env.RAZORPAY_KEY_ID = previous.RAZORPAY_KEY_ID;
      process.env.RAZORPAY_KEY_SECRET = previous.RAZORPAY_KEY_SECRET;
      process.env.RAZORPAY_WEBHOOK_SECRET = previous.RAZORPAY_WEBHOOK_SECRET;
      if (previous.CLERK_WEBHOOK_SECRET == null) delete process.env.CLERK_WEBHOOK_SECRET;
      else process.env.CLERK_WEBHOOK_SECRET = previous.CLERK_WEBHOOK_SECRET;
      process.env.CLERK_JWKS_URL = previous.CLERK_JWKS_URL;
    }
  });

  test('rate limiter emits headers and allows first request', () => {
    const req = { path: '/api/search', ip: '127.0.0.1', header: jest.fn().mockReturnValue(null) };
    const res = mockResponse();
    const next = jest.fn();
    rateLimiter(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', expect.any(String));
  });

  test('metrics service exposes prometheus counters', () => {
    metrics.observeRequest(25, 200);
    metrics.increment('gpsUpdates');
    const text = metrics.prometheus();
    expect(text).toContain('busqr_http_requests_total');
    expect(text).toContain('busqr_gps_updates_total');
  });

  test('production metadata models validate', async () => {
    const backup = new BackupRecord({
      backupId: 'backup-test',
      path: 'backups/backup-test.archive'
    });
    const job = new JobHistory({
      name: 'ticket_expiration',
      status: 'success'
    });
    const delivery = new ProviderDelivery({
      provider: 'email',
      recipient: 'ops@example.com',
      template: 'welcome'
    });

    await expect(backup.validate()).resolves.toBeUndefined();
    await expect(job.validate()).resolves.toBeUndefined();
    await expect(delivery.validate()).resolves.toBeUndefined();
    expect(backup._id).toBeInstanceOf(mongoose.Types.ObjectId);
  });

  test('job registry marks expiry jobs implemented and stubs honestly', () => {
    const jobService = require('../services/jobService');
    jobService.registerDefaultJobs();
    const jobs = jobService.listJobs();
    const expiry = jobs.find((job) => job.name === 'ticket_expiration');
    const stub = jobs.find((job) => job.name === 'wallet_reconciliation');
    expect(expiry.implemented).toBe(true);
    expect(expiry.options.intervalMs).toBeGreaterThan(0);
    expect(stub.implemented).toBe(false);
  });
});
