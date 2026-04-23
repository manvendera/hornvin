// ─────────────────────────────────────────────────────────
//  middleware/errorHandler.js — Global Error Handler
// ─────────────────────────────────────────────────────────

/**
 * 404 — Route Not Found
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route not found — ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // ─── Mongoose Bad ObjectId ─────────────────────
  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 400;
    message = "Invalid resource ID";
  }

  // ─── Mongoose Duplicate Key ────────────────────
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `An account with this ${field} already exists`;
  }

  // ─── Mongoose Validation Error ─────────────────
  if (err.name === "ValidationError") {
    statusCode = 400;
    const messages = Object.values(err.errors).map((val) => val.message);
    message = messages.join(". ");
  }

  // ─── JWT Errors ────────────────────────────────
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
    }),
  });
};

module.exports = { notFound, errorHandler };
