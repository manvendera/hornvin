// ─────────────────────────────────────────────────────────
//  controllers/admin/userManagementController.js — User Management
// ─────────────────────────────────────────────────────────
const User = require("../../models/User");
const ApiResponse = require("../../utils/ApiResponse");
const { logAction } = require("../../services/auditService");

// ═══════════════════════════════════════════════════════
//  DISTRIBUTOR MANAGEMENT
// ═══════════════════════════════════════════════════════

// POST /api/admin/distributors
exports.createDistributor = async (req, res) => {
  try {
    const {
      name, email, password, phone, businessName,
      businessAddress, gstNumber, panNumber,
      distributorRegion, commissionRate,
    } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return ApiResponse.error(res, "Email already registered", 409);

    const distributor = await User.create({
      name, email, password, phone, role: "distributor",
      businessName, businessAddress, gstNumber, panNumber,
      distributorRegion, commissionRate: commissionRate || 0,
      isEmailVerified: true,
      approvalStatus: "approved",
      approvedBy: req.user._id,
      approvedAt: new Date(),
    });

    await logAction(req, {
      action: "CREATE", entity: "User",
      entityId: distributor._id, details: { name, email, role: "distributor" },
    });

    return ApiResponse.created(res, "Distributor created", {
      distributor: {
        id: distributor._id, name: distributor.name, email: distributor.email,
        businessName: distributor.businessName, role: distributor.role,
      },
    });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

// GET /api/admin/distributors
exports.getDistributors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";
    const status = req.query.status;

    const filter = { role: "distributor" };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { businessName: { $regex: search, $options: "i" } },
      ];
    }
    if (status === "active") filter.isActive = true;
    if (status === "inactive") filter.isActive = false;

    const [distributors, total] = await Promise.all([
      User.find(filter)
        .select("-password -refreshTokens")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    return ApiResponse.success(res, "Distributors retrieved", {
      distributors,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

// DELETE /api/admin/distributors/:id (soft delete)
exports.deleteDistributor = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id, role: "distributor" });
    if (!user) return ApiResponse.notFound(res, "Distributor not found");

    await user.softDelete(req.user._id);

    await logAction(req, {
      action: "DELETE", entity: "User",
      entityId: user._id, details: { name: user.name, role: "distributor" },
    });

    return ApiResponse.success(res, "Distributor deleted");
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

// ═══════════════════════════════════════════════════════
//  GARAGE MANAGEMENT
// ═══════════════════════════════════════════════════════

// GET /api/admin/garages
exports.getGarages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";
    const approval = req.query.approval;

    const filter = { role: "garage" };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { businessName: { $regex: search, $options: "i" } },
      ];
    }
    if (approval) filter.approvalStatus = approval;

    const [garages, total] = await Promise.all([
      User.find(filter)
        .select("-password -refreshTokens")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    return ApiResponse.success(res, "Garages retrieved", {
      garages,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

// PUT /api/admin/garages/approve/:id
exports.approveGarage = async (req, res) => {
  try {
    const { action, rejectionReason } = req.body; // "approve" or "reject"
    const garage = await User.findOne({ _id: req.params.id, role: "garage" });
    if (!garage) return ApiResponse.notFound(res, "Garage not found");

    if (action === "approve") {
      garage.approvalStatus = "approved";
      garage.approvedBy = req.user._id;
      garage.approvedAt = new Date();
      garage.isActive = true;
    } else if (action === "reject") {
      garage.approvalStatus = "rejected";
      garage.rejectionReason = rejectionReason || "Not approved";
      garage.isActive = false;
    } else {
      return ApiResponse.error(res, "Action must be 'approve' or 'reject'");
    }

    await garage.save({ validateBeforeSave: false });

    await logAction(req, {
      action: action === "approve" ? "APPROVE" : "REJECT",
      entity: "User",
      entityId: garage._id,
      details: { name: garage.name, action, rejectionReason },
    });

    return ApiResponse.success(
      res,
      `Garage ${action === "approve" ? "approved" : "rejected"} successfully`,
      { garage: { id: garage._id, name: garage.name, approvalStatus: garage.approvalStatus } }
    );
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

// ═══════════════════════════════════════════════════════
//  CUSTOMER MANAGEMENT
// ═══════════════════════════════════════════════════════

// GET /api/admin/customers
exports.getCustomers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";

    const filter = { role: "customer" };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const [customers, total] = await Promise.all([
      User.find(filter)
        .select("-password -refreshTokens")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    return ApiResponse.success(res, "Customers retrieved", {
      customers,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

// DELETE /api/admin/customers/:id (soft delete)
exports.deleteCustomer = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id, role: "customer" });
    if (!user) return ApiResponse.notFound(res, "Customer not found");

    await user.softDelete(req.user._id);

    await logAction(req, {
      action: "DELETE", entity: "User",
      entityId: user._id, details: { name: user.name, role: "customer" },
    });

    return ApiResponse.success(res, "Customer deleted");
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};
// ═══════════════════════════════════════════════════════
//  SALES TEAM MANAGEMENT
// ═══════════════════════════════════════════════════════

// POST /api/admin/sales-team
exports.createSalesTeam = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const existing = await User.findOne({ $or: [{ email }, { phoneNumber: phone }] });
    if (existing) return ApiResponse.error(res, "Email or Phone already registered", 409);

    const member = await User.create({
      name, email, password, phoneNumber: phone, role: "sales_team",
      isEmailVerified: true,
      isPhoneVerified: true,
      isActive: true,
    });

    await logAction(req, {
      action: "CREATE", entity: "User",
      entityId: member._id, details: { name, email, role: "sales_team" },
    });

    return ApiResponse.created(res, "Sales team member created", {
      member: { id: member._id, name: member.name, email: member.email, role: member.role },
    });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

// GET /api/admin/sales-team
exports.getSalesTeam = async (req, res) => {
  try {
    const salesTeam = await User.find({ role: "sales_team", isDeleted: false })
      .select("-password -refreshTokens")
      .sort({ createdAt: -1 });

    return ApiResponse.success(res, "Sales team retrieved", { salesTeam });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

// DELETE /api/admin/sales-team/:id
exports.deleteSalesTeam = async (req, res) => {
  try {
    const member = await User.findOne({ _id: req.params.id, role: "sales_team" });
    if (!member) return ApiResponse.notFound(res, "Sales team member not found");

    await member.softDelete(req.user._id);

    await logAction(req, {
      action: "DELETE", entity: "User",
      entityId: member._id, details: { name: member.name, role: "sales_team" },
    });

    return ApiResponse.success(res, "Sales team member deleted");
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};
