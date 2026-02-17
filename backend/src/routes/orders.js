const express = require("express");
const router = express.Router();
const {
  getAllOrders,
  getOrderById,
  getOrderByOrderNumber,
  createOrder,
  rescheduleOrder,
  updateOrderStatus,
  cancelOrder,
} = require("../controllers/orderController");
const { authenticate } = require("../middleware/auth");

// Public route (for payment page)
router.get("/public/:order_number", getOrderByOrderNumber);

// Protected routes (admin only)
router.get("/", authenticate, getAllOrders);
router.get("/:id", authenticate, getOrderById);
router.post("/", authenticate, createOrder);
router.put("/:id/reschedule", authenticate, rescheduleOrder);
router.put("/:id/status", authenticate, updateOrderStatus);
router.put("/:id/cancel", authenticate, cancelOrder);

module.exports = router;
