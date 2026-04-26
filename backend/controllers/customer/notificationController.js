// ─────────────────────────────────────────────────────────
//  controllers/customer/notificationController.js
// ─────────────────────────────────────────────────────────
const Notification = require("../../models/Notification");
const ApiResponse = require("../../utils/ApiResponse");

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    return ApiResponse.success(res, "Notifications retrieved", { notifications });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

exports.markAsRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true }
    );
    return ApiResponse.success(res, "Notification marked as read");
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};
