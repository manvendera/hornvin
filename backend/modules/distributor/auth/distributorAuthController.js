const Distributor = require("../../../models/Distributor");
const Otp = require("../../../models/Otp");
const { generateAccessToken } = require("../../../utils/generateToken");
const ApiResponse = require("../../../utils/ApiResponse");
const { sendPhoneOTP } = require("../../../utils/sendSMS");

exports.register = async (req, res, next) => {
  try {
    const { name, email, phoneNumber, password, businessName, businessAddress, distributorRegion } = req.body;

    const existingDist = await Distributor.findOne({ 
      $or: [{ email }, { phoneNumber }] 
    });

    if (existingDist) {
      return ApiResponse.error(res, "Distributor with this email or phone already exists", 400);
    }

    const distributor = await Distributor.create({
      name,
      email,
      phoneNumber,
      password,
      businessName,
      businessAddress,
      distributorRegion,
      approvalStatus: "pending",
      isActive: false
    });

    // Generate and send OTP
    const otpValue = Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.create({
      phoneNumber,
      otp: otpValue,
      role: "distributor",
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    });

    await sendPhoneOTP(phoneNumber, otpValue);

    return ApiResponse.created(res, "Registration initiated. Please verify OTP sent to your phone.", {
      phoneNumber: distributor.phoneNumber
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyOtp = async (req, res, next) => {
  try {
    const { phoneNumber, otp } = req.body;

    const otpDoc = await Otp.findOne({ phoneNumber, role: "distributor" });

    // In development mode, we allow bypassing OTP or using 123456
    const isDevelopment = process.env.NODE_ENV === "development";
    const isValidOtp = isDevelopment ? (otp === "123456" || (otpDoc && await otpDoc.compareOTP(otp))) : (otpDoc && await otpDoc.compareOTP(otp));

    if (!isDevelopment && !isValidOtp) {
      return ApiResponse.error(res, "Invalid or expired OTP", 400);
    }

    const distributor = await Distributor.findOne({ phoneNumber });
    if (!distributor) {
      return ApiResponse.notFound(res, "Distributor not found");
    }

    // Cleanup OTP
    await Otp.deleteOne({ _id: otpDoc._id });

    return ApiResponse.success(res, "Phone verified successfully. Please wait for admin approval.");
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const distributor = await Distributor.findOne({ email }).select("+password");

    if (!distributor || !(await distributor.comparePassword(password))) {
      return ApiResponse.unauthorized(res, "Invalid credentials");
    }

    if (!distributor.isActive) {
      return ApiResponse.forbidden(res, "Account is inactive. Please wait for admin approval.");
    }

    const accessToken = generateAccessToken(distributor._id, "distributor");
    
    distributor.lastLogin = Date.now();
    await distributor.save();

    return ApiResponse.success(res, "Login successful", {
      user: {
        id: distributor._id,
        name: distributor.name,
        businessName: distributor.businessName,
        role: distributor.role,
        approvalStatus: distributor.approvalStatus
      },
      accessToken
    });
  } catch (error) {
    next(error);
  }
};
