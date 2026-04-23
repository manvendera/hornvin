// ─────────────────────────────────────────────────────────
//  controllers/adminController.js — Admin-Only Operations
// ─────────────────────────────────────────────────────────
const User = require("../models/User");
const ApiResponse = require("../utils/ApiResponse");

// ═════════════════════════════════════════════════════════
//  GET /api/admin/users — List All Users
// ═════════════════════════════════════════════════════════
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";
    const role = req.query.role || "";

    // Build filter
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (role) filter.role = role;

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-refreshTokens")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    return ApiResponse.success(res, "Users retrieved", {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get all users error:", error);
    return ApiResponse.serverError(res, error.message);
  }
};

// ═════════════════════════════════════════════════════════
//  GET /api/admin/users/:id — Get Single User
// ═════════════════════════════════════════════════════════
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-refreshTokens");

    if (!user) {
      return ApiResponse.notFound(res, "User not found");
    }

    return ApiResponse.success(res, "User retrieved", { user });
  } catch (error) {
    console.error("Get user by id error:", error);
    return ApiResponse.serverError(res, error.message);
  }
};

// ═════════════════════════════════════════════════════════
//  PUT /api/admin/users/:id/role — Update User Role
// ═════════════════════════════════════════════════════════
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return ApiResponse.error(res, "Invalid role. Must be 'user' or 'admin'.");
    }

    // Prevent admin from changing their own role
    if (req.params.id === req.user._id.toString()) {
      return ApiResponse.error(res, "You cannot change your own role");
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select("-refreshTokens");

    if (!user) {
      return ApiResponse.notFound(res, "User not found");
    }

    return ApiResponse.success(res, `User role updated to '${role}'`, { user });
  } catch (error) {
    console.error("Update user role error:", error);
    return ApiResponse.serverError(res, error.message);
  }
};

// ═════════════════════════════════════════════════════════
//  PUT /api/admin/users/:id/toggle-status — Activate/Deactivate User
// ═════════════════════════════════════════════════════════
exports.toggleUserStatus = async (req, res) => {
  try {
    // Prevent self-deactivation
    if (req.params.id === req.user._id.toString()) {
      return ApiResponse.error(res, "You cannot deactivate your own account");
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return ApiResponse.notFound(res, "User not found");
    }

    user.isActive = !user.isActive;

    // If deactivating, clear all refresh tokens
    if (!user.isActive) {
      user.refreshTokens = [];
    }

    await user.save({ validateBeforeSave: false });

    return ApiResponse.success(
      res,
      `User ${user.isActive ? "activated" : "deactivated"} successfully`,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isActive: user.isActive,
        },
      }
    );
  } catch (error) {
    console.error("Toggle user status error:", error);
    return ApiResponse.serverError(res, error.message);
  }
};

// ═════════════════════════════════════════════════════════
//  DELETE /api/admin/users/:id — Delete User
// ═════════════════════════════════════════════════════════
exports.deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return ApiResponse.error(res, "You cannot delete your own account");
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return ApiResponse.notFound(res, "User not found");
    }

    return ApiResponse.success(res, "User deleted successfully");
  } catch (error) {
    console.error("Delete user error:", error);
    return ApiResponse.serverError(res, error.message);
  }
};

// ═════════════════════════════════════════════════════════
//  GET /api/admin/stats — Dashboard Statistics
// ═════════════════════════════════════════════════════════
exports.getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, verifiedUsers, activeUsers, adminUsers] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ isEmailVerified: true }),
        User.countDocuments({ isActive: true }),
        User.countDocuments({ role: "admin" }),
      ]);

    // Users registered in the last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newUsers = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });

    return ApiResponse.success(res, "Dashboard stats retrieved", {
      stats: {
        totalUsers,
        verifiedUsers,
        unverifiedUsers: totalUsers - verifiedUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        adminUsers,
        regularUsers: totalUsers - adminUsers,
        newUsersLast7Days: newUsers,
      },
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    return ApiResponse.serverError(res, error.message);
  }
};
