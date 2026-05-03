const rateLimit = require("express-rate-limit");

const skipOptions = (req) => req.method === "OPTIONS";

// API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  skip: skipOptions,
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
  max: 5,
  skip: skipOptions,
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
