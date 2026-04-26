// ─────────────────────────────────────────────────────────
//  controllers/garage/analyticsController.js
// ─────────────────────────────────────────────────────────
const Order = require("../../models/Order");
const ServiceJob = require("../../models/ServiceJob");
const Garage = require("../../models/Garage");
const ApiResponse = require("../../utils/ApiResponse");

/**
 * GET /api/garage/analytics
 */
exports.getAnalytics = async (req, res) => {
  try {
    const garage = await Garage.findOne({ owner: req.user._id });
    const garageId = garage._id;

    // 1. Monthly Spending
    const spending = await Order.aggregate([
      { $match: { customer: req.user._id, status: { $ne: "cancelled" } } },
      { $group: { _id: { month: { $month: "$createdAt" } }, total: { $sum: "$totalAmount" } } }
    ]);

    // 2. Most Used Products (from service jobs)
    const topProducts = await ServiceJob.aggregate([
      { $match: { garage: garageId, status: "delivered" } },
      { $unwind: "$partsUsed" },
      { $group: { _id: "$partsUsed.name", count: { $sum: "$partsUsed.quantity" } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // 3. Service Profit (simplified)
    const profit = await ServiceJob.aggregate([
      { $match: { garage: garageId, status: "delivered" } },
      { $group: { _id: null, totalRevenue: { $sum: "$actualCost" } } }
    ]);

    return ApiResponse.success(res, "Garage analytics retrieved", {
      monthlySpending: spending,
      mostUsedProducts: topProducts,
      totalRevenue: profit[0]?.totalRevenue || 0
    });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

/**
 * POST /api/garage/returns
 */
exports.requestReturn = async (req, res) => {
  // Logic to initiate return for a B2B order
  try {
    const { orderId, productId, reason } = req.body;
    // Implementation placeholder...
    return ApiResponse.success(res, "Return request initiated");
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};
