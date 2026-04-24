// ─────────────────────────────────────────────────────────
//  controllers/admin/inventoryController.js — Inventory Management
// ─────────────────────────────────────────────────────────
const Inventory = require("../../models/Inventory");
const Product = require("../../models/Product");
const User = require("../../models/User");
const ApiResponse = require("../../utils/ApiResponse");
const { logAction } = require("../../services/auditService");

// GET /api/admin/inventory
exports.getInventory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const lowStockOnly = req.query.lowStock === "true";
    const search = req.query.search || "";

    const pipeline = [
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
      { $match: { "productInfo.isDeleted": { $ne: true } } },
    ];

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { "productInfo.name": { $regex: search, $options: "i" } },
            { "productInfo.sku": { $regex: search, $options: "i" } },
          ],
        },
      });
    }
    if (lowStockOnly) {
      pipeline.push({ $match: { isLowStock: true } });
    }

    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await Inventory.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    pipeline.push(
      { $sort: { isLowStock: -1, availableStock: 1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          product: "$productInfo._id",
          productName: "$productInfo.name",
          productSku: "$productInfo.sku",
          productPrice: "$productInfo.price",
          globalStock: 1,
          allocatedStock: 1,
          availableStock: 1,
          isLowStock: 1,
          lowStockThreshold: 1,
          lastRestocked: 1,
          allocationsCount: { $size: "$allocations" },
        },
      }
    );

    const inventory = await Inventory.aggregate(pipeline);

    // Low stock alerts count
    const lowStockCount = await Inventory.countDocuments({ isLowStock: true });

    return ApiResponse.success(res, "Inventory retrieved", {
      inventory,
      lowStockAlerts: lowStockCount,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

// POST /api/admin/inventory/allocate
exports.allocateStock = async (req, res) => {
  try {
    const { productId, distributorId, quantity, note } = req.body;

    if (!productId || !distributorId || !quantity) {
      return ApiResponse.error(res, "productId, distributorId, and quantity are required");
    }

    const distributor = await User.findOne({ _id: distributorId, role: "distributor" });
    if (!distributor) return ApiResponse.notFound(res, "Distributor not found");

    const inventory = await Inventory.findOne({ product: productId });
    if (!inventory) return ApiResponse.notFound(res, "Inventory record not found");

    if (quantity > inventory.availableStock) {
      return ApiResponse.error(
        res,
        `Insufficient stock. Available: ${inventory.availableStock}, Requested: ${quantity}`
      );
    }

    const prevStock = inventory.allocatedStock;
    inventory.allocations.push({
      distributor: distributorId,
      quantity,
      allocatedBy: req.user._id,
    });
    inventory.allocatedStock += quantity;
    inventory.history.push({
      type: "allocation",
      quantity,
      previousStock: prevStock,
      newStock: inventory.allocatedStock,
      reference: `Allocated to ${distributor.businessName || distributor.name}`,
      performedBy: req.user._id,
      note: note || `Stock allocated to distributor`,
    });
    await inventory.save();

    await logAction(req, {
      action: "ALLOCATE",
      entity: "Inventory",
      entityId: inventory._id,
      details: { productId, distributorId, quantity },
    });

    return ApiResponse.success(res, "Stock allocated successfully", {
      allocatedStock: inventory.allocatedStock,
      availableStock: inventory.availableStock,
    });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

// PUT /api/admin/inventory/update
exports.updateInventory = async (req, res) => {
  try {
    const { productId, globalStock, lowStockThreshold, note } = req.body;

    if (!productId) return ApiResponse.error(res, "productId is required");

    let inventory = await Inventory.findOne({ product: productId });
    if (!inventory) {
      // Create inventory if doesn't exist
      inventory = new Inventory({ product: productId });
    }

    const prevStock = inventory.globalStock;

    if (globalStock !== undefined) {
      inventory.globalStock = globalStock;
      inventory.lastRestocked = new Date();
      inventory.history.push({
        type: "restock",
        quantity: globalStock - prevStock,
        previousStock: prevStock,
        newStock: globalStock,
        performedBy: req.user._id,
        note: note || "Manual stock update",
      });

      // Sync product stock
      await Product.findByIdAndUpdate(productId, { stock: globalStock });
    }

    if (lowStockThreshold !== undefined) {
      inventory.lowStockThreshold = lowStockThreshold;
    }

    await inventory.save();

    await logAction(req, {
      action: "UPDATE",
      entity: "Inventory",
      entityId: inventory._id,
      details: { productId, globalStock, prevStock },
    });

    return ApiResponse.success(res, "Inventory updated", {
      globalStock: inventory.globalStock,
      allocatedStock: inventory.allocatedStock,
      availableStock: inventory.availableStock,
      isLowStock: inventory.isLowStock,
    });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};
