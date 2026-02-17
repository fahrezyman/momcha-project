const bcrypt = require("bcrypt");
const db = require("../config/db");
const { generateToken } = require("../utils/jwt");

// Login
async function login(req, res) {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Username and password are required",
        },
      });
    }

    // Get admin from database
    const [rows] = await db.query("SELECT * FROM admin WHERE username = ?", [
      username,
    ]);

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Username atau password salah",
        },
      });
    }

    const admin = rows[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Username atau password salah",
        },
      });
    }

    // Generate token
    const token = generateToken({
      admin_id: admin.id,
      username: admin.username,
    });

    // Return success
    res.json({
      success: true,
      data: {
        admin_id: admin.id,
        username: admin.username,
        name: admin.name,
        email: admin.email,
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Internal server error",
      },
    });
  }
}

// Get current admin info
async function getMe(req, res) {
  try {
    const [rows] = await db.query(
      "SELECT id, username, name, email, phone FROM admin WHERE id = ?",
      [req.admin.admin_id],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Admin not found",
        },
      });
    }

    res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Internal server error",
      },
    });
  }
}

// ... (kode login & getMe yang sudah ada)

// Create admin (untuk setup awal)
async function createAdmin(req, res) {
  try {
    const { username, password, email, name, phone } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Username and password are required",
        },
      });
    }

    // Check if admin already exists
    const [admins] = await db.query("SELECT id FROM admin LIMIT 2");

    if (admins.length > 0) {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message:
            "Admin already exists. This endpoint is disabled for security.",
        },
      });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Insert admin
    const [result] = await db.query(
      "INSERT INTO admin (username, password_hash, email, name, phone) VALUES (?, ?, ?, ?, ?)",
      [username, password_hash, email || null, name || null, phone || null],
    );

    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        username,
        email,
        name,
      },
      message: "Admin created successfully",
    });
  } catch (error) {
    console.error("Create admin error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Internal server error",
      },
    });
  }
}

module.exports = { login, getMe, createAdmin };
