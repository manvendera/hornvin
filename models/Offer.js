// ─────────────────────────────────────────────────────────
//  models/Offer.js — Promotions & Discount Coupons Schema
// ─────────────────────────────────────────────────────────
const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    code: {
      type: String,
      unique: true,
      uppercase: true,
      trim: true,
    },
    offerType: {
      type: String,
      enum: ["percentage", "fixed_amount", "buy_x_get_y", "free_shipping"],
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    minOrderAmount: {
      type: Number,
      default: 0,
    },
    maxDiscount: {
      type: Number, // for percentage offers
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    usageLimit: {
      type: Number, // total times this coupon can be used
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    applicableCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    applicableProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    bannerImage: String,
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Offer", offerSchema);
