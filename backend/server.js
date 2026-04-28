// ─────────────────────────────────────────────────────────
//  server.js — Express Application Entry Point
// ─────────────────────────────────────────────────────────
require("dotenv").config();
const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/admin");
const distributorRoutes = require("./routes/distributor");
const customerRoutes = require("./routes/customer");
const garageRoutes = require("./routes/garage");
const { errorHandler, notFound } = require("./middleware/errorHandler");

// ─── Connect to MongoDB ──────────────────────────────────
connectDB();

const app = express();

// ─── Global Middleware ────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: true, // Allow all origins in dev
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());
app.use(morgan("dev"));

// ─── Static Files (uploads) ──────────────────────────────
app.use("/uploads", express.static("uploads"));

// ─── Rate Limiting ────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per window
  message: {
    success: false,
    message: "Too many requests, please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", limiter);

// Stricter rate limit for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later.",
  },
});
app.use("/api/v1/auth", authLimiter);
app.use("/api/admin/login", authLimiter);
app.use("/api/admin/register", authLimiter);

// ─── Health Check ─────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 Hornvin Admin API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: "2.0.0",
  });
});

// ─── API Routes ───────────────────────────────────────────
app.use("/api/v1/auth", authRoutes);
app.use("/api/auth", authRoutes); // Standard alias

// Multi-Panel Auth Routes
app.use("/api/admin/auth", require("./modules/admin/auth/adminAuthRoutes"));
app.use("/api/distributor/auth", require("./modules/distributor/auth/distributorAuthRoutes"));
app.use("/api/garage/auth", require("./modules/garage/auth/garageAuthRoutes"));
app.use("/api/customer/auth", require("./modules/customer/auth/customerAuthRoutes"));

app.use("/api/admin", adminRoutes);
app.use("/api/distributor", distributorRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/garage", garageRoutes);

// ─── Error Handling ───────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────
const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`\n🚀 Hornvin Server running in ${process.env.NODE_ENV} mode on port ${port}`);
    console.log(`   Health: http://localhost:${port}/api/health`);
    console.log(`   Admin API: http://localhost:${port}/api/admin\n`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️  Port ${port} is already in use. Trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('❌ Server startup error:', err);
    }
  });
};

const PORT = parseInt(process.env.PORT) || 5000;
startServer(PORT);
