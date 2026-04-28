const express = require("express");
const router = express.Router();
const adminAuthCtrl = require("./adminAuthController");
const validate = require("../../../middleware/validate");
const { loginSchema, customerRegisterSchema } = require("../../../utils/validators");

router.post("/register", validate(customerRegisterSchema), adminAuthCtrl.register);
router.post("/login", validate(loginSchema), adminAuthCtrl.login);

module.exports = router;
