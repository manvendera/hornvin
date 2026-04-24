// ─────────────────────────────────────────────────────────
//  models/Staff.js — Garage Staff Management
// ─────────────────────────────────────────────────────────
const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema(
  {
    garage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Garage",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["mechanic", "manager", "receptionist", "admin"],
      default: "mechanic",
    },
    specialization: [String],
    salary: Number,
    joiningDate: Date,
    isActive: { type: Boolean, default: true },
    attendance: [
      {
        date: Date,
        status: { type: String, enum: ["present", "absent", "leave"] },
      }
    ]
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Staff", staffSchema);
