// ─────────────────────────────────────────────────────────
//  models/Vehicle.js — Customer Vehicles for Service
// ─────────────────────────────────────────────────────────
const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    garage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Garage",
      required: true,
    },
    ownerName: { type: String, required: true },
    ownerPhone: { type: String, required: true },
    registrationNumber: { type: String, required: true, uppercase: true, trim: true },
    make: String,
    model: String,
    year: Number,
    fuelType: { type: String, enum: ["petrol", "diesel", "cng", "electric"] },
    chassisNumber: String,
    engineNumber: String,
    odometerReading: Number,
    lastServiceDate: Date,
    insuranceExpiry: Date,
    documents: [
      {
        name: String,
        fileUrl: String,
      }
    ]
  },
  {
    timestamps: true,
  }
);

// Unique registration number per garage (or globally)
vehicleSchema.index({ registrationNumber: 1 }, { unique: true });

module.exports = mongoose.model("Vehicle", vehicleSchema);
