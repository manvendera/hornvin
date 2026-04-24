const crypto = require("crypto");
const User = require("../../models/User");
const ApiResponse = require("../../utils/ApiResponse");
const { sendPasswordResetEmail } = require("../../utils/sendEmail");
const {
  generateAccessToken,
  generateRefreshToken,
  setRefreshTokenCookie,
} = require("../../utils/generateToken");

// ═════════════════════════════════════════════════════════
//  POST /api/v1/auth/forgot-password
// ═════════════════════════════════════════════════════════
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({ success: true, message: "If account exists, reset link sent" });
    }

    const resetToken = user.generateResetToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    const result = await sendPasswordResetEmail(email, user.name, resetUrl);

    if (!result.success) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return ApiResponse.serverError(res, "Email sending failed");
    }

    return ApiResponse.success(res, "Password reset link sent");
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

// ═════════════════════════════════════════════════════════
//  POST /api/v1/auth/reset-password
// ═════════════════════════════════════════════════════════
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return ApiResponse.error(res, "Invalid or expired token", 400);

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.refreshTokens = [];
    await user.save();

    return ApiResponse.success(res, "Password reset successful");
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

// ═════════════════════════════════════════════════════════
//  PUT /api/v1/auth/change-password (Protected)
// ═════════════════════════════════════════════════════════
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select("+password");

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) return ApiResponse.error(res, "Current password incorrect");

    user.password = newPassword;
    user.refreshTokens = [];
    await user.save();

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshTokens.push({ token: refreshToken });
    await user.save({ validateBeforeSave: false });

    setRefreshTokenCookie(res, refreshToken);

    return ApiResponse.success(res, "Password changed successfully", { accessToken, refreshToken });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};
