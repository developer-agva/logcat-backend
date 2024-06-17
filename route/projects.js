const express = require('express')
const router = express.Router();
const {
    createNewProject,
    getAllRegisteredProjects,
    getProjectWithProjectCode,
    updateProjectWithProjectCode,
    addEmailWithProjectCode,
    getProjectDetails,
    
} = require('../controller/project');

const {isAuth,isSuperAdmin} = require('../middleware/authMiddleware');
const { isDeviceRegistered } = require('../middleware/validateMiddleware');

// Protected
router.get('/',isAuth,getAllRegisteredProjects);
router.post('/',isAuth,createNewProject);
router.get('/getDeviceCount/:projectCode',isAuth,getProjectDetails)
router.get('/:projectCode',isAuth, getProjectWithProjectCode)
router.put('/:projectCode',isAuth, updateProjectWithProjectCode)
router.put('/updateEmail/:projectCode', addEmailWithProjectCode)                                                                                                                                                                                                    

module.exports = router;