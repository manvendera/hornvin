const Customer = require("../../../models/Customer");
const Otp = require("../../../models/Otp");
const { generateAccessToken, generateRefreshToken, setRefreshTokenCookie } = require("../../../utils/generateToken");
const ApiResponse = require("../../../utils/ApiResponse");
const { sendPhoneOTP } = require("../../../utils/sendSMS");

// @desc    Register a new customer
// @route   POST /api/customer/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, phoneNumber, password } = req.body;

    const existingCustomer = await Customer.findOne({ 
      $or: [{ email }, { phoneNumber }] 
    });

    if (existingCustomer) {
      return ApiResponse.error(res, "Customer with this email or phone already exists", 400);
    }

    // Create customer but keep inactive until OTP verified
    const customer = await Customer.create({
      name,
      email,
      phoneNumber,
      password,
      isActive: false // Inactive until verified
    });

    // Generate and send OTP
    const otpValue = Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.create({
      phoneNumber,
      otp: otpValue,
      role: "customer",
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    });

    await sendPhoneOTP(phoneNumber, otpValue);

    return ApiResponse.created(res, "Registration initiated. Please verify OTP sent to your phone.", {
      phoneNumber: customer.phoneNumber
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP and activate account
// @route   POST /api/customer/auth/verify-otp
// @access  Public
exports.verifyOtp = async (req, res, next) => {
  try {
    const { phoneNumber, otp } = req.body;

    const otpDoc = await Otp.findOne({ phoneNumber, role: "customer" });

    // In development mode, we allow bypassing OTP or using 123456
    const isDevelopment = process.env.NODE_ENV === "development";
    const isValidOtp = isDevelopment ? (otp === "123456" || (otpDoc && await otpDoc.compareOTP(otp))) : (otpDoc && await otpDoc.compareOTP(otp));

    if (!isDevelopment && !isValidOtp) {
      return ApiResponse.error(res, "Invalid or expired OTP", 400);
    }

    // Activate customer
    const customer = await Customer.findOne({ phoneNumber });
    if (!customer) {
      return ApiResponse.notFound(res, "Customer not found");
    }

    customer.isActive = true;
    customer.lastLogin = Date.now();
    await customer.save();

    // Cleanup OTP
    await Otp.deleteOne({ _id: otpDoc._id });

    const accessToken = generateAccessToken(customer._id, "customer");

    return ApiResponse.success(res, "Account verified and activated successfully", {
      user: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        role: customer.role
      },
      accessToken
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login customer
// @route   POST /api/customer/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, identifier, password } = req.body;
    const loginId = identifier || email;

    if (!loginId) {
      return ApiResponse.error(res, "Email or Phone Number is required", 400);
    }

    const customer = await Customer.findOne({
      $or: [{ email: loginId }, { phoneNumber: loginId }]
    }).select("+password");

    if (!customer || !(await customer.comparePassword(password))) {
      return ApiResponse.unauthorized(res, "Invalid credentials");
    }

    // In development, auto-activate if not already (OTP verified is usually enough for customers)
    if (process.env.NODE_ENV === "development" && !customer.isActive) {
      customer.isActive = true;
      await customer.save();
    }

    if (!customer.isActive) {
      return ApiResponse.forbidden(res, "Account is inactive. Please verify OTP.");
    }

    const accessToken = generateAccessToken(customer._id, "customer");
    
    customer.lastLogin = Date.now();
    await customer.save();

    return ApiResponse.success(res, "Login successful", {
      user: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        role: customer.role
      },
      accessToken
    });
  } catch (error) {
    next(error);
  }
};
