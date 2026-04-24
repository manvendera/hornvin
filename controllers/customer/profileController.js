// ─────────────────────────────────────────────────────────
//  controllers/customer/profileController.js — Customer Profile
// ─────────────────────────────────────────────────────────
const User = require("../../models/User");
const ApiResponse = require("../../utils/ApiResponse");

/**
 * GET /api/customer/profile
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password -refreshTokens");
    return ApiResponse.success(res, "Profile retrieved", { user });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

/**
 * POST /api/customer/addresses
 */
exports.addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { name, phone, street, city, state, pincode, country, isDefault } = req.body;

    if (isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    user.addresses.push({ name, phone, street, city, state, pincode, country, isDefault });
    await user.save();

    return ApiResponse.success(res, "Address added successfully", { addresses: user.addresses });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

/**
 * DELETE /api/customer/addresses/:id
 */
exports.deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses = user.addresses.filter(addr => addr._id.toString() !== req.params.id);
    await user.save();
    return ApiResponse.success(res, "Address deleted successfully", { addresses: user.addresses });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};
