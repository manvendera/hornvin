// ─────────────────────────────────────────────────────────
//  models/Inventory.js — Inventory Allocation Schema
// ─────────────────────────────────────────────────────────
const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product is required"],
    },

    // ─── Global Stock ────────────────────────────────
    globalStock: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Stock cannot be negative"],
    },
    allocatedStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    availableStock: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ─── Distributor Allocations ─────────────────────
    allocations: [
      {
        distributor: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, "Allocation quantity must be at least 1"],
        },
        allocatedAt: {
          type: Date,
          default: Date.now,
        },
        allocatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],

    // ─── Stock History ───────────────────────────────
    history: [
      {
        type: {
          type: String,
          enum: ["restock", "allocation", "deallocation", "sale", "return", "adjustment"],
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        previousStock: Number,
        newStock: Number,
        reference: String,
        performedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        performedAt: {
          type: Date,
          default: Date.now,
        },
        note: String,
      },
    ],

    // ─── Alerts ──────────────────────────────────────
    lowStockThreshold: {
      type: Number,
      default: 10,
    },
    isLowStock: {
      type: Boolean,
      default: false,
    },
    lastRestocked: Date,
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ────────────────────────────────────────────
inventorySchema.index({ product: 1 }, { unique: true });
inventorySchema.index({ isLowStock: 1 });
inventorySchema.index({ "allocations.distributor": 1 });

// ─── Pre-save: calculate available stock & low-stock ────
inventorySchema.pre("save", function (next) {
  this.availableStock = this.globalStock - this.allocatedStock;
  this.isLowStock = this.availableStock <= this.lowStockThreshold;
  next();
});

module.exports = mongoose.model("Inventory", inventorySchema);
