// ─────────────────────────────────────────────────────────
//  middleware/validate.js — Request Validation Middleware
// ─────────────────────────────────────────────────────────
const ApiResponse = require("../utils/ApiResponse");

/**
 * Validate request body against a Joi schema
 * @param {Object} schema - Joi validation schema
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message.replace(/"/g, ""),
      }));

      return ApiResponse.error(res, "Validation failed", 400, errors);
    }

    next();
  };
};

module.exports = validate;
