require('dotenv').config();

const ENVIRONMENTS = ['development', 'test', 'testing', 'staging', 'production'];

function bool(value, fallback = false) {
  if (value == null || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

function number(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

const NODE_ENV = process.env.NODE_ENV || 'development';
const isTest = NODE_ENV === 'test' || NODE_ENV === 'testing';
const isProduction = NODE_ENV === 'production';

const config = {
  NODE_ENV,
  APP_ENV: process.env.APP_ENV || NODE_ENV,
  PORT: number(process.env.PORT, 5001),
  MONGO_URI: process.env.MONGO_URI || (isTest ? 'mongodb://127.0.0.1:27017/busqr_test' : ''),
  FARE: number(process.env.FARE, 20),
  FRONTEND_URL: process.env.FRONTEND_URL || (isProduction ? '' : 'http://localhost:3000'),
  API_VERSION: 'v1',
  LOG_FORMAT: process.env.LOG_FORMAT || (isProduction ? 'json' : 'json'),
  REQUEST_BODY_LIMIT: process.env.REQUEST_BODY_LIMIT || '1mb',
  CORS_ORIGINS: (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || (isProduction ? '' : 'http://localhost:3000,http://localhost:3001'))
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean),
  RATE_LIMIT_WINDOW_MS: number(process.env.RATE_LIMIT_WINDOW_MS, 60_000),
  RATE_LIMIT_PUBLIC: number(process.env.RATE_LIMIT_PUBLIC, 120),
  RATE_LIMIT_AUTHENTICATED: number(process.env.RATE_LIMIT_AUTHENTICATED, 600),
  RATE_LIMIT_PAYMENTS: number(process.env.RATE_LIMIT_PAYMENTS, 60),
  RATE_LIMIT_SEARCH: number(process.env.RATE_LIMIT_SEARCH, 120),
  FEATURE_FLAGS: {
    email: bool(process.env.FEATURE_EMAIL, false),
    push: bool(process.env.FEATURE_PUSH, false),
    backups: bool(process.env.FEATURE_BACKUPS, true),
    jobs: bool(process.env.FEATURE_JOBS, true),
    metrics: bool(process.env.FEATURE_METRICS, true),
    realtime: bool(process.env.FEATURE_REALTIME, true)
  },
  providers: {
    email: process.env.EMAIL_PROVIDER || 'console',
    push: process.env.PUSH_PROVIDER || 'console',
    storage: process.env.STORAGE_PROVIDER || 'local',
    maps: process.env.MAPS_PROVIDER || 'google_embed',
    payments: process.env.PAYMENT_PROVIDER || 'razorpay_foundation'
  }
};

function validateConfig(current = config) {
  const errors = [];
  const production = current.NODE_ENV === 'production';
  if (!ENVIRONMENTS.includes(current.NODE_ENV)) errors.push(`NODE_ENV must be one of ${ENVIRONMENTS.join(', ')}`);
  if (!current.PORT || current.PORT < 1) errors.push('PORT must be a positive number');
  if (!current.MONGO_URI) errors.push('MONGO_URI is required');
  if (production && !current.FRONTEND_URL) errors.push('FRONTEND_URL is required in production');
  if (production && current.CORS_ORIGINS.length === 0) errors.push('CORS_ORIGINS is required in production');
  if (production && !process.env.CLERK_SECRET_KEY && !process.env.CLERK_JWKS_URL) {
    errors.push('CLERK_SECRET_KEY or CLERK_JWKS_URL is required in production');
  }
  if (production && !process.env.RAZORPAY_KEY_ID) errors.push('RAZORPAY_KEY_ID is required in production');
  if (production && !process.env.RAZORPAY_KEY_SECRET) errors.push('RAZORPAY_KEY_SECRET is required in production');
  if (production && !process.env.RAZORPAY_WEBHOOK_SECRET) {
    errors.push('RAZORPAY_WEBHOOK_SECRET is required in production');
  }
  if (production && !process.env.CLERK_WEBHOOK_SECRET) {
    errors.push('CLERK_WEBHOOK_SECRET is required in production');
  }
  if (errors.length) {
    const error = new Error(`Invalid configuration: ${errors.join('; ')}`);
    error.code = 'CONFIG_VALIDATION_FAILED';
    error.details = errors;
    throw error;
  }
  return current;
}

validateConfig(config);

module.exports = config;
module.exports.validateConfig = validateConfig;
