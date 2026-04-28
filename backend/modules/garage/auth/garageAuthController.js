const Garage = require("../../../models/Garage");
const Otp = require("../../../models/Otp");
const { generateAccessToken } = require("../../../utils/generateToken");
const ApiResponse = require("../../../utils/ApiResponse");
const { sendPhoneOTP } = require("../../../utils/sendSMS");

exports.register = async (req, res, next) => {
  try {
    console.log("Garage Register Payload:", req.body);
    const { name, email, phoneNumber, password, businessName, garageType } = req.body;

    const existingGarage = await Garage.findOne({ 
      $or: [{ email }, { phoneNumber }] 
    });

    if (existingGarage) {
      return ApiResponse.error(res, "Garage with this email or phone already exists", 400);
    }

    const garage = await Garage.create({
      name,
      email,
      phoneNumber,
      password,
      businessName,
      garageType,
      approvalStatus: "pending",
      isActive: false
    });

    // Generate and send OTP
    const otpValue = Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.create({
      phoneNumber,
      otp: otpValue,
      role: "garage",
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    });

    await sendPhoneOTP(phoneNumber, otpValue);

    return ApiResponse.created(res, "Registration initiated. Please verify OTP sent to your phone.", {
      phoneNumber: garage.phoneNumber
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyOtp = async (req, res, next) => {
  try {
    const { phoneNumber, otp } = req.body;

    const otpDoc = await Otp.findOne({ phoneNumber, role: "garage" });

    // In development mode, we allow bypassing OTP or using 123456
    const isDevelopment = process.env.NODE_ENV === "development";
    const isValidOtp = isDevelopment ? (otp === "123456" || (otpDoc && await otpDoc.compareOTP(otp))) : (otpDoc && await otpDoc.compareOTP(otp));

    if (!isDevelopment && !isValidOtp) {
      return ApiResponse.error(res, "Invalid or expired OTP", 400);
    }

    const garage = await Garage.findOne({ phoneNumber });
    if (!garage) {
      return ApiResponse.notFound(res, "Garage not found");
    }

    // After OTP, garage is still pending approval, but we mark as verified if we had a flag
    // For now, let's say they can't login until approved, but OTP is done.
    
    // Cleanup OTP
    await Otp.deleteOne({ _id: otpDoc._id });

    return ApiResponse.success(res, "Phone verified successfully. Please wait for admin approval.");
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, identifier, password } = req.body;
    const loginId = identifier || email;

    if (!loginId) {
      return ApiResponse.error(res, "Email or Phone Number is required", 400);
    }

    const garage = await Garage.findOne({
      $or: [{ email: loginId }, { phoneNumber: loginId }]
    }).select("+password");

    if (!garage || !(await garage.comparePassword(password))) {
      return ApiResponse.unauthorized(res, "Invalid credentials");
    }

    // In development, auto-activate if not already
    if (process.env.NODE_ENV === "development" && !garage.isActive) {
      garage.isActive = true;
      await garage.save();
    }

    if (!garage.isActive) {
      return ApiResponse.forbidden(res, "Account is inactive. Please wait for admin approval.");
    }

    const accessToken = generateAccessToken(garage._id, "garage");
    
    garage.lastLogin = Date.now();
    await garage.save();

    return ApiResponse.success(res, "Login successful", {
      user: {
        id: garage._id,
        name: garage.name,
        businessName: garage.businessName,
        role: garage.role,
        approvalStatus: garage.approvalStatus
      },
      accessToken
    });
  } catch (error) {
    next(error);
  }
};
