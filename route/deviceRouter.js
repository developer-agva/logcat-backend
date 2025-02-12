// deviceRouter.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const deviceController = require('../controller/deviceController');
const locationController = require('../controller/locationController');
const demoDeviceController = require("../controller/demoDeviceController.js");
const router = express.Router();
const { isAuth, isAdmin } = require("../middleware/authMiddleware.js");
// const File = require("../model/File.js");
const statusModel = require('../model/statusModel.js')

// const statusData = await statusModel.find({})
// console.log(statusData)

router.post('/register', deviceController.createDevice);
router.get('/', deviceController.getAllDevices);
router.put('/update/:DeviceId', deviceController.updateDevice);

router.get('/getdevice/:DeviceId', deviceController.getDeviceById);     // get device with isPayment || isLocked field
router.get('/getdevice/v2/:DeviceId', deviceController.getDeviceByIdV2);  // get device with isPayment || isLocked field

router.get('/get-device-overview/:DeviceId', deviceController.getDeviceOverviewForSalesById); // Get single device overview for sales module
router.put('/update-device-overview/:DeviceId', deviceController.updateDeviceOverviewForSalesById);  // Update single device overview for sales

router.put('/payment-update', deviceController.updatePaymentStatus);
router.get('/payment-update-for-email', deviceController.updatePaymentStatus2);
router.put('/send-req-for-device-lock', deviceController.sendReqForDeviceLockOrUnlock);
router.get('/get-lock-unlock-devices', deviceController.getLockUnlockDevices);

router.get('/get-details/:DeviceId', deviceController.getDeviceById);
router.delete('/delete-byid/:DeviceId', deviceController.deleteSingleDevice);
router.get('/get-devices-by-hospital/:hospital_name', deviceController.getDevicesByHospital);
router.put('/update-addtofocus/:deviceId', isAuth, deviceController.updateAddtofocus);    // tested and done
router.put('/replace-deviceIds', deviceController.replaceDeviceIds)
router.get('/get-addtofocus/:deviceId', deviceController.getSignleFocusDevice)

// Map deviceIds with pincode and status
router.get('/get-device-status-with-pincode', deviceController.getDevicesStatusWithPincode)  // For AgVa Pro


// router.get()

router.get("/update/devices/new", deviceController.updateDevices)
// router.post('/register', deviceController.registerNewDevice);
router.get('/registered_devices', isAuth, deviceController.getAllDevices);
router.get('/get-device-count', deviceController.getDeviceCountData);

router.get('/get-ventilation-time', deviceController.getDeviceVentilationTime);

// replace deviceId from all coll and insert new deviceId
router.put('/replace-deviceId', deviceController.replaceDeviceId);


// Upload files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.post("/upload-files", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  // Save the file details to MongoDB
  // and store the file metadata such as filename, originalname, path, etc.

  const fileDetails = {
    filename: req.file.filename,
    originalname: req.file.originalname,
    path: req.file.path,
  };

  // Save the file details to MongoDB
  const newFile = new File(fileDetails);

  newFile.save((err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to save file details" });
    }
    return res.json({ message: "File uploaded successfully" });
  });
});
  

// sales/lead route
router.get("/demo-device-count-details/:product_code", demoDeviceController.getDeviceCountDetails)
router.get("/demo-device-count-details-for-graph/:product_code", demoDeviceController.getDeviceCountDetailsForGraph)


router.post("/add-lead-data", demoDeviceController.addInitialLead);
router.put("/update-lead-data/:leadId", demoDeviceController.updateLeadById);
router.post("/add-schedule-demo/:leadId", demoDeviceController.updateScheduledDemoByLeadId);
router.post("/add-dispatch-demo/:leadId", demoDeviceController.updateDispatchDemoByLeadId);
router.post("/add-for-sales/:leadId", demoDeviceController.addDeviceForSalesByLeadId);
router.post("/add-for-sales-confirmed/:leadId", demoDeviceController.addDeviceForSalesConfirmedByLeadId);
router.post("/add-dispatch-for-sales/:leadId", demoDeviceController.addDispatchForSalesByLeadId);
router.post("/add-payment-updates/:leadId", demoDeviceController.addPaymentUpdatesByLeadId);

router.post("/add-demo-complete-data/:leadId", demoDeviceController.addDemoCompletedByLeadId);
router.get("/get-all-leads", demoDeviceController.getAllLeads);
router.get("/get-single-lead/:leadId", demoDeviceController.getLeadById);

router.get("/get-leads-count", demoDeviceController.getLeadsCount);



module.exports = router
