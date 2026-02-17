const express = require("express");
const router = express.Router();
const { login, getMe, createAdmin } = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");

// POST /api/auth/login
router.post("/login", login);

// GET /api/auth/me (protected)
router.get("/me", authenticate, getMe);

// Endpoint untuk membuat admin baru (hanya untuk setup awal, sebaiknya diamankan dengan baik)
// router.post("/create-admin", createAdmin);

module.exports = router;
