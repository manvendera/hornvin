// ─────────────────────────────────────────────────────────
//  controllers/customer/wishlistController.js — Wishlist
// ─────────────────────────────────────────────────────────
const Wishlist = require("../../models/Wishlist");
const ApiResponse = require("../../utils/ApiResponse");

exports.getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ customer: req.user._id })
      .populate("products", "name slug price mrp images brand averageRating isInStock");

    if (!wishlist) {
      wishlist = await Wishlist.create({ customer: req.user._id, products: [] });
    }

    return ApiResponse.success(res, "Wishlist retrieved", { wishlist });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    let wishlist = await Wishlist.findOne({ customer: req.user._id });

    if (!wishlist) {
      wishlist = new Wishlist({ customer: req.user._id, products: [] });
    }

    if (wishlist.products.includes(productId)) {
      return ApiResponse.success(res, "Product already in wishlist", { wishlist });
    }

    wishlist.products.push(productId);
    await wishlist.save();

    return ApiResponse.success(res, "Product added to wishlist", { wishlist });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const wishlist = await Wishlist.findOne({ customer: req.user._id });
    if (!wishlist) return ApiResponse.notFound(res, "Wishlist not found");

    wishlist.products = wishlist.products.filter(id => id.toString() !== productId);
    await wishlist.save();

    return ApiResponse.success(res, "Product removed from wishlist", { wishlist });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};
