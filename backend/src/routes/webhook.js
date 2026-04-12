const express = require("express");
const router = express.Router();
const {
  handlePaymentNotification,
} = require("../controllers/webhookController");
const { apiLimiter } = require("../utils/rateLimiter");

// POST /api/webhook/payment (from Midtrans)
router.post("/payment", apiLimiter, handlePaymentNotification);

module.exports = router;
