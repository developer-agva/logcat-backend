// deviceRouter.js
const express = require('express');
const router = express.Router();
const { isAuth } = require("../middleware/authMiddleware.js");
const upload = require('../helper/upload.helper');
// const productionController = require("../controller/productionController.js");
const uploadController = require('../controller/upload.controller');
const accountsController = require('../controller/accountsController.js');
const productionModel = require('../model/productionModel.js');
// const deviceController = require('../controller/deviceController.js');

router.post('/accounts/save-data', isAuth, accountsController.saveAwaitingForShippedData); // need to test
router.put('/accounts/update-data', isAuth, accountsController.updateAccountDataById);  
router.get('/accounts/get-accounts-data', isAuth, accountsController.getAccountsData);
router.get('/accounts/get-dispatch-req-data', isAuth, accountsController.getDispatchReqData);

router.get('/accounts/get-data/:serialNo', isAuth, accountsController.getAccountsDataBySerialNo);

router.post('/upload-invoice-file/:serialNo/:invoiceNo', upload.single('file'), uploadController.uploadInvoicePdf);
router.post('/upload-ewaybill-file/:serialNo/:ewaybillNo', upload.single('file'), uploadController.uploadewayBillPdf);

// for shipping invoice
router.post('/upload-shipping-file/:serialNo', upload.single('file'), uploadController.uploadShippingInvoicePdf);
router.post('/save-shipping-data', accountsController.saveMarkasShippedData);
router.get('/mark-as-shipped-data', accountsController.getMArkAsShipped);
router.get('/get-awaiting-for-shipped', accountsController.getAwaitingForShippedData);  // completed

router.get('/get-dispatched-device-list', accountsController.getDispatchedDeviceList);   // completed
router.get('/get-production-list/v2', accountsController.getProductionListV2);   // completed    
router.get('/get-complete-device-details/:serialNo', accountsController.getSignleDispatchedData);   // completed
router.post('/upload-po-file/:serialNo', upload.single('file'), uploadController.uploadpoPdf);  // completed
router.post('/upload-return-po-file/:serialNo', upload.single('file'), uploadController.uploadreturnPoPdf);  // completed


module.exports = router;