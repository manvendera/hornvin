// ─────────────────────────────────────────────────────────
//  controllers/garage/orderingController.js
// ─────────────────────────────────────────────────────────
const mongoose = require("mongoose");
const Product = require("../../models/Product");
const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const Garage = require("../../models/Garage");
const ApiResponse = require("../../utils/ApiResponse");

/**
 * GET /api/garage/products
 * Specialized search for garages
 */
exports.getProducts = async (req, res) => {
  try {
    const { vehicleModel, category, brand, priceMin, priceMax, page = 1, limit = 20 } = req.query;
    const query = { isActive: true, isDeleted: false };

    if (vehicleModel) query["specifications.compatibleVehicles"] = { $regex: vehicleModel, $options: "i" };
    if (category) query.category = category;
    if (brand) query.brand = { $regex: brand, $options: "i" };
    if (priceMin || priceMax) {
      query.price = {};
      if (priceMin) query.price.$gte = Number(priceMin);
      if (priceMax) query.price.$lte = Number(priceMax);
    }

    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      Product.find(query).skip(skip).limit(Number(limit)),
      Product.countDocuments(query)
    ]);

    return ApiResponse.success(res, "B2B products retrieved", {
      products,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

/**
 * POST /api/garage/orders
 * Bulk order placement with stock locking
 */
exports.placeOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { items, paymentMethod, addressId, useCredit = false } = req.body;
    const garage = await Garage.findOne({ owner: req.user._id });
    if (!garage) throw new Error("Garage profile not found");

    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId).session(session);
      if (!product || product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product?.name || item.productId}`);
      }

      // Deduct Stock (Sync)
      product.stock -= item.quantity;
      await product.save({ session });

      const itemTotal = product.price * item.quantity;
      orderItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
        totalPrice: itemTotal
      });
      subtotal += itemTotal;
    }

    const order = await Order.create([{
      customer: req.user._id,
      items: orderItems,
      subtotal,
      totalAmount: subtotal * 1.18, // GST
      paymentMethod,
      paymentStatus: useCredit ? "credit" : "pending",
      status: "pending",
      shippingAddress: garage.address // Default to garage address
    }], { session });

    await session.commitTransaction();
    return ApiResponse.created(res, "Bulk order placed successfully", { order: order[0] });
  } catch (error) {
    await session.abortTransaction();
    return ApiResponse.error(res, error.message, 400);
  } finally {
    session.endSession();
  }
};

/**
 * GET /api/garage/orders/:id/tracking
 */
exports.getTracking = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return ApiResponse.notFound(res, "Order not found");

    // Timeline based on status history
    const timeline = order.statusHistory.map(h => ({
      status: h.status,
      time: h.timestamp,
      note: h.note
    }));

    return ApiResponse.success(res, "Order tracking timeline", {
      currentStatus: order.status,
      trackingNumber: order.trackingNumber,
      timeline
    });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

/**
 * GET /api/garage/orders/repeat
 * Smart suggestions based on previous bulk orders
 */
exports.getRepeatOrders = async (req, res) => {
  try {
    const frequentItems = await Order.aggregate([
      { $match: { customer: req.user._id } },
      { $unwind: "$items" },
      { $group: { _id: "$items.product", count: { $sum: 1 }, avgQty: { $avg: "$items.quantity" } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const productIds = frequentItems.map(f => f._id);
    const products = await Product.find({ _id: { $in: productIds } });

    return ApiResponse.success(res, "Repeat order suggestions", { 
      products: products.map(p => {
        const f = frequentItems.find(fi => fi._id.toString() === p._id.toString());
        return { ...p.toObject(), suggestedQuantity: Math.ceil(f.avgQty) };
      })
    });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};
