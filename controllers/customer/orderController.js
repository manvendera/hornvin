// ─────────────────────────────────────────────────────────
//  controllers/customer/orderController.js — Core Checkout
// ─────────────────────────────────────────────────────────
const mongoose = require("mongoose");
const Order = require("../../models/Order");
const Product = require("../../models/Product");
const Cart = require("../../models/Cart");
const User = require("../../models/User");
const ApiResponse = require("../../utils/ApiResponse");

/**
 * POST /api/customer/orders/checkout
 * Main checkout flow with transactions and stock locking
 */
exports.checkout = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { addressId, paymentMethod, customerNotes } = req.body;
    const customerId = req.user._id;

    // 1. Fetch Cart
    const cart = await Cart.findOne({ customer: customerId }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      return ApiResponse.error(res, "Cart is empty", 400);
    }

    // 2. Fetch Customer & Validate Address
    const customer = await User.findById(customerId);
    const address = customer.addresses.find(addr => addr._id.toString() === addressId);
    if (!address) {
      return ApiResponse.error(res, "Invalid shipping address", 400);
    }

    const orderItems = [];
    let subtotal = 0;
    let totalGst = 0;

    // 3. Validate Inventory & Calculate Totals (Stock Locking)
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id).session(session);

      if (!product || !product.isActive) {
        throw new Error(`Product ${item.product.name} is no longer available`);
      }

      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}`);
      }

      // Lock Stock (Deduct)
      product.stock -= item.quantity;
      await product.save({ session });

      const itemTotal = product.price * item.quantity;
      const itemGst = (itemTotal * (product.gstRate || 18)) / 100;

      orderItems.push({
        product: product._id,
        name: product.name,
        sku: product.sku,
        quantity: item.quantity,
        price: product.price,
        gstRate: product.gstRate,
        gstAmount: itemGst,
        totalPrice: itemTotal + itemGst
      });

      subtotal += itemTotal;
      totalGst += itemGst;
    }

    const shippingCost = subtotal > 1000 ? 0 : 100; // Example shipping logic
    const totalAmount = subtotal + totalGst + shippingCost;

    // 4. Create Order
    const order = await Order.create([{
      customer: customerId,
      items: orderItems,
      subtotal,
      totalGst,
      shippingCost,
      totalAmount,
      shippingAddress: {
        name: address.name,
        phone: address.phone,
        street: address.street,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        country: address.country
      },
      paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "pending" : "pending",
      status: "pending",
      customerNotes
    }], { session });

    // 5. Clear Cart
    await Cart.findOneAndUpdate({ customer: customerId }, { items: [] }, { session });

    await session.commitTransaction();
    session.endSession();

    return ApiResponse.created(res, "Order placed successfully", { 
      order: order[0],
      paymentRequired: paymentMethod !== "cod" 
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Checkout error:", error);
    return ApiResponse.error(res, error.message, 400);
  }
};

/**
 * GET /api/customer/orders
 */
exports.getOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const filter = { customer: req.user._id };
    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Order.countDocuments(filter);

    return ApiResponse.success(res, "Orders retrieved", {
      orders,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

/**
 * GET /api/customer/orders/:id
 */
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, customer: req.user._id })
      .populate("items.product", "images");

    if (!order) return ApiResponse.notFound(res, "Order not found");

    return ApiResponse.success(res, "Order details retrieved", { order });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

/**
 * PATCH /api/customer/orders/:id/cancel
 */
exports.cancelOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const order = await Order.findOne({ _id: req.params.id, customer: req.user._id }).session(session);
    if (!order) return ApiResponse.notFound(res, "Order not found");

    if (!["pending", "confirmed"].includes(order.status)) {
      return ApiResponse.error(res, "Cannot cancel order at this stage", 400);
    }

    order.status = "cancelled";
    order.statusHistory.push({ status: "cancelled", changedBy: req.user._id, note: "Cancelled by customer" });
    await order.save({ session });

    // Restore Inventory
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } }, { session });
    }

    await session.commitTransaction();
    return ApiResponse.success(res, "Order cancelled successfully");
  } catch (error) {
    await session.abortTransaction();
    return ApiResponse.serverError(res, error.message);
  } finally {
    session.endSession();
  }
};

/**
 * GET /api/customer/orders/:id/tracking
 */
exports.getTracking = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, customer: req.user._id })
      .select("status statusHistory trackingNumber trackingUrl estimatedDelivery");

    if (!order) return ApiResponse.notFound(res, "Order not found");

    return ApiResponse.success(res, "Tracking info retrieved", {
      currentStatus: order.status,
      history: order.statusHistory,
      tracking: {
        number: order.trackingNumber,
        url: order.trackingUrl,
        estimatedDelivery: order.estimatedDelivery
      }
    });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};
