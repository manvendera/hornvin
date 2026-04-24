// ─────────────────────────────────────────────────────────
//  controllers/customer/homeController.js — Home Module APIs
// ─────────────────────────────────────────────────────────
const Product = require("../../models/Product");
const Category = require("../../models/Category");
const Offer = require("../../models/Offer");
const ApiResponse = require("../../utils/ApiResponse");

/**
 * GET /api/customer/home
 * Returns featured products, categories, active offers, and banners
 */
exports.getHomeData = async (req, res) => {
  try {
    const [featuredProducts, categories, activeOffers] = await Promise.all([
      // 1. Featured Products
      Product.find({ isFeatured: true, isActive: true })
        .select("name slug price mrp images brand averageRating")
        .limit(10),
      
      // 2. Categories
      Category.find({ isActive: true }).select("name slug image").sort({ sortOrder: 1 }),
      
      // 3. Active Offers & Banners
      Offer.find({ 
        isActive: true, 
        startDate: { $lte: new Date() }, 
        endDate: { $gte: new Date() } 
      }).select("title description code bannerImage isFeatured")
    ]);

    // Separate banners from generic offers
    const banners = activeOffers.filter(o => o.bannerImage);
    const offers = activeOffers.filter(o => !o.bannerImage || o.isFeatured);

    return ApiResponse.success(res, "Home data retrieved successfully", {
      featuredProducts,
      categories,
      offers,
      banners
    });
  } catch (error) {
    console.error("Home data error:", error);
    return ApiResponse.serverError(res, error.message);
  }
};
