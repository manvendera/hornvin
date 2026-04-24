// ─────────────────────────────────────────────────────────
//  controllers/distributor/documentController.js
// ─────────────────────────────────────────────────────────
const Document = require("../../models/Document");
const ApiResponse = require("../../utils/ApiResponse");

/**
 * POST /api/distributor/documents/upload
 */
exports.uploadDocument = async (req, res) => {
  try {
    const { title, type, fileUrl, orderId } = req.body;

    const doc = await Document.create({
      owner: req.user._id,
      title,
      type,
      fileUrl,
      metadata: { orderId }
    });

    return ApiResponse.success(res, "Document uploaded successfully", doc);
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

/**
 * GET /api/distributor/documents
 */
exports.getDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ owner: req.user._id })
      .sort({ createdAt: -1 });

    return ApiResponse.success(res, "Documents fetched successfully", documents);
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};
