const express = require("express");
const { body } = require('express-validator');
const verifyUserOrAdmin = require('../middleware/verifyUserOrAdmin.js');
const router = express.Router();

const {
    registerUser,
    loginUser,
    updateUserProfile,
    logoutUser,
    // userForgetPassword,
    resetForgetPassword,
    verifyOtp,
    generateNewPassword,
    userPasswordChange,
    getUserByUserId,
    getUserProfileById,
    getAllUsers,
    getServiceEngList,
    changeUserType,
    getActivity,
    deleteSingleUser,
    changeUserStatus,
    getUserStatus,
    sendOtpSms,
    verifyOtpSms,
    registerUserForSuperAdmin,
    getAllActiveUSers,
    getAllPendingUsers,
    changeUserAcStatus,
    sendReqForDevice,
    getUserDeviceReq,
    getAllActiveAdmin,
    acceptOrRejectdeviceReq,
    addUserExperience,
    updateUserExperience,
    getUserProfileByExpId,
    endAssociation,
    updatePrimaryEmail,
    getAllEmployeeList,
    getAllInactiveUsers,
    assignDeviceToAssistant,
    getAssistantList
} = require('../controller/users.js')

const {
    isAuth, isAdmin, isSuperAdmin
} = require('../middleware/authMiddleware');
const { profileCache } = require("../middleware/cache.js");

// AUTH Route 
// Unprotected
router.post('/auth/login', loginUser);
router.post('/auth/register', registerUser);
router.post('/auth/register-for-dashboard', registerUserForSuperAdmin);


router.get('/send-otp-sms/:contactNumber', sendOtpSms);
router.post('/verify-sms-otp', verifyOtpSms);

router.post('/send-device-req', sendReqForDevice);    // for doctor role
router.get('/get-user-device-req', getUserDeviceReq); // get device req list for hodpital-admin
router.post('/accept-or-reject-device-req', acceptOrRejectdeviceReq);   // hospital admin can accept or reject device req
router.post('/assign-device-to-assistant', assignDeviceToAssistant); // done


// router.post("/auth/forget", body('email').notEmpty().isEmail(), userForgetPassword);

// Token access
router.post("/auth/resetPassword", resetForgetPassword)
router.post("/auth/verify-otp", verifyOtp);
router.put("/auth/generate-newpassword", generateNewPassword);
// router.post("/auth/resetPassword",
//     body('otp').notEmpty(),
//     body('email').notEmpty().isEmail(),
//     body('password').notEmpty().trim().escape(),
//     body('passwordVerify').notEmpty().trim().escape(),
//     resetForgetPassword);

// Protected
router.get('/auth/logout', isAuth, logoutUser)

// USERS Route
// Protected Route
// router.get('/users', isAuth, profileCache(10), getUserByUserId)
router.get('/users/:userId', isAuth, getUserProfileById);
router.get('/users/get-user-experience/:id', isAuth, getUserProfileByExpId);

router.get('/user-status/:email', getUserStatus);

router.get('/users-list', isAuth, getAllUsers);  
router.get('/employee-list', isAuth, getAllEmployeeList);

router.get('/active-users-list', isAuth, getAllActiveUSers);

router.get('/get-assistant-list', isAuth, getAssistantList);

router.get('/inactive-users-list', isAuth, getAllInactiveUsers);
router.get('/active-admin-list', isAuth, getAllActiveAdmin);

router.get('/pending-users-list', isAuth, getAllPendingUsers);  // done
router.put('/user-account-status/:userId', isAuth, changeUserAcStatus);


router.get('/service-eng-list', getServiceEngList);       
router.put('/change-user-status', changeUserStatus);

router.put('/change-userType/:userId', isAuth, isSuperAdmin, changeUserType);
router.delete('/users/delete-byid/:id', isAuth, isSuperAdmin, deleteSingleUser);

router.put('/users/update', isAuth, updateUserProfile);
router.post('/users/add-experience', isAuth, addUserExperience);
router.put('/users/update-experience', isAuth, updateUserExperience);
router.put('/users/end-association', isAuth, endAssociation);
router.put('/users/update-primary-email', isAuth, updatePrimaryEmail);


router.put("/users/changepassword", isAuth, userPasswordChange);
router.get("/user-activity", isAuth, getActivity);

module.exports = router;
