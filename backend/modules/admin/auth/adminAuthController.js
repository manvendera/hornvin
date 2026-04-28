const Admin = require("../../../models/Admin");
const { generateAccessToken } = require("../../../utils/generateToken");
const ApiResponse = require("../../../utils/ApiResponse");

// Admin registration (In real app, this might be restricted to existing admins)
exports.register = async (req, res, next) => {
  try {
    const { name, email, phoneNumber, password } = req.body;

    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      return ApiResponse.error(res, "Admin with this email already exists", 400);
    }

    const admin = await Admin.create({
      name,
      email,
      phoneNumber,
      password
    });

    const accessToken = generateAccessToken(admin._id, "admin");

    return ApiResponse.created(res, "Admin registered successfully", {
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      },
      accessToken
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, identifier, password } = req.body;
    const loginId = identifier || email;

    if (!loginId) {
      return ApiResponse.error(res, "Email or Username is required", 400);
    }

    const admin = await Admin.findOne({
      $or: [{ email: loginId }, { username: loginId }]
    }).select("+password");

    if (!admin || !(await admin.comparePassword(password))) {
      return ApiResponse.unauthorized(res, "Invalid credentials");
    }

    const accessToken = generateAccessToken(admin._id, "admin");
    
    admin.lastLogin = Date.now();
    await admin.save();

    return ApiResponse.success(res, "Admin Login successful", {
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      },
      accessToken
    });
  } catch (error) {
    next(error);
  }
};
