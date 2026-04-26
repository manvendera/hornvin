// ─────────────────────────────────────────────────────────
//  routes/admin/index.js — Admin Panel Routes (Modular)
// ─────────────────────────────────────────────────────────
const express = require("express");
const router = express.Router();

const { protect } = require("../../middleware/authMiddleware");
const { authorize } = require("../../middleware/roleMiddleware");
const { uploadCSV } = require("../../config/multer");

// ─── Controllers ─────────────────────────────────────────
const adminCtrl = require("../../controllers/admin/adminController");
const productCtrl = require("../../controllers/admin/productController");
const inventoryCtrl = require("../../controllers/admin/inventoryController");
const userMgmtCtrl = require("../../controllers/admin/userManagementController");
const orderCtrl = require("../../controllers/admin/orderController");
const financeCtrl = require("../../controllers/admin/financeController");
const notifCtrl = require("../../controllers/admin/notificationController");
const auditCtrl = require("../../controllers/admin/auditController");

// ═══════════════════════════════════════════════════════
//  1. ADMIN AUTHENTICATION (public)
// ═══════════════════════════════════════════════════════
router.post("/register", adminCtrl.adminRegister);
router.post("/login", adminCtrl.adminLogin);

// ═══════════════════════════════════════════════════════
//  All routes below require admin auth
// ═══════════════════════════════════════════════════════
router.use(protect, authorize("admin"));

// ─── Admin Profile ──────────────────────────────────────
router.get("/profile", adminCtrl.getAdminProfile);
router.put("/update-profile", adminCtrl.updateAdminProfile);
router.post("/logout", adminCtrl.adminLogout);

// ═══════════════════════════════════════════════════════
//  2. DASHBOARD
// ═══════════════════════════════════════════════════════
router.get("/dashboard", adminCtrl.getDashboard);

// ═══════════════════════════════════════════════════════
//  3. PRODUCT MANAGEMENT
// ═══════════════════════════════════════════════════════
router.post("/products", productCtrl.createProduct);
router.get("/products", productCtrl.getProducts);
router.get("/products/:id", productCtrl.getProductById);
router.put("/products/:id", productCtrl.updateProduct);
router.delete("/products/:id", productCtrl.deleteProduct);

// ─── Categories ─────────────────────────────────────────
router.post("/categories", productCtrl.createCategory);
router.get("/categories", productCtrl.getCategories);
router.put("/categories/:id", productCtrl.updateCategory);
router.delete("/categories/:id", productCtrl.deleteCategory);

// ═══════════════════════════════════════════════════════
//  4. INVENTORY MANAGEMENT
// ═══════════════════════════════════════════════════════
router.get("/inventory", inventoryCtrl.getInventory);
router.post("/inventory/allocate", inventoryCtrl.allocateStock);
router.put("/inventory/update", inventoryCtrl.updateInventory);

// ═══════════════════════════════════════════════════════
//  5. USER MANAGEMENT
// ═══════════════════════════════════════════════════════
// Distributors
router.post("/distributors", userMgmtCtrl.createDistributor);
router.get("/distributors", userMgmtCtrl.getDistributors);
router.delete("/distributors/:id", userMgmtCtrl.deleteDistributor);

// Garages
router.get("/garages", userMgmtCtrl.getGarages);
router.put("/garages/approve/:id", userMgmtCtrl.approveGarage);

// Customers
router.get("/customers", userMgmtCtrl.getCustomers);
router.delete("/customers/:id", userMgmtCtrl.deleteCustomer);

// ═══════════════════════════════════════════════════════
//  6. ORDER MANAGEMENT
// ═══════════════════════════════════════════════════════
router.get("/orders", orderCtrl.getOrders);
router.get("/orders/:id", orderCtrl.getOrderById);
router.put("/orders/assign-distributor/:id", orderCtrl.assignDistributor);
router.put("/orders/update-status/:id", orderCtrl.updateOrderStatus);
router.post("/orders/refund/:id", orderCtrl.processRefund);

// ═══════════════════════════════════════════════════════
//  7. FINANCE & REPORTS
// ═══════════════════════════════════════════════════════
router.get("/reports/sales", financeCtrl.getSalesReport);
router.get("/reports/revenue", financeCtrl.getRevenueReport);
router.get("/reports/gst", financeCtrl.getGstReport);
router.post("/invoice/:orderId", financeCtrl.generateInvoice);

// ═══════════════════════════════════════════════════════
//  8. NOTIFICATIONS
// ═══════════════════════════════════════════════════════
router.post("/notifications/broadcast", notifCtrl.broadcastNotification);
router.post("/notifications/target", notifCtrl.targetNotification);
router.get("/notifications", notifCtrl.getNotifications);

// ═══════════════════════════════════════════════════════
//  9. AUDIT LOGS
// ═══════════════════════════════════════════════════════
router.get("/audit-logs", auditCtrl.getAuditLogs);
router.get("/audit-logs/:id", auditCtrl.getAuditLogById);

// ═══════════════════════════════════════════════════════
//  10. BULK UPLOAD
// ═══════════════════════════════════════════════════════
router.post(
  "/products/bulk-upload",
  uploadCSV.single("file"),
  productCtrl.bulkUploadProducts
);

module.exports = router;
