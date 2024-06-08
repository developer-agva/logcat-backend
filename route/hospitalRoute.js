// deviceRouter.js
const express = require('express');
const router = express.Router();
const { isAuth, isAdmin, isDispatch } = require("../middleware/authMiddleware.js");
const hospitalController = require('../controller/hospitalController');
const verifyAdmin = require("../middleware/verifyAdmin.js");

// Hospital routes

router.post('/register-hospital', isAuth, hospitalController.saveHospital)
router.get('/hospital-list/:State', hospitalController.getHospitalList);
router.get('/get-bypincode/:Pincode', hospitalController.getHospitals);
router.get('/get-byhospital/:Hospital_Name', hospitalController.getHospitals);


router.get('/hospital-list', hospitalController.getHospitalList);
router.get('/get-access-hospital-list', isAuth, hospitalController.getAccesshospitals);

router.get('/get-byid/:id', hospitalController.getSingleHospital);
router.put('/update-hospital', isAuth, hospitalController.updateHospital);
router.delete('/delete-byid/:id', isAuth, hospitalController.deleteHospital);




router.get('/get-country-list', hospitalController.getCountryList);
router.get('/get-state-list/:name', hospitalController.getStateListByCountryName);


module.exports = router;
