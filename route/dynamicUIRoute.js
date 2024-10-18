const express = require('express');
const router = express.Router();
const { isAuth, isAdmin, isDispatch } = require("../middleware/authMiddleware.js");
const dynamicUIController = require("../controller/dynamicUIController.js");



router.get("/get-screen", dynamicUIController.getUIScreen);



module.exports = router;