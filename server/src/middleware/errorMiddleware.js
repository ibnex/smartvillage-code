const ApiError = require('../utils/ApiError');

const notFound = (req, _res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};


const errorHandler = (error, _req, res, _next) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal server error';
  let details = error.details;

  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    details = Object.values(error.errors).map((err) => ({
      field: err.path,
      message: err.message,
    }));
  }

  if (error.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for ${error.path}`;
  }

  if (error.code === 11000) {
    statusCode = 409;
    const field = Object.keys(error.keyPattern || {})[0] || 'field';
    message = `A record with that ${field} already exists`;
  }

  if (error.name === 'MulterError') {
    statusCode = 400;
    message =
      error.code === 'LIMIT_FILE_SIZE'
        ? 'The uploaded file is too large. Maximum size is 8 MB.'
        : `Upload failed: ${error.message}`;
  }

  if (error.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Malformed JSON request body';
  }

  if (statusCode >= 500) {
    console.error('[error]', error);
  }

  const payload = {
    success: false,
    message,
  };
  if (details) payload.details = details;
  if (process.env.NODE_ENV !== 'production' && statusCode >= 500) {
    payload.stack = error.stack;
  }

  res.status(statusCode).json(payload);
};

module.exports = { notFound, errorHandler };
