// deviceRouter.js
const express = require('express');
const router = express.Router();
const { isAuth } = require("../middleware/authMiddleware.js");
const upload = require('../helper/upload.helper');
const productionController = require("../controller/productionController.js");
const uploadController = require('../controller/upload.controller');

// Production routes

router.post('/add-new', isAuth, productionController.createProduction);
router.get('/production-list', isAuth, productionController.getProductionData);
router.get('/get-byid/:deviceId', isAuth, productionController.getProductionById);
router.get('/get-by-serialNumber/:serialNumber', isAuth, productionController.getProductionBySrNo);
router.get('/get-production-devices', isAuth, productionController.getProductionDevices);


router.put('/update-production', isAuth, productionController.updateProduction);
router.delete('/delete-byid/:id', isAuth, productionController.deleteProductionById);
router.post('/upload-production-file/:deviceId/:flag', upload.single('file'), uploadController.uploadQualityReport);
router.delete('/delete-file/:key', isAuth, uploadController.deleteProductionFile);
router.get('/get-production-file/:deviceId/:flag', isAuth, uploadController.getProductionFile);


module.exports = router;
