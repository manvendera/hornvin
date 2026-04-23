// ─────────────────────────────────────────────────────────
//  controllers/auditController.js — Audit Log APIs
// ─────────────────────────────────────────────────────────
const AuditLog = require("../models/AuditLog");
const ApiResponse = require("../utils/ApiResponse");

// GET /api/admin/audit-logs
exports.getAuditLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const { action, entity, userId, dateFrom, dateTo } = req.query;

    // ─── Filter Building ──────────────────────────────────
    const filter = {};
    if (action) filter.action = action;
    if (entity) filter.entity = entity;
    if (userId) filter.user = userId;

    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate("user", "name email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      AuditLog.countDocuments(filter),
    ]);

    return ApiResponse.success(res, "Audit logs retrieved", {
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

// GET /api/admin/audit-logs/:id
exports.getAuditLogById = async (req, res) => {
  try {
    const log = await AuditLog.findById(req.params.id).populate(
      "user",
      "name email role"
    );

    if (!log) {
      return ApiResponse.notFound(res, "Audit log not found");
    }

    return ApiResponse.success(res, "Audit log details retrieved", { log });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};
