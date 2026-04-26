// ─────────────────────────────────────────────────────────
//  middleware/authMiddleware.js — JWT Authentication
// ─────────────────────────────────────────────────────────
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ApiResponse = require("../utils/ApiResponse");

/**
 * Protect routes — verify access token
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Extract token from Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return ApiResponse.unauthorized(
        res,
        "Not authorized — no token provided"
      );
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // Get user from token
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return ApiResponse.unauthorized(res, "User no longer exists");
    }

    if (!user.isActive) {
      return ApiResponse.unauthorized(
        res,
        "Your account has been deactivated. Contact support."
      );
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return ApiResponse.unauthorized(
        res,
        "Token expired — please refresh your session"
      );
    }
    if (error.name === "JsonWebTokenError") {
      return ApiResponse.unauthorized(res, "Invalid token");
    }
    return ApiResponse.serverError(res, "Authentication failed");
  }
};

/**
 * Optional auth — attach user if token exists, but don't block
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
    }
  } catch (error) {
    // silently ignore — user remains null
  }
  next();
};

module.exports = { protect, optionalAuth };
