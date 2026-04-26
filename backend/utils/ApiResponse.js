// ─────────────────────────────────────────────────────────
//  utils/ApiResponse.js — Standardized API Response
// ─────────────────────────────────────────────────────────

class ApiResponse {
  /**
   * Send success response
   */
  static success(res, message, data = null, statusCode = 200) {
    const response = {
      success: true,
      message,
    };
    if (data !== null) response.data = data;
    return res.status(statusCode).json(response);
  }

  /**
   * Send error response
   */
  static error(res, message, statusCode = 400, errors = null) {
    const response = {
      success: false,
      message,
    };
    if (errors) response.errors = errors;
    return res.status(statusCode).json(response);
  }

  /**
   * Send created response (201)
   */
  static created(res, message, data = null) {
    return this.success(res, message, data, 201);
  }

  /**
   * Send unauthorized response (401)
   */
  static unauthorized(res, message = "Unauthorized") {
    return this.error(res, message, 401);
  }

  /**
   * Send forbidden response (403)
   */
  static forbidden(res, message = "Access denied") {
    return this.error(res, message, 403);
  }

  /**
   * Send not found response (404)
   */
  static notFound(res, message = "Resource not found") {
    return this.error(res, message, 404);
  }

  /**
   * Send server error response (500)
   */
  static serverError(res, message = "Internal server error") {
    return this.error(res, message, 500);
  }
}

module.exports = ApiResponse;
