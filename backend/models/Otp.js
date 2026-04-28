const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const otpSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    trim: true,
  },
  otp: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "distributor", "customer", "garage"],
    required: true,
  },
  attempts: {
    type: Number,
    default: 0,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: '5m' } // Automatically delete document after 5 minutes
  }
}, { timestamps: true });

// Hash OTP before saving
otpSchema.pre("save", async function(next) {
  if (!this.isModified("otp")) return next();
  const salt = await bcrypt.genSalt(10);
  this.otp = await bcrypt.hash(this.otp, salt);
  next();
});

// Method to verify OTP
otpSchema.methods.compareOTP = async function(candidateOTP) {
  return await bcrypt.compare(candidateOTP, this.otp);
};

module.exports = mongoose.model("Otp", otpSchema);
