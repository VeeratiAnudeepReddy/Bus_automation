const crypto = require('crypto');

class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.errorId = crypto.randomUUID();
  }
}

module.exports = AppError;
