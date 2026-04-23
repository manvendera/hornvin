// ─────────────────────────────────────────────────────────
//  routes/authRoutes.js — Authentication Routes
// ─────────────────────────────────────────────────────────
const express = require("express");
const router = express.Router();

const {
  register,
  verifyEmail,
  resendOTP,
  login,
  refreshToken,
  logout,
  logoutAll,
  forgotPassword,
  resetPassword,
  changePassword,
  getMe,
  updateProfile,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");
const { requireVerified } = require("../middleware/roleMiddleware");
const validate = require("../middleware/validate");
const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyOTPSchema,
  changePasswordSchema,
} = require("../utils/validators");

// ─── Public Routes ──────────────────────────────────────
router.post("/signup", validate(registerSchema), register);
router.post("/verify-email", validate(verifyOTPSchema), verifyEmail);
router.post("/resend-otp", resendOTP);
router.post("/login", validate(loginSchema), login);
router.post("/refresh-token", refreshToken);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);

// ─── Protected Routes ───────────────────────────────────
router.post("/logout", protect, logout);
router.post("/logout-all", protect, logoutAll);
router.put("/change-password", protect, validate(changePasswordSchema), changePassword);
router.get("/profile", protect, getMe);
router.put("/update-profile", protect, updateProfile);

module.exports = router;
