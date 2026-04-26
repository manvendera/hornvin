// ─────────────────────────────────────────────────────────
//  controllers/distributor/profileController.js
// ─────────────────────────────────────────────────────────
const User = require("../../models/User");
const ApiResponse = require("../../utils/ApiResponse");

/**
 * GET /api/distributor/profile
 */
exports.getProfile = async (req, res) => {
  try {
    const profile = await User.findById(req.user._id).select("-password");
    return ApiResponse.success(res, "Profile fetched successfully", profile);
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

/**
 * PATCH /api/distributor/profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    
    // Prevent sensitive field updates directly
    delete updates.password;
    delete updates.role;
    delete updates.email;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    return ApiResponse.success(res, "Profile updated successfully", user);
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

/**
 * POST /api/distributor/kyc
 * Handle KYC document updates
 */
exports.submitKyc = async (req, res) => {
  try {
    const { gstNumber, panNumber, businessName, businessAddress } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 
        $set: { 
          gstNumber, 
          panNumber, 
          businessName, 
          businessAddress,
          approvalStatus: "pending" // Re-verify on KYC update
        } 
      },
      { new: true }
    ).select("-password");

    return ApiResponse.success(res, "KYC details submitted for verification", user);
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};
