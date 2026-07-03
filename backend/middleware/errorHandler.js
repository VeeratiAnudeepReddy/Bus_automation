const mongoose = require('mongoose');
const logger = require('../utils/logger');
const AppError = require('../utils/appError');

function normalizeError(error) {
  if (error instanceof AppError) return error;
  if (error instanceof mongoose.Error.ValidationError) return new AppError('Validation failed', 400, 'VALIDATION_ERROR', error.errors);
  if (error?.name === 'CastError') return new AppError('Invalid resource identifier', 400, 'INVALID_ID');
  if (error?.code === 11000) return new AppError('Duplicate resource', 409, 'DUPLICATE_RESOURCE');
  return new AppError('Unexpected server error', 500, 'INTERNAL_ERROR');
}

function notFound(req, res) {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found', requestId: req.requestId } });
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  const normalized = normalizeError(error);
  logger.error('request_error', {
    requestId: req.requestId,
    errorId: normalized.errorId,
    code: normalized.code,
    route: req.originalUrl,
    status: normalized.statusCode,
    message: error.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
  });
  return res.status(normalized.statusCode).json({
    error: {
      id: normalized.errorId,
      code: normalized.code,
      message: normalized.message,
      requestId: req.requestId,
      details: normalized.statusCode < 500 ? normalized.details : undefined
    }
  });
}

module.exports = { errorHandler, notFound };
