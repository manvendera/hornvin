const User = require("../../models/User");
const ApiResponse = require("../../utils/ApiResponse");
const { sendVerificationOTP } = require("../../utils/sendEmail");

// ═════════════════════════════════════════════════════════
//  GET /api/v1/auth/me (Protected)
// ═════════════════════════════════════════════════════════
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    return res.status(200).json({ success: true, user });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

// ═════════════════════════════════════════════════════════
//  PUT /api/v1/auth/update-profile (Protected)
// ═════════════════════════════════════════════════════════
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, phoneNumber } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (phoneNumber) updates.phoneNumber = phoneNumber;

    if (email && email !== req.user.email) {
      const exists = await User.findOne({ email });
      if (exists) return ApiResponse.error(res, "Email already in use", 409);
      updates.email = email;
      updates.isEmailVerified = false;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    if (updates.email) {
      const otp = user.generateEmailOTP();
      await user.save({ validateBeforeSave: false });
      await sendVerificationOTP(user.email, user.name, otp);
    }

    return ApiResponse.success(res, "Profile updated successfully", { user });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

// ═════════════════════════════════════════════════════════
//  POST /api/v1/auth/upload-avatar (Protected)
// ═════════════════════════════════════════════════════════
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return ApiResponse.error(res, "Please upload an image file", 400);
    }

    // Generate URL (assuming base URL + uploads path)
    const avatarUrl = `${req.protocol}://${req.get("host")}/uploads/avatars/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarUrl },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Avatar uploaded successfully",
      url: avatarUrl,
      user
    });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};
