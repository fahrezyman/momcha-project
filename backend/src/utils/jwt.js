const jwt = require("jsonwebtoken");

// Generate JWT token
function generateToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET_DEV, {
    expiresIn: process.env.JWT_EXPIRES_IN_DEV || "7d",
  });
}

// Verify JWT token
function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET_DEV);
  } catch (error) {
    return null;
  }
}

module.exports = { generateToken, verifyToken };
