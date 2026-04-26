// ─────────────────────────────────────────────────────────
//  controllers/distributor/logisticsController.js
// ─────────────────────────────────────────────────────────
const DeliveryLog = require("../../models/DeliveryLog");
const Order = require("../../models/Order");
const ApiResponse = require("../../utils/ApiResponse");

/**
 * POST /api/distributor/delivery/assign
 * Assign a delivery agent to an order
 */
exports.assignAgent = async (req, res) => {
  try {
    const { orderId, agentId, estimatedDelivery } = req.body;

    const order = await Order.findOne({ _id: orderId, assignedDistributor: req.user._id });
    if (!order) return ApiResponse.notFound(res, "Order not found");

    // Generate a simple 6-digit OTP for delivery verification
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const deliveryLog = await DeliveryLog.create({
      order: orderId,
      agent: agentId || req.user._id, // Default to self if no agentId
      status: "assigned",
      otp,
      estimatedDelivery: estimatedDelivery || new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    order.status = "processing";
    await order.save();

    return ApiResponse.success(res, "Delivery agent assigned", deliveryLog);
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

/**
 * GET /api/distributor/delivery/:orderId
 * Track delivery status
 */
exports.trackDelivery = async (req, res) => {
  try {
    const log = await DeliveryLog.findOne({ order: req.params.orderId })
      .populate("agent", "name phone");

    if (!log) return ApiResponse.notFound(res, "Delivery info not found");

    return ApiResponse.success(res, "Delivery tracking data fetched", log);
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

/**
 * POST /api/distributor/delivery/otp-verify
 */
exports.verifyOtp = async (req, res) => {
  try {
    const { orderId, otp } = req.body;
    const log = await DeliveryLog.findOne({ order: orderId });

    if (!log) return ApiResponse.notFound(res, "Delivery record not found");
    if (log.otp !== otp) return ApiResponse.badRequest(res, "Invalid OTP");

    log.isOtpVerified = true;
    log.status = "delivered";
    log.actualDelivery = new Date();
    await log.save();

    // Update main order
    await Order.findByIdAndUpdate(orderId, { status: "delivered" });

    return ApiResponse.success(res, "OTP verified successfully. Order marked as delivered.");
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

/**
 * POST /api/distributor/delivery/proof
 * Upload delivery proof (signature/image URL)
 */
exports.uploadProof = async (req, res) => {
  try {
    const { orderId, proofUrl, type } = req.body; // type: 'image' or 'signature'
    
    const updateField = type === 'signature' ? { signatureImage: proofUrl } : { proofImage: proofUrl };
    
    const log = await DeliveryLog.findOneAndUpdate(
      { order: orderId },
      { ...updateField },
      { new: true }
    );

    if (!log) return ApiResponse.notFound(res, "Delivery record not found");

    return ApiResponse.success(res, "Delivery proof uploaded", log);
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};
