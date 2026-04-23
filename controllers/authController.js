// ─────────────────────────────────────────────────────────
//  controllers/authController.js — Authentication Logic
// ─────────────────────────────────────────────────────────
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ApiResponse = require("../utils/ApiResponse");
const {
  generateAccessToken,
  generateRefreshToken,
  setRefreshTokenCookie,
} = require("../utils/generateToken");
const {
  sendVerificationOTP,
  sendPasswordResetEmail,
} = require("../utils/sendEmail");

// ═════════════════════════════════════════════════════════
//  POST /api/auth/register
// ═════════════════════════════════════════════════════════
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return ApiResponse.error(
        res,
        "An account with this email already exists",
        409
      );
    }

    // Create user
    const user = await User.create({ name, email, password });

    // Generate OTP for email verification
    const otp = user.generateEmailOTP();
    await user.save({ validateBeforeSave: false });

    // Send verification email
    await sendVerificationOTP(email, name, otp);

    return res.status(201).json({
      success: true,
      message: "User registered successfully. Please verify email.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return ApiResponse.serverError(res, error.message);
  }
};

// ═════════════════════════════════════════════════════════
//  POST /api/auth/verify-email
// ═════════════════════════════════════════════════════════
exports.verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return ApiResponse.notFound(res, "User not found");
    }

    if (user.isEmailVerified) {
      return ApiResponse.error(res, "Email is already verified");
    }

    // Check OTP expiry
    if (!user.emailVerificationOTPExpires || user.emailVerificationOTPExpires < Date.now()) {
      return ApiResponse.error(res, "OTP has expired. Please request a new one.");
    }

    // Hash the provided OTP and compare
    const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");

    if (hashedOTP !== user.emailVerificationOTP) {
      return ApiResponse.error(res, "Invalid OTP");
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.emailVerificationOTP = undefined;
    user.emailVerificationOTPExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      message: "Email verified successfully"
    });
  } catch (error) {
    console.error("Verify email error:", error);
    return ApiResponse.serverError(res, error.message);
  }
};

// ═════════════════════════════════════════════════════════
//  POST /api/auth/resend-otp
// ═════════════════════════════════════════════════════════
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return ApiResponse.notFound(res, "User not found");
    }

    if (user.isEmailVerified) {
      return ApiResponse.error(res, "Email is already verified");
    }

    // Generate new OTP
    const otp = user.generateEmailOTP();
    await user.save({ validateBeforeSave: false });

    // Send OTP
    await sendVerificationOTP(email, user.name, otp);

    return ApiResponse.success(res, "A new OTP has been sent to your email.");
  } catch (error) {
    console.error("Resend OTP error:", error);
    return ApiResponse.serverError(res, error.message);
  }
};

// ═════════════════════════════════════════════════════════
//  POST /api/auth/login
// ═════════════════════════════════════════════════════════
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and explicitly include password
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return ApiResponse.unauthorized(res, "Invalid email or password");
    }

    // Check if account is active
    if (!user.isActive) {
      return ApiResponse.unauthorized(
        res,
        "Your account has been deactivated. Contact support."
      );
    }

    // Check if account is locked
    if (user.isLocked()) {
      return ApiResponse.error(
        res,
        "Account is temporarily locked due to too many failed login attempts. Try again in 30 minutes.",
        423
      );
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incrementLoginAttempts();
      return ApiResponse.unauthorized(res, "Invalid email or password");
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return ApiResponse.error(
        res,
        "Please verify your email before logging in. Check your inbox for the OTP.",
        403
      );
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      user.loginAttempts = 0;
      user.lockUntil = undefined;
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    // Store refresh token in DB
    user.refreshTokens.push({ token: refreshToken });

    // Keep only last 5 refresh tokens (max 5 devices)
    if (user.refreshTokens.length > 5) {
      user.refreshTokens = user.refreshTokens.slice(-5);
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Set refresh token as HTTP-only cookie
    setRefreshTokenCookie(res, refreshToken);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token: accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    return ApiResponse.serverError(res, error.message);
  }
};

// ═════════════════════════════════════════════════════════
//  POST /api/auth/refresh-token
// ═════════════════════════════════════════════════════════
exports.refreshToken = async (req, res) => {
  try {
    // Get refresh token from cookie or body
    const token = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!token) {
      return ApiResponse.unauthorized(res, "Refresh token not provided");
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      return ApiResponse.unauthorized(res, "Invalid or expired refresh token");
    }

    // Find user and check if this refresh token exists
    const user = await User.findOne({
      _id: decoded.id,
      "refreshTokens.token": token,
    });

    if (!user) {
      // Possible token reuse attack — clear all refresh tokens
      await User.findByIdAndUpdate(decoded.id, {
        $set: { refreshTokens: [] },
      });
      return ApiResponse.unauthorized(
        res,
        "Invalid refresh token — all sessions have been terminated for security"
      );
    }

    // Remove old refresh token
    user.refreshTokens = user.refreshTokens.filter((rt) => rt.token !== token);

    // Generate new tokens
    const newAccessToken = generateAccessToken(user._id, user.role);
    const newRefreshToken = generateRefreshToken(user._id);

    // Store new refresh token
    user.refreshTokens.push({ token: newRefreshToken });
    await user.save({ validateBeforeSave: false });

    // Set new refresh token cookie
    setRefreshTokenCookie(res, newRefreshToken);

    return ApiResponse.success(res, "Token refreshed successfully", {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    return ApiResponse.serverError(res, error.message);
  }
};

// ═════════════════════════════════════════════════════════
//  POST /api/auth/logout
// ═════════════════════════════════════════════════════════
exports.logout = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;

    if (token) {
      // Remove this specific refresh token
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { refreshTokens: { token } },
      });
    }

    // Clear the cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/auth/refresh-token",
    });

    return ApiResponse.success(res, "Logged out successfully");
  } catch (error) {
    console.error("Logout error:", error);
    return ApiResponse.serverError(res, error.message);
  }
};

// ═════════════════════════════════════════════════════════
//  POST /api/auth/logout-all
// ═════════════════════════════════════════════════════════
exports.logoutAll = async (req, res) => {
  try {
    // Clear ALL refresh tokens (logout from all devices)
    await User.findByIdAndUpdate(req.user._id, {
      $set: { refreshTokens: [] },
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/auth/refresh-token",
    });

    return ApiResponse.success(res, "Logged out from all devices successfully");
  } catch (error) {
    console.error("Logout all error:", error);
    return ApiResponse.serverError(res, error.message);
  }
};

// ═════════════════════════════════════════════════════════
//  POST /api/auth/forgot-password
// ═════════════════════════════════════════════════════════
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists — always return success
      return res.status(200).json({
        success: true,
        message: "Password reset link sent"
      });
    }

    // Generate reset token
    const resetToken = user.generateResetToken();
    await user.save({ validateBeforeSave: false });

    // Build reset URL
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // Send email
    const result = await sendPasswordResetEmail(email, user.name, resetUrl);

    if (!result.success) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return ApiResponse.serverError(
        res,
        "Failed to send password reset email. Please try again."
      );
    }

    return res.status(200).json({
      success: true,
      message: "Password reset link sent"
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return ApiResponse.serverError(res, error.message);
  }
};

// ═════════════════════════════════════════════════════════
//  POST /api/auth/reset-password/:token
// ═════════════════════════════════════════════════════════
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Hash the token from URL
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return ApiResponse.error(
        res,
        "Invalid or expired password reset token",
        400
      );
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    // Invalidate all refresh tokens (force re-login)
    user.refreshTokens = [];

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successful"
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return ApiResponse.serverError(res, error.message);
  }
};

// ═════════════════════════════════════════════════════════
//  PUT /api/auth/change-password (Protected)
// ═════════════════════════════════════════════════════════
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select("+password");

    // Verify current password
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return ApiResponse.error(res, "Current password is incorrect");
    }

    // Update password
    user.password = newPassword;

    // Invalidate all other refresh tokens
    user.refreshTokens = [];
    await user.save();

    // Generate new tokens for current session
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshTokens.push({ token: refreshToken });
    await user.save({ validateBeforeSave: false });

    setRefreshTokenCookie(res, refreshToken);

    return ApiResponse.success(res, "Password changed successfully", {
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Change password error:", error);
    return ApiResponse.serverError(res, error.message);
  }
};

// ═════════════════════════════════════════════════════════
//  GET /api/auth/me (Protected)
// ═════════════════════════════════════════════════════════
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      }
    });
  } catch (error) {
    console.error("Get me error:", error);
    return ApiResponse.serverError(res, error.message);
  }
};

// ═════════════════════════════════════════════════════════
//  PUT /api/auth/update-profile (Protected)
// ═════════════════════════════════════════════════════════
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const updates = {};

    if (name) updates.name = name;

    if (email && email !== req.user.email) {
      // Check if new email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return ApiResponse.error(res, "This email is already in use", 409);
      }
      updates.email = email;
      updates.isEmailVerified = false; // require re-verification
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    // If email changed, send new verification OTP
    if (updates.email) {
      const otp = user.generateEmailOTP();
      await user.save({ validateBeforeSave: false });
      await sendVerificationOTP(user.email, user.name, otp);
    }

    return ApiResponse.success(res, "Profile updated successfully", {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return ApiResponse.serverError(res, error.message);
  }
};
