const Otp = require("../../models/Otp");
const User = require("../../models/User");
const ApiResponse = require("../../utils/ApiResponse");
const { sendPhoneOTP } = require("../../utils/sendSMS");
const { generateAccessToken } = require("../../utils/generateToken");

/**
 * Generate 6-digit random OTP
 */
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

/**
 * POST /api/v1/auth/send-otp
 * Send OTP to phone number
 */
exports.sendOTP = async (req, res) => {
  try {
    const { phoneNumber, role } = req.body;

    if (!phoneNumber || !role) {
      return ApiResponse.error(res, "Phone number and role are required", 400);
    }

    // Check if user exists for the given role
    let user = await User.findOne({ phoneNumber });
    
    if (!user && process.env.NODE_ENV === 'development') {
      console.log(`\n👷 [DEV MODE] Auto-creating ${role} account for ${phoneNumber}...\n`);
      user = await User.create({
        name: `${role.charAt(0).toUpperCase() + role.slice(1)} ${phoneNumber.slice(-4)}`,
        phoneNumber: phoneNumber,
        password: 'password123',
        role: role,
        approvalStatus: 'approved',
        isPhoneVerified: true,
        isEmailVerified: true,
        email: `${role}${phoneNumber.slice(-4)}@example.com`
      });
    }


    if (!user) {
      return ApiResponse.error(res, "No account found with this phone number. Please contact admin.", 404);
    }
    
    if (user.role !== role && role !== 'customer') {
      return ApiResponse.error(res, `Account found, but it is not a ${role} account.`, 403);
    }

    // Generate OTP
    const otpCode = generateOTP();

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store in DB
    let otpRecord = await Otp.findOne({ phoneNumber });
    if (otpRecord) {
      otpRecord.otp = otpCode;
      otpRecord.role = role;
      otpRecord.expiresAt = expiresAt;
      otpRecord.attempts = 0;
    } else {
      otpRecord = new Otp({
        phoneNumber,
        otp: otpCode,
        role,
        expiresAt,
        attempts: 0
      });
    }
    await otpRecord.save();

    // In development, we don't actually need to send SMS if we use master OTP
    if (process.env.NODE_ENV === 'development') {
      console.log(`\n🚀 [DEV MODE] OTP for ${phoneNumber} is: ${otpCode}\n`);
      return ApiResponse.success(res, `Development OTP generated: ${otpCode}`);
    }

    // Send via SMS
    const smsResult = await sendPhoneOTP(phoneNumber, otpCode);
    if (!smsResult.success) {
      return ApiResponse.error(res, "Failed to send SMS. Please try again.", 500);
    }

    return ApiResponse.success(res, "OTP sent successfully to your phone");
  } catch (error) {
    console.error("Send OTP error:", error);
    return ApiResponse.serverError(res, error.message);
  }
};

/**
 * POST /api/v1/auth/register
 * Verify OTP and Register user
 */
exports.verifyAndRegister = async (req, res) => {
  try {
    const { phoneNumber, otp, name, password, role, email } = req.body;

    if (!phoneNumber || !otp || !name || !password || !role) {
      return ApiResponse.error(res, "Missing required fields", 400);
    }

    // 1. Find OTP record
    const otpRecord = await Otp.findOne({ phoneNumber });
    if (!otpRecord) {
      return ApiResponse.error(res, "OTP expired or not requested", 404);
    }

    // 2. Check Role consistency
    if (otpRecord.role !== role) {
      return ApiResponse.error(res, "Role mismatch between OTP and registration", 400);
    }

    // 3. Verify OTP
    const isMatch = await otpRecord.compareOTP(otp);
    if (!isMatch) {
      return ApiResponse.error(res, "Invalid OTP code", 401);
    }

    // 4. Check if user already exists
    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) {
      return ApiResponse.error(res, "A user with this phone number already exists", 409);
    }

    // 5. Create User
    const user = await User.create({
      name,
      phoneNumber,
      password,
      role,
      email, // optional
      isPhoneVerified: true,
      approvalStatus: role === 'customer' ? 'approved' : 'pending'
    });

    // 6. Generate JWT
    const token = generateAccessToken(user._id, user.role);

    // 7. Cleanup OTP
    await Otp.deleteOne({ _id: otpRecord._id });

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        phoneNumber: user.phoneNumber,
        status: user.approvalStatus
      }
    });

  } catch (error) {
    console.error("Registration error:", error);
    return ApiResponse.serverError(res, error.message);
  }
};

/**
 * POST /api/v1/auth/verify-otp
 * Verify OTP and Login user
 */
exports.verifyOTPAndLogin = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
      return ApiResponse.error(res, "Phone number and OTP are required", 400);
    }

    // 1. Find OTP record
    const otpRecord = await Otp.findOne({ phoneNumber });
    if (!otpRecord) {
      return ApiResponse.error(res, "OTP expired or not requested", 404);
    }

    // 2. Verify OTP
    const isMatch = await otpRecord.compareOTP(otp);
    if (!isMatch) {
      return ApiResponse.error(res, "Invalid OTP code", 401);
    }

    // 3. Find User
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return ApiResponse.error(res, "User not found. Please register first.", 404);
    }

    // 4. Generate JWT
    const token = generateAccessToken(user._id, user.role);

    // 5. Cleanup OTP
    await Otp.deleteOne({ _id: otpRecord._id });

    return ApiResponse.success(res, "Login successful", {
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        phoneNumber: user.phoneNumber,
        status: user.approvalStatus
      }
    });

  } catch (error) {
    console.error("Login OTP error:", error);
    return ApiResponse.serverError(res, error.message);
  }
};

/**
 * POST /api/v1/auth/resend-otp
 */
exports.resendOTP = async (req, res) => {
  // Reuse sendOTP logic
  return this.sendOTP(req, res);
};
