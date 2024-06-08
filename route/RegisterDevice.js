const express = require("express");
const { body } = require('express-validator');
const router = express.Router();
const {getDevice,createDevice,getDevicebyId,updateDevice} = require("../controller/DeviceRegister");
// const {
//     isAuth
// } = require('../middleware/authMiddleware');
const { registerDevice,
     getAllRegisteredDevice,
     getRegisterDeviceById,
    UpdateRegisterDeviceDetails
} = require("../controller/RegisterDevice");

router.route("/").get(getDevice);
router.route("/").post(createDevice);
router.route("/:did").get(getDevicebyId);
router.route("/:did").put(updateDevice);
// router.route("/:did").put(updateDevice);

// router.post("/").post(registerNEWDevice);

router.post("/RegisterDevice",
    body('DeviceId').notEmpty(),
    body('AliasName').notEmpty(),
    body('IMEI_NO').notEmpty(),
    body('Hospital_Name').notEmpty(),
    body('Ward_No').notEmpty(),
    body('Ventilator_Operator').notEmpty(),
    body('Doctor_Name').notEmpty(),
    registerDevice);

router.get('/',getAllRegisteredDevice); 
// router.get('/:did',getRegisterDeviceById);
router.put('/Update/:DeviceId',UpdateRegisterDeviceDetails);   

module.exports = router; 