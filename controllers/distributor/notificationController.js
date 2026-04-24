// ─────────────────────────────────────────────────────────
//  controllers/distributor/notificationController.js
// ─────────────────────────────────────────────────────────
const Notification = require("../../models/Notification");
const ApiResponse = require("../../utils/ApiResponse");

/**
 * GET /api/distributor/notifications
 * Fetch paginated notifications for the distributor
 */
exports.getNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments({ recipient: req.user._id });

    return ApiResponse.success(res, "Notifications fetched successfully", {
      notifications,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

/**
 * PATCH /api/distributor/notifications/:id/read
 */
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return ApiResponse.notFound(res, "Notification not found");
    }

    return ApiResponse.success(res, "Notification marked as read", notification);
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

/**
 * DELETE /api/distributor/notifications/:id
 */
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user._id
    });

    if (!notification) {
      return ApiResponse.notFound(res, "Notification not found");
    }

    return ApiResponse.success(res, "Notification deleted successfully");
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};
