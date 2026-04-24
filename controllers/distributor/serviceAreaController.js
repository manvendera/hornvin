// ─────────────────────────────────────────────────────────
//  controllers/distributor/serviceAreaController.js
// ─────────────────────────────────────────────────────────
const ServiceArea = require("../../models/ServiceArea");
const ApiResponse = require("../../utils/ApiResponse");

/**
 * GET /api/distributor/service-area
 */
exports.getServiceAreas = async (req, res) => {
  try {
    const areas = await ServiceArea.find({ distributor: req.user._id });
    return ApiResponse.success(res, "Service areas fetched", areas);
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

/**
 * POST /api/distributor/service-area
 */
exports.addServiceArea = async (req, res) => {
  try {
    const { name, pincodes, city, state } = req.body;

    const area = await ServiceArea.create({
      distributor: req.user._id,
      name,
      pincodes,
      city,
      state
    });

    return ApiResponse.success(res, "Service area added successfully", area);
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

/**
 * DELETE /api/distributor/service-area/:id
 */
exports.deleteServiceArea = async (req, res) => {
  try {
    const area = await ServiceArea.findOneAndDelete({
      _id: req.params.id,
      distributor: req.user._id
    });

    if (!area) return ApiResponse.notFound(res, "Service area not found");

    return ApiResponse.success(res, "Service area removed");
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};
