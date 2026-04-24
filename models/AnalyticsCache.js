// ─────────────────────────────────────────────────────────
//  models/AnalyticsCache.js — Cached Analytics for Dashboard
// ─────────────────────────────────────────────────────────
const mongoose = require("mongoose");

const analyticsCacheSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["distributor_dashboard", "global_admin"],
      required: true,
    },
    distributor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    period: {
      type: String,
      default: "daily",
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

analyticsCacheSchema.index({ type: 1, distributor: 1 });
analyticsCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("AnalyticsCache", analyticsCacheSchema);
