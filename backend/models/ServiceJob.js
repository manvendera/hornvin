// ─────────────────────────────────────────────────────────
//  models/ServiceJob.js — Service Appointments & Jobs
// ─────────────────────────────────────────────────────────
const mongoose = require("mongoose");

const serviceJobSchema = new mongoose.Schema(
  {
    garage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Garage",
      required: true,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },
    assignedStaff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
    },
    serviceType: {
      type: String,
      required: true,
      enum: ["general_service", "repair", "body_work", "inspection", "emergency"],
    },
    status: {
      type: String,
      enum: ["scheduled", "received", "in_progress", "quality_check", "ready", "delivered", "cancelled"],
      default: "scheduled",
    },
    scheduledDate: { type: Date, required: true },
    complaints: [String],
    estimatedCost: Number,
    actualCost: Number,
    partsUsed: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: String,
        quantity: Number,
        price: Number,
      }
    ],
    jobCard: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobCard",
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ServiceJob", serviceJobSchema);
