const rateLimit = require('express-rate-limit');

const standardOptions = {
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please slow down and try again shortly.',
  },
};


const apiLimiter = rateLimit({
  ...standardOptions,
  windowMs: 15 * 60 * 1000,
  limit: 1000,
});


const authLimiter = rateLimit({
  ...standardOptions,
  windowMs: 15 * 60 * 1000,
  limit: 40,
  skipSuccessfulRequests: true,
});

module.exports = { apiLimiter, authLimiter };
