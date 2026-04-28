const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const garageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    role: {
      type: String,
      default: "garage",
      immutable: true,
    },
    businessName: {
      type: String,
      required: [true, "Business Name is required"],
      trim: true,
    },
    businessAddress: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: "India" },
      location: {
        type: {
          type: String,
          enum: ["Point"],
        },
        coordinates: {
          type: [Number],
        },
      },
    },
    garageType: {
      type: String,
      enum: ["authorized", "independent", "multi-brand"],
      required: [true, "Garage Type is required"],
    },
    gstNumber: String,
    panNumber: String,
    servicesOffered: [String],
    operatingHours: [
      {
        day: { type: String, enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] },
        open: String,
        close: String,
        isClosed: { type: Boolean, default: false },
      },
    ],
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: Date,
  },
  {
    timestamps: true,
  }
);

// Geo-spatial index
garageSchema.index({ "businessAddress.location": "2dsphere" });

// Pre-save: Hash password and sanitize location
garageSchema.pre("save", async function (next) {
  // Hash password
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  }

  // Sanitize location
  if (this.businessAddress && this.businessAddress.location) {
    const loc = this.businessAddress.location;
    if (!loc.coordinates || loc.coordinates.length < 2) {
      // If coordinates are missing or incomplete, remove the location object
      // so it doesn't trigger 2dsphere index errors
      this.businessAddress.location = undefined;
    } else {
      // Ensure type is set if coordinates exist
      loc.type = "Point";
    }
  }

  next();
});

// Compare password
garageSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("Garage", garageSchema);
