// ─────────────────────────────────────────────────────────
//  controllers/customer/recommendationController.js
// ─────────────────────────────────────────────────────────
const Product = require("../../models/Product");
const Order = require("../../models/Order");
const ApiResponse = require("../../utils/ApiResponse");

/**
 * GET /api/customer/recommendations
 * AI-based suggestions based on browsing/purchase history
 */
exports.getRecommendations = async (req, res) => {
  try {
    // Basic recommendation logic: 
    // 1. Get user's last purchased categories
    const lastOrders = await Order.find({ customer: req.user._id })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate("items.product");

    const categoryIds = [];
    lastOrders.forEach(order => {
      order.items.forEach(item => {
        if (item.product && item.product.category) {
          categoryIds.push(item.product.category);
        }
      });
    });

    let recommended;
    if (categoryIds.length > 0) {
      recommended = await Product.find({
        category: { $in: categoryIds },
        isActive: true,
        _id: { $nin: lastOrders.flatMap(o => o.items.map(i => i.product._id)) }
      }).limit(10);
    } else {
      // Fallback to featured products
      recommended = await Product.find({ isFeatured: true, isActive: true }).limit(10);
    }

    return ApiResponse.success(res, "Recommendations retrieved", { recommended });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

/**
 * GET /api/customer/recommendations/reorder
 * Suggest products frequently purchased
 */
exports.getReorderSuggestions = async (req, res) => {
  try {
    const frequentProducts = await Order.aggregate([
      { $match: { customer: req.user._id, status: "delivered" } },
      { $unwind: "$items" },
      { $group: { _id: "$items.product", count: { $sum: 1 }, name: { $first: "$items.name" } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const productIds = frequentProducts.map(p => p._id);
    const products = await Product.find({ _id: { $in: productIds }, isActive: true });

    return ApiResponse.success(res, "Reorder suggestions retrieved", { products });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};
