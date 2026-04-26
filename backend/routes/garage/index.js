// ─────────────────────────────────────────────────────────
//  routes/garage/index.js — Garage B2B Routes
// ─────────────────────────────────────────────────────────
const express = require("express");
const router = express.Router();

const { protect } = require("../../middleware/authMiddleware");
const { authorize } = require("../../middleware/roleMiddleware");
const validate = require("../../middleware/validate");
const {
  garageProfileSchema,
  staffSchema,
  vehicleSchema,
  serviceJobSchema
} = require("../../utils/validators");

// Controllers
const profileCtrl = require("../../controllers/garage/profileController");
const orderCtrl = require("../../controllers/garage/orderingController");
const serviceCtrl = require("../../controllers/garage/serviceController");
const inventoryCtrl = require("../../controllers/garage/inventoryController");
const analyticsCtrl = require("../../controllers/garage/analyticsController");

// ─── Middleware ───────────────────────────────────────────
router.use(protect, authorize("garage"));

// ─── Profile & Staff ──────────────────────────────────────
router.get("/profile", profileCtrl.getProfile);
router.patch("/profile", validate(garageProfileSchema), profileCtrl.updateProfile);
router.post("/kyc", profileCtrl.uploadKYC);
router.post("/staff", validate(staffSchema), profileCtrl.addStaff);
router.get("/staff", profileCtrl.listStaff);

// ─── Ordering System ─────────────────────────────────────
router.get("/products", orderCtrl.getProducts);
router.post("/orders", orderCtrl.placeOrder);
router.get("/orders/repeat", orderCtrl.getRepeatOrders);
router.get("/orders/:id/tracking", orderCtrl.getTracking);

// ─── Service Management ──────────────────────────────────
router.post("/vehicles", validate(vehicleSchema), serviceCtrl.addVehicle);
router.post("/services", validate(serviceJobSchema), serviceCtrl.createServiceJob);
router.get("/vehicles/:id/history", serviceCtrl.getVehicleHistory);
router.post("/job-cards", serviceCtrl.generateJobCard);
router.patch("/services/:id", serviceCtrl.updateJobStatus);

// ─── Internal Inventory ──────────────────────────────────
router.get("/inventory", inventoryCtrl.getInventory);
router.post("/inventory", inventoryCtrl.updateStock);
router.get("/inventory/alerts", inventoryCtrl.getStockAlerts);

// ─── Analytics & Returns ─────────────────────────────────
router.get("/analytics", analyticsCtrl.getAnalytics);
router.post("/returns", analyticsCtrl.requestReturn);

module.exports = router;
