// ─────────────────────────────────────────────────────────
//  models/User.js — User Schema & Model (Multi-Role)
// ─────────────────────────────────────────────────────────
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // never return password by default
    },
    phone: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      default: null,
    },

    // ─── Role System (4 Roles) ────────────────────────
    role: {
      type: String,
      enum: ["admin", "distributor", "garage", "customer"],
      default: "customer",
    },

    // ─── Business Profile (for distributors & garages) ─
    businessName: {
      type: String,
      trim: true,
    },
    businessAddress: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: "India" },
    },
    gstNumber: {
      type: String,
      trim: true,
    },
    panNumber: {
      type: String,
      trim: true,
    },

    // ─── Distributor-Specific Fields ──────────────────
    distributorRegion: {
      type: String,
      trim: true,
    },
    commissionRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // ─── Garage-Specific Fields ───────────────────────
    garageType: {
      type: String,
      enum: ["authorized", "independent", "multi-brand"],
    },
    servicesOffered: [String],
    operatingHours: {
      open: String,
      close: String,
    },

    // ─── Approval Workflow ────────────────────────────
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: Date,
    rejectionReason: String,

    // ─── Email Verification ─────────────────────────
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationOTP: String,
    emailVerificationOTPExpires: Date,

    // ─── Password Reset ─────────────────────────────
    resetPasswordToken: String,
    resetPasswordExpires: Date,

    // ─── Refresh Tokens (multiple device support) ───
    refreshTokens: [
      {
        token: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // ─── Account Status ─────────────────────────────
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    lastLogin: Date,
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: Date,
  },
  {
    timestamps: true, // createdAt & updatedAt
  }
);

// ─── Indexes for performance ────────────────────────────
userSchema.index({ "refreshTokens.token": 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ isDeleted: 1 });
userSchema.index({ approvalStatus: 1 });

// ─── Default query: exclude soft-deleted ────────────────
userSchema.pre(/^find/, function (next) {
  // Only apply if not explicitly querying deleted docs
  if (this.getOptions()._includeDeleted !== true) {
    this.where({ isDeleted: { $ne: true } });
  }
  next();
});

// ─── Pre-save: Hash password ────────────────────────────
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── Instance Methods ───────────────────────────────────

// Compare entered password with hashed password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate email verification OTP (6-digit)
userSchema.methods.generateEmailOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.emailVerificationOTP = crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");
  this.emailVerificationOTPExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return otp; // return plain OTP (to send via email)
};

// Generate password reset token
userSchema.methods.generateResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
  return resetToken; // return plain token (to send via email)
};

// Check if account is locked
userSchema.methods.isLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

// Increment login attempts
userSchema.methods.incrementLoginAttempts = async function () {
  // Reset if lock has expired
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }
  const updates = { $inc: { loginAttempts: 1 } };
  // Lock account after 5 failed attempts for 30 minutes
  if (this.loginAttempts + 1 >= 5) {
    updates.$set = { lockUntil: Date.now() + 30 * 60 * 1000 };
  }
  return this.updateOne(updates);
};

// Soft delete
userSchema.methods.softDelete = function (deletedById) {
  this.isDeleted = true;
  this.isActive = false;
  this.deletedAt = new Date();
  this.deletedBy = deletedById;
  this.refreshTokens = [];
  return this.save({ validateBeforeSave: false });
};

module.exports = mongoose.model("User", userSchema);
