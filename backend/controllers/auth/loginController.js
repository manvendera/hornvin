const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const ApiResponse = require("../../utils/ApiResponse");
const {
  generateAccessToken,
  generateRefreshToken,
  setRefreshTokenCookie,
} = require("../../utils/generateToken");

// ═════════════════════════════════════════════════════════
//  POST /api/v1/auth/login
// ═════════════════════════════════════════════════════════
exports.login = async (req, res) => {
  try {
    const { email, phoneNumber, identifier, password } = req.body;
    const loginId = identifier || email || phoneNumber;

    const user = await User.findOne({
      $or: [
        { email: loginId.toLowerCase() },
        { phoneNumber: loginId }
      ]
    }).select("+password");

    if (!user) {
      return ApiResponse.unauthorized(res, "Invalid identifier or password");
    }



    if (!user.isActive) {
      return ApiResponse.unauthorized(res, "Your account has been deactivated. Contact support.");
    }

    if (user.isLocked()) {
      return ApiResponse.error(res, "Account is temporarily locked. Try again in 30 minutes.", 423);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incrementLoginAttempts();
      return ApiResponse.unauthorized(res, "Invalid identifier or password");
    }

    if (!user.isEmailVerified) {
      return ApiResponse.error(res, "Please verify your email before logging in.", 403);
    }

    // Reset login attempts
    if (user.loginAttempts > 0) {
      user.loginAttempts = 0;
      user.lockUntil = undefined;
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshTokens.push({ token: refreshToken });
    if (user.refreshTokens.length > 5) user.refreshTokens = user.refreshTokens.slice(-5);

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    setRefreshTokenCookie(res, refreshToken);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token: accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    return ApiResponse.serverError(res, error.message);
  }
};

// ═════════════════════════════════════════════════════════
//  POST /api/v1/auth/refresh-token
// ═════════════════════════════════════════════════════════
exports.refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!token) return ApiResponse.unauthorized(res, "Refresh token not provided");

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      return ApiResponse.unauthorized(res, "Invalid or expired refresh token");
    }

    const user = await User.findOne({ _id: decoded.id, "refreshTokens.token": token });
    if (!user) {
      await User.findByIdAndUpdate(decoded.id, { $set: { refreshTokens: [] } });
      return ApiResponse.unauthorized(res, "Invalid refresh token — sessions terminated");
    }

    user.refreshTokens = user.refreshTokens.filter((rt) => rt.token !== token);

    const newAccessToken = generateAccessToken(user._id, user.role);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshTokens.push({ token: newRefreshToken });
    await user.save({ validateBeforeSave: false });

    setRefreshTokenCookie(res, newRefreshToken);

    return ApiResponse.success(res, "Token refreshed successfully", {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

// ═════════════════════════════════════════════════════════
//  POST /api/v1/auth/logout
// ═════════════════════════════════════════════════════════
exports.logout = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (token) {
      await User.findByIdAndUpdate(req.user._id, { $pull: { refreshTokens: { token } } });
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/v1/auth/refresh-token",
    });

    return ApiResponse.success(res, "Logged out successfully");
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

// ═════════════════════════════════════════════════════════
//  POST /api/v1/auth/logout-all
// ═════════════════════════════════════════════════════════
exports.logoutAll = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { $set: { refreshTokens: [] } });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/v1/auth/refresh-token",
    });

    return ApiResponse.success(res, "Logged out from all devices successfully");
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};
