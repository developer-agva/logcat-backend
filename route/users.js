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

router.post('/send-device-req', sendReqForDevice);
router.get('/get-user-device-req', getUserDeviceReq);

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
router.get('/user-status/:email', getUserStatus);

router.get('/users-list', isAuth, getAllUsers);
router.get('/active-users-list', isAuth, getAllActiveUSers);
router.get('/active-admin-list', isAuth, getAllActiveAdmin);

router.get('/pending-users-list', isAuth, getAllPendingUsers);
router.put('/user-account-status/:userId', isAuth, changeUserAcStatus);


router.get('/service-eng-list', getServiceEngList);
router.put('/change-user-status', changeUserStatus);

router.put('/change-userType/:userId', isAuth, isSuperAdmin, changeUserType);
router.delete('/users/delete-byid/:id', isAuth, isSuperAdmin, deleteSingleUser);

router.put('/users/update', isAuth, updateUserProfile);
router.put("/users/changepassword", isAuth, userPasswordChange);
router.get("/user-activity", isAuth, getActivity);

module.exports = router;
