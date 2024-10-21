const express = require('express');
const router = express.Router();
const { isAuth, isAdmin, isDispatch } = require("../middleware/authMiddleware.js");
const commonController = require("../controller/commonController.js");
const locationCotroller = require("../controller/locationController.js");

// common routes
router.post("/send-verification-email", commonController.sendVerificationEmail);
router.post("/verify-otp", commonController.verifyOtp);
router.get("/search-by-pincode/:pincode", commonController.getCountryByPincode);
router.get("/get-serial-number-list", commonController.getDeviceSerialNumber);
router.get("/production-logs-data/:serialNo", commonController.getProdLogsData);
router.get("/dispatch-logs-data/:serialNo", commonController.getDispatchLogsData);
router.post("/send-fcm-token", commonController.sendFcmToken);

router.get("/get-notification-list/:fcmToken", commonController.getFcmNotification);

router.delete("/delete-notification/:id", commonController.deleteFcmNotification);


// Get Lat/Long by name or pincode
router.get("/get-all-locations", locationCotroller.getAllLocations);
router.get("/get-geocode-location/:pincode", locationCotroller.getGeoCodeByPincode);



module.exports = router;