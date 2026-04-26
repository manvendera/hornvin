// ─────────────────────────────────────────────────────────
//  controllers/distributor/returnController.js
// ─────────────────────────────────────────────────────────
const Return = require("../../models/Return");
const Order = require("../../models/Order");
const ApiResponse = require("../../utils/ApiResponse");

/**
 * GET /api/distributor/returns
 */
exports.getReturns = async (req, res) => {
  try {
    const returns = await Return.find()
      .populate({
        path: "order",
        match: { assignedDistributor: req.user._id }
      })
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });

    // Filter out returns where order was not assigned to this distributor
    const filteredReturns = returns.filter(r => r.order !== null);

    return ApiResponse.success(res, "Return requests fetched", filteredReturns);
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

/**
 * PATCH /api/distributor/returns/:id
 * Approve or Reject return request
 */
exports.processReturn = async (req, res) => {
  try {
    const { status, note } = req.body; // status: 'approved' or 'rejected'
    
    const returnReq = await Return.findById(req.params.id);
    if (!returnReq) return ApiResponse.notFound(res, "Return request not found");

    returnReq.status = status;
    returnReq.distributorNote = note;
    returnReq.processedAt = new Date();
    returnReq.processedBy = req.user._id;

    await returnReq.save();

    return ApiResponse.success(res, `Return request ${status}`, returnReq);
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

/**
 * PATCH /api/distributor/refunds/:id
 */
exports.updateRefundStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const returnReq = await Return.findByIdAndUpdate(
      req.params.id,
      { refundStatus: status },
      { new: true }
    );

    if (!returnReq) return ApiResponse.notFound(res, "Return request not found");

    return ApiResponse.success(res, "Refund status updated", returnReq);
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};
