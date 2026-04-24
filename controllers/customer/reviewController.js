// ─────────────────────────────────────────────────────────
//  controllers/customer/reviewController.js — Reviews
// ─────────────────────────────────────────────────────────
const Review = require("../../models/Review");
const Product = require("../../models/Product");
const Order = require("../../models/Order");
const ApiResponse = require("../../utils/ApiResponse");

exports.addReview = async (req, res) => {
  try {
    const { productId, rating, comment, images } = req.body;
    const customerId = req.user._id;

    // 1. Check if user has purchased the product (Verified Purchase)
    const hasPurchased = await Order.findOne({
      customer: customerId,
      status: "delivered",
      "items.product": productId
    });

    // 2. Create Review
    const review = await Review.create({
      product: productId,
      customer: customerId,
      rating,
      comment,
      images,
      isVerifiedPurchase: !!hasPurchased
    });

    // 3. Update Product average rating
    const reviews = await Review.find({ product: productId, isActive: true });
    const avgRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;

    await Product.findByIdAndUpdate(productId, {
      averageRating: avgRating.toFixed(1),
      totalReviews: reviews.length
    });

    return ApiResponse.created(res, "Review added successfully", { review });
  } catch (error) {
    if (error.code === 11000) {
      return ApiResponse.error(res, "You have already reviewed this product", 400);
    }
    return ApiResponse.serverError(res, error.message);
  }
};

exports.getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId, isActive: true })
      .populate("customer", "name avatar")
      .sort({ createdAt: -1 });

    return ApiResponse.success(res, "Reviews retrieved", { reviews });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

exports.updateReview = async (req, res) => {
  try {
    const review = await Review.findOne({ _id: req.params.id, customer: req.user._id });
    if (!review) return ApiResponse.notFound(res, "Review not found");

    const { rating, comment, images } = req.body;
    if (rating) review.rating = rating;
    if (comment) review.comment = comment;
    if (images) review.images = images;

    await review.save();

    // Recalculate avg rating
    const reviews = await Review.find({ product: review.product, isActive: true });
    const avgRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;
    await Product.findByIdAndUpdate(review.product, { averageRating: avgRating.toFixed(1) });

    return ApiResponse.success(res, "Review updated", { review });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({ _id: req.params.id, customer: req.user._id });
    if (!review) return ApiResponse.notFound(res, "Review not found");

    // Recalculate avg rating
    const reviews = await Review.find({ product: review.product, isActive: true });
    const avgRating = reviews.length > 0 
      ? reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length 
      : 0;

    await Product.findByIdAndUpdate(review.product, {
      averageRating: avgRating.toFixed(1),
      totalReviews: reviews.length
    });

    return ApiResponse.success(res, "Review deleted");
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};
