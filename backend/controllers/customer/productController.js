// ─────────────────────────────────────────────────────────
//  controllers/customer/productController.js — Search & Catalog
// ─────────────────────────────────────────────────────────
const Product = require("../../models/Product");
const Category = require("../../models/Category");
const ApiResponse = require("../../utils/ApiResponse");

/**
 * GET /api/customer/products
 * Search and filter products
 */
exports.getProducts = async (req, res) => {
  try {
    const { 
      search, category, priceMin, priceMax, brand, 
      sortBy, page = 1, limit = 20 
    } = req.query;

    const query = { isActive: true, isDeleted: false };

    // 1. Search (Keyword or Vehicle Model)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
        { "specifications.compatibleVehicles": { $regex: search, $options: "i" } }
      ];
    }

    // 2. Filter by Category (slug or ID)
    if (category) {
      const categoryDoc = await Category.findOne({ $or: [{ _id: category.match(/^[0-9a-fA-F]{24}$/) ? category : null }, { slug: category }] });
      if (categoryDoc) {
        query.category = categoryDoc._id;
      }
    }

    // 3. Price Range
    if (priceMin || priceMax) {
      query.price = {};
      if (priceMin) query.price.$gte = Number(priceMin);
      if (priceMax) query.price.$lte = Number(priceMax);
    }

    // 4. Brand
    if (brand) {
      query.brand = { $regex: brand, $options: "i" };
    }

    // 5. Sorting
    let sort = { createdAt: -1 };
    if (sortBy === "price_low") sort = { price: 1 };
    if (sortBy === "price_high") sort = { price: -1 };
    if (sortBy === "popularity") sort = { totalReviews: -1, averageRating: -1 };

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(query)
        .select("name slug price mrp images brand averageRating totalReviews isInStock category")
        .populate("category", "name slug")
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(query)
    ]);

    return ApiResponse.success(res, "Products retrieved successfully", {
      products,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
        limit: Number(limit)
      }
    });
  } catch (error) {
    console.error("Get products error:", error);
    return ApiResponse.serverError(res, error.message);
  }
};

/**
 * GET /api/customer/products/:id
 * Get detailed product info + compatibility
 */
exports.getProductDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Support lookup by ID or slug
    const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { slug: id };
    
    const product = await Product.findOne({ ...query, isActive: true })
      .populate("category", "name slug");

    if (!product) {
      return ApiResponse.notFound(res, "Product not found");
    }

    return ApiResponse.success(res, "Product details retrieved", { product });
  } catch (error) {
    console.error("Get product details error:", error);
    return ApiResponse.serverError(res, error.message);
  }
};
