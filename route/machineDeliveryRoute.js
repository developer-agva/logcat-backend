const express = require('express');
const router = express.Router();
const { isAuth, isAdmin, isDispatch } = require("../middleware/authMiddleware.js");
const commonController = require("../controller/commonController.js");
const locationCotroller = require("../controller/locationController.js");
const upload = require('../helper/upload.helper');
const uploadController = require('../controller/upload.controller');
const machineDeliveryController = require('../controller/machineDeliveryController.js');


router.post("/add-machine-delivery-data", machineDeliveryController.addMachineDelivery);
router.put("/update-machine-delivery-data/:id", machineDeliveryController.updateMachineDeliveryById);
router.get("/get-machine-delivery-data", machineDeliveryController.getAllMachineDeliveries);
router.get("/get-machine-delivery-data/:id", machineDeliveryController.getMachineDeliveryById);



module.exports = router;