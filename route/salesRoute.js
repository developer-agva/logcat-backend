const express = require('express');
const router = express.Router();
const salesController = require('../controller/salesController');
const upload = require('../helper/upload.helper');
const uploadController = require('../controller/upload.controller');


// Route for  
router.post('/expense/add', salesController.addExpense);
router.get('/expense/get-all', salesController.getAllExpenses);
router.put('/expense/update/:id', salesController.updateExpenseById);
router.delete('/expense/delete/:id', salesController.deleteExpenseById);

// Route for Sales or Demo

router.post('/demo/add', salesController.addDemo);
router.get('/demo/get-demo-data', salesController.getAllDemo);
router.put('/demo/update-status', salesController.updateVentialtorStatus);

// Route for create milestone
router.post('/mileStone/add', salesController.addMileStone);
router.get('/mileStone/get-count', salesController.getAllMileStone);

// Route for sold or sales
router.get('/sales/get-sales-data', salesController.getAllSalesData);

// Route for getting marketing user list
router.get('/users/get-user-list', salesController.getUserlist);

// Route for Marketing-Admin
router.get('/sales/dashboard-data', salesController.getTotalDataCount);

router.get('/sales/user-data', salesController.getUserData);

router.get('/sales/get-single-user-data/:userId', salesController.getUserData);
router.post('/expense/upload-exp-bill/:_id', upload.single('file'), uploadController.uploadExpenseBill);


module.exports = router;