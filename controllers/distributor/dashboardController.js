// ─────────────────────────────────────────────────────────
//  controllers/distributor/dashboardController.js
// ─────────────────────────────────────────────────────────
const Order = require("../../models/Order");
const Inventory = require("../../models/Inventory");
const ApiResponse = require("../../utils/ApiResponse");

/**
 * GET /api/distributor/dashboard
 * Fetch summary statistics for the distributor dashboard
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const distributorId = req.user._id;

    // 1. Total & Today's Orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalOrders = await Order.countDocuments({ assignedDistributor: distributorId });
    const todayOrders = await Order.countDocuments({ 
      assignedDistributor: distributorId,
      createdAt: { $gte: today }
    });

    // 2. Pending Deliveries
    const pendingDeliveries = await Order.countDocuments({
      assignedDistributor: distributorId,
      status: { $in: ["processing", "shipped", "out_for_delivery"] }
    });

    // 3. Total Revenue (Delivered orders only)
    const revenueResult = await Order.aggregate([
      { $match: { assignedDistributor: distributorId, status: "delivered" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // 4. Low Stock Count (Allocated items)
    const inventory = await Inventory.find({ "allocations.distributor": distributorId });
    let lowStockCount = 0;
    inventory.forEach(item => {
      const allocation = item.allocations.find(a => a.distributor.toString() === distributorId.toString());
      if (allocation && allocation.quantity <= 10) { // Example threshold
        lowStockCount++;
      }
    });

    // 5. Top Selling Products
    const topSelling = await Order.aggregate([
      { $match: { assignedDistributor: distributorId, status: "delivered" } },
      { $unwind: "$items" },
      { $group: { _id: "$items.product", name: { $first: "$items.name" }, totalSold: { $sum: "$items.quantity" } } },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ]);

    // 6. Monthly Growth Data (Last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const growthData = await Order.aggregate([
      { $match: { assignedDistributor: distributorId, createdAt: { $gte: sixMonthsAgo } } },
      { $group: { 
          _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
          orders: { $sum: 1 },
          revenue: { $sum: "$totalAmount" }
      }},
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    return ApiResponse.success(res, "Dashboard stats fetched successfully", {
      totalOrders,
      todayOrders,
      pendingDeliveries,
      totalRevenue,
      lowStockCount,
      topSellingProducts: topSelling,
      monthlyGrowthData: growthData
    });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};
