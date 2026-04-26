// ─────────────────────────────────────────────────────────
//  controllers/customer/paymentController.js — Payments
// ─────────────────────────────────────────────────────────
const Order = require("../../models/Order");
const Payment = require("../../models/Payment");
const ApiResponse = require("../../utils/ApiResponse");
const crypto = require("crypto");

/**
 * POST /api/customer/orders/:id/pay
 * Initiate/Process payment for an order
 */
exports.processPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findOne({ _id: id, customer: req.user._id });

    if (!order) return ApiResponse.notFound(res, "Order not found");
    if (order.paymentStatus === "paid") return ApiResponse.error(res, "Order already paid");

    // In a real scenario, you'd call Razorpay/Stripe API here
    // Example: const razorpayOrder = await razorpay.orders.create({ amount: order.totalAmount * 100, currency: "INR", receipt: order.orderNumber });

    return ApiResponse.success(res, "Payment initiated", {
      orderId: order._id,
      amount: order.totalAmount,
      currency: "INR",
      paymentGateway: "razorpay", // placeholder
      gatewayOrderId: "order_mock_" + Date.now() // placeholder
    });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

/**
 * POST /api/customer/orders/:id/verify
 * Verify payment signature from gateway
 */
exports.verifyPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    const order = await Order.findOne({ _id: id, customer: req.user._id });
    if (!order) return ApiResponse.notFound(res, "Order not found");

    // Mock verification logic
    // In real: const body = razorpay_order_id + "|" + razorpay_payment_id;
    // const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET).update(body.toString()).digest('hex');
    const isValid = true; // For demo/mock

    if (isValid) {
      order.paymentStatus = "paid";
      order.paymentId = razorpay_payment_id;
      order.status = "confirmed";
      order.statusHistory.push({ status: "confirmed", note: "Payment verified" });
      await order.save();

      // Create Payment record
      await Payment.create({
        order: order._id,
        customer: req.user._id,
        amount: order.totalAmount,
        method: order.paymentMethod,
        transactionId: razorpay_payment_id,
        status: "success",
        gatewayResponse: req.body
      });

      return ApiResponse.success(res, "Payment verified successfully", { order });
    } else {
      return ApiResponse.error(res, "Invalid signature", 400);
    }
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

/**
 * GET /api/customer/payments
 */
exports.getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ customer: req.user._id })
      .populate("order", "orderNumber totalAmount createdAt")
      .sort({ createdAt: -1 });

    return ApiResponse.success(res, "Payment history retrieved", { payments });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};
