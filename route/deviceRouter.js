// deviceRouter.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const deviceController = require('../controller/deviceController');
const locationController = require('../controller/locationController');
const router = express.Router();
const { isAuth, isAdmin } = require("../middleware/authMiddleware.js");
const File = require("../model/File.js");
const statusModel = require('../model/statusModel.js')

// const statusData = await statusModel.find({})
// console.log(statusData)

router.post('/register', deviceController.createDevice);
router.get('/', deviceController.getAllDevices);
router.put('/update/:DeviceId', deviceController.updateDevice);
router.get('/getdevice/:DeviceId', deviceController.getDeviceById);
router.get('/get-details/:DeviceId', deviceController.getDeviceById);
router.delete('/delete-byid/:DeviceId', deviceController.deleteSingleDevice);
router.get('/get-devices-by-hospital/:hospital_name', deviceController.getDevicesByHospital);
router.put('/update-addtofocus/:deviceId', isAuth, deviceController.updateAddtofocus);    // tested and done
router.get('/get-addtofocus/:deviceId', deviceController.getSignleFocusDevice)
// router.get()
router.get("/update/devices/new", deviceController.updateDevices)
// router.post('/register', deviceController.registerNewDevice);
router.get('/registered_devices', isAuth, deviceController.getAllDevices);
router.get('/get-device-count', deviceController.getDeviceCountData);

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
  


module.exports = router
