// ─────────────────────────────────────────────────────────
//  models/GarageInventory.js — Internal Garage Stock
// ─────────────────────────────────────────────────────────
const mongoose = require("mongoose");

const garageInventorySchema = new mongoose.Schema(
  {
    garage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Garage",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product", // If linked to main catalog
    },
    itemName: { type: String, required: true },
    sku: String,
    category: String,
    quantity: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    unitPrice: Number,
    lastSuppliedBy: String,
    location: String, // Shelf/Rack inside garage
  },
  {
    timestamps: true,
  }
);

// Index for quick search within a garage
garageInventorySchema.index({ garage: 1, itemName: 1 });

module.exports = mongoose.model("GarageInventory", garageInventorySchema);
