// ─────────────────────────────────────────────────────────
//  models/Order.js — Order Schema
// ─────────────────────────────────────────────────────────
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: { type: String, required: true },
    sku: String,
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
    },
    price: {
      type: Number,
      required: true,
    },
    gstRate: {
      type: Number,
      default: 18,
    },
    gstAmount: {
      type: Number,
      default: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
    },

    // ─── Customer ────────────────────────────────────
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Customer is required"],
    },

    // ─── Items ───────────────────────────────────────
    items: [orderItemSchema],

    // ─── Pricing ─────────────────────────────────────
    subtotal: {
      type: Number,
      required: true,
    },
    totalGst: {
      type: Number,
      default: 0,
    },
    shippingCost: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },

    // ─── Shipping Address ────────────────────────────
    shippingAddress: {
      name: String,
      phone: String,
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      country: { type: String, default: "India" },
    },

    // ─── Status ──────────────────────────────────────
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "returned",
        "refunded",
      ],
      default: "pending",
    },
    statusHistory: [
      {
        status: String,
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        note: String,
      },
    ],

    // ─── Payment ─────────────────────────────────────
    paymentMethod: {
      type: String,
      enum: ["cod", "upi", "card", "netbanking", "wallet"],
      default: "cod",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentId: String,

    // ─── Distributor Assignment ──────────────────────
    assignedDistributor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    assignedAt: Date,

    // ─── Garage (for service orders) ─────────────────
    assignedGarage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // ─── Refund ──────────────────────────────────────
    refund: {
      amount: Number,
      reason: String,
      processedAt: Date,
      processedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      status: {
        type: String,
        enum: ["pending", "processed", "rejected"],
      },
    },

    // ─── Invoice ─────────────────────────────────────
    invoiceNumber: String,
    invoiceGeneratedAt: Date,

    // ─── Tracking ────────────────────────────────────
    trackingNumber: String,
    trackingUrl: String,
    estimatedDelivery: Date,

    // ─── Notes ───────────────────────────────────────
    customerNotes: String,
    adminNotes: String,

    // ─── Soft Delete ─────────────────────────────────
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ────────────────────────────────────────────
orderSchema.index({ customer: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ assignedDistributor: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ paymentStatus: 1 });

// ─── Auto-generate order number ─────────────────────────
orderSchema.pre("save", function (next) {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = uuidv4().split("-")[0].toUpperCase();
    this.orderNumber = `ORD-${timestamp}-${random}`;
  }
  next();
});

// ─── Exclude soft-deleted ──────────────────────────────
orderSchema.pre(/^find/, function (next) {
  if (this.getOptions()._includeDeleted !== true) {
    this.where({ isDeleted: { $ne: true } });
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);
