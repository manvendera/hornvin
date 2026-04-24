// ─────────────────────────────────────────────────────────
//  controllers/distributor/orderController.js
// ─────────────────────────────────────────────────────────
const Order = require("../../models/Order");
const Inventory = require("../../models/Inventory");
const ApiResponse = require("../../utils/ApiResponse");
const mongoose = require("mongoose");

/**
 * GET /api/distributor/orders
 */
exports.getOrders = async (req, res) => {
  try {
    const { status, priority, startDate, endDate } = req.query;
    let query = { assignedDistributor: req.user._id };

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const orders = await Order.find(query)
      .populate("customer", "name email phone")
      .sort({ createdAt: -1 });

    return ApiResponse.success(res, "Orders fetched successfully", orders);
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

/**
 * GET /api/distributor/orders/:id
 */
exports.getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findOne({ 
      _id: req.params.id, 
      assignedDistributor: req.user._id 
    }).populate("customer", "name email phone businessName");

    if (!order) return ApiResponse.notFound(res, "Order not found");

    return ApiResponse.success(res, "Order details fetched", order);
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

/**
 * PATCH /api/distributor/orders/:id/status
 */
exports.updateOrderStatus = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { status, note } = req.body;
    const allowedStatuses = ["PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"];
    
    if (!allowedStatuses.includes(status.toUpperCase())) {
      return ApiResponse.badRequest(res, "Invalid status update");
    }

    const order = await Order.findOne({ 
      _id: req.params.id, 
      assignedDistributor: req.user._id 
    }).session(session);

    if (!order) {
      await session.abortTransaction();
      return ApiResponse.notFound(res, "Order not found");
    }

    // Atomic update status and push to history
    order.status = status.toLowerCase();
    order.statusHistory.push({
      status: status.toLowerCase(),
      changedBy: req.user._id,
      note: note || `Status updated to ${status}`
    });

    // If delivered, update payment status if COD
    if (status.toUpperCase() === "DELIVERED" && order.paymentMethod === "cod") {
      order.paymentStatus = "paid";
    }

    await order.save({ session });
    await session.commitTransaction();

    return ApiResponse.success(res, `Order status updated to ${status}`, order);
  } catch (error) {
    await session.abortTransaction();
    return ApiResponse.serverError(res, error.message);
  } finally {
    session.endSession();
  }
};

/**
 * PATCH /api/distributor/orders/:id/accept
 */
exports.acceptOrder = async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, assignedDistributor: req.user._id, status: "pending" },
      { 
        status: "confirmed",
        $push: { statusHistory: { status: "confirmed", changedBy: req.user._id, note: "Order accepted by distributor" } }
      },
      { new: true }
    );

    if (!order) return ApiResponse.notFound(res, "Order not found or already processed");

    return ApiResponse.success(res, "Order accepted successfully", order);
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

/**
 * POST /api/distributor/orders/:id/cancel
 */
exports.cancelOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { reason } = req.body;
    const order = await Order.findOne({ 
      _id: req.params.id, 
      assignedDistributor: req.user._id 
    }).session(session);

    if (!order) {
      await session.abortTransaction();
      return ApiResponse.notFound(res, "Order not found");
    }

    if (["delivered", "cancelled"].includes(order.status)) {
      await session.abortTransaction();
      return ApiResponse.badRequest(res, `Cannot cancel order in ${order.status} state`);
    }

    // Return stock to distributor allocation
    for (const item of order.items) {
      await Inventory.findOneAndUpdate(
        { product: item.product, "allocations.distributor": req.user._id },
        { 
          $inc: { "allocations.$.quantity": item.quantity },
          $push: { history: { type: "return", quantity: item.quantity, reference: order.orderNumber, note: "Order cancelled" } }
        }
      ).session(session);
    }

    order.status = "cancelled";
    order.statusHistory.push({ status: "cancelled", changedBy: req.user._id, note: reason });
    await order.save({ session });

    await session.commitTransaction();
    return ApiResponse.success(res, "Order cancelled and stock returned", order);
  } catch (error) {
    await session.abortTransaction();
    return ApiResponse.serverError(res, error.message);
  } finally {
    session.endSession();
  }
};
