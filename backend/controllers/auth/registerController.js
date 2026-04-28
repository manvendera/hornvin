const crypto = require("crypto");
const User = require("../../models/User");
const ApiResponse = require("../../utils/ApiResponse");
const { sendVerificationOTP } = require("../../utils/sendEmail");
const { generateAccessToken } = require("../../utils/generateToken");

// ═════════════════════════════════════════════════════════
//  POST /api/v1/auth/signup (Unified Role-Based Signup)
// ═════════════════════════════════════════════════════════
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role, businessName, garageType, distributorRegion } = req.body;

    const query = [];
    if (email) query.push({ email });
    if (phone) query.push({ phoneNumber: phone });

    const existingUser = await User.findOne({ $or: query });
    if (existingUser) {
      const field = existingUser.email === email && email ? "email" : "phone number";
      return ApiResponse.error(res, `An account with this ${field} already exists`, 409);
    }



    // Validate role
    const validRoles = ["admin", "distributor", "garage", "customer"];
    const userRole = validRoles.includes(role) ? role : "customer";

    // Set approval status (Admin, Distributor, and Garage require approval)
    const requiresApproval = ["admin", "distributor", "garage"].includes(userRole);
    const approvalStatus = requiresApproval ? "pending" : "approved";

    // Create user with provided fields
    const user = await User.create({
      name,
      email,
      password,
      phoneNumber: phone,
      role: userRole,
      businessName,
      garageType,
      distributorRegion,
      approvalStatus
    });

    // Generate OTP
    const otp = user.generateEmailOTP();
    await user.save({ validateBeforeSave: false });

    // Send verification email
    await sendVerificationOTP(email, name, otp);

    // Also log to console for development (since SMS API might not be available)
    if (process.env.NODE_ENV === 'development') {
      console.log(`\n📧 [VERIFICATION] OTP for ${email} / ${phone} is: ${otp}\n`);
    }

    const accessToken = generateAccessToken(user._id, user.role);
    
    return res.status(201).json({
      success: true,
      message: requiresApproval 
        ? "Registration successful. Please verify your email and wait for admin approval."
        : "Registration successful. Please verify your email.",
      token: accessToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, status: user.approvalStatus }
    });
  } catch (error) {
    console.error("Register error:", error);
    return ApiResponse.serverError(res, error.message);
  }
};

// ═════════════════════════════════════════════════════════
//  POST /api/v1/auth/signup/garage
// ═════════════════════════════════════════════════════════
exports.registerGarage = async (req, res) => {
  try {
    const { name, email, password, phone, businessName, garageType } = req.body;

    const query = [];
    if (email) query.push({ email });
    if (phone) query.push({ phoneNumber: phone });

    const existingUser = await User.findOne({ $or: query });
    if (existingUser) {
      const field = existingUser.email === email && email ? "email" : "phone number";
      return ApiResponse.error(res, `An account with this ${field} already exists`, 409);
    }


    // Create garage user
    const user = await User.create({
      name,
      email,
      password,
      phoneNumber: phone,
      role: "garage",
      businessName,
      garageType,
      approvalStatus: "pending" // requires admin approval
    });

    const otp = user.generateEmailOTP();
    await user.save({ validateBeforeSave: false });

    await sendVerificationOTP(email, name, otp);

    // Also log to console for development
    if (process.env.NODE_ENV === 'development') {
      console.log(`\n🏢 [GARAGE VERIFICATION] OTP for ${email} / ${phone} is: ${otp}\n`);
    }
    
    // Send via SMS utility (which logs to console)
    const { sendPhoneOTP } = require("../../utils/sendSMS");
    await sendPhoneOTP(phone, otp);


    const accessToken = generateAccessToken(user._id, user.role);

    return res.status(201).json({
      success: true,
      message: "Garage registration successful. Please verify email and wait for admin approval.",
      token: accessToken,
      user: { id: user._id, name: user.name, role: user.role }
    });
  } catch (error) {
    console.error("Garage Register error:", error);
    return ApiResponse.serverError(res, error.message);
  }
};

// ═════════════════════════════════════════════════════════
//  POST /api/v1/auth/verify-email
// ═════════════════════════════════════════════════════════
exports.verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) return ApiResponse.notFound(res, "User not found");
    if (user.isEmailVerified) return ApiResponse.error(res, "Email is already verified");

    if (!user.emailVerificationOTPExpires || user.emailVerificationOTPExpires < Date.now()) {
      return ApiResponse.error(res, "OTP has expired. Please request a new one.");
    }

    const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");
    if (hashedOTP !== user.emailVerificationOTP) {
      return ApiResponse.error(res, "Invalid OTP");
    }

    user.isEmailVerified = true;
    user.emailVerificationOTP = undefined;
    user.emailVerificationOTPExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return ApiResponse.success(res, "Email verified successfully");
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

// ═════════════════════════════════════════════════════════
//  POST /api/v1/auth/resend-otp
// ═════════════════════════════════════════════════════════
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return ApiResponse.notFound(res, "User not found");

    const otp = user.generateEmailOTP();
    await user.save({ validateBeforeSave: false });
    await sendVerificationOTP(email, user.name, otp);

    // Also log to console for development
    if (process.env.NODE_ENV === 'development') {
      console.log(`\n🔄 [RESEND] OTP for ${email} / ${user.phoneNumber} is: ${otp}\n`);
    }

    return ApiResponse.success(res, "OTP resent successfully");
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};
