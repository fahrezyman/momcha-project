const express = require("express");
const router = express.Router();
const {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} = require("../controllers/customersController");
const { authenticate } = require("../middleware/auth");

// All routes are protected (admin only)
router.get("/", authenticate, getAllCustomers);
router.get("/:id", authenticate, getCustomerById);
router.post("/", authenticate, createCustomer);
router.put("/:id", authenticate, updateCustomer);
router.delete("/:id", authenticate, deleteCustomer);

module.exports = router;
