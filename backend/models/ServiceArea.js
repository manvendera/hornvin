// ─────────────────────────────────────────────────────────
//  models/ServiceArea.js — Delivery Zones & Service Areas
// ─────────────────────────────────────────────────────────
const mongoose = require("mongoose");

const serviceAreaSchema = new mongoose.Schema(
  {
    distributor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    pincodes: [
      {
        type: String,
        required: true,
      },
    ],
    city: String,
    state: String,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

serviceAreaSchema.index({ distributor: 1 });
serviceAreaSchema.index({ pincodes: 1 });

module.exports = mongoose.model("ServiceArea", serviceAreaSchema);
