// ─────────────────────────────────────────────────────────
//  controllers/customer/cartController.js — Cart Module
// ─────────────────────────────────────────────────────────
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");
const ApiResponse = require("../../utils/ApiResponse");

/**
 * GET /api/customer/cart
 */
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ customer: req.user._id })
      .populate("items.product", "name slug price mrp images brand isInStock stock");

    if (!cart) {
      cart = await Cart.create({ customer: req.user._id, items: [] });
    }

    return ApiResponse.success(res, "Cart retrieved successfully", { cart });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

/**
 * POST /api/customer/cart
 * Add or increment item in cart
 */
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return ApiResponse.notFound(res, "Product not found or inactive");
    }

    if (product.stock < quantity) {
      return ApiResponse.error(res, "Insufficient stock", 400);
    }

    let cart = await Cart.findOne({ customer: req.user._id });
    if (!cart) {
      cart = new Cart({ customer: req.user._id, items: [] });
    }

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

    if (itemIndex > -1) {
      // Update existing item
      cart.items[itemIndex].quantity += Number(quantity);
      if (product.stock < cart.items[itemIndex].quantity) {
        return ApiResponse.error(res, "Cannot add more than available stock", 400);
      }
    } else {
      // Add new item
      cart.items.push({ product: productId, quantity: Number(quantity) });
    }

    await cart.save();
    
    // Return populated cart
    cart = await cart.populate("items.product", "name slug price mrp images brand");

    return ApiResponse.success(res, "Item added to cart", { cart });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

/**
 * PATCH /api/customer/cart/:itemId
 * Update quantity (itemId is the product ID)
 */
exports.updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params; // itemId here is productId
    const { quantity } = req.body;

    if (quantity < 1) {
      return ApiResponse.error(res, "Quantity must be at least 1", 400);
    }

    const cart = await Cart.findOne({ customer: req.user._id });
    if (!cart) return ApiResponse.notFound(res, "Cart not found");

    const itemIndex = cart.items.findIndex(item => item.product.toString() === itemId);
    if (itemIndex === -1) return ApiResponse.notFound(res, "Item not found in cart");

    // Check stock
    const product = await Product.findById(itemId);
    if (product.stock < quantity) {
      return ApiResponse.error(res, `Only ${product.stock} units available`, 400);
    }

    cart.items[itemIndex].quantity = Number(quantity);
    await cart.save();

    return ApiResponse.success(res, "Cart updated successfully", { cart });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

/**
 * DELETE /api/customer/cart/:itemId
 */
exports.removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    const cart = await Cart.findOne({ customer: req.user._id });
    if (!cart) return ApiResponse.notFound(res, "Cart not found");

    cart.items = cart.items.filter(item => item.product.toString() !== itemId);
    await cart.save();

    return ApiResponse.success(res, "Item removed from cart", { cart });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

/**
 * DELETE /api/customer/cart
 */
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ customer: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    return ApiResponse.success(res, "Cart cleared successfully");
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};
