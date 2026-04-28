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
      return res.status(400).json(new ApiResponse(false, "Distributor with this email or phone already exists"));
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

    res.status(201).json(new ApiResponse(true, "Registration initiated. Please verify OTP sent to your phone.", {
      phoneNumber: distributor.phoneNumber
    }));
  } catch (error) {
    next(error);
  }
};

exports.verifyOtp = async (req, res, next) => {
  try {
    const { phoneNumber, otp } = req.body;

    const otpDoc = await Otp.findOne({ phoneNumber, role: "distributor" });

    if (!otpDoc || !(await otpDoc.compareOTP(otp))) {
      return res.status(400).json(new ApiResponse(false, "Invalid or expired OTP"));
    }

    const distributor = await Distributor.findOne({ phoneNumber });
    if (!distributor) {
      return res.status(404).json(new ApiResponse(false, "Distributor not found"));
    }

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

    const distributor = await Distributor.findOne({ email }).select("+password");

    if (!distributor || !(await distributor.comparePassword(password))) {
      return res.status(401).json(new ApiResponse(false, "Invalid credentials"));
    }

    if (!distributor.isActive) {
      return res.status(403).json(new ApiResponse(false, "Account is inactive"));
    }

    const accessToken = generateAccessToken(distributor._id, "distributor");
    
    distributor.lastLogin = Date.now();
    await distributor.save();

    res.status(200).json(new ApiResponse(true, "Login successful", {
      user: {
        id: distributor._id,
        name: distributor.name,
        businessName: distributor.businessName,
        role: distributor.role,
        approvalStatus: distributor.approvalStatus
      },
      accessToken
    }));
  } catch (error) {
    next(error);
  }
};
