const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");

const env = process.env.NODE_ENV || "development";
require("dotenv").config({ path: path.resolve(process.cwd(), `.env.${env}`) });

const app = express();

// Global CORS — runs before rate limiters so 429 responses always include Allow-Origin header.
// Auth security is handled by JWT middleware, not CORS origin restriction.
app.use(cors({ origin: true, credentials: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use("/api/", require("./utils/rateLimiter").apiLimiter);
app.use("/api/auth/login", require("./utils/rateLimiter").loginLimiter);

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/services", require("./routes/services"));
app.use("/api/customers", require("./routes/customers"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/webhook", require("./routes/webhook"));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Momcha API is running" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: "Endpoint not found",
    },
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    success: false,
    error: {
      code: "SERVER_ERROR",
      message: "Internal server error",
    },
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});
