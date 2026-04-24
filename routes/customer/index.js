// ─────────────────────────────────────────────────────────
//  routes/customer/index.js — Customer Panel Routes
// ─────────────────────────────────────────────────────────
const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");

const { protect } = require("../../middleware/authMiddleware");
const { authorize } = require("../../middleware/roleMiddleware");
const validate = require("../../middleware/validate");
const { 
  addressSchema, 
  addToCartSchema, 
  checkoutSchema, 
  reviewSchema 
} = require("../../utils/validators");

// Controllers
const homeCtrl = require("../../controllers/customer/homeController");
const productCtrl = require("../../controllers/customer/productController");
const cartCtrl = require("../../controllers/customer/cartController");
const wishlistCtrl = require("../../controllers/customer/wishlistController");
const orderCtrl = require("../../controllers/customer/orderController");
const paymentCtrl = require("../../controllers/customer/paymentController");
const reviewCtrl = require("../../controllers/customer/reviewController");
const offerCtrl = require("../../controllers/customer/offerController");
const notifCtrl = require("../../controllers/customer/notificationController");
const profileCtrl = require("../../controllers/customer/profileController");
const recommendCtrl = require("../../controllers/customer/recommendationController");

// ─── Rate Limiters ────────────────────────────────────────
const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 5, // 5 checkouts per 15 mins
  message: { success: false, message: "Too many checkout attempts. Please try again later." }
});

// ─── Public Routes ───────────────────────────────────────
router.get("/home", homeCtrl.getHomeData);
router.get("/products", productCtrl.getProducts);
router.get("/products/:id", productCtrl.getProductDetails);
router.get("/reviews/:productId", reviewCtrl.getProductReviews);
router.get("/offers", offerCtrl.getOffers);

// ─── Protected Routes (Role: CUSTOMER) ──────────────────
router.use(protect, authorize("customer"));

// ─── Profile & Addresses ───────────────────────────────
router.get("/profile", profileCtrl.getProfile);
router.post("/addresses", validate(addressSchema), profileCtrl.addAddress);
router.delete("/addresses/:id", profileCtrl.deleteAddress);

// ─── Cart ──────────────────────────────────────────────
router.get("/cart", cartCtrl.getCart);
router.post("/cart", validate(addToCartSchema), cartCtrl.addToCart);
router.patch("/cart/:itemId", cartCtrl.updateCartItem);
router.delete("/cart/:itemId", cartCtrl.removeFromCart);
router.delete("/cart", cartCtrl.clearCart);

// ─── Wishlist ──────────────────────────────────────────
router.get("/wishlist", wishlistCtrl.getWishlist);
router.post("/wishlist", wishlistCtrl.addToWishlist);
router.delete("/wishlist/:productId", wishlistCtrl.removeFromWishlist);

// ─── Orders & Checkout ─────────────────────────────────
router.post("/orders/checkout", checkoutLimiter, validate(checkoutSchema), orderCtrl.checkout);
router.get("/orders", orderCtrl.getOrders);
router.get("/orders/:id", orderCtrl.getOrderById);
router.patch("/orders/:id/cancel", orderCtrl.cancelOrder);
router.get("/orders/:id/tracking", orderCtrl.getTracking);

// ─── Payments ──────────────────────────────────────────
router.post("/orders/:id/pay", paymentCtrl.processPayment);
router.post("/orders/:id/verify", paymentCtrl.verifyPayment);
router.get("/payments", paymentCtrl.getPaymentHistory);

// ─── Reviews ───────────────────────────────────────────
router.post("/reviews", validate(reviewSchema), reviewCtrl.addReview);
router.patch("/reviews/:id", reviewCtrl.updateReview);
router.delete("/reviews/:id", reviewCtrl.deleteReview);

// ─── Coupons & Smart Features ──────────────────────────
router.post("/apply-coupon", offerCtrl.applyCoupon);
router.get("/recommendations", recommendCtrl.getRecommendations);
router.get("/recommendations/reorder", recommendCtrl.getReorderSuggestions);

// ─── Notifications ─────────────────────────────────────
router.get("/notifications", notifCtrl.getNotifications);
router.patch("/notifications/:id/read", notifCtrl.markAsRead);

module.exports = router;
