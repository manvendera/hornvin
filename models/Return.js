// ─────────────────────────────────────────────────────────
//  models/Return.js — Return & Refund Schema
// ─────────────────────────────────────────────────────────
const mongoose = require("mongoose");

const returnSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: Number,
        reason: String,
      },
    ],
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "received", "refunded"],
      default: "pending",
    },
    refundStatus: {
      type: String,
      enum: ["not_initiated", "pending", "completed", "failed"],
      default: "not_initiated",
    },
    refundAmount: Number,
    pickupAddress: Object,
    images: [String],
    adminNote: String,
    distributorNote: String,
    processedAt: Date,
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

returnSchema.index({ order: 1 });
returnSchema.index({ user: 1 });
returnSchema.index({ status: 1 });

module.exports = mongoose.model("Return", returnSchema);
