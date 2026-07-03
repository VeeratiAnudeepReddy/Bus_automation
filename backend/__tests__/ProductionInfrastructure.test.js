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
});
