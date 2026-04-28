const express = require("express");
const router = express.Router();
const garageAuthCtrl = require("./garageAuthController");
const validate = require("../../../middleware/validate");
const { loginSchema, garageRegisterSchema } = require("../../../utils/validators");

router.post("/register", validate(garageRegisterSchema), garageAuthCtrl.register);
router.post("/verify-otp", garageAuthCtrl.verifyOtp);
router.post("/login", validate(loginSchema), garageAuthCtrl.login);

module.exports = router;
