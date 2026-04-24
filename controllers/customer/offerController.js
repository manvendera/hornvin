// ─────────────────────────────────────────────────────────
//  controllers/customer/offerController.js
// ─────────────────────────────────────────────────────────
const Offer = require("../../models/Offer");
const ApiResponse = require("../../utils/ApiResponse");

exports.getOffers = async (req, res) => {
  try {
    const offers = await Offer.find({ 
      isActive: true, 
      startDate: { $lte: new Date() }, 
      endDate: { $gte: new Date() } 
    });
    return ApiResponse.success(res, "Active offers retrieved", { offers });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};

exports.applyCoupon = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    const offer = await Offer.findOne({ code: code.toUpperCase(), isActive: true });

    if (!offer) return ApiResponse.notFound(res, "Invalid coupon code");
    if (new Date() > offer.endDate) return ApiResponse.error(res, "Coupon expired", 400);
    if (orderAmount < offer.minOrderAmount) {
      return ApiResponse.error(res, `Minimum order amount for this coupon is ${offer.minOrderAmount}`, 400);
    }

    let discount = 0;
    if (offer.offerType === "percentage") {
      discount = (orderAmount * offer.value) / 100;
      if (offer.maxDiscount && discount > offer.maxDiscount) discount = offer.maxDiscount;
    } else if (offer.offerType === "fixed_amount") {
      discount = offer.value;
    }

    return ApiResponse.success(res, "Coupon applied", { discount, code: offer.code });
  } catch (error) {
    return ApiResponse.serverError(res, error.message);
  }
};
