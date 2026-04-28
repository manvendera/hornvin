const express = require("express");
const router = express.Router();
const distributorAuthCtrl = require("./distributorAuthController");
const validate = require("../../../middleware/validate");
const { loginSchema, distributorRegisterSchema } = require("../../../utils/validators");

router.post("/register", validate(distributorRegisterSchema), distributorAuthCtrl.register);
router.post("/verify-otp", distributorAuthCtrl.verifyOtp);
router.post("/login", validate(loginSchema), distributorAuthCtrl.login);

module.exports = router;
