// ─────────────────────────────────────────────────────────
//  models/Notification.js — Notification Schema
// ─────────────────────────────────────────────────────────
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      maxlength: [1000, "Message cannot exceed 1000 characters"],
    },
    type: {
      type: String,
      enum: ["broadcast", "targeted", "system"],
      default: "broadcast",
    },
    targetRoles: [{
      type: String,
      enum: ["admin", "distributor", "garage", "customer"],
    }],
    targetUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    readBy: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      readAt: { type: Date, default: Date.now },
    }],
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    actionUrl: String,
    isActive: { type: Boolean, default: true },
    expiresAt: Date,
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ targetRoles: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
