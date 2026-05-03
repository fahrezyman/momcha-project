const express = require("express");
const router = express.Router();
const {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  reorderServices,
} = require("../controllers/servicesController");
const { authenticate } = require("../middleware/auth");

// Public route
router.get("/", getAllServices);
router.get("/:id", getServiceById);

// Protected routes (admin only)
router.post("/", authenticate, createService);
router.put("/reorder", authenticate, reorderServices);
router.put("/:id", authenticate, updateService);
router.delete("/:id", authenticate, deleteService);

module.exports = router;
