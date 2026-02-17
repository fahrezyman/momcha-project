const express = require("express");
const router = express.Router();
const {
  handlePaymentNotification,
} = require("../controllers/webhookController");

// POST /api/webhook/payment (from Midtrans)
router.post("/payment", handlePaymentNotification);

module.exports = router;
