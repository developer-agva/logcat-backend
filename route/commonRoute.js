const express = require('express');
const router = express.Router();
const { isAuth, isAdmin, isDispatch } = require("../middleware/authMiddleware.js");
const commonController = require("../controller/commonController.js");


// common routes
router.post("/send-verification-email", commonController.sendVerificationEmail);
router.post("/verify-otp", commonController.verifyOtp);
router.get("/search-by-pincode/:pincode", commonController.getCountryByPincode);
router.get("/get-serial-number-list", commonController.getDeviceSerialNumber);
router.get("/production-logs-data/:serialNo", commonController.getProdLogsData);
router.get("/dispatch-logs-data/:serialNo", commonController.getDispatchLogsData);
router.post("/send-fcm-token", commonController.sendFcmToken);






module.exports = router;