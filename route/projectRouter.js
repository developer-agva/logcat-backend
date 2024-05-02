const express = require('express');
const router = express.Router();
const { isAuth, isAdmin } = require("../middleware/authMiddleware.js");
const projectController = require('../controller/projectController.js');

router.post('/addNewProject', isAuth, isAdmin, projectController.addNewProject);
router.get('/project-list', isAuth, projectController.getAllProjects);
// router.get('/featured-product-list', isAuth, isAdmin, projectController.getAllProjects);

router.get('/product-list', projectController.getAllProducts);

router.get('/project-list-for-app', projectController.getAllProjectList);








// exports module
module.exports = router


