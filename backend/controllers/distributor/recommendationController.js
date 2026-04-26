// ─────────────────────────────────────────────────────────
//  controllers/distributor/recommendationController.js
// ─────────────────────────────────────────────────────────
const Inventory = require("../../models/Inventory");
const Order = require("../../models/Order");
const ApiResponse = require("../../utils/ApiResponse");

/**
 * GET /api/distributor/recommendations/restock
 * Suggest products to restock based on low stock or high velocity
 */
exports.getRestockRecommendations = async (req, res) => {
  try {
    const distributorId = req.user._id;

    // Find items where this distributor has low stock
    const inventory = await Inventory.find({ 
      "allocations.distributor": distributorId
    }).populate("product", "name sku");

    const recommendations = inventory
      .map(item => {
        const allocation = item.allocations.find(a => a.distributor.toString() === distributorId.toString());
        return {
          product: item.product,
          currentStock: allocation ? allocation.quantity : 0,
          threshold: item.lowStockThreshold,
          priority: allocation && allocation.quantity <= item.lowStockThreshold ? "high" : "medium"
        };
      })
      .filter(r => r.priority === "high" || r.currentStock < r.threshold * 2);

    return ApiResponse.success(res, "Restock recommendations generated", recommendations);
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

/**
 * GET /api/distributor/recommendations/repeat-orders
 * Identify customers who might want to reorder
 */
exports.getRepeatOrderRecommendations = async (req, res) => {
  try {
    const distributorId = req.user._id;

    // Find customers who haven't ordered in the last 30 days but have ordered before
    const lastMonth = new Date();
    lastMonth.setDate(lastMonth.getDate() - 30);

    const repeatCustomers = await Order.aggregate([
      { $match: { assignedDistributor: distributorId } },
      { $group: { 
          _id: "$customer", 
          lastOrderDate: { $max: "$createdAt" }, 
          orderCount: { $sum: 1 } 
      }},
      { $match: { lastOrderDate: { $lt: lastMonth }, orderCount: { $gt: 1 } } },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "customerDetails" } },
      { $unwind: "$customerDetails" },
      { $project: { "customerDetails.password": 0, "customerDetails.refreshTokens": 0 } }
    ]);

    return ApiResponse.success(res, "Repeat order recommendations fetched", repeatCustomers);
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};
