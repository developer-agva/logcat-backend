const express = require('express');
const router = express.Router();

const upload = require('../helper/upload.helper');
const uploadController = require('../controller/upload.controller');
const { isAuth } = require('../middleware/authMiddleware');
 
// service report upload route
router.post('/upload-single/:deviceId/:serialNo/:faultReason/:email', upload.single('file'), uploadController.uploadSingle);

router.post('/add-project-with-image', upload.single('file'), uploadController.addProjectWithImage);

router.post('/add-featured-product-with-image', upload.single('file'), uploadController.addFeaturedProdWithImage);


router.post('/upload-print-file/:deviceId/:email', upload.array('files', 3), uploadController.uploadPrintFileAndSendEmail);

router.post('/upload-quality-file', upload.single('file'), uploadController.uploadQltyFile);  // upload qlty file for oodo CRM


router.post('/upload-multiple', upload.array('files', 5), uploadController.uploadMultiple);

router.get('/get-uploaded-files', isAuth, uploadController.getUploadedS3file);
// router.delete('/delete-file-byid/:id', isAuth, uploadController.deleteFile);
router.delete('/delete-file/:key', isAuth, uploadController.deleteS3File);
router.get('/get-uploaded-files/:deviceId', isAuth, uploadController.getFileByDeviceId);

router.post('/upload-ticket-file', upload.single('file'), uploadController.uploadTicketAttachmentFile);
router.post('/update-ticket-file/:ticket_number', upload.single('file'), uploadController.updateTicketAttachmentFile);
router.post('/upload-service-doc/:ticket_number', upload.single('file'), uploadController.uploadServiceDocument);


router.post('/upload-app', upload.single('file'), uploadController.uploadAndroidApp);
router.get('/get-app-list/:project_code', uploadController.getAppHistory);
// router.get('/get-s3bucket-file', uploadController.getS3bucketData);


 // for upload error handling
router.post('/upload-single-v2', uploadController.uploadSingleV2);


// for sales
router.post('/upload-visiting-card', upload.single('file'), uploadController.uploadVisitingCard);
router.post('/upload-delivery-note/:leadId', upload.single('file'), uploadController.uploadVisitingCard);



module.exports = router;

