// ─────────────────────────────────────────────────────────
//  routes/authRoutes.js — Authentication Routes
// ─────────────────────────────────────────────────────────
const express = require("express");
const router = express.Router();

const registerCtrl = require("../controllers/auth/registerController");
const loginCtrl = require("../controllers/auth/loginController");
const passwordCtrl = require("../controllers/auth/passwordController");
const profileCtrl = require("../controllers/auth/profileController");

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
router.post("/signup", validate(registerSchema), registerCtrl.register);
router.post("/register", validate(registerSchema), registerCtrl.register);
router.post("/signup/garage", registerCtrl.registerGarage); // Add specific garage register
router.post("/verify-email", validate(verifyOTPSchema), registerCtrl.verifyEmail);
router.post("/resend-otp", registerCtrl.resendOTP);
router.post("/login", validate(loginSchema), loginCtrl.login);
router.post("/refresh-token", loginCtrl.refreshToken);
router.post("/forgot-password", validate(forgotPasswordSchema), passwordCtrl.forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), passwordCtrl.resetPassword);

// ─── Protected Routes ───────────────────────────────────
router.post("/logout", protect, loginCtrl.logout);
router.post("/logout-all", protect, loginCtrl.logoutAll);
router.put("/change-password", protect, validate(changePasswordSchema), passwordCtrl.changePassword);
router.get("/profile", protect, profileCtrl.getMe);
router.put("/update-profile", protect, profileCtrl.updateProfile);

module.exports = router;
