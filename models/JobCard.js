// ─────────────────────────────────────────────────────────
//  models/JobCard.js — Detailed Service Reports
// ─────────────────────────────────────────────────────────
const mongoose = require("mongoose");

const jobCardSchema = new mongoose.Schema(
  {
    jobNumber: {
      type: String,
      unique: true,
      required: true,
    },
    serviceJob: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceJob",
      required: true,
    },
    garage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Garage",
      required: true,
    },
    inspectionDetails: {
      exterior: String,
      interior: String,
      engine: String,
      brakes: String,
      tyres: String,
    },
    workDone: [
      {
        description: String,
        labourCost: Number,
      }
    ],
    inventoryUsed: [
      {
        item: { type: mongoose.Schema.Types.ObjectId, ref: "GarageInventory" },
        quantity: Number,
        price: Number,
      }
    ],
    customerApprovalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    images: [String], // Photos before/after service
    totalAmount: Number,
    isCompleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("JobCard", jobCardSchema);
