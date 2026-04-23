// ─────────────────────────────────────────────────────────
//  controllers/adminController.js — Admin Auth & Dashboard
// ─────────────────────────────────────────────────────────
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const ApiResponse = require("../utils/ApiResponse");
const { logAction } = require("../services/auditService");
const {
  generateAccessToken,
  generateRefreshToken,
  setRefreshTokenCookie,
} = require("../utils/generateToken");

// ═══════════════════════════════════════════════════════
//  POST /api/admin/register
// ═══════════════════════════════════════════════════════
exports.adminRegister = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return ApiResponse.error(res, "Admin with this email already exists", 409);
    }

    const user = await User.create({
      name,
      email,
      password,
      role: "admin",
      isEmailVerified: true,
      approvalStatus: "approved",
    });

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshTokens.push({ token: refreshToken });
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    setRefreshTokenCookie(res, refreshToken);

    return ApiResponse.created(res, "Admin registered successfully", {
      token: accessToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Admin register error:", error);
    return ApiResponse.serverError(res, error.message);
  }
};

// ═══════════════════════════════════════════════════════
//  POST /api/admin/login
// ═══════════════════════════════════════════════════════
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, role: "admin" }).select("+password");
    if (!user) {
      return ApiResponse.unauthorized(res, "Invalid admin credentials");
    }
    if (!user.isActive) {
      return ApiResponse.unauthorized(res, "Account deactivated");
    }
    if (user.isLocked()) {
      return ApiResponse.error(res, "Account locked. Try again in 30 minutes.", 423);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incrementLoginAttempts();
      return ApiResponse.unauthorized(res, "Invalid admin credentials");
    }

    user.loginAttempts = 0;
    user.lockUntil = undefined;
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshTokens.push({ token: refreshToken });
    if (user.refreshTokens.length > 5) user.refreshTokens = user.refreshTokens.slice(-5);
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    setRefreshTokenCookie(res, refreshToken);

    await logAction(req, { action: "LOGIN", entity: "User", entityId: user._id, details: { email } });

    return ApiResponse.success(res, "Admin login successful", {
      token: accessToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return ApiResponse.serverError(res, error.message);
  }
};

// ═══════════════════════════════════════════════════════
//  GET /api/admin/profile
// ═══════════════════════════════════════════════════════
exports.getAdminProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    return ApiResponse.success(res, "Admin profile retrieved", {
      user: {
        id: user._id, name: user.name, email: user.email,
        phone: user.phone, role: user.role, avatar: user.avatar,
        lastLogin: user.lastLogin, createdAt: user.createdAt,
      },
    });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

// ═══════════════════════════════════════════════════════
//  PUT /api/admin/update-profile
// ═══════════════════════════════════════════════════════
exports.updateAdminProfile = async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (avatar) updates.avatar = avatar;

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true, runValidators: true,
    });

    await logAction(req, { action: "UPDATE", entity: "User", entityId: user._id, details: updates });

    return ApiResponse.success(res, "Profile updated", {
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone },
    });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

// ═══════════════════════════════════════════════════════
//  POST /api/admin/logout
// ═══════════════════════════════════════════════════════
exports.adminLogout = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (token) {
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { refreshTokens: { token } },
      });
    }
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    await logAction(req, { action: "LOGOUT", entity: "User", entityId: req.user._id });

    return ApiResponse.success(res, "Logged out successfully");
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

// ═══════════════════════════════════════════════════════
//  GET /api/admin/dashboard
// ═══════════════════════════════════════════════════════
exports.getDashboard = async (req, res) => {
  try {
    const [
      totalDistributors,
      totalGarages,
      totalCustomers,
      totalProducts,
      totalOrders,
    ] = await Promise.all([
      User.countDocuments({ role: "distributor" }),
      User.countDocuments({ role: "garage" }),
      User.countDocuments({ role: "customer" }),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments(),
    ]);

    // Daily sales (today)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const dailySalesAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: todayStart }, paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
    ]);
    const dailySales = dailySalesAgg[0] || { total: 0, count: 0 };

    // Monthly revenue (current month)
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const monthlyRevenueAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: monthStart }, paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
    ]);
    const monthlyRevenue = monthlyRevenueAgg[0] || { total: 0, count: 0 };

    // Last 7 days chart data
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const chartData = await Order.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo }, paymentStatus: "paid" } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("customer", "name email")
      .select("orderNumber status totalAmount createdAt");

    // Pending approvals
    const pendingApprovals = await User.countDocuments({
      approvalStatus: "pending",
      role: { $in: ["distributor", "garage"] },
    });

    return ApiResponse.success(res, "Dashboard data retrieved", {
      stats: {
        totalDistributors,
        totalGarages,
        totalCustomers,
        totalProducts,
        totalOrders,
        pendingApprovals,
      },
      dailySales: { amount: dailySales.total, count: dailySales.count },
      monthlyRevenue: { amount: monthlyRevenue.total, count: monthlyRevenue.count },
      chartData,
      recentOrders,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return ApiResponse.serverError(res, error.message);
  }
};
