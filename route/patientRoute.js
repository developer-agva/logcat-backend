// deviceRouter.js
const express = require('express');
const router = express.Router();
const { isAuth, isNurse, isProduction, isAdmin, isServiceEng } = require("../middleware/authMiddleware.js");
const patientController = require('../controller/patientController.js');
const upload = require('../helper/upload.helper');
const uploadController = require('../controller/upload.controller');
// Patient routes

router.post('/save-uhid-details', patientController.saveUhid);
router.post('/save-uhid-details/v2', patientController.saveUhidV2);
router.post('/save-patient-discharge/v2', patientController.savePatientDischargeData);


router.get('/get-allUhid', isAuth, patientController.getAllUhid);

router.get('/get-patient-list/:deviceId', isAuth, patientController.getAllUhidBydeviceId);
router.get('/get-patient-details/:id', isAuth, patientController.getDataById);
router.get('/get-diagnose/:UHID', isAuth, patientController.getDiagnoseByUhid);


router.get('/get-Uhids',isAuth, patientController.getAllUhids);
router.post('/add-medical-diagnose/:UHID', isAuth, patientController.saveDiagnose);
router.put('/update-patient/:id', isAuth, patientController.updatePatientById);

router.post('/upload-patient-file/:deviceId/:UHID', upload.single('file'), uploadController.uploadPatientFile);
router.delete('/delete-file/:key', isAuth, uploadController.deletePatientFile);
router.delete('/delete-patient/:id', isAuth, patientController.deletePatientById);




module.exports = router;
