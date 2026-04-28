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
      return res.status(400).json(new ApiResponse(false, "Garage with this email or phone already exists"));
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

    res.status(201).json(new ApiResponse(true, "Registration initiated. Please verify OTP sent to your phone.", {
      phoneNumber: garage.phoneNumber
    }));
  } catch (error) {
    next(error);
  }
};

exports.verifyOtp = async (req, res, next) => {
  try {
    const { phoneNumber, otp } = req.body;

    const otpDoc = await Otp.findOne({ phoneNumber, role: "garage" });

    if (!otpDoc || !(await otpDoc.compareOTP(otp))) {
      return res.status(400).json(new ApiResponse(false, "Invalid or expired OTP"));
    }

    const garage = await Garage.findOne({ phoneNumber });
    if (!garage) {
      return res.status(404).json(new ApiResponse(false, "Garage not found"));
    }

    // After OTP, garage is still pending approval, but we mark as verified if we had a flag
    // For now, let's say they can't login until approved, but OTP is done.
    
    // Cleanup OTP
    await Otp.deleteOne({ _id: otpDoc._id });

    res.status(200).json(new ApiResponse(true, "Phone verified successfully. Please wait for admin approval."));
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const garage = await Garage.findOne({ email }).select("+password");

    if (!garage || !(await garage.comparePassword(password))) {
      return res.status(401).json(new ApiResponse(false, "Invalid credentials"));
    }

    if (!garage.isActive) {
      return res.status(403).json(new ApiResponse(false, "Account is inactive"));
    }

    const accessToken = generateAccessToken(garage._id, "garage");
    
    garage.lastLogin = Date.now();
    await garage.save();

    res.status(200).json(new ApiResponse(true, "Login successful", {
      user: {
        id: garage._id,
        name: garage.name,
        businessName: garage.businessName,
        role: garage.role,
        approvalStatus: garage.approvalStatus
      },
      accessToken
    }));
  } catch (error) {
    next(error);
  }
};
