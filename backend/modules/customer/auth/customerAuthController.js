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
      return res.status(400).json(new ApiResponse(false, "Customer with this email or phone already exists"));
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

    res.status(201).json(new ApiResponse(true, "Registration initiated. Please verify OTP sent to your phone.", {
      phoneNumber: customer.phoneNumber
    }));
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

    if (!otpDoc || !(await otpDoc.compareOTP(otp))) {
      return res.status(400).json(new ApiResponse(false, "Invalid or expired OTP"));
    }

    // Activate customer
    const customer = await Customer.findOne({ phoneNumber });
    if (!customer) {
      return res.status(404).json(new ApiResponse(false, "Customer not found"));
    }

    customer.isActive = true;
    customer.lastLogin = Date.now();
    await customer.save();

    // Cleanup OTP
    await Otp.deleteOne({ _id: otpDoc._id });

    const accessToken = generateAccessToken(customer._id, "customer");

    res.status(200).json(new ApiResponse(true, "Account verified and activated successfully", {
      user: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        role: customer.role
      },
      accessToken
    }));
  } catch (error) {
    next(error);
  }
};

// @desc    Login customer
// @route   POST /api/customer/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const customer = await Customer.findOne({ email }).select("+password");

    if (!customer || !(await customer.comparePassword(password))) {
      return res.status(401).json(new ApiResponse(false, "Invalid credentials"));
    }

    if (!customer.isActive) {
      return res.status(403).json(new ApiResponse(false, "Account is inactive"));
    }

    const accessToken = generateAccessToken(customer._id, "customer");
    
    customer.lastLogin = Date.now();
    await customer.save();

    res.status(200).json(new ApiResponse(true, "Login successful", {
      user: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        role: customer.role
      },
      accessToken
    }));
  } catch (error) {
    next(error);
  }
};
