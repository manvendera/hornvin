// ─────────────────────────────────────────────────────────
//  controllers/financeController.js — Finance & Reports
// ─────────────────────────────────────────────────────────
const Order = require("../models/Order");
const ApiResponse = require("../utils/ApiResponse");
const { generateInvoicePDF } = require("../services/invoiceService");
const { logAction } = require("../services/auditService");

// GET /api/admin/reports/sales
exports.getSalesReport = async (req, res) => {
  try {
    const { period = "monthly", dateFrom, dateTo } = req.query;

    let groupFormat;
    switch (period) {
      case "daily": groupFormat = "%Y-%m-%d"; break;
      case "weekly": groupFormat = "%Y-W%V"; break;
      case "yearly": groupFormat = "%Y"; break;
      default: groupFormat = "%Y-%m"; break;
    }

    const matchStage = { paymentStatus: { $in: ["paid", "refunded"] } };
    if (dateFrom) matchStage.createdAt = { ...(matchStage.createdAt || {}), $gte: new Date(dateFrom) };
    if (dateTo) matchStage.createdAt = { ...(matchStage.createdAt || {}), $lte: new Date(dateTo) };

    const salesData = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: "$createdAt" } },
          totalSales: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: "$totalAmount" },
          totalGst: { $sum: "$totalGst" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Top selling products
    const topProducts = await Order.aggregate([
      { $match: matchStage },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          productName: { $first: "$items.name" },
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: { $sum: "$items.totalPrice" },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
    ]);

    return ApiResponse.success(res, "Sales report generated", {
      period,
      salesData,
      topProducts,
    });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

// GET /api/admin/reports/revenue
exports.getRevenueReport = async (req, res) => {
  try {
    const { year } = req.query;
    const targetYear = parseInt(year) || new Date().getFullYear();

    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${targetYear}-01-01`),
            $lt: new Date(`${targetYear + 1}-01-01`),
          },
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
          avgOrderValue: { $avg: "$totalAmount" },
          gstCollected: { $sum: "$totalGst" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const yearTotal = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${targetYear}-01-01`),
            $lt: new Date(`${targetYear + 1}-01-01`),
          },
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
          totalGst: { $sum: "$totalGst" },
        },
      },
    ]);

    return ApiResponse.success(res, "Revenue report generated", {
      year: targetYear,
      monthlyRevenue,
      yearSummary: yearTotal[0] || { totalRevenue: 0, totalOrders: 0, totalGst: 0 },
    });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

// GET /api/admin/reports/gst
exports.getGstReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    const targetYear = parseInt(year) || new Date().getFullYear();
    const targetMonth = parseInt(month) || new Date().getMonth() + 1;

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    const gstBreakdown = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          paymentStatus: "paid",
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.gstRate",
          taxableAmount: { $sum: "$items.totalPrice" },
          gstCollected: { $sum: "$items.gstAmount" },
          itemCount: { $sum: "$items.quantity" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const totalGst = gstBreakdown.reduce((sum, item) => sum + item.gstCollected, 0);
    const totalTaxable = gstBreakdown.reduce((sum, item) => sum + item.taxableAmount, 0);

    return ApiResponse.success(res, "GST report generated", {
      period: `${targetMonth}/${targetYear}`,
      gstBreakdown,
      summary: {
        totalTaxableAmount: totalTaxable,
        totalGstCollected: totalGst,
        cgst: totalGst / 2,
        sgst: totalGst / 2,
      },
    });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

// POST /api/admin/invoice/:orderId
exports.generateInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate("customer", "name email phone")
      .populate("items.product", "name sku");

    if (!order) return ApiResponse.notFound(res, "Order not found");

    // Generate invoice number if not exists
    if (!order.invoiceNumber) {
      const date = new Date();
      order.invoiceNumber = `INV-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}-${order.orderNumber.split("-").pop()}`;
      order.invoiceGeneratedAt = new Date();
      await order.save();
    }

    const pdfBuffer = await generateInvoicePDF(order);

    await logAction(req, {
      action: "CREATE", entity: "Invoice",
      entityId: order._id,
      details: { invoiceNumber: order.invoiceNumber, orderId: order._id },
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${order.invoiceNumber}.pdf`
    );
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Invoice generation error:", error);
    return ApiResponse.serverError(res, error.message);
  }
};
