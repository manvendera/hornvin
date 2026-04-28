// ─────────────────────────────────────────────────────────
//  routes/distributor/index.js — Distributor Panel Routes
// ─────────────────────────────────────────────────────────
const express = require("express");
const router = express.Router();

const { protect } = require("../../middleware/authMiddleware");
const { authorize, requireVerified, requireApproval } = require("../../middleware/roleMiddleware");
const activityLogger = require("../../middleware/activityLogger");

// Import Controllers
const dashboardController = require("../../controllers/distributor/dashboardController");
const notificationController = require("../../controllers/distributor/notificationController");
const inventoryController = require("../../controllers/distributor/inventoryController");
const orderController = require("../../controllers/distributor/orderController");
const logisticsController = require("../../controllers/distributor/logisticsController");
const earningController = require("../../controllers/distributor/earningController");
const returnController = require("../../controllers/distributor/returnController");
const serviceAreaController = require("../../controllers/distributor/serviceAreaController");
const profileController = require("../../controllers/distributor/profileController");
const analyticsController = require("../../controllers/distributor/analyticsController");
const documentController = require("../../controllers/distributor/documentController");
const recommendationController = require("../../controllers/distributor/recommendationController");
const garageController = require("../../controllers/distributor/garageController");

// ─── Middleware Chain ──────────────────────────────────────
// All routes here require: login + distributor role + approved account + logging
router.use(protect);
router.use(authorize("distributor"));
router.use(requireApproval);
router.use(activityLogger);

// ─── Dashboard ─────────────────────────────────────────────
router.get("/dashboard", dashboardController.getDashboardStats);

// ─── Notifications ─────────────────────────────────────────
router.get("/notifications", notificationController.getNotifications);
router.patch("/notifications/:id/read", notificationController.markAsRead);
router.delete("/notifications/:id", notificationController.deleteNotification);

// ─── Inventory ─────────────────────────────────────────────
router.get("/inventory", inventoryController.getInventory);
router.post("/inventory/request", inventoryController.requestStock);
router.patch("/inventory/:id", inventoryController.updateStock);
router.get("/inventory/history", inventoryController.getInventoryHistory);

// ─── Orders ────────────────────────────────────────────────
router.get("/orders", orderController.getOrders);
router.get("/orders/:id", orderController.getOrderDetails);
router.patch("/orders/:id/accept", orderController.acceptOrder);
router.patch("/orders/:id/status", orderController.updateOrderStatus);
router.post("/orders/:id/cancel", orderController.cancelOrder);

// ─── Logistics ─────────────────────────────────────────────
router.post("/delivery/assign", logisticsController.assignAgent);
router.get("/delivery/:orderId", logisticsController.trackDelivery);
router.post("/delivery/otp-verify", logisticsController.verifyOtp);
router.post("/delivery/proof", logisticsController.uploadProof);

// ─── Earnings ──────────────────────────────────────────────
router.get("/earnings", earningController.getEarningsSummary);
router.get("/payments", earningController.getPaymentHistory);
router.get("/reports", earningController.getReports);

// ─── Returns & Refunds ─────────────────────────────────────
router.get("/returns", returnController.getReturns);
router.patch("/returns/:id", returnController.processReturn);
router.patch("/refunds/:id", returnController.updateRefundStatus);

// ─── Service Area ──────────────────────────────────────────
router.get("/service-area", serviceAreaController.getServiceAreas);
router.post("/service-area", serviceAreaController.addServiceArea);
router.delete("/service-area/:id", serviceAreaController.deleteServiceArea);

// ─── Garage Management ─────────────────────────────────────
router.get("/garages", garageController.getGarages);
router.get("/garages/:id", garageController.getGarageDetails);
router.patch("/garages/:id", garageController.updateGarage);

// ─── Profile & KYC ─────────────────────────────────────────
router.get("/profile", profileController.getProfile);
router.patch("/profile", profileController.updateProfile);
router.post("/kyc", profileController.submitKyc);

// ─── Analytics ─────────────────────────────────────────────
router.get("/analytics", analyticsController.getAnalytics);

// ─── Documents ─────────────────────────────────────────────
router.post("/documents/upload", documentController.uploadDocument);
router.get("/documents", documentController.getDocuments);

// ─── Smart Features (Recommendations) ──────────────────────
router.get("/recommendations/restock", recommendationController.getRestockRecommendations);
router.get("/recommendations/repeat-orders", recommendationController.getRepeatOrderRecommendations);

module.exports = router;
