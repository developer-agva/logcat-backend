const express = require("express");
const multer = require("multer");
const { body } = require('express-validator');
var maxSize = 1 * 1024 * 1024

// FILE UPLOAD WITH MULTER 
const storage = multer.diskStorage({
  destination: "./public/uploads/",
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
});

var upload = multer({ storage: storage, limits: { fileSize: maxSize } });
var uploadFunc = upload.single("filePath")
const router = express.Router();
const {
  createLogs,
  createLogsV2,
  createAlerts,
  createAlertsNew,
  createTrends,
  getLogsByLogType,
  dateWiseCrashCount,
  dateWiseLogOccurrencesByLogMsg,
  getLogsCountWithOs,
  getLogsCountWithModelName,
  getCrashOccurrenceByLogMsg,
  getErrorCountByOSArchitecture,
  crashlyticsData,
  crashFreeUsersDatewise,
  getFilteredLogs,
  getAlertsWithFilter,
  getErrorCountByVersion,
  createEvents,
  getEventsWithFilter,
  getEventsById,
  getAlertsById,
  getLogsById,
  getAllDeviceId,
  getAllDevicesForUsers,
  getCrashOccurrenceByLogMsgWithDeviceId,
  dateWiseLogOccurrencesByLogMsgWithDeviceId,
  crashlyticsData2,
  getTrendsWithFilter,
  getTrendsById,
  getAllFocusedDevicesForUsers,
  createAlertsNewV2,
  createEventsV2,
  createTrendsV2,
  getAllDeviceIdV2,
  getAlertsByIdV2,
  getTrendsByIdV2,
  getEventsByIdV2,
  getLogsByIdV2
} = require("../controller/logs");
// New controller
const logController = require('../controller/logController.js');
const locationController = require('../controller/locationController.js');
const calibrationController = require('../controller/calibrationController.js');
const deviceController = require('../controller/deviceController');
const { isAuth, isSuperAdmin, isAdmin } = require("../middleware/authMiddleware");

const { validateHeader } = require("../middleware/validateMiddleware");
const hospitalController = require("../controller/hospitalController");

// Unprotected routes
// old API
router.post("/:project_code", logController.createNewLog);
// New API for all products instead of AGVA PRO
router.post("/v2/:productCode", logController.createNewLogV2);






router.post("/location/:project_code", locationController.saveNewLocation);    // for all products
router.get('/location/:deviceId/:project_code', locationController.getLocationByDeviceId);
router.post('/calibration/:project_code', calibrationController.saveCalibrationData);  // for all products
router.get('/calibration/:deviceId', calibrationController.getCalibrationByDeviceId);

// Service API
router.post('/services/:project_code', deviceController.addDeviceService);   // step 1 for ventilator   done
router.post('/services/verify-sms-otp/:project_code', deviceController.verifyOtpSms); // step 2 for ventilator  done
router.get('/services/get-by-deviceId', deviceController.getServicesById);
router.post('/services/ticket-status/:project_code', deviceController.updateTicketStatus);  // step 1 for close ticket  done
router.post('/services/verify-otp-for-ticket-close/:project_code', deviceController.closeTicket);
router.get('/services/get-all', deviceController.getAllServices);

// End service API

// Dispatch API
router.post('/status/:project_code', deviceController.saveStatus);
// new route for all upcomming products
router.post('/v2/status/:productCode', deviceController.saveStatusV2); // v2-version

router.get('/deviceOverview/:deviceId/:project_code', isAuth, deviceController.getDeviceOverviewById);
router.post('/add-dispatch-details/:project_code', deviceController.addAboutDevice);
router.post('/return-device/:project_code', deviceController.returnDevice);
router.get('/get-return-device/:deviceId', deviceController.getReturnDeviceData);

router.put('/update-dispatch-data/:project_code', isAuth, deviceController.updateAboutData);
router.get('/track-dispatched-device-location/:deviceId', deviceController.trackDeviceLocation);

router.get('/get-dispatch-data/:project_code', deviceController.getDispatchData);
router.get('/get-dispatch-databyId/:deviceId', deviceController.getDispatchDataById);


// router.post('/add-shipment-details/:serialNo', deviceController);
router.get('/about/:deviceId', isAuth, deviceController.getAboutByDeviceId);
// router.get('/about/:deviceId', isAuth, deviceController.getAboutByDeviceId);


router.get('/dynamicDeviceId/:deviceId', deviceController.sendAndReceiveData);
router.put('/assignedDeviceToUser', isAuth, deviceController.assignedDeviceToUser);
router.get('/getAssignedDeviceByUserId/:userId', isAuth, deviceController.getAssignedDeviceById);
router.get('/get-device-access-list/:deviceId', isAuth, deviceController.getDeviceAccessUsersByDeviceId);
router.get('/get-device-access-users', isAuth, deviceController.getDeviceAccessUsers);

router.get('/get-device-access-ast-list', isAuth, deviceController.getDeviceAccessAstList);
router.get('/get-device-access-doct-list', isAuth, deviceController.getDeviceAccessDoctList);


router.delete('/delete-access-from-assistant/:_id', isAuth, deviceController.deleteDeviceAccessFromAst);
router.delete('/delete-access-from-doctor/:_id', isAuth, deviceController.deleteDeviceAccessFromDoctor);

router.get('/adminDashboardDataCount', deviceController.getAdminDashboardDataCount);
router.get('/getTotalDevicesCount/:filterType', deviceController.getTotalDevicesDataCount);
router.get('/getTotalActiveDevicesCount/:filterType', deviceController.getTotalActiveDevicesCount);
router.get('/getDevicesAttentionCount/:filterType', deviceController.getDevicesNeedingAttention);


router.post(
  "/v2/:project_code",
  function (req, res, next) {
    uploadFunc(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        return res.status(400).json({
          status: 0,
          data: {
            err: {
              generatedTime: new Date(),
              errMsg: err.stack,
              msg: err.message,
              type: err.name,
            },
          },
        });
      } else if (err) {
        // console.log(err)
        // An unknown error occurred when uploading.
        return res.status(500).json({
          status: -1,
          data: {
            err: {
              generatedTime: new Date(),
              errMsg: err.stack,
              msg: err.message,
              type: err.name,
            },
          },
        });
      }
      // Everything went fine.
      next()
    })
  },
  validateHeader,
  createLogsV2
);
router.post("/alerts/:project_code",
  body('did').notEmpty(),
  body('type').notEmpty(),
  body('ack.*.code').notEmpty(),
  body('ack.*.timestamp').notEmpty(),
  createAlerts);

// New alerts or alarm api for new ventilators
router.post("/alerts-new/:project_code", createAlertsNew);

// for new alert API for all upcomming products
router.post("/v2/alerts-new/:productCode", createAlertsNewV2)
  
// old route for agva pro
router.post("/events/:project_code",
  body('did').notEmpty(),
  body('type').notEmpty(),
  body('ack.*.code').notEmpty(),
  body('ack.*.timestamp').notEmpty(),
createEvents);

// new route for all upcomming products
router.post("/v2/events/:productCode",
  body('did').notEmpty(),
  body('type').notEmpty(),
  body('ack.*.code').notEmpty(),
  body('ack.*.timestamp').notEmpty(),
createEventsV2);


router.post("/trends/:project_code",
  body('did').notEmpty(),
  body('type').notEmpty(),
  body('ack.*.code').notEmpty(),
  body('ack.*.timestamp').notEmpty(),
createTrends);

router.post("/trends/v2/:project_code", createTrendsV2);  // v2-version


//Protected Route
router.get("/:projectCode", isAuth, getFilteredLogs);

router.get("/getLogsCount/:projectCode", isAuth, getLogsByLogType);
router.get("/datewiselogcount/:projectCode", isAuth, dateWiseCrashCount);
router.get(
  "/crashfree-users-datewise/:projectCode",
  isAuth,
  crashFreeUsersDatewise
);

router.get("/alerts/:projectCode", isAuth, getAlertsWithFilter);
router.get("/events/:projectCode", isAuth, getEventsWithFilter);
router.get("/trends/:projectCode", isAuth, getTrendsWithFilter);

router.get("/deviceTrends/:did", getTrendsById);
router.get("/v2/deviceTrends/:did", getTrendsByIdV2);  // v2-version

router.get("/deviceAlerts/:did", getAlertsById);
router.get("/v2/deviceAlerts/:did", getAlertsByIdV2);   // v2-version

router.get("/deviceEvents/:did", getEventsById);
router.get("/v2/deviceEvents/:did", getEventsByIdV2);    // v2-version


router.get("/deviceLogs/:device", getLogsById);
router.get("/v2/deviceLogs/:device", getLogsByIdV2);   // v2-version


router.get("/Allevents/Events", isAuth, getAllDeviceId);
router.get("/v2/Allevents/Events/:projectCode", isAuth, getAllDeviceIdV2);  // v2-version



router.get("/Allevents/get-devices-for-users", isAuth, getAllDevicesForUsers)
router.get("/Allevents/get-focused-devices", getAllFocusedDevicesForUsers)

// router.get("/example", async (req,res)=>{
//     console.log("value of something")
// })

router.get("/get-crashlytics-data/:projectCode", isAuth, crashlyticsData);
router.get("/log-occurrences-datewise/:projectCode", isAuth, dateWiseLogOccurrencesByLogMsg);
router.get("/logMsgOccurence/:projectCode", isAuth, getCrashOccurrenceByLogMsg);
router.get("/logMsgOccurence2/:did", isAuth, getCrashOccurrenceByLogMsgWithDeviceId);
router.get("/log-occurrences-datewise2/:did", isAuth, dateWiseLogOccurrencesByLogMsgWithDeviceId);
router.get("/get-crashlytics-data2/:did", isAuth, crashlyticsData2);

//router.get("/deviceLoges/:did",getLogesById)

// UNUSED ROUTES
router.get("/getLogsCountWithOs/:projectCode", isAuth, getLogsCountWithOs);
router.get(
  "/getLogsCountWithModelName/:projectCode",
  isAuth,
  getLogsCountWithModelName
);
router.get(
  "/getErrorCountByOSArchitecture/:projectCode",
  isAuth,
  getErrorCountByOSArchitecture
);
router.get(
  "/getErrorCountByVersion/:projectCode",
  isAuth,
  getErrorCountByVersion
);

module.exports = router;
