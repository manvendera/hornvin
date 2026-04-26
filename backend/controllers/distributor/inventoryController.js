// ─────────────────────────────────────────────────────────
//  controllers/distributor/inventoryController.js
// ─────────────────────────────────────────────────────────
const Inventory = require("../../models/Inventory");
const ApiResponse = require("../../utils/ApiResponse");

/**
 * GET /api/distributor/inventory
 * View allocated stock with filters
 */
exports.getInventory = async (req, res) => {
  try {
    const distributorId = req.user._id;
    const { category, lowStock, search } = req.query;

    let query = { "allocations.distributor": distributorId };

    // Note: Filtering by category would require a join (lookup) with Product model
    const inventory = await Inventory.find(query)
      .populate("product")
      .lean();

    // Map to only show this distributor's allocation
    let results = inventory.map(item => {
      const allocation = item.allocations.find(a => a.distributor.toString() === distributorId.toString());
      return {
        _id: item._id,
        product: item.product,
        allocatedQuantity: allocation ? allocation.quantity : 0,
        lowStockThreshold: item.lowStockThreshold,
        isLowStock: allocation ? allocation.quantity <= item.lowStockThreshold : false,
        lastUpdated: allocation ? allocation.allocatedAt : null
      };
    });

    if (lowStock === "true") {
      results = results.filter(r => r.isLowStock);
    }

    if (search) {
      results = results.filter(r => r.product.name.toLowerCase().includes(search.toLowerCase()));
    }

    return ApiResponse.success(res, "Inventory fetched successfully", results);
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

/**
 * POST /api/distributor/inventory/request
 * Request stock from admin
 */
exports.requestStock = async (req, res) => {
  try {
    const { productId, quantity, note } = req.body;
    
    // In a real system, this would create a 'StockRequest' record for Admin to approve
    // For now, we'll just log it or notify admin
    return ApiResponse.success(res, "Stock request sent to admin", { productId, quantity, note });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

/**
 * PATCH /api/distributor/inventory/:id
 * Update stock manually (adjustment)
 */
exports.updateStock = async (req, res) => {
  try {
    const { quantity, type, note } = req.body; // type: 'add' or 'subtract'
    const adjustment = type === 'add' ? Math.abs(quantity) : -Math.abs(quantity);

    // Atomic update using $inc
    const inventory = await Inventory.findOneAndUpdate(
      { 
        _id: req.params.id, 
        "allocations.distributor": req.user._id 
      },
      { 
        $inc: { "allocations.$.quantity": adjustment },
        $push: { 
          history: {
            type: "adjustment",
            quantity: adjustment,
            performedBy: req.user._id,
            note: note || "Manual adjustment"
          }
        }
      },
      { new: true }
    );

    if (!inventory) {
      return ApiResponse.notFound(res, "Inventory record not found or unauthorized");
    }

    return ApiResponse.success(res, "Stock updated successfully", inventory);
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

/**
 * GET /api/distributor/inventory/history
 */
exports.getInventoryHistory = async (req, res) => {
  try {
    const inventory = await Inventory.find({ "allocations.distributor": req.user._id })
      .select("history product")
      .populate("product", "name sku");

    // Flatten and filter history
    let history = [];
    inventory.forEach(item => {
      item.history.forEach(log => {
        history.push({
          product: item.product,
          ...log.toObject()
        });
      });
    });

    history.sort((a, b) => b.performedAt - a.performedAt);

    return ApiResponse.success(res, "Inventory history fetched", history);
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};
