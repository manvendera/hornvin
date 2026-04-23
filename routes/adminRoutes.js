// ─────────────────────────────────────────────────────────
//  routes/adminRoutes.js — Admin Routes (Protected)
// ─────────────────────────────────────────────────────────
const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  getUserById,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
  getDashboardStats,
} = require("../controllers/adminController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

// All admin routes require authentication + admin role
router.use(protect, authorize("admin"));

// ─── Admin Dashboard ────────────────────────────────────
router.get("/stats", getDashboardStats);

// ─── User Management ────────────────────────────────────
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id/role", updateUserRole);
router.put("/users/:id/toggle-status", toggleUserStatus);
router.delete("/users/:id", deleteUser);

module.exports = router;
