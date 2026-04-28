const Admin = require("../../../models/Admin");
const { generateAccessToken } = require("../../../utils/generateToken");
const ApiResponse = require("../../../utils/ApiResponse");

// Admin registration (In real app, this might be restricted to existing admins)
exports.register = async (req, res, next) => {
  try {
    const { name, email, phoneNumber, password } = req.body;

    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      return res.status(400).json(new ApiResponse(false, "Admin with this email already exists"));
    }

    const admin = await Admin.create({
      name,
      email,
      phoneNumber,
      password
    });

    const accessToken = generateAccessToken(admin._id, "admin");

    res.status(201).json(new ApiResponse(true, "Admin registered successfully", {
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      },
      accessToken
    }));
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email }).select("+password");

    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json(new ApiResponse(false, "Invalid credentials"));
    }

    const accessToken = generateAccessToken(admin._id, "admin");
    
    admin.lastLogin = Date.now();
    await admin.save();

    res.status(200).json(new ApiResponse(true, "Admin Login successful", {
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      },
      accessToken
    }));
  } catch (error) {
    next(error);
  }
};
