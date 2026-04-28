const express = require("express");
const router = express.Router();
const customerAuthCtrl = require("./customerAuthController");
const validate = require("../../../middleware/validate");
const { loginSchema, customerRegisterSchema } = require("../../../utils/validators");

router.post("/register", validate(customerRegisterSchema), customerAuthCtrl.register);
router.post("/verify-otp", customerAuthCtrl.verifyOtp);
router.post("/login", validate(loginSchema), customerAuthCtrl.login);

module.exports = router;
