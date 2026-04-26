// ─────────────────────────────────────────────────────────
//  controllers/distributor/earningController.js
// ─────────────────────────────────────────────────────────
const Order = require("../../models/Order");
const Payment = require("../../models/Payment");
const ApiResponse = require("../../utils/ApiResponse");

/**
 * GET /api/distributor/earnings
 */
exports.getEarningsSummary = async (req, res) => {
  try {
    const distributorId = req.user._id;

    // Total earnings from delivered orders
    const stats = await Order.aggregate([
      { $match: { assignedDistributor: distributorId, status: "delivered" } },
      { 
        $group: { 
          _id: null, 
          totalRevenue: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
          // Assuming commission is stored on the User model or calculated per order
        } 
      }
    ]);

    const result = stats.length > 0 ? stats[0] : { totalRevenue: 0, totalOrders: 0 };
    
    // Calculate commission (example: 10% or from user profile)
    const commissionRate = req.user.commissionRate || 10;
    result.totalCommission = (result.totalRevenue * commissionRate) / 100;

    return ApiResponse.success(res, "Earnings summary fetched", {
      ...result,
      commissionRate
    });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

/**
 * GET /api/distributor/payments
 * History of payments received from admin
 */
exports.getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    return ApiResponse.success(res, "Payment history fetched", payments);
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

/**
 * GET /api/distributor/reports
 * Placeholder for report generation logic
 */
exports.getReports = async (req, res) => {
  try {
    const { format, type } = req.query; // format: pdf/excel, type: sales/inventory
    
    return ApiResponse.success(res, `Generating ${type} report in ${format} format. This feature will be available in the next update.`);
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};
