// ─────────────────────────────────────────────────────────
//  services/auditService.js — Audit Logging Service
// ─────────────────────────────────────────────────────────
const AuditLog = require("../models/AuditLog");

/**
 * Log an admin action
 * @param {Object} req - Express request object
 * @param {Object} logData - Action details
 * @param {string} logData.action - Action performed (e.g., 'CREATE', 'LOGIN')
 * @param {string} logData.entity - Affected entity (e.g., 'Product', 'User')
 * @param {string} logData.entityId - ID of the affected entity
 * @param {Object} [logData.details] - Additional data
 * @param {string} [logData.userId] - Explicit user ID (optional, defaults to req.user._id)
 */
const logAction = async (req, { action, entity, entityId, details, userId }) => {
  try {
    const finalUserId = userId || req.user?._id;

    if (!finalUserId && action !== "LOGIN_FAILED") {
      // For some actions like failed login, we might not have a userId
      // but for most actions, we require it.
      // However, to avoid crashing, we just log a warning.
      console.warn(`Audit log skipped: No userId for action ${action}`);
      return;
    }

    await AuditLog.create({
      action,
      entity,
      entityId,
      user: finalUserId,
      details,
      ip: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers["user-agent"],
    });
  } catch (error) {
    console.error("Audit log error:", error.message);
  }
};

module.exports = { logAction };
