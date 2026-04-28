// ─────────────────────────────────────────────────────────
//  controllers/distributor/garageController.js
// ─────────────────────────────────────────────────────────
const Garage = require("../../models/Garage");
const User = require("../../models/User");
const Order = require("../../models/Order");
const ApiResponse = require("../../utils/ApiResponse");

/**
 * GET /api/distributor/garages
 * List all garages associated with this distributor or in their service area
 */
exports.getGarages = async (req, res) => {
  try {
    const distributorId = req.user._id;
    
    // In a production system, we might filter by a 'distributor' field in Garage model
    // For now, let's fetch all active garages (assuming distributor manages all in their area)
    const garages = await Garage.find({ isActive: true })
      .populate("owner", "name phoneNumber email")
      .lean();

    return ApiResponse.success(res, "Garages fetched successfully", garages);
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

/**
 * GET /api/distributor/garages/:id
 * Detailed profile + order history
 */
exports.getGarageDetails = async (req, res) => {
  try {
    const garage = await Garage.findById(req.params.id)
      .populate("owner", "name phoneNumber email");

    if (!garage) {
      return ApiResponse.notFound(res, "Garage not found");
    }

    // Fetch order history for this garage (assuming owner is the user who placed orders)
    const orders = await Order.find({ assignedGarage: garage.owner._id })
      .sort({ createdAt: -1 })
      .limit(10);

    return ApiResponse.success(res, "Garage details fetched", {
      profile: garage,
      recentOrders: orders
    });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

/**
 * PATCH /api/distributor/garages/:id
 * Update credit limit or status
 */
exports.updateGarage = async (req, res) => {
  try {
    const { creditLimit, isActive, kycStatus } = req.body;
    
    const garage = await Garage.findByIdAndUpdate(
      req.params.id,
      { $set: { creditLimit, isActive, kycStatus } },
      { new: true }
    );

    if (!garage) {
      return ApiResponse.notFound(res, "Garage not found");
    }

    return ApiResponse.success(res, "Garage updated successfully", garage);
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};
