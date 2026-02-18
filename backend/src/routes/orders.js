const express = require("express");
const router = express.Router();
const {
  getAllOrders,
  getOrderById,
  getOrderByOrderNumber,
  createOrder,
  updateOrder,
  rescheduleOrder,
  updateOrderStatus,
  cancelOrder,
} = require("../controllers/orderController"); // ← TAMBAH 's'
const { authenticate } = require("../middleware/auth");

// Public route (for payment page)
router.get("/public/:order_number", getOrderByOrderNumber);

// Protected routes (admin only)
router.get("/", authenticate, getAllOrders);
router.get("/:id", authenticate, getOrderById);
router.post("/", authenticate, createOrder);

// PENTING: Routes spesifik HARUS SEBELUM routes general!
router.post("/:id/reschedule", authenticate, rescheduleOrder);
router.post("/:id/cancel", authenticate, cancelOrder);
router.patch("/:id/status", authenticate, updateOrderStatus);

// General update - TERAKHIR
router.put("/:id", authenticate, updateOrder);

module.exports = router;
