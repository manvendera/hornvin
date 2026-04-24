// ─────────────────────────────────────────────────────────
//  models/Garage.js — Garage Profile Schema
// ─────────────────────────────────────────────────────────
const mongoose = require("mongoose");

const garageSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    businessName: {
      type: String,
      required: true,
      trim: true,
    },
    gstNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    panNumber: String,
    contactEmail: String,
    contactPhone: String,
    
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      location: {
        type: { type: String, default: "Point" },
        coordinates: [Number], // [longitude, latitude]
      },
    },

    servicesOffered: [String],
    workingHours: [
      {
        day: { type: String, enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] },
        open: String,
        close: String,
        isClosed: { type: Boolean, default: false },
      },
    ],
    
    kycStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    kycDocuments: [
      {
        docType: String,
        fileUrl: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    
    serviceAreas: [
      {
        name: String,
        pincode: String,
        radius: Number, // in KM
      }
    ]
  },
  {
    timestamps: true,
  }
);

// Geo-spatial index for location-based search
garageSchema.index({ "address.location": "2dsphere" });

module.exports = mongoose.model("Garage", garageSchema);
