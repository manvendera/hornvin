// ─────────────────────────────────────────────────────────
//  controllers/distributor/analyticsController.js
// ─────────────────────────────────────────────────────────
const Order = require("../../models/Order");
const ApiResponse = require("../../utils/ApiResponse");

/**
 * GET /api/distributor/analytics
 */
exports.getAnalytics = async (req, res) => {
  try {
    const distributorId = req.user._id;

    // 1. Sales Trends (Daily for last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const salesTrends = await Order.aggregate([
      { $match: { assignedDistributor: distributorId, createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 2. Product Demand
    const productDemand = await Order.aggregate([
      { $match: { assignedDistributor: distributorId } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          name: { $first: "$items.name" },
          quantity: { $sum: "$items.quantity" }
        }
      },
      { $sort: { quantity: -1 } },
      { $limit: 10 }
    ]);

    // 3. Region Performance
    const regionPerformance = await Order.aggregate([
      { $match: { assignedDistributor: distributorId } },
      {
        $group: {
          _id: "$shippingAddress.city",
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    // 4. Order Conversion Rate (Delivered / Total)
    const totalOrders = await Order.countDocuments({ assignedDistributor: distributorId });
    const deliveredOrders = await Order.countDocuments({ assignedDistributor: distributorId, status: "delivered" });
    const conversionRate = totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0;

    return ApiResponse.success(res, "Analytics data fetched successfully", {
      salesTrends,
      productDemand,
      regionPerformance,
      orderConversionRate: conversionRate.toFixed(2) + "%"
    });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};
