// ─────────────────────────────────────────────────────────
//  models/AuditLog.js — Audit Log Schema
// ─────────────────────────────────────────────────────────
const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        "CREATE", "UPDATE", "DELETE", "LOGIN", "LOGOUT",
        "APPROVE", "REJECT", "ASSIGN", "REFUND", "BULK_UPLOAD",
        "STATUS_CHANGE", "ALLOCATE", "NOTIFICATION_SENT",
      ],
    },
    entity: {
      type: String,
      required: true,
      enum: [
        "User", "Product", "Category", "Order",
        "Inventory", "Notification", "Invoice",
      ],
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
    },
    ipAddress: String,
    userAgent: String,
  },
  { timestamps: true }
);

auditLogSchema.index({ performedBy: 1 });
auditLogSchema.index({ entity: 1, entityId: 1 });
auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
