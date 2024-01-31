const express = require('express');
const router = express.Router();
const { isAuth, isAdmin } = require("../middleware/authMiddleware.js");
const projectController = require('../controller/projectController.js');

router.post('/addNewProject', isAuth, isAdmin, projectController.addNewProject);
router.get('/project-list', isAuth, isAdmin, projectController.getAllProjects);








// exports module
module.exports = router


