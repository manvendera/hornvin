// ─────────────────────────────────────────────────────────
//  middleware/activityLogger.js — Audit Logging Middleware
// ─────────────────────────────────────────────────────────
const AuditLog = require("../models/AuditLog");

const activityLogger = async (req, res, next) => {
  const originalSend = res.send;

  res.send = function (data) {
    res.on("finish", async () => {
      try {
        if (req.user && req.method !== "GET") {
          await AuditLog.create({
            user: req.user._id,
            action: `${req.method} ${req.originalUrl}`,
            details: {
              body: req.body,
              params: req.params,
              query: req.query,
              statusCode: res.statusCode,
            },
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.headers["user-agent"],
          });
        }
      } catch (error) {
        console.error("❌ Activity Logger Error:", error);
      }
    });
    originalSend.call(this, data);
  };

  next();
};

module.exports = activityLogger;
