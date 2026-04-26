// ─────────────────────────────────────────────────────────
//  services/auditService.js — Audit Logging Service
// ─────────────────────────────────────────────────────────
const AuditLog = require("../models/AuditLog");

/**
 * Log an admin action
 */
const logAction = async (req, { action, entity, entityId, details }) => {
  try {
    await AuditLog.create({
      action,
      entity,
      entityId,
      performedBy: req.user._id,
      details,
      ipAddress: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers["user-agent"],
    });
  } catch (error) {
    console.error("Audit log error:", error.message);
  }
};

module.exports = { logAction };
