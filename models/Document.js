// ─────────────────────────────────────────────────────────
//  models/Document.js — Invoices, KYC, and Receipts
// ─────────────────────────────────────────────────────────
const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["invoice", "kyc_pan", "kyc_gst", "receipt", "other"],
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileKey: String, // Supabase storage key
    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    metadata: {
      orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
      fileSize: Number,
      fileType: String,
    },
    verifiedAt: Date,
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

documentSchema.index({ owner: 1 });
documentSchema.index({ type: 1 });

module.exports = mongoose.model("Document", documentSchema);
