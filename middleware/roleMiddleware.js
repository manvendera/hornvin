// ─────────────────────────────────────────────────────────
//  middleware/roleMiddleware.js — Role-Based Access Control
// ─────────────────────────────────────────────────────────
const ApiResponse = require("../utils/ApiResponse");

/**
 * Restrict access to specific roles
 * @param  {...string} roles - Allowed roles (e.g., "admin", "user")
 *
 * Usage: authorize("admin") or authorize("admin", "user")
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.unauthorized(
        res,
        "Not authorized — please login first"
      );
    }

    if (!roles.includes(req.user.role)) {
      return ApiResponse.forbidden(
        res,
        `Access denied — role '${req.user.role}' is not authorized for this resource`
      );
    }

    next();
  };
};

/**
 * Check if user is verified
 */
const requireVerified = (req, res, next) => {
  if (!req.user) {
    return ApiResponse.unauthorized(
      res,
      "Not authorized — please login first"
    );
  }

  if (!req.user.isEmailVerified) {
    return ApiResponse.forbidden(
      res,
      "Please verify your email before accessing this resource"
    );
  }

  next();
};

module.exports = { authorize, requireVerified };
