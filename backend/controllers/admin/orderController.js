// ─────────────────────────────────────────────────────────
//  controllers/admin/orderController.js — Order Management
// ─────────────────────────────────────────────────────────
const Order = require("../../models/Order");
const User = require("../../models/User");
const Product = require("../../models/Product");
const ApiResponse = require("../../utils/ApiResponse");
const { logAction } = require("../../services/auditService");
const { generateInvoicePDF } = require("../../services/invoiceService");

// GET /api/admin/orders
exports.getOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const search = req.query.search || "";
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    const dateFrom = req.query.dateFrom;
    const dateTo = req.query.dateTo;

    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
      ];
    }
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("customer", "name email phone")
        .populate("assignedDistributor", "name businessName")
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter),
    ]);

    return ApiResponse.success(res, "Orders retrieved", {
      orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

// GET /api/admin/orders/:id
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("customer", "name email phone")
      .populate("assignedDistributor", "name email businessName phone")
      .populate("assignedGarage", "name businessName")
      .populate("items.product", "name images sku")
      .populate("statusHistory.changedBy", "name");

    if (!order) return ApiResponse.notFound(res, "Order not found");

    return ApiResponse.success(res, "Order retrieved", { order });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

// PUT /api/admin/orders/assign-distributor/:id
exports.assignDistributor = async (req, res) => {
  try {
    const { distributorId } = req.body;
    if (!distributorId) return ApiResponse.error(res, "distributorId is required");

    const distributor = await User.findOne({ _id: distributorId, role: "distributor", isActive: true });
    if (!distributor) return ApiResponse.notFound(res, "Active distributor not found");

    const order = await Order.findById(req.params.id);
    if (!order) return ApiResponse.notFound(res, "Order not found");

    order.assignedDistributor = distributorId;
    order.assignedAt = new Date();
    order.statusHistory.push({
      status: "processing",
      changedBy: req.user._id,
      note: `Assigned to distributor: ${distributor.businessName || distributor.name}`,
    });
    if (order.status === "pending" || order.status === "confirmed") {
      order.status = "processing";
    }
    await order.save();

    await logAction(req, {
      action: "ASSIGN", entity: "Order",
      entityId: order._id,
      details: { distributorId, distributorName: distributor.name },
    });

    return ApiResponse.success(res, "Distributor assigned to order", {
      order: {
        id: order._id, orderNumber: order.orderNumber,
        status: order.status, assignedDistributor: distributor.name,
      },
    });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

// PUT /api/admin/orders/update-status/:id
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, note, trackingNumber, trackingUrl, estimatedDelivery } = req.body;

    const validStatuses = [
      "pending", "confirmed", "processing", "shipped",
      "out_for_delivery", "delivered", "cancelled", "returned", "refunded",
    ];
    if (!validStatuses.includes(status)) {
      return ApiResponse.error(res, `Invalid status. Must be one of: ${validStatuses.join(", ")}`);
    }

    const order = await Order.findById(req.params.id);
    if (!order) return ApiResponse.notFound(res, "Order not found");

    const prevStatus = order.status;
    order.status = status;
    order.statusHistory.push({
      status,
      changedBy: req.user._id,
      note: note || `Status changed from ${prevStatus} to ${status}`,
    });

    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (trackingUrl) order.trackingUrl = trackingUrl;
    if (estimatedDelivery) order.estimatedDelivery = new Date(estimatedDelivery);

    if (status === "delivered") order.paymentStatus = "paid";
    if (status === "cancelled" && order.paymentStatus === "paid") {
      order.paymentStatus = "refunded";
    }

    await order.save();

    await logAction(req, {
      action: "STATUS_CHANGE", entity: "Order",
      entityId: order._id, details: { prevStatus, newStatus: status },
    });

    return ApiResponse.success(res, "Order status updated", {
      order: { id: order._id, orderNumber: order.orderNumber, status: order.status },
    });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

// POST /api/admin/orders/refund/:id
exports.processRefund = async (req, res) => {
  try {
    const { amount, reason } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) return ApiResponse.notFound(res, "Order not found");

    if (!amount || amount <= 0) {
      return ApiResponse.error(res, "Valid refund amount is required");
    }
    if (amount > order.totalAmount) {
      return ApiResponse.error(res, "Refund amount cannot exceed order total");
    }

    order.refund = {
      amount,
      reason: reason || "Admin initiated refund",
      processedAt: new Date(),
      processedBy: req.user._id,
      status: "processed",
    };
    order.status = "refunded";
    order.paymentStatus = "refunded";
    order.statusHistory.push({
      status: "refunded",
      changedBy: req.user._id,
      note: `Refund of ₹${amount} processed. Reason: ${reason || "N/A"}`,
    });
    await order.save();

    // Restore stock for refunded items
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }

    await logAction(req, {
      action: "REFUND", entity: "Order",
      entityId: order._id, details: { amount, reason },
    });

    return ApiResponse.success(res, "Refund processed successfully", {
      refund: order.refund,
      orderStatus: order.status,
    });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};
