// supportRoute.js
const express = require('express');
const router = express.Router();
const { isAuth } = require("../middleware/authMiddleware.js");
const supportController = require('../controller/supportController.js');
const upload = require('../helper/upload.helper');
const uploadController = require('../controller/upload.controller');


// Support Routes

router.post('/create-ticket', isAuth, supportController.saveTicket);
router.put('/re-assign-ticket', isAuth, supportController.reAssignTicket);  // used
router.get('/get-ticket/:ticket_number',isAuth, supportController.getTicketDetails); // used



// router.get('/get-tickets',isAuth, supportController.getAllTickets);
// router.delete('/delete-ticket/:id',isAuth, supportController.deleteTicket);
// router.put('/update-ticket',isAuth, supportController.updateTicket);


// router.get('/get-ticket-details/:ticket_number', supportController.getTicketByTicketNumber);
router.post('/add-installation-record', isAuth, supportController.addInstallationRecord);
// router.post('/upload-installation-report',  supportController.addInstallationReport);
router.get('/get-concerned-person/:concerned_p_contact', supportController.getConcernedPerson);

// open route
// router.get('/get-individual-ticket/:email', supportController.getIndividualTicket);
router.post('/add-feedback', supportController.submitFeedback);


router.post('/upload-installation-report/:deviceId/:flag', upload.single('file'), uploadController.uploadInstallationReport);


router.delete('/delete-installation-report/:key', isAuth, uploadController.deleteInstallationRecord);






module.exports = router;
