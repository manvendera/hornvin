// ─────────────────────────────────────────────────────────
//  controllers/admin/notificationController.js — Notification APIs
// ─────────────────────────────────────────────────────────
const Notification = require("../../models/Notification");
const User = require("../../models/User");
const ApiResponse = require("../../utils/ApiResponse");
const { logAction } = require("../../services/auditService");

// POST /api/admin/notifications/broadcast
exports.broadcastNotification = async (req, res) => {
  try {
    const { title, message, priority, actionUrl, expiresAt } = req.body;

    if (!title || !message) {
      return ApiResponse.error(res, "Title and message are required");
    }

    const notification = await Notification.create({
      title,
      message,
      type: "broadcast",
      targetRoles: ["admin", "distributor", "garage", "customer"],
      priority: priority || "medium",
      actionUrl,
      expiresAt,
      sentBy: req.user._id,
    });

    const recipientCount = await User.countDocuments({ isActive: true });

    await logAction(req, {
      action: "NOTIFICATION_SENT",
      entity: "Notification",
      entityId: notification._id,
      details: { type: "broadcast", recipientCount },
    });

    return ApiResponse.created(res, "Broadcast notification sent", {
      notification,
      recipientCount,
    });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

// POST /api/admin/notifications/target
exports.targetNotification = async (req, res) => {
  try {
    const { title, message, targetRoles, targetUsers, priority, actionUrl } = req.body;

    if (!title || !message) {
      return ApiResponse.error(res, "Title and message are required");
    }
    if (!targetRoles?.length && !targetUsers?.length) {
      return ApiResponse.error(res, "Must specify targetRoles or targetUsers");
    }

    const notification = await Notification.create({
      title,
      message,
      type: "targeted",
      targetRoles: targetRoles || [],
      targetUsers: targetUsers || [],
      priority: priority || "medium",
      actionUrl,
      sentBy: req.user._id,
    });

    let recipientCount = 0;
    if (targetRoles?.length) {
      recipientCount = await User.countDocuments({
        role: { $in: targetRoles },
        isActive: true,
      });
    }
    if (targetUsers?.length) {
      recipientCount += targetUsers.length;
    }

    await logAction(req, {
      action: "NOTIFICATION_SENT",
      entity: "Notification",
      entityId: notification._id,
      details: { type: "targeted", targetRoles, recipientCount },
    });

    return ApiResponse.created(res, "Targeted notification sent", {
      notification,
      recipientCount,
    });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

// GET /api/admin/notifications (bonus: list sent notifications)
exports.getNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      Notification.find()
        .populate("sentBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments(),
    ]);

    return ApiResponse.success(res, "Notifications retrieved", {
      notifications,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};
