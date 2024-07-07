// deviceRouter.js
const express = require('express');
const router = express.Router();
const { isAuth, isNurse, isProduction, isAdmin, isServiceEng } = require("../middleware/authMiddleware.js");
const patientController = require('../controller/patientController.js');
const upload = require('../helper/upload.helper');
const uploadController = require('../controller/upload.controller');
// Patient routes

router.post('/save-uhid-detailss', patientController.saveUhid);  //
router.post('/save-uhid-details/v2/:projectCode', patientController.saveUhidV2);   // v2-version
// router.get('/get-uhid-details/v2/:projectCode', patientController.saveUhidV2);

router.post('/save-patient-discharge/v2/:projectCode', patientController.savePatientDischargeData);    // v2-version
router.get('/get-all-patient-discharge-data/v2/:projectCode', isAuth, patientController.getAllPatientDischargeData);  //v2-version

router.get('/get-allUhid', isAuth, patientController.getAllUhid);
router.get('/v2/get-allUhid', isAuth, patientController.getAllUhidV2);  // v2-version

router.get('/get-patient-list/:deviceId', isAuth, patientController.getAllUhidBydeviceId);
router.get('/get-patient-list/v2/:deviceId', isAuth, patientController.getAllUhidBydeviceIdV2);  // v2-version 


router.get('/get-patient-details/:id', isAuth, patientController.getDataById);
router.get('/get-patient-details/v2/:id', isAuth, patientController.getDataByIdV2);   // v2-version


router.get('/get-diagnose/:UHID', isAuth, patientController.getDiagnoseByUhid);
router.get('/get-diagnose/v2/:UHID', isAuth, patientController.getDiagnoseByUhidV2);  // v2-version


router.get('/get-Uhids',isAuth, patientController.getAllUhids);
router.get('/get-Uhids',isAuth, patientController.getAllUhidsV2);  // v2-version

router.post('/add-medical-diagnose/:UHID', isAuth, patientController.saveDiagnose);
router.put('/update-patient', isAuth, patientController.updatePatientById);
router.put('/patient-discharge/:UHID', isAuth, patientController.updatePatientDischarge);

router.post('/upload-patient-file/:UHID', upload.single('file'), uploadController.uploadPatientFile);
router.delete('/delete-file/:key', isAuth, uploadController.deletePatientFile);
router.delete('/delete-patient/:id', isAuth, patientController.deletePatientById);




module.exports = router;
