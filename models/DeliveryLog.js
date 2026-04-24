// ─────────────────────────────────────────────────────────
//  models/DeliveryLog.js — Logistics & Delivery Tracking
// ─────────────────────────────────────────────────────────
const mongoose = require("mongoose");

const deliveryLogSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Can be a dedicated agent or the distributor themselves
    },
    status: {
      type: String,
      enum: ["assigned", "picked_up", "in_transit", "delivered", "failed"],
      default: "assigned",
    },
    location: {
      lat: Number,
      lng: Number,
      address: String,
    },
    otp: String,
    isOtpVerified: {
      type: Boolean,
      default: false,
    },
    proofImage: String,
    signatureImage: String,
    failReason: String,
    estimatedDelivery: Date,
    actualDelivery: Date,
    updates: [
      {
        status: String,
        location: String,
        timestamp: { type: Date, default: Date.now },
        note: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

deliveryLogSchema.index({ order: 1 });
deliveryLogSchema.index({ agent: 1 });
deliveryLogSchema.index({ status: 1 });

module.exports = mongoose.model("DeliveryLog", deliveryLogSchema);
