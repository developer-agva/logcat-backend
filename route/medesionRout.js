const express = require('express')
const router = express.Router();
const {
    getAllMedicineData,
    getIcd10DiagnosisData
} = require('../controller/medicineControler');

const {isAuth, isSuperAdmin} = require('../middleware/authMiddleware');

// protected with auth
router.get('/indianMedicineData', isAuth, getAllMedicineData);
router.get('/icd10-diagnosis-data', isAuth, getIcd10DiagnosisData);


module.exports = router;