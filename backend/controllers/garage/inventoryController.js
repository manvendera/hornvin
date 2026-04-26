// ─────────────────────────────────────────────────────────
//  controllers/garage/inventoryController.js
// ─────────────────────────────────────────────────────────
const GarageInventory = require("../../models/GarageInventory");
const Garage = require("../../models/Garage");
const ApiResponse = require("../../utils/ApiResponse");

/**
 * GET /api/garage/inventory
 */
exports.getInventory = async (req, res) => {
  try {
    const garage = await Garage.findOne({ owner: req.user._id });
    const inventory = await GarageInventory.find({ garage: garage._id });
    return ApiResponse.success(res, "Internal inventory retrieved", { inventory });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

/**
 * POST /api/garage/inventory
 * Add or update internal stock
 */
exports.updateStock = async (req, res) => {
  try {
    const { product, itemName, quantity, unitPrice, lowStockThreshold } = req.body;
    const garage = await Garage.findOne({ owner: req.user._id });

    let stockItem = await GarageInventory.findOne({ garage: garage._id, itemName });

    if (stockItem) {
      stockItem.quantity += Number(quantity);
      if (unitPrice) stockItem.unitPrice = unitPrice;
      await stockItem.save();
    } else {
      stockItem = await GarageInventory.create({
        garage: garage._id,
        product,
        itemName,
        quantity,
        unitPrice,
        lowStockThreshold
      });
    }

    return ApiResponse.success(res, "Stock updated", { stockItem });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

/**
 * GET /api/garage/inventory/alerts
 */
exports.getStockAlerts = async (req, res) => {
  try {
    const garage = await Garage.findOne({ owner: req.user._id });
    const alerts = await GarageInventory.find({
      garage: garage._id,
      $expr: { $lte: ["$quantity", "$lowStockThreshold"] }
    });

    return ApiResponse.success(res, "Low stock alerts", { alerts });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};
