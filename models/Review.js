// ─────────────────────────────────────────────────────────
//  models/Review.js — Product Reviews & Ratings Schema
// ─────────────────────────────────────────────────────────
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    images: [String],
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent multiple reviews from same user for same product
reviewSchema.index({ product: 1, customer: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
