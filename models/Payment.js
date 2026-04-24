// ─────────────────────────────────────────────────────────
//  models/Payment.js — Payment Schema
// ─────────────────────────────────────────────────────────
const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
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
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "upi", "card", "netbanking", "wallet"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "captured", "failed", "refunded"],
      default: "pending",
    },
    transactionId: String,
    paymentGateway: String,
    metadata: Object,
    paidAt: Date,
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ order: 1 });
paymentSchema.index({ user: 1 });
paymentSchema.index({ paymentStatus: 1 });

module.exports = mongoose.model("Payment", paymentSchema);
