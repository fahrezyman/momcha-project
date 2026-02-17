const { verifyToken } = require("../utils/jwt");

// Middleware to protect routes
function authenticate(req, res, next) {
  // Get token from header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "No token provided",
      },
    });
  }

  const token = authHeader.substring(7); // Remove 'Bearer '

  // Verify token
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Invalid or expired token",
      },
    });
  }

  // Attach admin info to request
  req.admin = decoded;
  next();
}

module.exports = { authenticate };
