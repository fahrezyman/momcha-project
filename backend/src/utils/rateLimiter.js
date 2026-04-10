const rateLimit = require("express-rate-limit");

// API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per window
  message: {
    success: false,
    error: {
      code: "TOO_MANY_REQUESTS",
      message: "Terlalu banyak request. Coba lagi nanti.",
    },
  },
});

// Login rate limit (stricter)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // max 5 login attempts
  message: {
    success: false,
    error: {
      code: "TOO_MANY_REQUESTS",
      message: "Terlalu banyak percobaan login. Coba lagi dalam 15 menit.",
    },
  },
});

module.exports = {
  apiLimiter,
  loginLimiter,
};
