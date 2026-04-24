// ─────────────────────────────────────────────────────────
//  controllers/garage/profileController.js
// ─────────────────────────────────────────────────────────
const Garage = require("../../models/Garage");
const Staff = require("../../models/Staff");
const User = require("../../models/User");
const ApiResponse = require("../../utils/ApiResponse");

/**
 * GET /api/garage/profile
 */
exports.getProfile = async (req, res) => {
  try {
    const garage = await Garage.findOne({ owner: req.user._id }).populate("owner", "name email role");
    if (!garage) return ApiResponse.notFound(res, "Garage profile not found");
    return ApiResponse.success(res, "Garage profile retrieved", { garage });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

/**
 * PATCH /api/garage/profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const { businessName, servicesOffered, workingHours, address, gstDetails } = req.body;
    
    let garage = await Garage.findOne({ owner: req.user._id });
    if (!garage) {
      garage = new Garage({ owner: req.user._id, businessName });
    }

    if (businessName) garage.businessName = businessName;
    if (servicesOffered) garage.servicesOffered = servicesOffered;
    if (workingHours) garage.workingHours = workingHours;
    if (address) garage.address = address;
    if (gstDetails) {
      garage.gstNumber = gstDetails.gstNumber;
      garage.panNumber = gstDetails.panNumber;
    }

    await garage.save();
    return ApiResponse.success(res, "Profile updated successfully", { garage });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

/**
 * POST /api/garage/kyc
 */
exports.uploadKYC = async (req, res) => {
  try {
    const { docType, fileUrl } = req.body;
    const garage = await Garage.findOne({ owner: req.user._id });
    if (!garage) return ApiResponse.notFound(res, "Garage profile not found");

    garage.kycDocuments.push({ docType, fileUrl });
    garage.kycStatus = "pending";
    await garage.save();

    return ApiResponse.success(res, "KYC documents uploaded. Verification pending.", { garage });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

/**
 * POST /api/garage/staff
 */
exports.addStaff = async (req, res) => {
  try {
    const { name, email, phone, role, specialization, salary } = req.body;
    const garage = await Garage.findOne({ owner: req.user._id });
    if (!garage) return ApiResponse.notFound(res, "Garage profile not found");

    // 1. Check if user already exists or create new placeholder user
    let user = await User.findOne({ email });
    if (!user) {
      // Create new user with a temporary password
      const tempPassword = `Hornvin@${Math.floor(1000 + Math.random() * 9000)}`;
      user = await User.create({ 
        name, 
        email, 
        phone, 
        password: tempPassword,
        role: "garage", 
        isActive: true,
        isEmailVerified: true // assume verified if added by owner
      });
      // Note: In production, send an email to staff with their tempPassword
    }

    const staff = await Staff.create({
      garage: garage._id,
      user: user._id,
      role,
      specialization,
      salary,
      joiningDate: new Date()
    });

    return ApiResponse.created(res, "Staff added successfully", { staff });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

/**
 * GET /api/garage/staff
 */
exports.listStaff = async (req, res) => {
  try {
    const garage = await Garage.findOne({ owner: req.user._id });
    if (!garage) return ApiResponse.notFound(res, "Garage profile not found");

    const staff = await Staff.find({ garage: garage._id, isActive: true }).populate("user", "name email phone");
    return ApiResponse.success(res, "Staff list retrieved", { staff });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};
