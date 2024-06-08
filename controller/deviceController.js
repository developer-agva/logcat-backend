// deviceController.js
const Device = require('../model/RegisterDevice');
const servicesModel = require('../model/servicesModel');
const Log = require('../model/logs');
const Joi = require('joi');
const statusModel = require('../model/statusModel');
const deviceOverviewModel = require('../model/deviceOverviewModel');
const { address } = require('..');
const aboutDeviceModel = require('../model/aboutDeviceModel');
const RegisterDevice = require('../model/RegisterDevice');
const assignDeviceTouserModel = require('../model/assignedDeviceTouserModel');
// const deviceController = {};
const mongoose = require('mongoose');
const User = require('../model/users');
// const { registerDevice } = require('./RegisterDevice');
const { validationResult } = require('express-validator');
const emailVerificationModel = require("../model/emailVerificationModel")
let redisClient = require("../config/redisInit");
const JWTR = require("jwt-redis").default;
const jwtr = new JWTR(redisClient);

require("dotenv").config({ path: "../.env" });
var unirest = require("unirest");
// const mongoose = require('mongoose');
// console.log(11111,process.env.ORIGIN)

/**
 * api      POST @/devices/register
 * desc     @register for logger access only
 */
const createDevice = async (req, res) => {
  try {
    const schema = Joi.object({
      DeviceId: Joi.string().required(),
      Department_Name: Joi.string().required(),
      Hospital_Name: Joi.string().required(),
      Ward_No: Joi.string().required(),
      Doctor_Name: Joi.string().required(),
      IMEI_NO: Joi.string().required(),
      Bio_Med: Joi.string().required(),
      Alias_Name: Joi.string().required(),
      deviceType: Joi.string().allow("").optional(),
    })
    let result = schema.validate(req.body);

    if (result.error) {
      return res.status(200).json({
        status: 0,
        statusCode: 400,
        message: result.error.details[0].message,
      })
    }

    // for logger user activity
    // const token = req.headers["authorization"].split(' ')[1];
    // const verified = await jwtrr.verify(token, process.env.jwtr_SECRET);
    // const loggedInUser = await User.findById({_id:verified.user});
    // const normalUser = await User.findById({_id:req.body._id});


    // give alias name of deviceId
    // const Alias_Str = "AgPr";
    // const ranNum = Math.floor(1000 + Math.random() * 9000);
    // let Alias_Name = `${Alias_Str}-${ranNum}`
    // // check aliasname
    // const checkAlias = await Device.findOne({Alias_Name:Alias_Name})
    // if (checkAlias) {
    //   Alias_Name = `${Alias_Str}-${ranNum}`
    // }
    const checkHospital = await registeredHospitalModel.findOne({ Hospital_Name: req.body.Hospital_Name });
    if (!checkHospital) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Error! Wrong hospital name.",
      });
    }
    const deviceData = await Device.findOneAndUpdate(
      { DeviceId: req.body.DeviceId },
      {
        DeviceId: req.body.DeviceId,
        Alias_Name: req.body.Alias_Name,
        Department_Name: req.body.Department_Name,
        Hospital_Name: req.body.Hospital_Name,
        Ward_No: req.body.Ward_No,
        Doctor_Name: req.body.Doctor_Name,
        IMEI_NO: req.body.IMEI_NO,
        Bio_Med: req.body.Bio_Med,
        deviceType: !!(req.body.deviceType) ? req.body.deviceType : "AgVa-Pro", 
      },
      { upsert: true, new: true }
    );
    // const newDevice = new Device(req.body);
    // const savedDevice = await newDevice.save();
    return res.status(200).json({
      "statusCode": 200,
      "statusValue": "SUCCESS",
      data: deviceData
    });
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    });
  }
};


const updatePaymentStatus = async (req, res) => {
  try {
    const schema = Joi.object({
      DeviceId: Joi.string().required(),
      isPaymentDone:Joi.string().optional(),
      isLocked:Joi.boolean().optional(),
    })
    let result = schema.validate(req.body);

    if (result.error) {
      return res.status(200).json({
        status: 0,
        statusCode: 400,
        message: result.error.details[0].message,
      })
    }
    
    //check deviceId
    const checkDeviceId = await Device.findOne({ DeviceId: req.body.DeviceId })
    if (!checkDeviceId) {
      return res.status(404).json({
        statusCode: 404,
        statusValue:"FAIL",
        message: "DeviceId not registered."
      })
    }

    const deviceData = await Device.findOneAndUpdate(
      { DeviceId: req.body.DeviceId },
      { 
        isPaymentDone: !!(req.body.isPaymentDone) ? req.body.isPaymentDone : "true",
        isLocked: !!(req.body.isLocked) ? req.body.isLocked : false
     },
      { upsert: true, new: true }
    );
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      data: deviceData
    });
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    });
  }
};


/**
 * api      UPDATE @/devices/update/DeviceId
 * desc     @update devices for logger access only
 */
const updateDevices = async (req, res) => {
  try {
  
    // let data = [9, 45, 2, 8, 45, 23, 7, 78, 0, 11, 41, 77];
    
    // for (let i = 0; i<data.length; i++) {
    //   console.log(data[i])
    // }
    
    // check hospital
    // const checkDevices = await productionModel.find({},{deviceId:1});
    // if (!checkDevices) {
    //   return res.status(400).json({
    //     statusCode: 400,
    //     statusValue: "FAIL",
    //     message: "Error! Wrong hospital name.",
    //   });
    // }
    // // console.log(checkDevices)
    // const deviceData = await productionModel.updateMany({version:{$in:["1.0.0"]}},{$set:{version:"2.0.0"}})
    // // const newDevice = new Device(req.body);
    // // const savedDevice = await newDevice.save();
    return res.status(200).json({
      "statusCode": 200,
      "statusValue": "SUCCESS",
      // data: 
    })
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    });
  }
};



/**
 * api      UPDATE @/devices/update/DeviceId
 * desc     @update devices for logger access only
 */
const updateDevice = async (req, res) => {
  try {
    const schema = Joi.object({
      Department_Name: Joi.string().required(),
      Hospital_Name: Joi.string().required(),
      Ward_No: Joi.string().required(),
      Doctor_Name: Joi.string().required(),
      IMEI_NO: Joi.string().required(),
      Bio_Med: Joi.string().required(),
      Alias_Name: Joi.string().required(),
    })
    let result = schema.validate(req.body);
    if (result.error) {
      return res.status(200).json({
        status: 0,
        statusCode: 400,
        message: result.error.details[0].message,
      })
    }

    // check hospital
    const checkHospital = await registeredHospitalModel.findOne({ Hospital_Name: req.body.Hospital_Name });
    if (!checkHospital) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Error! Wrong hospital name.",
      });
    }

    const deviceData = await Device.findOneAndUpdate(
      { DeviceId: req.params.DeviceId },
      req.body,
      { upsert: true, new: true },
    );
    // const newDevice = new Device(req.body);
    // const savedDevice = await newDevice.save();
    return res.status(200).json({
      "statusCode": 200,
      "statusValue": "SUCCESS",
      data: deviceData
    });

  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    });
  }
};


/**
 * api      UPDATE @/update-autofocus/:deviceId
 * desc     @update devices for logger access only
 */
const updateAddtofocus = async (req, res) => {
  try {
    const schema = Joi.object({
      addTofocus: Joi.boolean().required(),
      userId: Joi.string().required(),
    })
    let result = schema.validate(req.body);
    if (result.error) {
      return res.status(200).json({
        status: 0,
        statusCode: 400,
        message: result.error.details[0].message,
      })
    }
    const deviceData = await Device.findOneAndUpdate(
      { DeviceId: req.params.deviceId },
      { addTofocus: req.body.addTofocus },
      { upsert: true, new: true },
    )
    await statusModel.updateMany({deviceId:req.params.deviceId},{addTofocus:req.body.addTofocus},{upsert:true})
    await statusModelV2.updateMany({deviceId:req.params.deviceId},{addTofocus:req.body.addTofocus},{upsert:true})
    const getAddTofocusList = await Device.find({addTofocus:true})
    
    // check userId in fcm_token model
    // const checkUserId = await fcmTokenModel.findOne({userId:mongoose.Types.ObjectId(req.body.userId)})
    // if (!!checkUserId) {
    //   await fcmTokenModel.upd
    // }
    await fcmTokenModel.updateMany({userId:req.body.userId},{$push:{deviceIds:req.params.deviceId}})
    // console.log(11,getAddTofocusList.length)
    return res.status(200).json({
      "statusCode": 200,
      "statusValue": "SUCCESS",
      data: deviceData
    })
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    });
  }
};


/**
 * api      GET @/devices/get-addtofocus/:deviceId
 * desc     @getSignleFocusDevice devices for logger access only
 */
const getSignleFocusDevice = async (req, res) => {
  try {
    const deviceId = req.params.deviceId
    if (!deviceId) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "DeviceId is required!"
      })
    }

    const getData = await statusModel.findOne({deviceId:deviceId},{addTofocus:1,message:1,deviceId:1})
    if (!!getData) {
      return res.status(200).json({
        statusCode: 200,
        statusValue: "SUCCESS",
        message: "Data get successfully.",
        data: getData
      })
    }
    return res.status(400).json({
      statusCode: 400,
      statusValue: "FAIL",
      message: "data not found."
    })
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    })
  }  
}


/**
 * api      UPDATE @/devices/update/DeviceId
 * desc     @update devices for logger access only
 */
const deleteSingleDevice = async (req, res) => {
  try {
    const DeviceId = req.params.DeviceId;

    const checkDevice = await Device.findOne({ DeviceId: DeviceId });
    if (!checkDevice || checkDevice == "") {
      return res.status(400).json({
        "statusCode": 400,
        "statusValue": "FAIL",
        "message": "data not found."
      });
    }
    const deleteDevice = await Device.findOneAndDelete({ DeviceId: DeviceId });
    // await statusModel.findByIdAndDelete({deviceId:DeviceId})
    if (!!deleteDevice) {
      return res.status(200).json({
        statusCode: 200,
        statusValue: "SUCCESS",
        message: "Device deleted successfully.",
      });
    }
    return res.status(400).json({
      "statusCode": 400,
      "statusValue": "FAIL",
      "message": "data not deleted."
    });
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    });
  }
};


/**
 * api      GET @/devices/getdevice/DeviceId
 * desc     @get single device by id for logger access only
 */
const getDeviceById = async (req, res) => {
  try {
    const { DeviceId } = req.params;
    if (!DeviceId) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "Validation error",
        message: "Device Id is required!"
      })
    }

    let data = await Device.findOne({ DeviceId: DeviceId }, { "createdAt": 0, "updatedAt": 0, "__v": 0 });
    if (!data) {
      return res.status(404).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "DeviceId not registered.",
      })
    }
    const data2 = await statusModel.findOne({ deviceId: DeviceId }, { "createdAt": 0, "updatedAt": 0, "__v": 0 });
    data = {
      '_id': data._id,
      'DeviceId': data.DeviceId,
      'Alias_Name': data.Alias_Name,
      'Bio_Med': data.Bio_Med,
      'Department_Name': data.Department_Name,
      'Doctor_Name': data.Doctor_Name,
      'Hospital_Name': data.Hospital_Name,
      'IMEI_NO': data.IMEI_NO,
      'message': data2.message,
      'Ward_No': data.Ward_No,
      'isAssigned': data.isAssigned,
      'address': data2.address,
      'health': data2.health,
      'last_hours': data2.last_hours,
      'total_hours': data2.total_hours,
      'isPaymentDone':!!(data.isPaymentDone) ? data.isPaymentDone : "true" ,
      'isLocked':!!(data.isLocked) ? data.isLocked : false,
    };
    if (!data) {
      return res.status(404).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Data not found with this given deviceId.",
        data: {},
      })
    }
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Device get successfully!",
      data: data
    });
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    })
  }
}


/**
 * api      GET @/devices/getdevice/DeviceId
 * desc     @get single device by id for logger access only
 */
const getDeviceByIdV2 = async (req, res) => {
  try {

    const DeviceId  = req.params.DeviceId;
    if (!DeviceId) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "Validation error",
        message: "Device Id is required!"
      })
    }

    let data = await Device.findOne({ DeviceId: DeviceId }, { "createdAt": 0, "updatedAt": 0, "__v": 0 });
    // console.log(12,data)
    if (!data) {          
      return res.status(404).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "DeviceId not registered..",
      })
    }

    const data2 = await statusModelV2.findOne({ deviceId: DeviceId }, { "createdAt": 0, "updatedAt": 0, "__v": 0 });
    if (!data2) {
      return res.status(404).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Status data not found with this given deviceId.",
      })
    }

    data = {
      '_id': !!(data._id) ? data._id : "",
      'DeviceId': !!(data.DeviceId) ? data.DeviceId : "",
      'Alias_Name': !!(data.Alias_Name) ? data.Alias_Name : "",
      'Bio_Med': !!(data.Bio_Med) ? data.Bio_Med : "",
      'Department_Name': !!(data.Department_Name) ? data.Department_Name : "",
      'Doctor_Name': !!(data.Doctor_Name) ? data.Doctor_Name : "",
      'Hospital_Name': !!(data.Hospital_Name) ? data.Hospital_Name : "",
      'IMEI_NO': !!(data.IMEI_NO) ? data.IMEI_NO : "",
      'message': !!(data2.message) ? data2.message : "",
      'Ward_No': !!(data.Ward_No) ? data.Ward_No : "",
      'isAssigned': !!(data.isAssigned) ? data.isAssigned : "",
      'address': !!(data2.address) ? data2.address : "",
      'health': !!(data2.health) ? data2.health : "",
      'last_hours': !!(data2.last_hours) ? data2.last_hours : "",
      'total_hours': !!(data2.total_hours) ? data2.total_hours : "",
      'isPaymentDone':!!(data.isPaymentDone) ? data.isPaymentDone : "true" ,
      'isLocked':!!(data.isLocked) ? data.isLocked : false,
    };
    
    if (!data) {
      return res.status(404).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Data not found with this given deviceId.",
        data: {},
      })
    }

    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Device get successfully!",
      data: data
    });
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    })
  }
}


/**
 * api      GET @/get-devices-by-hospital/:hospital
 * desc     @get single device by id for logger access only
 */
const getDevicesByHospital = async (req, res) => {
  try {
    const getRegDevices = await Device.find({ Hospital_Name: req.params.hospital_name });
    const deviceIds = getRegDevices.map((item) => {
      return item.DeviceId
    })
    const getRecord = await statusModel.find({ "deviceId": { $in: deviceIds } }).sort({ "createdAt": 1 })
    // console.log(getRecord)
    let arrayUniqueByKey = [...new Map(getRecord.map(item => [item["deviceId"], item])).values()];

    if (arrayUniqueByKey.length < 1) {
      return res.status(404).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Data not found with this given hospital name.",
        data: [],
      })
    }

    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Device get successfully!",
      data: arrayUniqueByKey
    });
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    })
  }
}


/**
 * api      GET @/devices
 * desc     @getAllDevices for logger access only
 */
const getAllDevices = async (req, res) => {
  try {
    // Search
    var search = "";
    if (req.query.search && req.query.search !== "undefined") {
      search = req.query.search;
    }
    // Pagination
    let { page, limit } = req.query;
    if (!page || page === "undefined") {
      page = 1;
    }
    if (!limit || limit === "undefined" || parseInt(limit) === 0) {
      limit = 20000;
    }
    const skip = page > 0 ? (page - 1) * limit : 0;

    // get loggedin user details
    // const token = req.headers["authorization"].split(' ')[1];
    // const verified = await jwtrr.verify(token, process.env.jwtr_SECRET);
    // const loggedInUser = await User.findById({_id:verified.user});

    // Declare blank obj
    // let filterObj = {}

    // if (!!loggedInUser && loggedInUser.userType === "Hospital-Admin") {
    //   filterObj = {Hospital_Name:loggedInUser.hospitalName}
    // }

    const devices = await Device.find({
      $or: [
        { Hospital_Name: { $regex: ".*" + search + ".*", $options: "i" } },
        { DeviceId: { $regex: search } },
      ]
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Count
    const count = await Device.find({
      $or: [
        { Hospital_Name: { $regex: ".*" + search + ".*", $options: "i" } },
        { DeviceId: { $regex: search } },
      ]
    })
      .sort({ createdAt: -1 }).countDocuments();

    if (devices.length > 0) {
      return res.status(200).json({
        statusCode: 200,
        statusValue: "SUCCESS",
        message: "The device lists has been retrieved successfully.",
        data: devices,
        totalDataCount: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page
      })
    }
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Data not found.",
      data: devices,
    })
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    });
  }
}

const getDeviceCountData = async (req, res) => {
  try {
    const soldCount = await aboutDeviceModel.aggregate([
      {
        $match: {
          purpose:"Sold"
        }
      },
      {
        $group: {
          _id: "$purpose",
          count: { $sum: 1 },
        }
      }
    ])
    
    const demoCount = await aboutDeviceModel.aggregate([
      {
        $match: {
          purpose:"Demo"
        }
      },
      {
        $group: {
          _id: "$purpose",
          count: { $sum: 1 },
        }
      }
    ])

    // merge both data
    let totalCount = [...soldCount, ...demoCount]

    if (!!totalCount) {
      return res.status(200).json({
        statusCode: 200,
        statusValue: "SUCCESS",
        message: "Device data count get successfully.",
        data: totalCount
      })
    }
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    });
  }
}


/**
 * api      POST @/api/logger/logs/services/:project_code
 * desc     @addDeviceServices for logger access only
 */
const addDeviceService = async (req, res) => {
  try {
    const schema = Joi.object({
      deviceId: Joi.string().required(),
      message: Joi.string().required(),
      date: Joi.string().required(),
      serialNo: Joi.string().allow("").optional(),
      name: Joi.string().required(),
      contactNo: Joi.string().required(),
      hospitalName: Joi.string().required(),
      wardNo: Joi.string().required(),
      email: Joi.string().required(),
      department: Joi.string().required(),
    })
    let result = schema.validate(req.body);
    if (result.error) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "Validation Error",
        message: result.error.details[0].message,
      })
    }
    const project_code = req.query.project_code
   
    // var serialNo = Math.floor(1000 + Math.random() * 9000);
    // for otp sms on mobile
    
    const contactNo = `+91${req.body.contactNo}`;
    const number = req.body.contactNo;
    var otpValue = Math.floor(1000 + Math.random() * 9000);
    

    // define tag name
    let tag1 = "General Service";
    let tag2 = "Operating Support";
    let tag3 = "Request for Consumables";
    let tag4 = "Physical Damage";
    let tag5 = "Issue in Ventilation";
    let tag6 = "Performance Issues";
    let tag7 = "Apply for CMC/AMC";

    const msg = req.body.message;

    const tags = {
      tag1: !!(msg && msg.includes("General Service")) ? tag1 : "",
      tag2: !!(msg && msg.includes("Operating Support")) ? tag2 : "",
      tag3: !!(msg && msg.includes("Request for Consumables")) ? tag3 : "",
      tag4: !!(msg && msg.includes("Physical Damage")) ? tag4 : "",
      tag5: !!(msg && msg.includes("Issue in Ventilation")) ? tag5 : "",
      tag6: !!(msg && msg.includes("Performance Issues")) ? tag6 : "",
      tag7: !!(msg && msg.includes("Apply for CMC/AMC")) ? tag7 : "",
    };
    
    // check already exixts service request oe not
    const checkData = await servicesModel.findOne({ $and: [{ deviceId: req.body.deviceId }, { message: req.body.message }, { isVerified: true }, { ticketStatus: "Open" }] });
    // console.log(11,checkData);
    // console.log(12,req.body); 
    if (!!checkData) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Service request already raised.",
      })
    }

    // console.log(11,tags)
    // Set priority
    let priority;
    if (msg.includes("General Service") == true || msg.includes("Apply for CMC/AMC") == true) {
      priority = "Medium";
    }
    priority = "High";
    
    // check already exists and isVerified
    const checkIsexistsAndVerfied = await servicesModel.findOne({
      $and: [{ deviceId: req.body.deviceId }, { isVerified: false }] 
    })
    
    let savedServices;
    if (!!checkIsexistsAndVerfied) {
      savedServices = await servicesModel.findOneAndUpdate({
        $and: [{ deviceId: req.body.deviceId }, { isVerified: false }] 
      },{
        deviceId: req.body.deviceId,
        message: req.body.message,
        date: req.body.date,
        serialNo: otpValue,
        name: req.body.name,
        contactNo: req.body.contactNo,
        hospitalName: req.body.hospitalName,
        wardNo: req.body.wardNo,
        email: req.body.email,
        department: req.body.department,
        ticketStatus: "Open",
        remark: "",
        issues: tags,
        priority: priority,
      })
    } else {
      const newServices = new servicesModel({
        deviceId: req.body.deviceId,
        message: req.body.message,
        date: req.body.date,
        serialNo: otpValue,
        name: req.body.name,
        contactNo: req.body.contactNo,
        hospitalName: req.body.hospitalName,
        wardNo: req.body.wardNo,
        email: req.body.email,
        department: req.body.department,
        ticketStatus: "Open",
        remark: "",
        issues: tags,
        priority: priority,
      });
      // console.log(req.body)
      savedServices = await newServices.save();
    }
    
    const getLastData = await servicesModel.find({ contactNo: req.body.contactNo }).sort({ createdAt: -1 });
    // console.log(11, getLastData) 
    if (!!savedServices) {
      await servicesModel.findOneAndUpdate(
        { serialNo: getLastData[0].serialNo },
        {
          otp: getLastData[0].serialNo,
          isVerified: false,
        },
      )
      
      var req = unirest("GET", "https://www.fast2sms.com/dev/bulkV2");
      const sendSms = req.query({
        "authorization": process.env.Fast2SMS_AUTHORIZATION,
        "variables_values": `${otpValue}`,
        "route": "otp",
        "numbers": `${number}`
      })
      req.headers({
        "cache-control": "no-cache"
      })
      req.end(function (res) {
        // console.log(123,res.error.status)
      if (res.error.status === 400) {
          console.log(false)
        } 
        console.log("Otp sent successfully.")  
      });

      if (sendSms) {
        // findlast inserted data
        return res.status(201).json({
          statusCode: 201,
          statusValue: "SUCCESS",
          message: "Data added successfully.",
          otp: otpValue
        })
      }
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "otp was not sended.",
        data: savedServices
      });
    }
    return res.status(400).json({
      statusCode: 400,
      statusValue: "FAIL",
      message: "Error! Data not added.",
      data: savedServices
    })
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    })
  }
}



/**
 * api      POST @/api/logger/logs/services/:project_code
 * desc     @addDeviceServices for logger access only
 */
const addDeviceServiceV2 = async (req, res) => {
  try {
    const schema = Joi.object({
      deviceId: Joi.string().required(),
      message: Joi.string().required(),
      date: Joi.string().required(),
      serialNo: Joi.string().allow("").optional(),
      name: Joi.string().required(),
      contactNo: Joi.string().required(),
      hospitalName: Joi.string().required(),
      wardNo: Joi.string().required(),
      email: Joi.string().required(),
      department: Joi.string().required(),
    })
    let result = schema.validate(req.body);
    if (result.error) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "Validation Error",
        message: result.error.details[0].message,
      })
    }
    // const project_code = req.params.project_code
   
    // var serialNo = Math.floor(1000 + Math.random() * 9000);
    // for otp sms on mobile
    
    const contactNo = `+91${req.body.contactNo}`;
    const number = req.body.contactNo;
    var otpValue = Math.floor(1000 + Math.random() * 9000);
    

    // define tag name
    let tag1 = "General Service";
    let tag2 = "Operating Support";
    let tag3 = "Request for Consumables";
    let tag4 = "Physical Damage";
    let tag5 = "Issue in Ventilation";
    let tag6 = "Performance Issues";
    let tag7 = "Apply for CMC/AMC";

    const msg = req.body.message;

    const tags = {
      tag1: !!(msg && msg.includes("General Service")) ? tag1 : "",
      tag2: !!(msg && msg.includes("Operating Support")) ? tag2 : "",
      tag3: !!(msg && msg.includes("Request for Consumables")) ? tag3 : "",
      tag4: !!(msg && msg.includes("Physical Damage")) ? tag4 : "",
      tag5: !!(msg && msg.includes("Issue in Ventilation")) ? tag5 : "",
      tag6: !!(msg && msg.includes("Performance Issues")) ? tag6 : "",
      tag7: !!(msg && msg.includes("Apply for CMC/AMC")) ? tag7 : "",
    };

    // check already exixts service request oe not
    const checkData = await servicesModel.findOne({ $and: [{ deviceId: req.body.deviceId }, { message: req.body.message }, { isVerified: true },{ ticketStatus: "Open" }] });
    // console.log(11,checkData);
    // console.log(12,req.body); 
    if (!!checkData) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Service request already raised.",
      })
    }

    // console.log(11,tags)
    // Set priority
    let priority;
    if (msg.includes("General Service") == true || msg.includes("Apply for CMC/AMC") == true) {
      priority = "Medium";
    }
    priority = "High";
    
    // check already exists and isVerified
    const checkIsexistsAndVerfied = await servicesModel.findOne({
      $and: [{ deviceId: req.body.deviceId }, { isVerified: false }] 
    })
    
    let savedServices;
    if (!!checkIsexistsAndVerfied) {
      savedServices = await servicesModel.findOneAndUpdate({
        $and: [{ deviceId: req.body.deviceId }, { isVerified: false }] 
      },{
        deviceId: req.body.deviceId,
        message: req.body.message,
        date: req.body.date,
        serialNo: otpValue,
        name: req.body.name,
        contactNo: req.body.contactNo,
        hospitalName: req.body.hospitalName,
        wardNo: req.body.wardNo,
        email: req.body.email,
        department: req.body.department,
        ticketStatus: "Open",
        remark: "",
        issues: tags,
        priority: priority,
        productCode:req.params.project_code,
      })
    } else {
      const newServices = new servicesModel({
        deviceId: req.body.deviceId,
        message: req.body.message,
        date: req.body.date,
        serialNo: otpValue,
        name: req.body.name,
        contactNo: req.body.contactNo,
        hospitalName: req.body.hospitalName,
        wardNo: req.body.wardNo,
        email: req.body.email,
        department: req.body.department,
        ticketStatus: "Open",
        remark: "",
        issues: tags,
        priority: priority,
        productCode:req.params.project_code,
      });
      // console.log(req.body)
      savedServices = await newServices.save();
    }

    const getLastData = await servicesModel.find({ contactNo: req.body.contactNo }).sort({ createdAt: -1 });
    // console.log(11, getLastData) 
    if (!!savedServices) {
      await servicesModel.findOneAndUpdate(
        { serialNo: getLastData[0].serialNo },
        {
          otp: getLastData[0].serialNo,
          isVerified: false,
        },
      )

      var req = unirest("GET", "https://www.fast2sms.com/dev/bulkV2");
      const sendSms = req.query({
        "authorization": process.env.Fast2SMS_AUTHORIZATION,
        "variables_values": `${otpValue}`,
        "route": "otp",
        "numbers": `${number}`
      })
      req.headers({
        "cache-control": "no-cache"
      })
      req.end(function (res) {
        // console.log(123,res.error.status)
      if (res.error.status === 400) {
          console.log(false)
        } 
        console.log("Otp sent successfully.")  
      });

      if (sendSms) {
        // findlast inserted data
        return res.status(201).json({
          statusCode: 201,
          statusValue: "SUCCESS",
          message: "Data added successfully.",
          otp: otpValue
        })
      }
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "otp was not sended.",
        data: savedServices
      });
    }
    return res.status(400).json({
      statusCode: 400,
      statusValue: "FAIL",
      message: "Error! Data not added.",
      data: savedServices
    })
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    })
  }
}

// const addDeviceService2 = async (req, res) => {
//   try {
//     const schema = Joi.object({
//       deviceId: Joi.string().required(),
//       message: Joi.string().required(),
//       date: Joi.string().required(),
//       serialNo: Joi.string().allow("").optional(),
//       name: Joi.string().required(),
//       contactNo: Joi.string().required(),
//       hospitalName: Joi.string().required(),
//       wardNo: Joi.string().required(),
//       email: Joi.string().required(),
//       department: Joi.string().required(),
//     })
//     let result = schema.validate(req.body);
//     if (result.error) {
//       return res.status(400).json({
//         statusCode: 400,
//         statusValue: "Validation Error",
//         message: result.error.details[0].message,
//       })
//     }
//     const project_code = req.query.project_code
//     var otp = Math.floor(1000 + Math.random() * 9000);
//     // var serialNo = Math.floor(1000 + Math.random() * 9000);
//     // for otp sms on mobile
//     const twilio = require('twilio');

//     const accountSid = process.env.ACCOUNTSID

//     const authToken = process.env.AUTHTOKEN
    
//     const twilioPhone = process.env.TWILIOPHONE
    
//     const contactNo = `+91${req.body.contactNo}`;
//     const client = new twilio(accountSid, authToken);

//     // define tag name
//     let tag1 = "General Service";
//     let tag2 = "Operating Support";
//     let tag3 = "Request for Consumables";
//     let tag4 = "Physical Damage";
//     let tag5 = "Issue in Ventilation";
//     let tag6 = "Performance Issues";
//     let tag7 = "Apply for CMC/AMC";

//     const msg = req.body.message;

//     const tags = {
//       tag1: !!(msg && msg.includes("General Service")) ? tag1 : "",
//       tag2: !!(msg && msg.includes("Operating Support")) ? tag2 : "",
//       tag3: !!(msg && msg.includes("Request for Consumables")) ? tag3 : "",
//       tag4: !!(msg && msg.includes("Physical Damage")) ? tag4 : "",
//       tag5: !!(msg && msg.includes("Issue in Ventilation")) ? tag5 : "",
//       tag6: !!(msg && msg.includes("Performance Issues")) ? tag6 : "",
//       tag7: !!(msg && msg.includes("Apply for CMC/AMC")) ? tag7 : "",
//     };

//     // check already exixts service request oe not
//     const checkData = await servicesModel.findOne({ $and: [{ deviceId: req.body.deviceId }, { message: req.body.message }, { isVerified: true }] });
//     // console.log(11,checkData);
//     // console.log(12,req.body); 
//     if (!!checkData) {
//       return res.status(400).json({
//         statusCode: 400,
//         statusValue: "FAIL",
//         message: "Service request already raised.",
//       })
//     }

//     // console.log(11,tags)
//     // Set priority
//     let priority;
//     if (msg.includes("General Service") == true || msg.includes("Apply for CMC/AMC") == true) {
//       priority = "Medium";
//     }
//     priority = "High";

//     const newServices = new servicesModel({
//       deviceId: req.body.deviceId,
//       message: req.body.message,
//       date: req.body.date,
//       serialNo: otp,
//       name: req.body.name,
//       contactNo: req.body.contactNo,
//       hospitalName: req.body.hospitalName,
//       wardNo: req.body.wardNo,
//       email: req.body.email,
//       department: req.body.department,
//       ticketStatus: "Open",
//       remark: "",
//       issues: tags,
//       priority: priority,
//     });
//     // console.log(req.body)
//     const savedServices = await newServices.save();

//     const getLastData = await servicesModel.find({ contactNo: req.body.contactNo }).sort({ createdAt: -1 });
//     // console.log(11, getLastData) 
//     if (!!savedServices) {
//       await servicesModel.findOneAndUpdate(
//         { serialNo: getLastData[0].serialNo },
//         {
//           otp: getLastData[0].serialNo,
//           isVerified: false,
//         },
//       );
//       const sendSms = client.messages
//         .create({
//           body: `Your AgVa Healthcare registration verification OTP is : ${otp}`,
//           from: twilioPhone,
//           to: contactNo
//         })
//         .then(message => console.log(`Message sent with SID: ${message.sid}`))
//         .catch(error => console.error(`Error sending message: ${error.message}`));
//       if (sendSms) {
//         // findlast inserted data
//         return res.status(201).json({
//           statusCode: 201,
//           statusValue: "SUCCESS",
//           message: "Data added successfully.",
//           otp: otp
//         })
//       }
//       return res.status(400).json({
//         statusCode: 400,
//         statusValue: "FAIL",
//         message: "otp was not sended.",
//         data: savedServices
//       });
//     }
//     return res.status(400).json({
//       statusCode: 400,
//       statusValue: "FAIL",
//       message: "Error! Data not added.",
//       data: savedServices
//     })
//   } catch (err) {
//     res.status(500).json({
//       statusCode: 500,
//       statusValue: "FAIL",
//       message: "Internal server error",
//       data: {
//         generatedTime: new Date(),
//         errMsg: err.stack,
//       }
//     })
//   }
// }

const verifyOtpSms = async (req, res) => {
  try {
    const schema = Joi.object({
      otp: Joi.string().required(),
      deviceId: Joi.string().required(),
    })
    let result = schema.validate(req.body);
    if (result.error) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: result.error.details[0].message,
      })
    }
    const checkOtp = await servicesModel.findOne({ $and: [{ otp: req.body.otp }, { deviceId: req.body.deviceId }] });
    const errors = validationResult(req);

    // console.log(11,checkOtp)
    if (!checkOtp) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "You have entered wrong otp. Please enter valid OTP",
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: errors
              .array()
              .map((err) => {
                return `${err.msg}: ${err.param}`;
              })
              .join(' | '),
            msg: 'Wrong OTP',
            type: 'ValidationError',
            statusCode: 400,
          },
        },
      });
      // console.log()
    }
    if (checkOtp.isVerified == true) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Contact Number already verified.",
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: errors
              .array()
              .map((err) => {
                return `${err.msg}: ${err.param}`;
              })
              .join(' | '),
            msg: 'Contact Number already verified.',
            type: 'ValidationError',
            statusCode: 400,
          },
        },
      });
      // console.log()
    }

    await servicesModel.findOneAndUpdate({ $and: [{ otp: req.body.otp }, { deviceId: req.body.deviceId }] }, { isVerified: true })
    res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Otp verified successfully."
    })
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error.",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    });
  }
}


// api for ticket closing process
const updateTicketStatus = async (req, res) => {
  try {
    const schema = Joi.object({
      _id: Joi.string().required(),
      contactNo: Joi.string().required(),
      UId: Joi.string().allow("").optional(),
      serviceEngName: Joi.string().required(),
    })
    let result = schema.validate(req.body);
    if (result.error) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: result.error.details[0].message,
      })
    }

    // console.log(12, req.body);
    // for otp sms on mobile
    const contactNo = `+91${req.body.contactNo}`;
    const number = req.body.contactNo;
    var otpValue = Math.floor(1000 + Math.random() * 9000);
    
    // check ticket 
    const checkTicket = await servicesModel.findById({ _id: req.body._id});
    
    if (!!checkTicket) {
      // console.log(13,otp)
      await servicesModel.findOneAndUpdate(
        { _id: req.body._id },
        {
          otp: otpValue,
          UID: req.body.UId,
          serviceEngName: req.body.serviceEngName,
        }, { upsert: true },
      );
      var req = unirest("GET", "https://www.fast2sms.com/dev/bulkV2");
      const sendSms = req.query({
        "authorization": process.env.Fast2SMS_AUTHORIZATION,
        "variables_values": `${otpValue}`,
        "route": "otp",
        "numbers": `${number}`
      })
      req.headers({
        "cache-control": "no-cache"
      })
      req.end(function (res) {
        // console.log(123,res.error.status)
      if (res.error.status === 400) {
          console.log(false)
        } 
        console.log("Otp sent successfully.")  
      });

      if (sendSms) {
        // findlast inserted data
        return res.status(201).json({
          statusCode: 201,
          statusValue: "SUCCESS",
          message: "OTP has been send successfully.",
          otp: otpValue
        })
      }
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "otp was not sended.",
      });
    }
    return res.status(400).json({
      statusCode: 400,
      statusValue: "FAIL",
      message: "Error! Data not added.",
      data: savedServices
    })

  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error.",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    });
  }
}

// for ticket closing process
const closeTicket = async (req, res) => {
  try {
    const schema = Joi.object({
      otp: Joi.string().required(),
      remark: Joi.string().optional(),
      deviceId: Joi.string().required(),
    })
    let result = schema.validate(req.body);
    if (result.error) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: result.error.details[0].message,
      })
    }
    // console.log(req.body)
    const checkOtp = await servicesModel.findOne({ $and: [{ otp: req.body.otp }, { deviceId: req.body.deviceId }] });
    const errors = validationResult(req);

    // console.log(11,checkOtp)
    if (!checkOtp) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "You have entered wrong otp. Please enter valid OTP",
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: errors
              .array()
              .map((err) => {
                return `${err.msg}: ${err.param}`;
              })
              .join(' | '),
            msg: 'Wrong OTP',
            type: 'ValidationError',
            statusCode: 400,
          },
        },
      });
      // console.log()
    }
    if (checkOtp.ticketStatus == "Closed") {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Ticket already closed.",
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: errors
              .array()
              .map((err) => {
                return `${err.msg}: ${err.param}`;
              })
              .join(' | '),
            msg: 'Ticket already closed.',
            type: 'ValidationError',
            statusCode: 400,
          },
        },
      });
      // console.log()
    }
    if (!!(req.body.remark)) {
      await servicesModel.findOneAndUpdate({ $and: [{ otp: req.body.otp }, { deviceId: req.body.deviceId }] }, { ticketStatus: "Closed", remark: "Ticket has been closed by Service Engineer" });
      res.status(200).json({
        statusCode: 200,
        statusValue: "SUCCESS",
        message: "Ticket has been closed successfully."
      })
    }
    await servicesModel.findOneAndUpdate({ $and: [{ otp: req.body.otp }, { deviceId: req.body.deviceId }] }, { ticketStatus: "Closed", remark: "Ticket has been closed by Phone call" });
    res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Ticket has been closed successfully."
    })

  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error.",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    });
  }
}

/**
 * api   GET@/api/logger/logs/services/get-all
 * desc  @getAllServices for logger access only
 */
const getAllServices = async (req, res) => {
  try {

    let { page, limit, sortBy } = req.query;
    // for search
    var search = "";
    if (req.query.search && req.query.search !== "undefined") {
      search = req.query.search;
    }

    // for pagination
    if (!page || page === "undefined") {
      page = 1;
    }
    if (!limit || limit === "undefined" || parseInt(limit) === 0) {
      limit = 999999;
    }

    // for sorting
    if (!sortBy || sortBy === "Open" || sortBy == "undefined" || sortBy == "open") {
      sortBy = {
        $and: [
          { isVerified: true },
          { ticketStatus: "Open" },
          {
            $or: [
              { serialNo: { $regex: ".*" + search + ".*", $options: "i" } },
              { email: { $regex: ".*" + search + ".*", $options: "i" } },
            ]
          }
        ],
      }
    }
    else if (sortBy == "All" || sortBy == "all") {
      sortBy = {
        $and: [
          { isVerified: true },
          {
            $or: [
              { serialNo: { $regex: ".*" + search + ".*", $options: "i" } },
              { email: { $regex: ".*" + search + ".*", $options: "i" } },
            ]
          }
        ],
      }
    }
    // const project_code = req.query.project_code;

    const resData = await servicesModel.find(sortBy,
      {
        __v: 0,
        otp: 0,
        createdAt: 0,
        updatedAt: 0
      })
      .sort({ "createdAt": -1 });

    // for pagination
    const paginateArray = (resData, page, limit) => {
      const skip = resData.slice((page - 1) * limit, page * limit);
      return skip;
    };

    let finalData = paginateArray(resData, page, limit)
    // count data
    const count = await servicesModel.find(sortBy,
      {
        __v: 0,
        otp: 0,
        createdAt: 0,
        updatedAt: 0
      })
      .sort({ "createdAt": -1 })
      .countDocuments();

    if (finalData.length > 0) {
      return res.status(200).json({
        statusCode: 200,
        statusValue: "SUCCESS",
        message: "Services get successfully!",
        data: finalData,
        totalDataCount: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page
      })
    }
    return res.status(404).json({
      statusCode: 404,
      statusValue: "FAIL",
      message: "Data not found."
    })
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    })
  }
}


/**
 * api   GET@/api/logger/logs/services/get-all
 * desc  @getAllServices for logger access only
 */
const getAllServicesV2 = async (req, res) => {
  try {

    let { page, limit, sortBy } = req.query;
    // for search
    var search = "";
    if (req.query.search && req.query.search !== "undefined") {
      search = req.query.search;
    }

    // for pagination
    if (!page || page === "undefined") {
      page = 1;
    }
    if (!limit || limit === "undefined" || parseInt(limit) === 0) {
      limit = 999999;
    }

    // for sorting
    if (!sortBy || sortBy === "Open" || sortBy == "undefined" || sortBy == "open") {
      sortBy = {
        $and: [
          { isVerified: true },
          { productCode:req.params.project_code },
          { ticketStatus: "Open" },
          {
            $or: [
              { serialNo: { $regex: ".*" + search + ".*", $options: "i" } },
              { email: { $regex: ".*" + search + ".*", $options: "i" } },
            ]
          }
        ],
      }
    }
    else if (sortBy == "All" || sortBy == "all") {
      sortBy = {
        $and: [
          { isVerified: true },
          { productCode:req.params.project_code },
          {
            $or: [
              { serialNo: { $regex: ".*" + search + ".*", $options: "i" } },
              { email: { $regex: ".*" + search + ".*", $options: "i" } },
            ]
          }
        ],
      }
    }
    // const project_code = req.query.project_code;

    const resData = await servicesModel.find(sortBy,
      {
        __v: 0,
        otp: 0,
        createdAt: 0,
        updatedAt: 0
      })
      .sort({ "createdAt": -1 });

    // for pagination
    const paginateArray = (resData, page, limit) => {
      const skip = resData.slice((page - 1) * limit, page * limit);
      return skip;
    };

    let finalData = paginateArray(resData, page, limit)
    // count data
    const count = await servicesModel.find(sortBy,
      {
        __v: 0,
        otp: 0,
        createdAt: 0,
        updatedAt: 0
      })
      .sort({ "createdAt": -1 })
      .countDocuments();

    if (finalData.length > 0) {
      return res.status(200).json({
        statusCode: 200,
        statusValue: "SUCCESS",
        message: "Services get successfully!",
        data: finalData,
        totalDataCount: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page
      })
    }
    return res.status(404).json({
      statusCode: 404,
      statusValue: "FAIL",
      message: "Data not found."
    })
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    })
  }
}



/**
 * api   GET@/api/logger/logs/services/:deviceId/:project_code
 * desc  @getServicesById for logger access only
 */
const getServicesById = async (req, res) => {
  try {
    let { page, limit, deviceId, project_code } = req.query;
    if (!page || page === "undefined") {
      page = 1;
    }
    if (!limit || limit === "undefined" || parseInt(limit) === 0) {
      limit = 999999;
    }

    // const project_code = req.query.project_code;
    if (!deviceId) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "Validation error",
        message: "Device Id is required!"
      })
    }

    // aggregate logic
    var pipline = [
      // Match
      {
        "$match": { $and: [{ "deviceId": deviceId }, { "isVerified": true }] },
      },
      {
        "$lookup": {
          "from": "s3_bucket_files",
          "localField": "serialNo",
          "foreignField": "serialNo",
          "as": "bucket_mapping",
        },
      },
      // For this data model, will always be 1 record in right-side
      // of join, so take 1st joined array element
      {
        "$set": {
          "bucket_mapping": { "$first": "$bucket_mapping" },
        }
      },
      // Extract the joined embeded fields into top level fields
      {
        "$set": { "location": "$bucket_mapping.location" },
      },
      {
        "$unset": [
          "bucket_mapping",
          "__v",
          "createdAt",
          "updatedAt",
          "otp",
          "isVerified",
        ]
      },
      {
        "$sort": { "updatedAt": -1 }
      },
    ]
    
    // get data
    let resData = await servicesModel.aggregate(pipline)
    // Sort the array based on date property
    resData.sort((a, b) => {
      // Convert date obj to string
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA - dateB;
    })

    // Put "Open" tickets on top, followed by "Closed" tickets
    const sortedData = [
      ...resData.filter((item) => item.ticketStatus === "Open"),
      ...resData.filter((item) => item.ticketStatus === "Closed")
    ]
    const count = sortedData.length
    // for pagination
    const paginateArray = (sortedData, page, limit) => {
      const skip = sortedData.slice((page - 1) * limit, page * limit);
      return skip;
    };

    let finalData = paginateArray(sortedData, page, limit)
    // count data


    if (finalData.length > 0) {
      return res.status(200).json({
        statusCode: 200,
        statusValue: "SUCCESS",
        message: "Services get successfully!",
        data: finalData,
        totalDataCount: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page
      })
    }
    return res.status(404).json({
      statusCode: 404,
      statusValue: "FAIL",
      message: "Data not found."
    })
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    })
  }
}

/**
 * api POST@/api/logger/logs/status/:project_code
 * desc @saveStatus for logger access only
 */
const saveStatus = async (req, res) => {
  try {
    const schema = Joi.object({
      deviceId: Joi.string().required(),
      message: Joi.string().required(),
      health: Joi.string().required(),
      last_hours: Joi.string().required(),
      total_hours: Joi.string().required(),
      address: Joi.string().required()
    });
    const result = schema.validate(req.body);
    if (result.error) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "Validation Error",
        message: result.error.details[0].message,
      });
    }
    const project_code = req.query.project_code

    // const newStatus = new statusModel(req.body);
    const saveDoc = await statusModel.updateMany(
      {
        deviceId: req.body.deviceId
      },
      {
        deviceId: req.body.deviceId,
        message: req.body.message,
        health: req.body.health,
        last_hours: req.body.last_hours,
        total_hours: req.body.total_hours,
        address: req.body.address
      },
      {
        upsert: true,
      }
    );
    return res.status(201).json({
      statusCode: 201,
      statusValue: "SUCCESS",
      message: "Data added successfully."
    })
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    })
  }
}

// new api for all upcomming products
const saveStatusV2 = async (req, res) => {
  try {
    const schema = Joi.object({
      deviceId: Joi.string().required(),
      message: Joi.string().required(),
      health: Joi.string().required(),
      last_hours: Joi.string().allow("").optional(),
      total_hours: Joi.string().allow("").optional(),
      address: Joi.string().allow("").optional()
    });
    const result = schema.validate(req.body);
    if (result.error) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "Validation Error",
        message: result.error.details[0].message,
      });
    }
    if (req.params.productCode == "002") {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "Validation Error",
        message: "productCode must be 003 or 004 or 005 or 006 format.",
      });
    }
    // const newStatus = new statusModel(req.body);
    const saveDoc = await statusModelV2.updateMany(
      {
        deviceId: req.body.deviceId
      },
      {
        deviceId: req.body.deviceId,
        message: req.body.message,
        health: req.body.health,
        last_hours: !!(req.body.last_hours) ? req.body.last_hours : "",
        total_hours: !!(req.body.total_hours) ? req.body.total_hours : "",
        address: !!(req.body.address) ? req.body.address : "",
        type:req.params.productCode
      },
      {
        upsert: true,
      }
    );
    return res.status(201).json({
      statusCode: 201,
      statusValue: "SUCCESS",
      message: "Data added successfully."
    })
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    })
  }
}


/**
 * api      GET @/api/logger/logs/deviceOverview/:deviceId/:project_code
 * desc     @getDeviceOverviewById for logger access only
 */
const getDeviceOverviewById = async (req, res) => {
  try {
    const { deviceId, project_code } = req.params;
    // const project_code = req.query.project_code;
    if (!deviceId) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "Validation error",
        message: "Device Id is required!"
      })
    }
    const findData = await statusModel.findOne({ deviceId: deviceId });
    if (findData) {
      const saveDoc = new deviceOverviewModel({
        deviceId: findData.deviceId,
        runningStatus: findData.message,
        address: "A-1 Sector 81, Noida 201301 (UP)",
        hours: "01:54:14",
        totalHours: "06:52:14",
        health: "Good"
      })
      await saveDoc.save();
    }
    const data = await deviceOverviewModel.find({ deviceId: deviceId }, { "createdAt": 0, "updatedAt": 0, "__v": 0 });
    if (!data.length) {
      return res.status(404).json({
        statusCode: 404,
        statusValue: "FAIL",
        message: "Data not found."
      })
    }
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Device overview get successfully!",
      data: data
    })
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    })
  }
}

// get return device history
const getReturnDeviceData = async (req, res) => {
  try {
    // aggregate logic old data
    var pipline1 = [
      // Match
      {
        "$match": { "deviceId": req.params.deviceId }
      },
      {
        "$lookup": {
          "from": "s3_po_buckets",
          "localField": "deviceId",
          "foreignField": "deviceId",
          "as": "poPdfData"
        }
      },

      // For this data model, will always be 1 record in right-side
      // of join, so take 1st joined array element
      {
        "$set": {
          "poPdfData": { "$first": "$poPdfData" },
        }
      },
      // Extract the joined embeded fields into top level fields
      {
        "$set": { "poPdf": "$poPdfData.location" },
      },
      {
        "$unset": [
          "__v",
          // "createdAt",
          "poPdfData",
          "updatedAt",
          // "otp",
          // "isVerified",
          // "dispatchData.__v"
        ]
      },
    ]

    var pipline2 = [
      // Match
      {
        "$match": { "deviceId": req.params.deviceId }
      },
      {
        "$lookup": {
          "from": "s3_return_po_buckets",
          "localField": "deviceId",
          "foreignField": "deviceId",
          "as": "poPdfData"
        }
      },

      // For this data model, will always be 1 record in right-side
      // of join, so take 1st joined array element
      {
        "$set": {
          "poPdfData": { "$first": "$poPdfData" },
        }
      },
      // Extract the joined embeded fields into top level fields
      {
        "$set": { "poPdf": "$poPdfData.location" },
      },
      {
        "$unset": [
          "__v",
          // "createdAt",
          "poPdfData",
          "updatedAt",
          // "otp",
          // "isVerified",
          // "dispatchData.__v"
        ]
      },
    ]
    // get data
    const resData1 = await returnDeviceModel.aggregate(pipline1);
    const resData2 = await aboutDeviceModel.aggregate(pipline2);
    finalArr = [...resData1, ...resData2]
    // console.log(resData)
    if (resData1.length > 0) {
      return res.status(200).json({
        statusCode: 200,
        statusValue: "SUCCESS",
        message: "data get successfully.",
        data: finalArr
      })
    }
    return res.status(400).json({
      statusCode: 400,
      statusValue: "FAIL",
      message: "data not found.",
    })
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      },
    });
  }
};

// return device
const returnDevice = async (req, res) => {
  try {
    const schema = Joi.object({
      deviceId: Joi.string().optional(),
      product_type: Joi.string().required(),
      serial_no: Joi.string().required(),
      purpose: Joi.string().allow("").optional(),
      concerned_person: Joi.string().allow("").optional(),
      batch_no: Joi.string(),                   // not required
      date_of_manufacturing: Joi.string(),      // not required
      address: Joi.string().allow("").optional(),
      date_of_dispatch: Joi.string().required(),
      hospital_name: Joi.string().allow("").optional(),
      phone_number: Joi.string().required().allow("").optional(),
      sim_no: Joi.string(),                     // not required
      pincode: Joi.string().allow("").optional(),
      distributor_name: Joi.string().allow("").optional(), // not required
      distributor_contact: Joi.string().allow('').optional(),     // not required
      state: Joi.string().allow("").optional(),
      city: Joi.string().allow("").optional(),
      district: Joi.string().allow("").optional(),
      document_no: Joi.string().allow("").optional(),
      concerned_person_email: Joi.string().allow("").optional(),
      // gst_number: Joi.string().allow("").optional(),
      marketing_lead: Joi.string().allow("").optional(),
      consinee: Joi.string().allow("").optional(),
      consigneeAddress: Joi.string().allow("").optional(),
      buyerAddress: Joi.string().allow("").optional(),
      buyerName: Joi.string().allow("").optional(),
      poNumber: Joi.string().allow("").optional(),
      distributor_gst: Joi.string().allow('').optional(),
      panNo: Joi.string().allow('').optional(),
      otherRef: Joi.string().allow('').optional(),
    });
    const result = schema.validate(req.body);
    if (result.error) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "Validation Error",
        message: result.error.details[0].message,
      });
    }
    // console.log(req.body)
    const project_code = req.query.project_code;
    // check already serial number exixts or not
    const isSerialNo = await aboutDeviceModel.findOne({ serial_no: req.body.serial_no });

    // set date of warranty
    function addOneYear(date) {
      date.setFullYear(date.getFullYear() + 1);
      return date;
    }
    const date = new Date(new Date());
    const date_of_warranty = addOneYear(date);
    const cstr = date_of_warranty.toISOString()
    const finalDate = cstr.split("T")
    // console.log(11,nStr[0])

    // get Production data
    const getProduction = await productionModel.findOne({ $or: [{ serialNumber: req.body.serial_no }, { deviceId: req.body.deviceId }] });
    // console.log(22, getProduction)
    // get hospital
    const getHospital = await Device.findOne({ $or: [{ DeviceId: req.body.deviceId }] });
    // console.log(11,getHospital)
    const oldData = await aboutDeviceModel.findOne({ deviceId: req.body.deviceId })
    // console.log(12,oldData)
    // console.log(11,req.body)
    await returnDeviceModel.findOneAndUpdate({ deviceId: "59b5ffc658031f311" }, oldData, { upsert: true })
    let saveDispatchData
    if (!!getProduction) {
      saveDispatchData = await aboutDeviceModel.findOneAndUpdate(
        { deviceId: req.body.deviceId },
        {
          deviceId: req.body.deviceId,
          product_type: req.body.product_type,
          serial_no: req.body.serial_no,
          purpose: !!(req.body.purpose) ? req.body.purpose : "NA",
          concerned_person: !!(req.body.concerned_person) ? req.body.concerned_person : "NA",
          batch_no: !!(req.body.batch_no) ? req.body.batch_no : "NA",
          date_of_manufacturing: !!(req.body.date_of_manufacturing) ? req.body.date_of_manufacturing : "NA",
          address: !!(req.body.address) ? req.body.address : "NA",
          date_of_dispatch: !!(req.body.date_of_dispatch) ? req.body.date_of_dispatch : "NA",
          hospital_name: !!(req.body.hospital_name) ? req.body.hospital_name : "NA",
          phone_number: !!(req.body.phone_number) ? req.body.phone_number : "NA",
          sim_no: "NA",
          pincode: req.body.pincode,
          distributor_name: (!!req.body.distributor_name) ? req.body.distributor_name : "NA",
          distributor_contact: (!!req.body.distributor_contact) ? req.body.distributor_contact : "NA",
          state: (!!req.body.state) ? req.body.state : "NA",
          city: (!!req.body.city) ? req.body.city : "NA",
          district: (!!req.body.district) ? req.body.district : "NA",
          date_of_warranty: !!finalDate[0] ? finalDate[0] : "NA",
          document_no: req.body.document_no,
          concerned_person_email: !!(req.body.concerned_person_email) ? req.body.concerned_person_email : "NA",
          // gst_number:!!(req.body.gst_number) ? req.body.gst_number : "NA",
          marketing_lead: !!(req.body.marketing_lead) ? req.body.marketing_lead : "NA",
          consinee: !!(req.body.consinee) ? req.body.consinee : "NA",
          consigneeAddress: !!(req.body.consigneeAddress) ? req.body.consigneeAddress : "NA",
          buyerAddress: !!(req.body.buyerAddress) ? req.body.buyerAddress : "NA",
          buyerName: !!(req.body.buyerName) ? req.body.buyerName : "NA",
          distributor_gst: !!(req.body.distributor_gst) ? req.body.distributor_gst : "NA",
          panNo: !!(req.body.panNo) ? req.body.panNo : "NA",
          otherRef: !!(req.body.otherRef) ? req.body.otherRef : "NA"
        },
        { upsert: true }
      );
      await productionModel.findOneAndUpdate({ deviceId: req.body.deviceId }, { shipmentMode: "inprocess", return: true }, { upsert: true })
      await markAsShippedModel.findOneAndDelete({ deviceId: req.body.deviceId })
      // console.log(2)

      return res.status(201).json({
        statusCode: 201,
        statusValue: "SUCCESS",
        message: "Data added successfully.",
      });
    }
    return res.status(201).json({
      statusCode: 201,
      statusValue: "SUCCESS",
      message: "Data added successfully.",
    });
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      },
    });
  }
};



const addAboutDevice = async (req, res) => {
  try {
    const schema = Joi.object({
      deviceId: Joi.string().optional(),
      product_type: Joi.string().required(),
      serial_no: Joi.string().required(),
      purpose: Joi.string().allow("").optional(),
      concerned_person: Joi.string().allow("").optional(),
      batch_no: Joi.string(),                   // not required
      date_of_manufacturing: Joi.string(),      // not required
      address: Joi.string().allow("").optional(),
      date_of_dispatch: Joi.string().required(),
      hospital_name: Joi.string().allow("").optional(),
      phone_number: Joi.string().required().allow("").optional(),
      sim_no: Joi.string(),                     // not required
      pincode: Joi.string().allow("").optional(),
      distributor_name: Joi.string().allow("").optional(), // not required
      distributor_contact: Joi.string().allow('').optional(),     // not required
      state: Joi.string().allow("").optional(),
      city: Joi.string().allow("").optional(),
      district: Joi.string().allow("").optional(),
      country: Joi.string().allow("").optional(),
      document_no: Joi.string().allow("").optional(),
      concerned_person_email: Joi.string().allow("").optional(),
      // gst_number: Joi.string().allow("").optional(),
      marketing_lead: Joi.string().allow("").optional(),
      consinee: Joi.string().allow("").optional(),
      consigneeAddress: Joi.string().allow("").optional(),
      buyerAddress: Joi.string().allow("").optional(),
      buyerName: Joi.string().allow("").optional(),
      poNumber: Joi.string().allow("").optional(),
      distributor_gst: Joi.string().allow('').optional(),
      panNo: Joi.string().allow('').optional(),
      otherRef: Joi.string().allow('').optional(),
    });
    const result = schema.validate(req.body);
    if (result.error) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "Validation Error",
        message: result.error.details[0].message,
      });
    }
    // console.log(req.body)
    const project_code = req.query.project_code;
    // check already serial number exixts or not
    const isSerialNo = await aboutDeviceModel.findOne({ serial_no: req.body.serial_no });
    
    // set date of warranty
    function addOneYear(date) {
      date.setFullYear(date.getFullYear() + 1);
      return date;
    }
    const date = new Date(new Date());
    const date_of_warranty = addOneYear(date);
    const cstr = date_of_warranty.toISOString()
    const finalDate = cstr.split("T")
    // console.log(11,nStr[0])

    // get Production data
    const getProduction = await productionModel.findOne({ $or: [{ serialNumber: req.body.serial_no }, { deviceId: req.body.deviceId }] });
    // console.log(22, getProduction)
    // get hospital
    const getHospital = await Device.findOne({ $or: [{ DeviceId: req.body.deviceId }] });
    // console.log(11,getHospital)
    // console.log(11,req.body)

    // get productCode from statusModel
    const getProductCode = await statusModelV2.findOne({ deviceId: req.body.deviceId });


    let saveDispatchData
    if (!!getProduction) {
      // console.log(1)
      saveDispatchData = await aboutDeviceModel.findOneAndUpdate(
        { deviceId: !!getProduction ? getProduction.deviceId : req.body.deviceId },
        {
          deviceId: !!getProduction ? getProduction.deviceId : req.body.deviceId,
          product_type: !!getProduction ? getProduction.productType : req.body.product_type,
          serial_no: !!getProduction ? getProduction.serialNumber : req.body.serial_no,
          purpose: !!(req.body.purpose) ? req.body.purpose : "NA",
          concerned_person: !!(req.body.concerned_person) ? req.body.concerned_person : "NA",
          batch_no: !!getProduction ? getProduction.batchNumber : req.body.batch_no,
          date_of_manufacturing: !!getProduction ? getProduction.manufacturingDate : req.body.date_of_manufacturing,
          address: !!(req.body.address) ? req.body.address : "NA",
          date_of_dispatch: !!(req.body.date_of_dispatch) ? req.body.date_of_dispatch : "NA",
          hospital_name: !!(req.body.hospital_name) ? req.body.hospital_name : "NA",
          phone_number: !!(req.body.phone_number) ? req.body.phone_number : "NA",
          sim_no: !!getProduction ? getProduction.simNumber : "NA",
          pincode: !!(req.body.pincode) ? req.body.pincode : "NA",
          distributor_name: (!!req.body.distributor_name) ? req.body.distributor_name : "NA",
          distributor_contact: (!!req.body.distributor_contact) ? req.body.distributor_contact : "NA",
          state: (!!req.body.state) ? req.body.state : "NA",
          city: (!!req.body.city) ? req.body.city : "NA",
          district: (!!req.body.district) ? req.body.district : "NA",
          country: (!!req.body.country) ? req.body.country : "NA",
          date_of_warranty: !!(finalDate[0]) ? finalDate[0] : "NA",
          document_no: !!(req.body.document_no) ? req.body.document_no : "NA",
          concerned_person_email: !!(req.body.concerned_person_email) ? req.body.concerned_person_email : "NA",
          // gst_number:!!(req.body.gst_number) ? req.body.gst_number : "NA",
          marketing_lead: !!(req.body.marketing_lead) ? req.body.marketing_lead : "NA",
          consinee: !!(req.body.consinee) ? req.body.consinee : "NA",
          consigneeAddress: !!(req.body.consigneeAddress) ? req.body.consigneeAddress : "NA",
          buyerAddress: !!(req.body.buyerAddress) ? req.body.buyerAddress : "NA",
          buyerName: !!(req.body.buyerName) ? req.body.buyerName : "NA",
          distributor_gst: !!(req.body.distributor_gst) ? req.body.distributor_gst : "NA",
          panNo: !!(req.body.panNo) ? req.body.panNo : "NA",
          otherRef: !!(req.body.otherRef) ? req.body.otherRef : "NA",
          productCode: !!getProductCode ? getProductCode.type : "",
        },
        { upsert: true }
      )
      // for update shipmentMode
      await productionModel.findOneAndUpdate({ shipmentMode: "inprocess" })
      await RegisterDevice.findOneAndUpdate({ DeviceId: !!getProduction ? getProduction.deviceId : req.body.deviceId },{Hospital_Name:req.body.hospital_name})
    }

    saveDispatchData = await aboutDeviceModel.findOneAndUpdate(
      { deviceId: req.body.deviceId },
      {
        deviceId: req.body.deviceId,
        product_type: req.body.product_type,
        serial_no: req.body.serial_no,
        purpose: !!(req.body.purpose) ? req.body.purpose : "NA",
        concerned_person: !!(req.body.concerned_person) ? req.body.concerned_person : "NA",
        batch_no: !!(req.body.batch_no) ? req.body.batch_no : "NA",
        date_of_manufacturing: !!(req.body.date_of_manufacturing) ? req.body.date_of_manufacturing : "NA",
        address: !!(req.body.address) ? req.body.address : "NA",
        date_of_dispatch: !!(req.body.date_of_dispatch) ? req.body.date_of_dispatch : "NA",
        hospital_name: !!(req.body.hospital_name) ? req.body.hospital_name : "NA",
        phone_number: !!(req.body.phone_number) ? req.body.phone_number : "NA",
        sim_no: "NA",
        pincode: req.body.pincode,
        distributor_name: (!!req.body.distributor_name) ? req.body.distributor_name : "NA",
        distributor_contact: (!!req.body.distributor_contact) ? req.body.distributor_contact : "NA",
        state: (!!req.body.state) ? req.body.state : "NA",
        city: (!!req.body.city) ? req.body.city : "NA",
        district: (!!req.body.district) ? req.body.district : "NA",
        country: (!!req.body.country) ? req.body.country : "NA",
        date_of_warranty: !!finalDate[0] ? finalDate[0] : "NA",
        document_no: req.body.document_no,
        concerned_person_email: !!(req.body.concerned_person_email) ? req.body.concerned_person_email : "NA",
        // gst_number:!!(req.body.gst_number) ? req.body.gst_number : "NA",
        marketing_lead: !!(req.body.marketing_lead) ? req.body.marketing_lead : "NA",
        consinee: !!(req.body.consinee) ? req.body.consinee : "NA",
        consigneeAddress: !!(req.body.consigneeAddress) ? req.body.consigneeAddress : "NA",
        buyerAddress: !!(req.body.buyerAddress) ? req.body.buyerAddress : "NA",
        buyerName: !!(req.body.buyerName) ? req.body.buyerName : "NA",
        distributor_gst: !!(req.body.distributor_gst) ? req.body.distributor_gst : "NA",
        panNo: !!(req.body.panNo) ? req.body.panNo : "NA",
        otherRef: !!(req.body.otherRef) ? req.body.otherRef : "NA",
        productCode: !!getProductCode ? getProductCode.type : "",
      },
      { upsert: true }
    );
    await productionModel.findOneAndUpdate({ shipmentMode: "inprocess" })
    await RegisterDevice.findOneAndUpdate({ DeviceId: !!getProduction ? getProduction.deviceId : req.body.deviceId },{Hospital_Name:req.body.hospital_name})
    // console.log(2)
    const checkData = await aboutDeviceModel.findOne({ deviceId: req.body.deviceId });
    if (!!checkData) {
      await productionModel.findOneAndUpdate(
        { deviceId: checkData.deviceId },
        {
          hospitalName: checkData.hospital_name,
          // address:checkData.address,
          dispatchDate: checkData.date_of_dispatch,
          purpose: checkData.purpose,
          dateOfWarranty: checkData.date_of_warranty,
          shipmentMode: "inprocess"
        }
      );
      return res.status(201).json({
        statusCode: 201,
        statusValue: "SUCCESS",
        message: "Data added successfully.",
      });
    }
    // await productionModel.findOneAndUpdate(
    //   {deviceId:checkData.deviceId},
    //   {
    //     hospitalName:checkData.hospital_name,
    //     address:checkData.address,
    //     dispatchDate:checkData.date_of_dispatch,
    //     purpose:checkData.purpose,
    //     dateOfWarranty:checkData.date_of_warranty,
    //   }
    // );
    // console.log(33,saveDispatchData)
    return res.status(201).json({
      statusCode: 201,
      statusValue: "SUCCESS",
      message: "Data added successfully.",
    });
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      },
    });
  }
};


// PUT - update dispatch data
const updateAboutData = async (req, res) => {
  try {
    const schema = Joi.object({
      deviceId: Joi.string().optional(),
      product_type: Joi.string().optional(),
      serial_no: Joi.string().required(),
      purpose: Joi.string().allow("").optional(),
      concerned_person: Joi.string().allow("").optional(),
      batch_no: Joi.string().optional(),                   // not required
      date_of_manufacturing: Joi.string().optional(),      // not required
      address: Joi.string().allow("").optional(),
      date_of_dispatch: Joi.string().optional(),
      hospital_name: Joi.string().allow("").optional(),
      phone_number: Joi.string().required().allow("").optional(),
      sim_no: Joi.string().optional(),                     // not required
      pincode: Joi.string().allow("").optional(),
      distributor_name: Joi.string().allow("").optional(), // not required
      distributor_contact: Joi.string().allow('').optional(),     // not required
      state: Joi.string().allow("").optional(),
      city: Joi.string().allow("").optional(),
      district: Joi.string().allow("").optional(),
      document_no: Joi.string().allow("").optional(),
      concerned_person_email: Joi.string().allow("").optional(),
      // gst_number: Joi.string().allow("").optional(),
      marketing_lead: Joi.string().allow("").optional(),
      consinee: Joi.string().allow("").optional(),
      buyerAddress: Joi.string().allow("").optional(),
      buyerName: Joi.string().allow("").optional(),
      poNumber: Joi.string().allow("").optional(),
      distributor_gst: Joi.string().allow('').optional(),
      panNo: Joi.string().allow('').optional(),
      otherRef: Joi.string().allow('').optional(),
    });
    const result = schema.validate(req.body);
    if (result.error) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "Validation Error",
        message: result.error.details[0].message,
      });
    }
    const project_code = req.query.project_code;


    const getData = await aboutDeviceModel.find({ $or: [{ deviceId: req.body.deviceId }, { serial_no: req.body.serial_no }] }).sort({ createdAt: -1 });
    if (getData.length < 1) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Error!! Data not updated."
      });
    }
    // add dispatch data location wise
    await dispatchActivityLogModel.findOneAndUpdate(
      {
        serial_no:"AGVA2345684322"
      },
      {
        deviceId:getData[0].deviceId,address:getData[0].address,serial_no:getData[0].serial_no,hospital_name:getData[0].hospital_name,concerned_person:getData[0].concerned_person,
        address:getData[0].address,billed_to:getData[0].billed_to,buyerAddress:getData[0].buyerAddress,buyerName:getData[0].buyerName,city:getData[0].city,concerned_person_email:getData[0].concerned_person_email,
        consigneeAddress:getData[0].consigneeAddress,consinee:getData[0].consinee,date_of_dispatch:getData[0].date_of_dispatch,date_of_manufacturing:getData[0].date_of_manufacturing,
        distributor_contact:getData[0].distributor_contact,distributor_name:getData[0].distributor_name,distributor_gst:getData[0].distributor_gst,district:getData[0].district,
        document_no:getData[0].document_no,marketing_lead:getData[0].marketing_lead,phone_number:getData[0].phone_number,pincode:getData[0].pincode,product_type:getData[0].product_type,
        purpose:getData[0].purpose,sim_no:getData[0].sim_no,state:getData[0].state,country:getData[0].country
      }, {upsert:true})
    
    const saveDispatchData = await aboutDeviceModel.findOneAndUpdate(
      { $or: [{ deviceId: req.body.deviceId }, { serial_no: req.body.serial_no }] },
      req.body,
      { upsert: true }
    )
    await productionModel.findOneAndUpdate({deviceId:req.body.deviceId},{purpose:req.body.purpose})
    await RegisterDevice.findOneAndUpdate({ DeviceId: req.body.deviceId },{Hospital_Name:!!(req.body.hospital_name) ? req.body.hospital_name : getData[0].hospital_name})
    // const saveDoc = await saveDispatchData.save();
    if (!saveDispatchData) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Error!! Data not updated."
      });
    }
  
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Dispatch Data updated successfully.",
      data: saveDispatchData
    });
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      },
    });
  }
}


const getDispatchData = async (req, res) => {
  try {
    // Search
    var search = "";
    if (req.query.search && req.query.search !== "undefined") {
      search = req.query.search;
    }
    // Pagination
    let { page, limit } = req.query;
    if (!page || page === "undefined") {
      page = 1;
    }
    if (!limit || limit === "undefined" || parseInt(limit) === 0) {
      limit = 99999;
    }

    const { project_code } = req.params;
    let dispatchData = await aboutDeviceModel.aggregate(
      [
        { $match: { deviceId: { $ne: null } } },
        {
          "$match": {
            "$or": [
              { deviceId: { $regex: ".*" + search + ".*", $options: "i" } },
              { serial_no: { $regex: ".*" + search + ".*", $options: "i" } },
              { hospital_name: { $regex: ".*" + search + ".*", $options: "i" } },
            ]
          }
        },
        {
          $group: {
            _id: {
              deviceId: '$deviceId',
              // batch_no:'$batch_no',
              // product_type:'$product_type',
              // serial_no:'$serial_no',
              // purpose:'$purpose',
              // concerned_person:'$concerned_person',
              // date_of_manufacturing:'$date_of_manufacturing',
              // address:'$address',
              // date_of_dispatch:'$date_of_dispatch',
              // hospital_name:'$hospital_name',
              // phone_number:'$phone_number',
              // sim_no:'$sim_no',
              // pincode:'$pincode',
              // distributor_name:'$distributor_name',
              // state:'$state',
              // city:'$city',
              // district:'$district',
              // date_of_warranty:'$date_of_warranty',
              // document_no:'$document_no',
              // updatedAt:'$updatedAt',
            }, uniqueDocs: { $first: '$$ROOT' }
          }
        },
        { $replaceRoot: { newRoot: '$uniqueDocs' } },
        { $sort: { createdAt: -1 } },
        { $project: { __v: 0, createdAt: 0, updatedAt: 0 } }
      ]
    );
    // const dispatchData = await aboutDeviceModel.find({ "product_type":{$ne:null} }, 
    //   { "deviceId":1,
    //   "batch_no":1,
    //   "product_type":1,
    //   "serial_no":1,
    //   "purpose":1,
    //   "concerned_person":1,
    //   "date_of_manufacturing":1,
    //   "address":1,
    //   "date_of_dispatch":1,
    //   "hospital_name":1,
    //   "phone_number":1,
    //   "sim_no":1,
    //   "pincode":1,
    //   "distributor_name":1,
    //   "distributor_contact":1,
    //   "state":1,
    //   "city":1,
    //   "district":1,
    //   "date_of_warranty":1,
    //   "document_no":1,
    // }).sort({updatedAt:-1});

    // for pagination purpose 

    const paginateArray = (dispatchData, page, limit) => {
      const skip = dispatchData.slice((page - 1) * limit, page * limit);
      return skip;
    };

    let allData = paginateArray(dispatchData, page, limit)
    if (!dispatchData.length) {
      return res.status(404).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Data not found with this given deviceId."
      });
    }
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Product dispatch details get successfully!",
      data: allData,
      totalDataCount: dispatchData.length,
      totalPages: Math.ceil((dispatchData.length) / limit),
      currentPage: page,
      // data22:dispData
    });
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    })
  }
}


const getDispatchDataV2 = async (req, res) => {
  try {
    // Search
    var search = "";
    if (req.query.search && req.query.search !== "undefined") {
      search = req.query.search;
    }
    // Pagination
    let { page, limit } = req.query;
    if (!page || page === "undefined") {
      page = 1;
    }
    if (!limit || limit === "undefined" || parseInt(limit) === 0) {
      limit = 99999;
    }

    const { project_code } = req.params;
    let dispatchData = await aboutDeviceModel.aggregate(
      [
        { $match: {$and:[{ deviceId: { $ne: null }},{productCode:req.params.productCode}] }},
        {
          "$match": {
            "$or": [
              { deviceId: { $regex: ".*" + search + ".*", $options: "i" } },
              { serial_no: { $regex: ".*" + search + ".*", $options: "i" } },
              { hospital_name: { $regex: ".*" + search + ".*", $options: "i" } },
            ]
          }
        },
        {
          $group: {
            _id: {
              deviceId: '$deviceId',
              // batch_no:'$batch_no',
              // product_type:'$product_type',
              // serial_no:'$serial_no',
              // purpose:'$purpose',
              // concerned_person:'$concerned_person',
              // date_of_manufacturing:'$date_of_manufacturing',
              // address:'$address',
              // date_of_dispatch:'$date_of_dispatch',
              // hospital_name:'$hospital_name',
              // phone_number:'$phone_number',
              // sim_no:'$sim_no',
              // pincode:'$pincode',
              // distributor_name:'$distributor_name',
              // state:'$state',
              // city:'$city',
              // district:'$district',
              // date_of_warranty:'$date_of_warranty',
              // document_no:'$document_no',
              // updatedAt:'$updatedAt',
            }, uniqueDocs: { $first: '$$ROOT' }
          }
        },
        { $replaceRoot: { newRoot: '$uniqueDocs' } },
        { $sort: { createdAt: -1 } },
        { $project: { __v: 0, createdAt: 0, updatedAt: 0 } }
      ]
    );
    // const dispatchData = await aboutDeviceModel.find({ "product_type":{$ne:null} }, 
    //   { "deviceId":1,
    //   "batch_no":1,
    //   "product_type":1,
    //   "serial_no":1,
    //   "purpose":1,
    //   "concerned_person":1,
    //   "date_of_manufacturing":1,
    //   "address":1,
    //   "date_of_dispatch":1,
    //   "hospital_name":1,
    //   "phone_number":1,
    //   "sim_no":1,
    //   "pincode":1,
    //   "distributor_name":1,
    //   "distributor_contact":1,
    //   "state":1,
    //   "city":1,
    //   "district":1,
    //   "date_of_warranty":1,
    //   "document_no":1,
    // }).sort({updatedAt:-1});

    // for pagination purpose 

    const paginateArray = (dispatchData, page, limit) => {
      const skip = dispatchData.slice((page - 1) * limit, page * limit);
      return skip;
    };

    let allData = paginateArray(dispatchData, page, limit)
    if (!dispatchData.length) {
      return res.status(404).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Data not found.",
        data:[]
      });
    }
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Product dispatch details get successfully!",
      data: allData,
      totalDataCount: dispatchData.length,
      totalPages: Math.ceil((dispatchData.length) / limit),
      currentPage: page,
      // data22:dispData
    });
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    })
  }
}



// get dispatched device location
const trackDeviceLocation = async (req, res) => {
  try {
    const getData1 = await dispatchActivityLogModel.find({ deviceId: req.params.deviceId });
    const getData2 = await aboutDeviceModel.find({ deviceId: req.params.deviceId });
    const finalArrData = [...getData1, ...getData2]
    if (finalArrData.length < 1) {
      return res.status(404).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Data not found with this given deviceId."
      });
    }
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Product dispatch details get successfully!",
      data: finalArrData,
    })
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    })
  }
}


const getDispatchDataById = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const data = await aboutDeviceModel.find({ "deviceId": req.params.deviceId },
      {
        "deviceId": 1,
        "batch_no": 1,
        "product_type": 1,
        "serial_no": 1,
        "purpose": 1,
        "concerned_person": 1,
        "date_of_manufacturing": 1,
        "address": 1,
        "date_of_dispatch": 1,
        "hospital_name": 1,
        "phone_number": 1,
        "sim_no": 1,
        "pincode": 1,
        "distributor_name": 1,
        "distributor_contact": 1,
        "state": 1,
        "city": 1,
        "district": 1,
        "date_of_warranty": 1,
        "document_no": 1,
      }).sort({ updatedAt: -1 }).limit(1);
    const servicesData = await servicesModel.find({ "deviceId": req.params.deviceId },
      {
        "createdAt": 0, "updatedAt": 0, "__v": 0,
      }).sort({ updatedAt: -1 });
    if (!data.length) {
      return res.status(404).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Data not found with this given deviceId."
      })
    }
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Product dispatch details get successfully!",
      data: data[0],
      servicesData: servicesData,
    });
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    })
  }
}



const activityModel = require('../model/activityModel');
const productionModel = require('../model/productionModel');
const registeredHospitalModel = require('../model/registeredHospitalModel');
const dispatchActivityLogModel = require('../model/dispatchActivityLogModel');
const returnDeviceModel = require('../model/returnDeviceModel');
const markAsShippedModel = require('../model/markAsShippedModel');
const accountsHistoryModel = require('../model/accountHistoryModel');
const accountsModel = require('../model/accountModel');
const s3BucketModel = require('../model/s3BucketModel');
const s3BucketInsModel = require('../model/s3BucketInstallationModel');
const s3BucketProdModel = require('../model/s3BucketProductionModel');
const s3shippingBucketModel = require('../model/s3bucketShippingModel');
const s3ewayBillBucketModel = require('../model/s3ewayBillBucketModel');
const s3invoiceBucketModel = require('../model/s3invoiceBucketModel');
const s3PatientFileModel = require('../model/s3PatientFileModel');
const s3poBucketModel = require('../model/s3BucketPoPdfModel');
const s3ReturnPoBucketModel = require('../model/s3BucketReturnPoPdfModel');
const statusModelV2 = require('../model/statusModelV2');
const fcmTokenModel = require('../model/fcmTockenModel');
const { messaging } = require('firebase-admin');
const { eventNames } = require('../model/event_ventilator_collection');
const event_ventilator_collection = require('../model/event_ventilator_collection');
const trends_ventilator_collection = require('../model/trends_ventilator_collection');
const { registerDevice } = require('./RegisterDevice');

// const jwtr = require("jwtr-redis").default;
// const jwtr = new jwtrR(redisClient);
// const jwtr = require('jsonwebtoken')

const getAboutByDeviceId = async (req, res) => {
  try {
    const { deviceId, project_code } = req.params;
    if (!deviceId) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "Validation error",
        message: "Device Id is required!"
      })
    }
    const data = await aboutDeviceModel.find({ deviceId: deviceId }, { "createdAt": 0, "updatedAt": 0, "__v": 0 }).sort({ createdAt: -1 }).limit(1);
    if (!data.length) {
      return res.status(404).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Data not found with this given deviceId."
      })
    }
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Product dispatch details get successfully!",
      data: data
    });
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    })
  }
}


const sendAndReceiveData = async (req, res) => {
  try {
    const { deviceId } = req.params;
    if (!deviceId) {
      return res.status(404).json({
        statusCode: 404,
        statusValue: "FAIL",
        message: "DeviceId is required."
      })
    }
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Data get successfully.",
      data: deviceId
    })
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    })
  }
}


// Assigned device to user
const assignedDeviceToUser = async (req, res) => {
  try {
    const schema = Joi.object({
      deviceId: Joi.string().required(),
      _id: Joi.array(),
    })
    let result = schema.validate(req.body);
    if (result.error) {
      return res.status(200).json({
        status: 0,
        statusCode: 400,
        message: result.error.details[0].message,
      })
    }
    const token = req.headers["authorization"].split(' ')[1];
    const verified = await jwtr.verify(token, process.env.JWT_SECRET);

    // console.log('resp2',verified.user)

    const findDevice = await RegisterDevice.findOne({ DeviceId: req.body.deviceId });
    // console.log(findDevice)
    if (!findDevice) {
      return res.status(404).json({
        statusCode: 404,
        statusValue: "FAIL",
        message: `Device not registered with this deviceId : ${req.body.deviceId}`
      });
    }

    // for logger user activity
    const loggedInUser = await User.findById({ _id: verified.user });
    const userIds = req.body._id;
    // console.log(userIds)
    let arrData = [];
    userIds.map(async (item) => {
      var obj = {
        "userId":item,
        "deviceId": req.body.deviceId,
      }
      arrData.push(obj);
    })
    // console.log(arrData)
    // const saveDoc = await assignDeviceTouserModel.insertMany(arrData);
    arrData.map(async (ob) => {
      await assignDeviceTouserModel.findOneAndUpdate(
        { userId: ob.userId, deviceId: ob.deviceId },
        {
          userId: ob.userId,
          deviceId: ob.deviceId,
          assignedBy: loggedInUser.email,
          status: true
        },
        { upsert: true },
      )
    })
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Device assigned successfully.",

    });
    // console.log(userInfo);
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    })
  }
}

const assignedDeviceToUser2 = async (req, res) => {
  try {

    const token = req.headers["authorization"].split(' ')[1];
    const verified = await jwtr.verify(token, process.env.jwtr_SECRET);

    // console.log('resp2',verified.user)

    const findDevice = await RegisterDevice.find({ DeviceId: { $in: req.body.DeviceId } })
      .select({ __v: 0, _id: 0, createdAt: 0, updatedAt: 0 });
    if (findDevice.length === 0) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: `Device not registered with this deviceId : ${req.body.DeviceId}`
      });
    }
    // const checkIsAssigned = await RegisterDevice.find({DeviceId: { $in: req.body.DeviceId }, isAssigned:true});
    // if (checkIsAssigned.length>0) {
    //   return res.status(400).json({
    //     statusCode: 400,
    //     statusValue: "FAIL",
    //     message: "Device already assigned.",
    //   })
    // }
    const updateDoc = await assignDeviceTouserModel.findOneAndUpdate({
      userId:req.body._id,
    }, {
      $push: {
        Assigned_Devices: findDevice
      }
    }, { upsert: true, new: true });

    let deviceIds = req.body.DeviceId
    deviceIds.map(async (items) => {
      await RegisterDevice.findOneAndUpdate({ DeviceId: items }, { isAssigned: true });
    })
    // for logger user activity
    const loggedInUser = await User.findById({ _id: verified.user });
    const normalUser = await User.findById({ _id: req.body._id });
    // console.log(userInfo);
    await saveActivity(verified.user, 'Device assigned successfully!', `${loggedInUser.email} has assigned new device to ${normalUser.email}`);

    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Device assigned successfully.",
      data: updateDoc
    });

  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    })
  }
}



async function saveActivity(userId, action, msg) {
  const userInfo = await User.findOne({ _id: userId });
  const data = await activityModel.create({ userId: userId, email: userInfo.email, action: action, msg: msg });
  data.save();
}

const getAssignedDeviceById1 = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "Validation error",
        message: "User Id is required!"
      })
    }
    const data = await assignDeviceTouserModel.find({ userId:userId})
      .select({ _id: 0, __v: 0, updatedAt: 0 })
      .sort({ createdAt: -1 });

    if (!data.length) {
      return res.status(404).json({
        statusCode: 404,
        statusValue: "FAIL",
        message: "Data not found.",
        data: {}
      })
    }
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "assigned device get successfully!",
      data: data
    })
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    })
  }
}


const getAssignedDeviceById = async (req, res) => {
  try {
    const userId = req.params.userId;
    const token = req.headers["authorization"].split(' ')[1];
    const verified = await jwtr.verify(token, process.env.JWT_SECRET);
    const loggedInUser = await User.findById({ _id: verified.user }, { firstName: 1, lastName: 1, email: 1, hospitalName: 1, designation: 1, speciality: 1 });
    var pipline = [
      // Match
      {
        "$match": { status: true, userId:userId },
      },
      {
        "$lookup": {
          "from": "users",
          "localField": "userId",
          "foreignField": "_id",
          "as": "users",
        },
      },
      {
        "$lookup": {
          "from": "registerdevices",
          "localField": "deviceId",
          "foreignField": "DeviceId",
          "as": "deviceDetails",
        },
      },
      // filter data
      // For this data model, will always be 1 record in right-side
      // of join, so take 1st joined array element
      {
        "$set": {
          "users": { "$first": "$users" },
          "deviceDetails": { "$first": "$deviceDetails" },
        }
      },
      // Extract the joined embeded fields into top level fields
      {
        "$set": {
          "Hospital_Name": "$deviceDetails.Hospital_Name",
          "DetiveType": "$deviceDetails.DeviceType",
          "Department_Name": "$deviceDetails.Department_Name",
          "IMEI_NO": "$deviceDetails.IMEI_NO",
          "Ward_No": "$deviceDetails.Ward_No",
          "Bio_Med": "$deviceDetails.Bio_Med",
          "Alias_Name": "$deviceDetails.Alias_Name",
          "DeviceType": "$deviceDetails.DeviceType",
        },
      },
      {
        "$unset": [
          "users",
          "__v",
          "createdAt",
          "updatedAt",
          "otp",
          "deviceDetails",
          "status",
          "assignedBy"
        ]
      },
      {
        "$sort": { "updatedAt": -1 }
      },
    ]
    const assignData = await assignDeviceTouserModel.aggregate(pipline)
    // console.log(assignData)
    if (!assignData.length) {
      return res.status(404).json({
        statusCode: 404,
        statusValue: "FAIL",
        message: "Data not found.",
        data: []
      })
    }
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "assigned device get successfully!",
      data: assignData,
      data2: loggedInUser
    })
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    })
  }
}


const getDeviceAccessUsersByDeviceId = async (req, res) => {
  try {
    const { deviceId } = req.params;
    if (!deviceId) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "Validation error",
        message: "DeviceId Id is required!"
      })
    }

    var pipline = [
      // Match
      {
        "$match": { status: true, deviceId: req.params.deviceId },
      },
      {
        "$lookup": {
          "from": "users",
          "localField": "userId",
          "foreignField": "_id",
          "as": "users",
        },
      },
      {
        "$project": { "deviceId": 1, "assignedBy": 1, "users.firstName": 1, "users.lastName": 1, "users.hospitalName": 1, "users.contactNumber": 1, "users.department": 1 },
      },
      {
        "$sort": { "updatedAt": -1 }
      },
    ]
    const assignData = await assignDeviceTouserModel.aggregate(pipline)
    // console.log(assignData)
    if (!assignData.length) {
      return res.status(404).json({
        statusCode: 404,
        statusValue: "FAIL",
        message: "Data not found.",
        data: []
      })
    }
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "assigned device get successfully!",
      data: assignData
    })
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    })
  }
}


const getDeviceAccessAstList = async (req, res) => {
  try {
    const token = req.headers["authorization"].split(' ')[1];
    const verified = await jwtr.verify(token, process.env.JWT_SECRET);
    const loggedInUser = await User.findById({ _id: verified.user });
    // console.log(11,loggedInUser)
    var pipline = [
      // Match
      {
        "$match": { $and:[{userId:loggedInUser._id},{assistantId:{$ne:""}}] },
      },
      {
        "$lookup": {
          "from": "registerdevices",
          "localField": "deviceId",
          "foreignField": "DeviceId",
          "as": "deviceDetails",
        },
      },
      {
        "$lookup": {
          "from": "users",
          "localField": "assistantId",
          "foreignField": "_id",
          "as": "userDetails",
        },
      },
      {
        "$unset": [
          // "users",
          "__v",
          "createdAt",
          "updatedAt",
          "otp",
          // "deviceDetails",
          "status",
          "assignedBy"
        ]
      },
      {
        "$sort": { "updatedAt": -1 }
      },
    ]
    let assignData = await assignDeviceTouserModel.aggregate(pipline)
    // const getUserdetails = await User.find
    // console.log(assignData)
    if (!assignData.length) {
      return res.status(404).json({
        statusCode: 404,
        statusValue: "FAIL",
        message: "Data not found.",
        data: []
      })
    }
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "assigned device get successfully!",
      data: assignData
    })
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    })
  }
}



const getDeviceAccessDoctList = async (req, res) => {
  try {
    const token = req.headers["authorization"].split(' ')[1];
    const verified = await jwtr.verify(token, process.env.JWT_SECRET);
    const loggedInUser = await User.findById({ _id: verified.user });
    // console.log(11,loggedInUser)
    var pipline = [
      // Match
      {
        "$match": { hospitalName:loggedInUser.hospitalName },
      },
      {
        "$lookup": {
          "from": "registerdevices",
          "localField": "deviceId",
          "foreignField": "DeviceId",
          "as": "deviceDetails",
        },
      },
      {
        "$lookup": {
          "from": "users",
          "localField": "assistantId",
          "foreignField": "_id",
          "as": "doctorDetails",
        },
      },
      {
        "$unset": [
          // "users",
          "__v",
          "createdAt",
          "updatedAt",
          "otp",
          // "deviceDetails",
          "status",
          "assistantId"
        ]
      },
      {
        "$sort": { "updatedAt": -1 }
      },
    ]
    let assignData = await assignDeviceTouserModel.aggregate(pipline)
    // console.log(assignData)
    if (!assignData.length) {
      return res.status(404).json({
        statusCode: 404,
        statusValue: "FAIL",
        message: "Data not found.",
        data: []
      })
    }
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Get device access doctor list successfully!",
      data: assignData
    })
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    })
  }
}



const getDeviceAccessUsers = async (req, res) => {
  try {
    const token = req.headers["authorization"].split(' ')[1];
    const verified = await jwtr.verify(token, process.env.jwtr_SECRET);
    const loggedInUser = await User.findById({ _id: verified.user });

    var pipline = [
      // Match
      {
        "$match": { status: true },
      },
      {
        "$lookup": {
          "from": "users",
          "localField": "userId",
          "foreignField": "_id",
          "as": "users",
        },
      },
      {
        "$lookup": {
          "from": "registerdevices",
          "localField": "deviceId",
          "foreignField": "DeviceId",
          "as": "deviceDetails",
        },
      },
      // filter data
      {
        "$match": { "deviceDetails.Hospital_Name": loggedInUser.hospitalName },
      },
      // For this data model, will always be 1 record in right-side
      // of join, so take 1st joined array element
      {
        "$set": {
          "users": { "$first": "$users" },
          "deviceDetails": { "$first": "$deviceDetails" },
        }
      },
      // Extract the joined embeded fields into top level fields
      {
        "$set": { "firstName": "$users.firstName", "lastName": "$users.lastName", "speciality": "$users.speciality", "contactNumber": "$users.contactNumber", "Hospital_Name": "$deviceDetails.Hospital_Name", "DeviceType": "$deviceDetails.DeviceType" },
      },
      {
        "$unset": [
          "users",
          "__v",
          "createdAt",
          "updatedAt",
          "otp",
          "deviceDetails",
          "status",
          "assignedBy"
        ]
      },
      {
        "$sort": { "updatedAt": -1 }
      },
    ]
    const assignData = await assignDeviceTouserModel.aggregate(pipline)
    // console.log(assignData)
    if (!assignData.length) {
      return res.status(404).json({
        statusCode: 404,
        statusValue: "FAIL",
        message: "Data not found.",
        data: []
      })
    }
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "assigned device get successfully!",
      data: assignData
    })
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    })
  }
}

const deleteDeviceAccessFromAst = async (req, res) => {
  try {
    // for logger activity
    // const token = req.headers["authorization"].split(' ')[1];
    // const verified = await jwtrr.verify(token, process.env.jwtr_SECRET);
    // const loggedInUser = await User.findById({_id:verified.user});
    // console.log(11, req.params._id)
    const removeDatas = await assignDeviceTouserModel.find({ _id:req.params._id })
    // console.log(11,removeDatas)
    const removeData = await assignDeviceTouserModel.findOneAndDelete(
      { _id:req.params._id }
    )
    if (!removeData) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Data not deleted.",
      })
    }
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Data deleted successfully.",
    });
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    })
  }
}


const deleteDeviceAccessFromDoctor = async (req, res) => {
  try {
    // for logger activity
    // const token = req.headers["authorization"].split(' ')[1];
    // const verified = await jwtrr.verify(token, process.env.jwtr_SECRET);
    // const loggedInUser = await User.findById({_id:verified.user});
    const removeData = await assignDeviceTouserModel.findByIdAndDelete(
      { _id:req.params._id}
    )
    if (!removeData) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Data not deleted.",
      })
    }
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Data deleted successfully.",
    });
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    })
  }
}

/**
 * get dashboard data count for admin access only
 * GET - api/logger/logs/
*/
const getAdminDashboardDataCount = async (req, res) => {
  try {
    let curDate = new Date().toJSON().slice(0, 10);

    let filterDate = new Date();
    var last7days = (filterDate.getTime() - (7 * 24 * 60 * 60 * 1000));

    filterDate.setTime(last7days);
    var expectedDateWeekly = filterDate.toJSON().slice(0, 10);

    let filterDate2 = new Date();
    var last30days = (filterDate2.getTime() - (30 * 24 * 60 * 60 * 1000));
    filterDate2.setTime(last30days);
    var expectedDateMonthly = filterDate2.toJSON().slice(0, 10);

    const totalUsers = await User.find({ "createdAt": { $gte: new Date(expectedDateMonthly), $lt: new Date(curDate) }, }).countDocuments();

    const aggregateLogic = [
      {
        $match: { "createdAt": { $gte: new Date(expectedDateWeekly), $lt: new Date(curDate) }, "accountStatus": "Active" }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]
    // use of logic
    const weeklyDataCount = await User.aggregate(aggregateLogic)
    let sortedData = weeklyDataCount.sort((a, b) => {
      return new Date(a._id) - new Date(b._id);
    })
    const totalCounts = weeklyDataCount.reduce((acc, cur) => {
      return acc + cur.count;
    }, 0);

    // for 30 days users count

    const aggregateLogic2 = [
      {
        $match: { "createdAt": { $gte: new Date(expectedDateMonthly), $lt: new Date(curDate) }, }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]
    // use of logic
    const monthlyDataCount = await User.aggregate(aggregateLogic2)
    let sortedData2 = monthlyDataCount.sort((a, b) => {
      return new Date(a._id) - new Date(b._id);
    })
    const totalMonthlyCounts = monthlyDataCount.reduce((acc, cur) => {
      return acc + cur.count;
    }, 0);

    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Data counts get successfully.",
      data: {
        totalUserCount: totalUsers ? totalUsers : 0,
        totalUserCount30Days: monthlyDataCount ? sortedData2 : 0,
        totalActiveUserIn7Days: totalCounts ? totalCounts : 0,
        totalActiveUserIn7DaysDatewise: weeklyDataCount ? weeklyDataCount : 0,
        totalNewUserInLast30Days: totalMonthlyCounts ? totalMonthlyCounts : 0,
        totalNewUserInLast30DaysDatewise: monthlyDataCount ? sortedData2 : 0,
      }
    })
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    })
  }
}

// const getAgvaProAndSuctionDataCount = async (req, res) => {
//   try {
//     const getAgvaProData = await aboutDeviceModel.find({
//       $and:[
//         {product_type:{$in:["Agva Pro","","Agva-Pro"]}},
//         {purpose:{$ne:" "}},
//       ]
//     })
//     const getAgvaProDemoData =  await aboutDeviceModel.find({
//       $and:[
//         {product_type:{$in:["Agva Pro","","Agva-Pro"]}},
//         {purpose:"Demo"}
//       ]
//     })
//     const getAgvaProSoldData =  await aboutDeviceModel.find({
//       $and:[
//         {product_type:{$in:["Agva Pro","","Agva-Pro"]}},
//         {purpose:"Sold"}
//       ]
//     })

//     // console.log(11, getAgvaProData.length)
//     // console.log(12, getAgvaProDemoData.length)
//     // console.log(13, getAgvaProSoldData.length)

//     const getSuctionData = await aboutDeviceModel.find({
//       $and:[
//         {product_type:{$in:["Suction"]}},
//         {purpose:{$ne:" "}},
//       ]
//     })
//     const getSuctionDemoData =  await aboutDeviceModel.find({
//       $and:[
//         {product_type:{$in:["Suction"]}},
//         {purpose:"Demo"}
//       ]
//     })
//     const getSuctionSoldData =  await aboutDeviceModel.find({
//       $and:[
//         {product_type:{$in:["Suction"]}},
//         {purpose:"Sold"}
//       ]
//     })
//     // console.log(21, getSuctionData.length)
//     // console.log(22, getSuctionDemoData.length)
//     // console.log(23, getSuctionSoldData.length)

//     return res.status(200).json({
//       statusCode: 200,
//       statusValue:"SUCCESS",
//       message:"Data count get successfully.",
//       agvaProData:[{
//         "totalCount":!!(getAgvaProData.length) ? getAgvaProData.length : 0,
//         "demoCount":!!(getAgvaProDemoData.length) ? getAgvaProDemoData.length : 0,
//         "soldCount":!!(getAgvaProSoldData.length) ? getAgvaProSoldData.length : 0,
//       }],
//       suctionData:[{
//         "totalCount":!!(getSuctionData.length) ? getSuctionData.length : 0,
//         "demoCount":!!(getSuctionDemoData.length) ? getSuctionDemoData.length : 0,
//         "soldCount":!!(getSuctionSoldData.length) ? getSuctionSoldData.length : 0,
//       }]
//     })
//   } catch (err) {
//     res.status(500).json({
//       statusCode: 500,
//       statusValue: "FAIL",
//       message: "Internal server error",
//       data: {
//         generatedTime: new Date(),
//         errMsg: err.stack,
//       }
//     })
//   }
// }
const getAgvaProAndSuctionDataCount = async (req, res) => {
  try {
         
    const agvaProData = await aboutDeviceModel.aggregate([
      {
        $match: {
          product_type: { $in: ["Agva Pro", "", "Agva-Pro"] },
          purpose: { $ne: "" },
          deviceId: { $ne: "" }
        }
      },
      {
        $group: {
          _id: null,
          totalCount: { $sum: 1 },
          demoCount: { $sum: { $cond: { if: { $eq: ["$purpose", "Demo"] }, then: 1, else: 0 } } },
          soldCount: { $sum: { $cond: { if: { $eq: ["$purpose", "Sold"] }, then: 1, else: 0 } } }
        }
      },
      {
        $project:{
          "_id":0
        }
      }
    ]);

    const suctionData = await aboutDeviceModel.aggregate([
      {
        $match: {
          product_type: "Suction",
          purpose: { $ne: "" }
        }
      },
      {
        $group: {
          _id: null,
          totalCount: { $sum: 1 },
          demoCount: { $sum: { $cond: { if: { $eq: ["$purpose", "Demo"] }, then: 1, else: 0 } } },
          soldCount: { $sum: { $cond: { if: { $eq: ["$purpose", "Sold"] }, then: 1, else: 0 } } }
        }
      },
      {
        $project:{
          "_id":0
        }
      }
    ]);

    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Data count retrieved successfully.",
      agvaProData: agvaProData.length > 0 ? agvaProData : [{ totalCount: 0, demoCount: 0, soldCount: 0 }],
      suctionData: suctionData.length > 0 ? suctionData : [{ totalCount: 0, demoCount: 0, soldCount: 0 }],
      // ndata:getAgvaProData1
    });
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    });
  }
};

const getWMYDataCountForAgvaPro = async (req, res) => {
  try {
    const filter = req.params.filter;
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const productionData = await productionModel.find({$and:[{deviceId:{$ne:""}},{productType:{$ne:"Suction"}}]},{_id:1,deviceId:1,createdAt:1,updatedAt:1,deviceType:1,purpose:1})
    
    const statusData = await statusModel.find({deviceId:{$ne:""}})
    // Step 1: Extract deviceIds from statusData
    const statusDeviceIds = new Set(statusData.map(status => status.deviceId));
    const filteredProductionData = productionData.filter(production => statusDeviceIds.has(production.deviceId));
    // console.log(11, filteredProductionData)


    if (req.params.filter == "yearly") {
        // Step 2: Filter productionData to include only entries with deviceId in statusDeviceIds

      // Step 3: Filter data to include only the last 10 years
      const tenYearsAgo = new Date();
      tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);

      const recentProductionData = filteredProductionData.filter(production => production.createdAt >= tenYearsAgo);

      // Step 4: Group the matched entries by year
      const groupedByYear = recentProductionData.reduce((acc, production) => {
        const duration = production.createdAt.getFullYear();
        if (!acc[duration]) {
          acc[duration] = [];
        }
        acc[duration].push(production);
        return acc;
      }, {});

      // Step 5: Count the entries per year
      const dataCountByYear = Object.keys(groupedByYear).map(duration => ({
        duration,
        count: groupedByYear[duration].length
      }));



      return res.status(200).json({
        statusCode: 200,
        statusValue: "SUCCESS",
        message: "Data count retrieved successfully.",
        totalDevicesCountYearly:dataCountByYear,
        maxCount:dataCountByYear[1].count
      });
    } else if (req.params.filter == "monthly") {
      // data2
      
      // Step 3: Filter data to include only the last 12 months
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 6);

      const recentProductionData2 = filteredProductionData.filter(production => production.createdAt >= twelveMonthsAgo);

      // Step 4: Group the matched entries by month
      const groupedByMonth = recentProductionData2.reduce((acc, production) => {
        const duration = `${production.createdAt.getFullYear()}-${('0' + (production.createdAt.getMonth() + 1)).slice(-2)}`;
        if (!acc[duration]) {
          acc[duration] = [];
        }
        acc[duration].push(production);
        return acc;
      }, {});

      // Step 5: Count the entries per month
      const dataCountByMonth = Object.keys(groupedByMonth).map(duration => ({
        duration,
        count: groupedByMonth[duration].length
      }));

      // Step 6: Function to convert date format
      const convertDateFormat = (dataCountByMonth) => {
        return dataCountByMonth.map(item => {
          const [year, month] = item.duration.split('-');
          const monthName = monthNames[parseInt(month) - 1];

          return {
            ...item,
            duration:`${year}-${monthName}`
          }
        })
      }
      const convertedData = convertDateFormat(dataCountByMonth)
      const maxCount = convertedData.reduce((max, item) => item.count > max ? item.count : max, convertedData[0].count);

      return res.status(200).json({
        statusCode: 200,
        statusValue: "SUCCESS",
        message: "Data count retrieved successfully.",
        // totalDevicesCountYearly:convertedData,
        totalDevicesCountMonthly:[
          {
            "duration": convertedData[0].duration,
            "count": 0+convertedData[0].count
          },
          {
            "duration": convertedData[1].duration,
            "count": convertedData[0].count+convertedData[1].count
          },
          {
            "duration": convertedData[2].duration,
            "count": convertedData[0].count+convertedData[1].count+convertedData[2].count
          },
          {
            "duration": convertedData[3].duration,
            "count": convertedData[0].count+convertedData[1].count+convertedData[2].count+convertedData[3].count
          },
          {
            "duration": convertedData[4].duration,
            "count":convertedData[0].count+convertedData[1].count+convertedData[2].count+convertedData[3].count+convertedData[4].count
          },
          {
            "duration": convertedData[5].duration,
            "count": convertedData[0].count+convertedData[1].count+convertedData[2].count+convertedData[3].count+convertedData[4].count+convertedData[5].count
          },
        ], 
        maxCount:convertedData[0].count+convertedData[1].count+convertedData[2].count+convertedData[3].count+convertedData[4].count+convertedData[5].count
      });
    } else if (req.params.filter == "weekly") {
      
        const now = new Date();
        const past28Days = new Date();
        past28Days.setDate(now.getDate() - 28);

        const initialDate = new Date("2023-12-01T00:00:00Z");
        const endDate2 = past28Days
      // for testing purpose
      

      const InitialCount = await productionModel.find({
        $and:[
          {deviceId:{$ne:""}},
          {productType:{$ne:"Suction"}},
          {createdAt:{$gte:initialDate, $lte:endDate2}}
        ]
      },{_id:1,deviceId:1,createdAt:1})

      // console.log(1111,rest.length);
        const prodData = await productionModel.find({
          $and:[
            {deviceId:{$ne:""}},
            {productType:{$ne:"Suction"}},
            {createdAt:{$gte:past28Days, $lte:now}}
          ]
        })
        // Prepare week intervals
        const weeks = [
          { duration: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 28), count: 0, start: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 28), end: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 21) },
          { duration: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 21), count: 0, start: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 21), end: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14) },
          { duration: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14), count: 0, start: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14), end: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7) },
          { duration: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7), count: 0, start: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7), end: now }
        ];

        // Track the latest occurrence of each did
        const uniqueDidMap = new Map();

        prodData.forEach(event => {
          const { deviceId, createdAt } = event;
          if (!uniqueDidMap.has(deviceId) || uniqueDidMap.get(deviceId) < createdAt) {
            uniqueDidMap.set(deviceId, createdAt);
          }
        });

        // Count unique did occurrences per week
        uniqueDidMap.forEach(createdAt => {
          weeks.forEach(week => {
            if (createdAt >= week.start && createdAt <= week.end) {
              week.count++;
            }
          });
        });

        const result = weeks.map(week => ({ duration: week.duration, count: week.count }));

        // I need format this result
        const formattedResult = result.map(entry => {
          const date = new Date(entry.duration)
          const day = date.getUTCDate();
          const month = monthNames[date.getUTCMonth()]
          const formattedDuration = `${day}-${month}`
          return {
            duration:formattedDuration,
            count:entry.count,
          }
        })
        return res.status(200).json({
          statusCode: 200,
          statusValue: "SUCCESS",
          message: "Most recent events by device ID retrieved successfully.",
          totalDevicesCountWeekly:[
            {
                "duration": formattedResult[0].duration,
                "count": 0+InitialCount.length
            },
            {
                "duration": formattedResult[1].duration,
                "count": InitialCount.length+formattedResult[1].count
            },
            {
                "duration": formattedResult[2].duration,
                "count": InitialCount.length+formattedResult[1].count+formattedResult[2].count
            },
            {
                "duration": formattedResult[3].duration,
                "count": InitialCount.length+formattedResult[1].count+formattedResult[2].count+formattedResult[3].count
            }
          ],
          maxCount:InitialCount.length+formattedResult[1].count+formattedResult[2].count+formattedResult[3].count
        });
    } else if (req.params.filter == "today") {
      // Define Inital date time
      const initialDate = new Date("2023-12-01T00:00:00Z");
      const endDate2 = new Date();
      endDate2.setDate(endDate2.getDate() - 1);

      const productionData = await productionModel.find({
        $and:[
          {deviceId:{$ne:""}},{productType:{$ne:"Suction"}},
          {createdAt:{$gte:initialDate, $lte:endDate2}}
        ]},
        {_id:1,deviceId:1,createdAt:1,updatedAt:1,deviceType:1,purpose:1})
      // Extract deviceIds from statusData
      const statusDeviceIds = new Set(statusData.map(status => status.deviceId));
      // console.log(12,statusDeviceIds)
      // Filter productionData to include only entries with deviceId in statusDeviceIds
      const filteredProductionData = productionData.filter(production => statusDeviceIds.has(production.deviceId));

      const initialCount = filteredProductionData.length;
      
      // console.log(111,filteredProductionData.length)
      const moment = require('moment-timezone');
      // Get the current date and time in the Asia/Kolkata time zone
      const currentDateInKolkata = moment.tz("Asia/Kolkata");
      const currentDate = currentDateInKolkata.toDate();

      // Subtract hours to get different time intervals
      const timeIntervals = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24].map(hours => ({
        duration: moment.tz("Asia/Kolkata").subtract(hours, 'hours').format('HH:mm'),
        date: moment(currentDateInKolkata).subtract(hours, 'hours').toDate()
      }));

      // Filter data and count occurrences for each interval
      const tdCount = timeIntervals.map(({ duration, date }) => ({
        duration,
        count: filteredProductionData.filter(item => new Date(item.updatedAt) >= date && new Date(item.updatedAt) <= currentDate).length
      }));

      return res.status(200).json({
        statusCode: 200,
        statusValue: "SUCCESS",
        message: "Most recent events by device ID retrieved successfully.",
        todayActiveDeviceCount:[
          {
              "duration": tdCount[0].duration,
              "count": initialCount+tdCount[0].count
          },
          {
              "duration": tdCount[1].duration,
              "count": initialCount+tdCount[0].count+tdCount[1].count
          },
          {
              "duration": tdCount[2].duration,
              "count": initialCount+tdCount[0].count+tdCount[1].count+tdCount[2].count
          },
          {
              "duration": tdCount[3].duration,
              "count": initialCount+tdCount[0].count+tdCount[1].count+tdCount[2].count+tdCount[3].count
          },
          {
              "duration": tdCount[4].duration,
              "count": initialCount+tdCount[0].count+tdCount[1].count+tdCount[2].count+tdCount[3].count+tdCount[4].count
          },
          {
              "duration": tdCount[5].duration,
              "count": initialCount+tdCount[0].count+tdCount[1].count+tdCount[2].count+tdCount[3].count+tdCount[4].count
              +tdCount[5].count
          },
          {
              "duration": tdCount[6].duration,
              "count": initialCount+tdCount[0].count+tdCount[1].count+tdCount[2].count+tdCount[3].count+tdCount[4].count
              +tdCount[5].count+tdCount[6].count
          },
          {
              "duration": tdCount[7].duration,
              "count":  initialCount+tdCount[0].count+tdCount[1].count+tdCount[2].count+tdCount[3].count+tdCount[4].count
              +tdCount[5].count+tdCount[6].count+tdCount[7].count
          },
          {
              "duration": tdCount[8].duration,
              "count":  initialCount+tdCount[0].count+tdCount[1].count+tdCount[2].count+tdCount[3].count+tdCount[4].count
              +tdCount[5].count+tdCount[6].count+tdCount[7].count+tdCount[8].count
          },
          {
              "duration": tdCount[9].duration,
              "count":  initialCount+tdCount[0].count+tdCount[1].count+tdCount[2].count+tdCount[3].count+tdCount[4].count
              +tdCount[5].count+tdCount[6].count+tdCount[7].count+tdCount[8].count+tdCount[9].count
          },
          {
              "duration": tdCount[10].duration,
              "count":  initialCount+tdCount[0].count+tdCount[1].count+tdCount[2].count+tdCount[3].count+tdCount[4].count
              +tdCount[5].count+tdCount[6].count+tdCount[7].count+tdCount[8].count+tdCount[9].count+tdCount[10].count
          },
          {
              "duration": tdCount[11].duration,
              "count":  initialCount+tdCount[0].count+tdCount[1].count+tdCount[2].count+tdCount[3].count+tdCount[4].count
              +tdCount[5].count+tdCount[6].count+tdCount[7].count+tdCount[8].count+tdCount[9].count+tdCount[10].count+tdCount[11].count
          }
      ],
      maxCount:initialCount+tdCount[0].count+tdCount[1].count+tdCount[2].count+tdCount[3].count+tdCount[4].count
      +tdCount[5].count+tdCount[6].count+tdCount[7].count+tdCount[8].count+tdCount[9].count+tdCount[10].count+tdCount[11].count
      })
  
    }
    return res.status(400).json({
      statusCode: 400,
      statusValue: "FAIL",
      message: "filter value is required.",
      // data:filteredProductionData
    });
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    });
  }
}

const getWMYDemoDataCountForAgvaPro = async (req, res) => {
  try {
    // dataCountByWeekLast4Weeks = [{"duration": "May-W2","count": 4},{"duration": "May-W4","count": 4}]
    const filter = req.params.filter;
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun","Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const productionData = await productionModel.find({$and:[{deviceId:{$ne:""}},{productType:{$ne:"Suction"}},{purpose:"Demo"}]})
    
    const statusData = await statusModel.find({deviceId:{$ne:""}})
    // Step 1: Extract deviceIds from statusData
    const statusDeviceIds = new Set(statusData.map(status => status.deviceId));
    const filteredProductionData = productionData.filter(production => statusDeviceIds.has(production.deviceId));
    
   
    // for today data count
    // Step 3: Filter data to include only the last 10 years
    let dataCountByYear;
      const tenYearsAgo = new Date();
      tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);

      const recentProductionData = filteredProductionData.filter(production => production.createdAt >= tenYearsAgo);

      // Step 4: Group the matched entries by year
      const groupedByYear = recentProductionData.reduce((acc, production) => {
        const duration = production.createdAt.getFullYear();
        if (!acc[duration]) {
          acc[duration] = [];
        }
        acc[duration].push(production);
        return acc;
      }, {});

      // Step 5: Count the entries per year
      dataCountByYear = Object.keys(groupedByYear).map(duration => ({
        duration,
        count: groupedByYear[duration].length
      }));

    // end today data count

    if (req.params.filter == "yearly") {
        // Step 2: Filter productionData to include only entries with deviceId in statusDeviceIds

      // Step 3: Filter data to include only the last 10 years
      const tenYearsAgo = new Date();
      tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);

      const recentProductionData = filteredProductionData.filter(production => production.createdAt >= tenYearsAgo);

      // Step 4: Group the matched entries by year
      const groupedByYear = recentProductionData.reduce((acc, production) => {
        const duration = production.createdAt.getFullYear();
        if (!acc[duration]) {
          acc[duration] = [];
        }
        acc[duration].push(production);
        return acc;
      }, {});

      // Step 5: Count the entries per year
      dataCountByYear = Object.keys(groupedByYear).map(duration => ({
        duration,
        count: groupedByYear[duration].length
      }));

      return res.status(200).json({
        statusCode: 200,
        statusValue: "SUCCESS",
        message: "Data count retrieved successfully.",
        totalDevicesCountYearly:dataCountByYear,
        maxCount:dataCountByYear[1].count
      });
    } else if (req.params.filter == "monthly") {
      // Step 3: Filter data to include only the last 12 months
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 6);

      const recentProductionData2 = filteredProductionData.filter(production => production.createdAt >= twelveMonthsAgo);

      // Step 4: Group the matched entries by month
      const groupedByMonth = recentProductionData2.reduce((acc, production) => {
        const duration = `${production.createdAt.getFullYear()}-${('0' + (production.createdAt.getMonth() + 1)).slice(-2)}`;
        if (!acc[duration]) {
          acc[duration] = [];
        }
        acc[duration].push(production);
        return acc;
      }, {});

      // Step 5: Count the entries per month
      const dataCountByMonth = Object.keys(groupedByMonth).map(duration => ({
        duration,
        count: groupedByMonth[duration].length
      }));

      // Step 6: Function to convert date format
      const convertDateFormat = (dataCountByMonth) => {
        return dataCountByMonth.map(item => {
          const [year, month] = item.duration.split('-');
          const monthName = monthNames[parseInt(month) - 1];

          return {
            ...item,
            duration:`${year}-${monthName}`
          }
        })
      }
      const convertedData = convertDateFormat(dataCountByMonth)
      const maxCount = convertedData.reduce((max, item) => item.count > max ? item.count : max, convertedData[0].count);

      return res.status(200).json({
        statusCode: 200,
        statusValue: "SUCCESS",
        message: "Data count retrieved successfully.",
        // totalDevicesCountYearly:convertedData,
        totalDevicesCountMonthly:[
          {
            "duration": convertedData[0].duration,
            "count": 0+convertedData[0].count
          },
          {
            "duration": convertedData[1].duration,
            "count": convertedData[0].count+convertedData[1].count
          },
          {
            "duration": convertedData[2].duration,
            "count": convertedData[0].count+convertedData[1].count+convertedData[2].count
          },
          {
            "duration": convertedData[3].duration,
            "count": convertedData[0].count+convertedData[1].count+convertedData[2].count+convertedData[3].count
          },
          {
            "duration": convertedData[4].duration,
            "count":convertedData[0].count+convertedData[1].count+convertedData[2].count+convertedData[3].count+convertedData[4].count
          },
          {
            "duration": convertedData[5].duration,
            "count": convertedData[0].count+convertedData[1].count+convertedData[2].count+convertedData[3].count+convertedData[4].count+convertedData[5].count
          },
        ], 
        maxCount:convertedData[0].count+convertedData[1].count+convertedData[2].count+convertedData[3].count+convertedData[4].count+convertedData[5].count
      });
    } else if (req.params.filter == "weekly") {

      const now = new Date();
        const past28Days = new Date();
        past28Days.setDate(now.getDate() - 28);

        const initialDate = new Date("2023-12-01T00:00:00Z");
        const endDate2 = past28Days
      // for testing purpose
      

      const InitialCount = await productionModel.find({
        $and:[
          {deviceId:{$ne:""}},
          {productType:{$ne:"Suction"}},
          {purpose:"Demo"},
          {createdAt:{$gte:initialDate, $lte:endDate2}}
        ]
      },{_id:1,deviceId:1,createdAt:1})

      // console.log(1111,rest.length);
        const prodData = await productionModel.find({
          $and:[
            {deviceId:{$ne:""}},
            {productType:{$ne:"Suction"}},
            {purpose:"Demo"},
            {createdAt:{$gte:past28Days, $lte:now}}
          ]
        })
        // Prepare week intervals
        const weeks = [
          { duration: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 28), count: 0, start: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 28), end: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 21) },
          { duration: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 21), count: 0, start: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 21), end: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14) },
          { duration: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14), count: 0, start: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14), end: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7) },
          { duration: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7), count: 0, start: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7), end: now }
        ];

        // Track the latest occurrence of each did
        const uniqueDidMap = new Map();

        prodData.forEach(event => {
          const { deviceId, createdAt } = event;
          if (!uniqueDidMap.has(deviceId) || uniqueDidMap.get(deviceId) < createdAt) {
            uniqueDidMap.set(deviceId, createdAt);
          }
        });

        // Count unique did occurrences per week
        uniqueDidMap.forEach(createdAt => {
          weeks.forEach(week => {
            if (createdAt >= week.start && createdAt <= week.end) {
              week.count++;
            }
          });
        });

        const result = weeks.map(week => ({ duration: week.duration, count: week.count }));

        // I need format this result
        const formattedResult = result.map(entry => {
          const date = new Date(entry.duration)
          const day = date.getUTCDate();
          const month = monthNames[date.getUTCMonth()]
          const formattedDuration = `${day}-${month}`
          return {
            duration:formattedDuration,
            count:entry.count,
          }
        })
        return res.status(200).json({
          statusCode: 200,
          statusValue: "SUCCESS",
          message: "Most recent events by device ID retrieved successfully.",
          weeklyDataCount:[
            {
                "duration": formattedResult[0].duration,
                "count": 0+InitialCount.length
            },
            {
                "duration": formattedResult[1].duration,
                "count": InitialCount.length+formattedResult[1].count
            },
            {
                "duration": formattedResult[2].duration,
                "count": InitialCount.length+formattedResult[1].count+formattedResult[2].count
            },
            {
                "duration": formattedResult[3].duration,
                "count": InitialCount.length+formattedResult[1].count+formattedResult[2].count+formattedResult[3].count
            }
          ],
          maxCount:InitialCount.length+formattedResult[1].count+formattedResult[2].count+formattedResult[3].count
        });
      
    } else if (req.params.filter == "today") {

     // Define Inital date time
     const initialDate = new Date("2023-12-01T00:00:00Z");
     const endDate2 = new Date();
     endDate2.setDate(endDate2.getDate() - 1);

     const productionData = await productionModel.find({
       $and:[
         {deviceId:{$ne:""}},{productType:{$ne:"Suction"}},
         {purpose:"Demo"},
         {createdAt:{$gte:initialDate, $lte:endDate2}}
       ]},
       {_id:1,deviceId:1,createdAt:1,updatedAt:1,deviceType:1,purpose:1})
     // Extract deviceIds from statusData
     const statusDeviceIds = new Set(statusData.map(status => status.deviceId));
     // console.log(12,statusDeviceIds)
     // Filter productionData to include only entries with deviceId in statusDeviceIds
     const filteredProductionData = productionData.filter(production => statusDeviceIds.has(production.deviceId));

     const initialCount = filteredProductionData.length;
     
     // console.log(111,filteredProductionData.length)
     const moment = require('moment-timezone');
     // Get the current date and time in the Asia/Kolkata time zone
     const currentDateInKolkata = moment.tz("Asia/Kolkata");
     const currentDate = currentDateInKolkata.toDate();

     // Subtract hours to get different time intervals
     const timeIntervals = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24].map(hours => ({
       duration: moment.tz("Asia/Kolkata").subtract(hours, 'hours').format('HH:mm'),
       date: moment(currentDateInKolkata).subtract(hours, 'hours').toDate()
     }));

     // Filter data and count occurrences for each interval
     const tdCount = timeIntervals.map(({ duration, date }) => ({
       duration,
       count: filteredProductionData.filter(item => new Date(item.updatedAt) >= date && new Date(item.updatedAt) <= currentDate).length
     }));

     return res.status(200).json({
       statusCode: 200,
       statusValue: "SUCCESS",
       message: "Most recent events by device ID retrieved successfully.",
       todayActiveDeviceCount:[
         {
             "duration": tdCount[0].duration,
             "count": initialCount+tdCount[0].count
         },
         {
             "duration": tdCount[1].duration,
             "count": initialCount+tdCount[0].count+tdCount[1].count
         },
         {
             "duration": tdCount[2].duration,
             "count": initialCount+tdCount[0].count+tdCount[1].count+tdCount[2].count
         },
         {
             "duration": tdCount[3].duration,
             "count": initialCount+tdCount[0].count+tdCount[1].count+tdCount[2].count+tdCount[3].count
         },
         {
             "duration": tdCount[4].duration,
             "count": initialCount+tdCount[0].count+tdCount[1].count+tdCount[2].count+tdCount[3].count+tdCount[4].count
         },
         {
             "duration": tdCount[5].duration,
             "count": initialCount+tdCount[0].count+tdCount[1].count+tdCount[2].count+tdCount[3].count+tdCount[4].count
             +tdCount[5].count
         },
         {
             "duration": tdCount[6].duration,
             "count": initialCount+tdCount[0].count+tdCount[1].count+tdCount[2].count+tdCount[3].count+tdCount[4].count
             +tdCount[5].count+tdCount[6].count
         },
         {
             "duration": tdCount[7].duration,
             "count":  initialCount+tdCount[0].count+tdCount[1].count+tdCount[2].count+tdCount[3].count+tdCount[4].count
             +tdCount[5].count+tdCount[6].count+tdCount[7].count
         },
         {
             "duration": tdCount[8].duration,
             "count":  initialCount+tdCount[0].count+tdCount[1].count+tdCount[2].count+tdCount[3].count+tdCount[4].count
             +tdCount[5].count+tdCount[6].count+tdCount[7].count+tdCount[8].count
         },
         {
             "duration": tdCount[9].duration,
             "count":  initialCount+tdCount[0].count+tdCount[1].count+tdCount[2].count+tdCount[3].count+tdCount[4].count
             +tdCount[5].count+tdCount[6].count+tdCount[7].count+tdCount[8].count+tdCount[9].count
         },
         {
             "duration": tdCount[10].duration,
             "count":  initialCount+tdCount[0].count+tdCount[1].count+tdCount[2].count+tdCount[3].count+tdCount[4].count
             +tdCount[5].count+tdCount[6].count+tdCount[7].count+tdCount[8].count+tdCount[9].count+tdCount[10].count
         },
         {
             "duration": tdCount[11].duration,
             "count":  initialCount+tdCount[0].count+tdCount[1].count+tdCount[2].count+tdCount[3].count+tdCount[4].count
             +tdCount[5].count+tdCount[6].count+tdCount[7].count+tdCount[8].count+tdCount[9].count+tdCount[10].count+tdCount[11].count
         }
     ],
     maxCount:initialCount+tdCount[0].count+tdCount[1].count+tdCount[2].count+tdCount[3].count+tdCount[4].count
     +tdCount[5].count+tdCount[6].count+tdCount[7].count+tdCount[8].count+tdCount[9].count+tdCount[10].count+tdCount[11].count
     })
    }
    //   // Extract deviceIds from statusData
    //   const statusDeviceIds = new Set(statusData.map(status => status.deviceId));
    //   // console.log(12,statusDeviceIds)
    //   // Filter productionData to include only entries with deviceId in statusDeviceIds
    //   const filteredProductionData = productionData.filter(production => statusDeviceIds.has(production.deviceId));
    //   const moment = require('moment-timezone');
    //   // Get the current date and time in the Asia/Kolkata time zone
    //   const currentDateInKolkata = moment.tz("Asia/Kolkata");
    //   const currentDate = currentDateInKolkata.toDate();

    //   // Subtract hours to get different time intervals
    //   const timeIntervals = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24].map(hours => ({
    //     duration: moment.tz("Asia/Kolkata").subtract(hours, 'hours').format('HH:mm'),
    //     date: moment(currentDateInKolkata).subtract(hours, 'hours').toDate()
    //   }));

    //   // Filter data and count occurrences for each interval
    //   const todayActiveDeviceCount = timeIntervals.map(({ duration, date }) => ({
    //     duration,
    //     count: filteredProductionData.filter(item => new Date(item.updatedAt) >= date && new Date(item.updatedAt) <= currentDate).length
    //   }));

    //   return res.status(200).json({
    //     statusCode: 200,
    //     statusValue: "SUCCESS",
    //     message: "Most recent events by device ID retrieved successfully.",
    //     todayActiveDeviceCount
    //   })
    // }
    // return res.status(400).json({
    //   statusCode: 400,
    //   statusValue: "FAIL",
    //   message: "filter value is required.",
    // });
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    });
  }
}


const getActiveDevicesCountForAgvaPro = async (req, res) => {
  try {

      const filter = req.params.filter;
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      // console.log(dataCountArray);
      if (filter == "today") {
        ///////// end total previous data count

        // Today data count hourly basis
        const moment = require('moment-timezone');
        // Get the current date and time in the Asia/Kolkata time zone
        const currentDate = moment.tz("Asia/Kolkata").format('YYYY-MM-DD HH:mm:ss');
        const currentDateInKolkata = moment.tz("Asia/Kolkata");
        const twoHourBefore = moment(currentDateInKolkata).subtract(2, 'hours').toDate();
        // const oneHourBeforee = moment.tz("Asia/Kolkata").subtract(1, 'hours').format('HH:mm');
        // console.log(13,oneHourBeforee)
        const fourHourBefore = moment(currentDateInKolkata).subtract(4, 'hours').toDate();  
        const sixHourBefore = moment(currentDateInKolkata).subtract(6, 'hours').toDate(); 
        const eightHourBefore = moment(currentDateInKolkata).subtract(8, 'hours').toDate(); 
        const tenHourBefore = moment(currentDateInKolkata).subtract(10, 'hours').toDate();    
        const twelHourBefore = moment(currentDateInKolkata).subtract(12, 'hours').toDate();
        const forteenHourBefore = moment(currentDateInKolkata).subtract(14, 'hours').toDate();
        const sixteenHourBefore = moment(currentDateInKolkata).subtract(16, 'hours').toDate();
        const eighteenHourBefore = moment(currentDateInKolkata).subtract(18, 'hours').toDate();
        const twentyHourBefore = moment(currentDateInKolkata).subtract(20, 'hours').toDate();
        const twentytwoHourBefore = moment(currentDateInKolkata).subtract(22, 'hours').toDate();
        const twentyFourHourBefore = moment(currentDateInKolkata).subtract(24, 'hours').toDate();
  
        // Define the aggregate pipeline

        
        const pipeline = [
          // {},
          {
            $facet: {
              eventsForLast2Hr: [
                { $match: { updatedAt: { $gte: twoHourBefore, $lte: currentDateInKolkata.toDate() } } },
                { $group: { _id: "$did", latestEvent: { $last: "$$ROOT" } } },
                { $replaceRoot: { newRoot: "$latestEvent" } }
              ],
              eventsForLast4Hr: [
                { $match: { updatedAt: { $gte: fourHourBefore, $lte: currentDateInKolkata.toDate() } } },
                { $group: { _id: "$did", latestEvent: { $last: "$$ROOT" } } },
                { $replaceRoot: { newRoot: "$latestEvent" } }
              ],
              eventsForLast6Hr: [
                { $match: { updatedAt: { $gte: sixHourBefore, $lte: currentDateInKolkata.toDate() } } },
                { $group: { _id: "$did", latestEvent: { $last: "$$ROOT" } } },
                { $replaceRoot: { newRoot: "$latestEvent" } }
              ],
              eventsForLast8Hr: [
                { $match: { updatedAt: { $gte: eightHourBefore, $lte: currentDateInKolkata.toDate() } } },
                { $group: { _id: "$did", latestEvent: { $last: "$$ROOT" } } },
                { $replaceRoot: { newRoot: "$latestEvent" } }
              ],
              eventsForLast10Hr: [
                { $match: { updatedAt: { $gte: tenHourBefore, $lte: currentDateInKolkata.toDate() } } },
                { $group: { _id: "$did", latestEvent: { $last: "$$ROOT" } } },
                { $replaceRoot: { newRoot: "$latestEvent" } }
              ],
              eventsForLast12Hr: [
                { $match: { updatedAt: { $gte: twelHourBefore, $lte: currentDateInKolkata.toDate() } } },
                { $group: { _id: "$did", latestEvent: { $last: "$$ROOT" } } },
                { $replaceRoot: { newRoot: "$latestEvent" } }
              ],
              eventsForLast14Hr: [
                { $match: { updatedAt: { $gte: forteenHourBefore, $lte: currentDateInKolkata.toDate() } } },
                { $group: { _id: "$did", latestEvent: { $last: "$$ROOT" } } },
                { $replaceRoot: { newRoot: "$latestEvent" } }
              ],
              eventsForLast16Hr: [
                { $match: { updatedAt: { $gte: sixteenHourBefore, $lte: currentDateInKolkata.toDate() } } },
                { $group: { _id: "$did", latestEvent: { $last: "$$ROOT" } } },
                { $replaceRoot: { newRoot: "$latestEvent" } }
              ],
              eventsForLast18Hr: [
                { $match: { updatedAt: { $gte: eighteenHourBefore, $lte: currentDateInKolkata.toDate() } } },
                { $group: { _id: "$did", latestEvent: { $last: "$$ROOT" } } },
                { $replaceRoot: { newRoot: "$latestEvent" } }
              ],
              eventsForLast20Hr: [
                { $match: { updatedAt: { $gte: twentyHourBefore, $lte: currentDateInKolkata.toDate() } } },
                { $group: { _id: "$did", latestEvent: { $last: "$$ROOT" } } },
                { $replaceRoot: { newRoot: "$latestEvent" } }
              ],
              eventsForLast22Hr: [
                { $match: { updatedAt: { $gte: twentytwoHourBefore, $lte: currentDateInKolkata.toDate() } } },
                { $group: { _id: "$did", latestEvent: { $last: "$$ROOT" } } },
                { $replaceRoot: { newRoot: "$latestEvent" } }
              ],
              eventsForLast24Hr: [
                { $match: { updatedAt: { $gte: twentyFourHourBefore, $lte: currentDateInKolkata.toDate() } } },
                { $group: { _id: "$did", latestEvent: { $last: "$$ROOT" } } },
                { $replaceRoot: { newRoot: "$latestEvent" } }
              ]
            }
          }
        ];
        
        const results = await event_ventilator_collection.aggregate(pipeline);

        const todayActiveDeviceCount = [
          {
            duration:moment.tz("Asia/Kolkata").subtract(2, 'hours').format('HH:mm'),
            count:results[0].eventsForLast2Hr.length,
          },
          {
            duration:moment.tz("Asia/Kolkata").subtract(4, 'hours').format('HH:mm'),
            count:results[0].eventsForLast4Hr.length,
          },
          {
            duration:moment.tz("Asia/Kolkata").subtract(6, 'hours').format('HH:mm'),
            count:results[0].eventsForLast6Hr.length,
          },
          {
            duration:moment.tz("Asia/Kolkata").subtract(8, 'hours').format('HH:mm'),
            count:results[0].eventsForLast8Hr.length,
          },
          {
            duration:moment.tz("Asia/Kolkata").subtract(10, 'hours').format('HH:mm'),
            count:results[0].eventsForLast10Hr.length,
          },
          {
            duration:moment.tz("Asia/Kolkata").subtract(12, 'hours').format('HH:mm'),
            count:results[0].eventsForLast12Hr.length,
          },
          {
            duration:moment.tz("Asia/Kolkata").subtract(14, 'hours').format('HH:mm'),
            count:results[0].eventsForLast14Hr.length,
          },
          {
            duration:moment.tz("Asia/Kolkata").subtract(16, 'hours').format('HH:mm'),
            count:results[0].eventsForLast16Hr.length,
          },
          {
            duration:moment.tz("Asia/Kolkata").subtract(18, 'hours').format('HH:mm'),
            count:results[0].eventsForLast18Hr.length,
          },
          {
            duration:moment.tz("Asia/Kolkata").subtract(20, 'hours').format('HH:mm'),
            count:results[0].eventsForLast20Hr.length,
          },
          {
            duration:moment.tz("Asia/Kolkata").subtract(22, 'hours').format('HH:mm'),
            count:results[0].eventsForLast22Hr.length,
          },
          {
            duration:moment.tz("Asia/Kolkata").subtract(24, 'hours').format('HH:mm'),
            count:results[0].eventsForLast24Hr.length,
          },
        ]

        let maxCount = -Infinity;
        for (item of todayActiveDeviceCount) {
          if (item.count > maxCount) {
            maxCount = item.count
          }
        }

        return res.status(200).json({
          statusCode: 200,
          statusValue: "SUCCESS",
          message: "Most recent events by device ID retrieved successfully.",
          // data:results,
          todayActiveDeviceCount,
          maxCount
        });

      } else if (filter == "weekly") {

        const now = new Date();

        const past28Days = new Date("2024-05-01T00:00:00Z");
        past28Days.setDate(now.getDate() - 28);

        // Query to find documents updated in the last 28 days
        const query = {
          updatedAt: {
            $gte: past28Days,
            $lte: now
          }
        };
        // await event_ventilator_collection.find();
        const eventData = await event_ventilator_collection.find(query)

        // Prepare week intervals
        const weeks = [
          { duration: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 28), count: 0, start: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 28), end: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 21) },
          { duration: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 21), count: 0, start: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 21), end: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14) },
          { duration: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14), count: 0, start: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14), end: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7) },
          { duration: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7), count: 0, start: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7), end: now }
        ];

        // Track the latest occurrence of each did
        const uniqueDidMap = new Map();

        eventData.forEach(event => {
          const { did, updatedAt } = event;
          if (!uniqueDidMap.has(did) || uniqueDidMap.get(did) < updatedAt) {
            uniqueDidMap.set(did, updatedAt);
          }
        });

        // Count unique did occurrences per week
        uniqueDidMap.forEach(updatedAt => {
          weeks.forEach(week => {
            if (updatedAt >= week.start && updatedAt <= week.end) {
              week.count++;
            }
          });
        });

        const result = weeks.map(week => ({ duration: week.duration, count: week.count }));

        // I need format this result
        const formattedResult = result.map(entry => {
          const date = new Date(entry.duration)
          const day = date.getUTCDate();
          const month = monthNames[date.getUTCMonth()]
          const formattedDuration = `${day}-${month}`
          return {
            duration:formattedDuration,
            count:entry.count,
          }
        })
        return res.status(200).json({
          statusCode: 200,
          statusValue: "SUCCESS",
          message: "Most recent events by device ID retrieved successfully.",
          weeklyDataCount:formattedResult,
          maxCount:formattedResult[3].count
        });

      } else if (filter == "monthly") {
          
          const initialDate = new Date("2023-12-01T00:00:00Z");
          const endDate2 = new Date();
          endDate2.setDate(endDate2.getDate() - 1);
        
          const prodData = await productionModel.find({
            $and:[
              {deviceId:{$ne:""}},
              {deviceType:{$ne:"Suction"}},
              {createdAt:{$gte:initialDate,$lte:endDate2}}
            ]})
          const deviceIds = prodData.map((item) => {
            return item.deviceId
          })
          // console.log(22,deviceIds)

          const twelveMonthsAgo = new Date();
          twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 6);
          // console.log(33,twelveMonthsAgo)

          const result2 = await event_ventilator_collection.find({
            $and: [
              { date: { $gte: twelveMonthsAgo.toISOString() } },
              { did: { $in: deviceIds } }
            ]
          },{_id:1,did:1,updatedAt:1})



          // Data count From 1 Apr to 30 Apr
          const result3 = await event_ventilator_collection.find({
            $and: [
              { createdAt: { $gte: new Date("2024-04-01T00:00:00Z"), $lte:new Date("2024-04-30T23:59:59Z") } },
              { did: { $in: deviceIds } }
            ]
          },{_id:1,did:1,updatedAt:1})

          console.log(22, result3.length)

          const uniqueDidsApr = new Map();
          result3.forEach(item => {
              if (!uniqueDidsApr.has(item.did)) {
                uniqueDidsApr.set(item.did, item);
              }
          });

          // console.log(44, uniqueDids)
          const uniqueDidArrayApr = Array.from(uniqueDidsApr.values());
          result3.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
          console.log(99, uniqueDidArrayApr.length)

         // End April Code


         
          // Convert the Map to an array of unique did entries
          // const uniqueDidArray = Array.from(uniqueDids.values());

          // Step 1: Sort the array by updatedAt in descending order
          result2.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

          // Step 2: Filter the array to get the unique did based on the latest updatedAt value
          const uniqueDids = new Map();
          result2.forEach(item => {
              if (!uniqueDids.has(item.did)) {
                  uniqueDids.set(item.did, item);
              }
          });

          // console.log(44, uniqueDids)

          // Convert the Map to an array of unique did entries
          const uniqueDidArray = Array.from(uniqueDids.values());

          // Step 3: Group the filtered results by month and year
          const groupedByMonthYear = uniqueDidArray.reduce((acc, item) => {
              const date = new Date(item.updatedAt);
              const year = date.getFullYear();
              const month = date.toLocaleString('default', { month: 'short' });
              const duration = `${year}-${month}`;

              if (!acc[duration]) {
                  acc[duration] = 0;
              }
              acc[duration]++;
              return acc;
          }, {});

          // Step 4: Format the result as requested
          const result = Object.keys(groupedByMonthYear).map(duration => ({
              duration,
              count: groupedByMonthYear[duration]
          }));

          // max count 
          const maxCount = result.reduce((max, item) => item.count > max ? item.count : max, result[0].count);

          // console.log(maxCount);

          return res.status(200).json({
            statusCode: 200,
            statusValue: "SUCCESS",
            message: "Most recent events by device ID retrieved successfully.",
            monthlyDataCount: result.reverse(),
            maxCount:maxCount,
            // data:uniqueDidArray.length
          });
          
        } else if (filter == "yearly") {

          const initialDate = new Date("2023-12-01T00:00:00Z");
          const endDate2 = new Date();
          endDate2.setDate(endDate2.getDate()-1);

          // Define the aggregation pipeline
          const pipeline = [
            {
                $match: {
                  updatedAt: { $gte:initialDate,$lte:endDate2}
                }
            },
            {
                $addFields: {
                    year: { $year: { $dateFromString: { dateString: "$date" } } }
                }
            },
            {
                $group: {
                    _id: {
                        year: "$year",
                        did: "$did"
                    }
                }
            },
            {
                $group: {
                    _id: "$_id.year",
                    uniqueDidCount: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
          ];

          // Execute the aggregation query
          const result = await event_ventilator_collection.aggregate(pipeline).exec();

          // Transform the result into the desired format
          const yearlyData = result.map(item => ({
              duration: item._id,
              count: item.uniqueDidCount
          }));
         
          return res.status(200).json({
            statusCode: 200,
            statusValue: "SUCCESS",
            message: "Most recent events by device ID retrieved successfully.",
            yearlyDataCount: yearlyData,
            maxCount:yearlyData[1].count
          });
        }
      
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    });
  }
}

const getActiveDemoDevicesCountForAgvaPro = async (req, res) => {
  try {
    const filter = req.params.filter;
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const prodAndStatus = await productionModel.aggregate([
      {
        $match:{"productType":{$ne:"Suction"} }
      },
      {
        $lookup:
        {
          from: "device_statuses",
          localField: "deviceId",
          foreignField: "deviceId",
          as: "deviceInfo"
        }
      },
      {
        "$set": {
                  "deviceInfo": {"$first": "$deviceInfo"},
                }
      },
      // Extract the joined embeded fields into top level fields
      {
        "$set": {"message": "$deviceInfo.message"},
      },
      {$match:{$and:[{purpose:"Demo"},{message:"ACTIVE"}]}},
      {
        $project:{
          "deviceId":1,
          "purpose":1,"productType":1,"message":1,
        }
      }
    ])
    // console.log(22,prodAndStatus)
    
    const deviceIds = prodAndStatus.map((item) => {
      return item.deviceId
    })
    // console.log(12,deviceIds)
      
    const eventData = await event_ventilator_collection.aggregate([
      {
          $match: { did: { $in: deviceIds } }
      },
      {
          $addFields: {
              eventDate: {
                  $dateFromString: { dateString: "$date" }
              },
              eventDateString: {
                  $dateToString: { format: "%Y-%m-%d", date: { $dateFromString: { dateString: "$date" } } }
              }
          }
      },
      {
          $sort: {
              did: 1,
              eventDate: -1
          }
      },
      {
          $group: {
              _id: {
                  did: "$did",
                  date: "$eventDateString"
              },
              latestEvent: { $first: "$$ROOT" }
          }
      },
      {
          $replaceRoot: {
              newRoot: "$latestEvent"
          }
      }
  ])

  // console.log(11, eventData)
  
  if (filter == "yearly") {

      // console.log(15, eventData)
      const prodData = await productionModel.find({$and:[{purpose:"Demo"},{productType:{$ne:"Suction"}}]},{_id:1,purpose:1,deviceId:1})
      const deviceIds = prodData.map((item) => {
        return item.deviceId
      })

      const initialDate = new Date("2023-12-01T00:00:00Z");
      const endDate2 = new Date();
      endDate2.setDate(endDate2.getDate()-1);

      // Define the aggregation pipeline
      const pipeline = [
        {
          $match: {$and:[{updatedAt: { $gte:initialDate,$lte:endDate2}},{did:{$in:deviceIds}}]}
        },
        {
          $addFields: {
            year: { $year: { $dateFromString: { dateString: "$date" } } }
            }
        },
        {
          $group: {
            _id: {
                year: "$year",
                did: "$did"
            }
          }
        },
        {
          $group: {
            _id: "$_id.year",
            uniqueDidCount: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ];

      // Execute the aggregation query
      const result = await event_ventilator_collection.aggregate(pipeline).exec();

      // Transform the result into the desired format
      const yearlyData = result.map(item => ({
        duration: item._id,
        count: item.uniqueDidCount
      }));
      
      return res.status(200).json({
        statusCode: 200,
        statusValue: "SUCCESS",
        message: "Data count retrieved successfully.",
        yearlyDataCount:yearlyData,
        maxCount:yearlyData[1].count
      })

  }  else if (filter == "monthly") {
  
    const prodData = await productionModel.find({$and:[{deviceId:{$ne:""}},{deviceType:{$ne:"Suction"}},{purpose:"Demo"}]})
    const deviceIds = prodData.map((item) => {
      return item.deviceId
    })
    // console.log(22,deviceIds)

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 6);
    // console.log(33,twelveMonthsAgo)

    const result2 = await event_ventilator_collection.find({
      $and: [
        { date: { $gte: twelveMonthsAgo.toISOString() } },
        { did: { $in: deviceIds } }
      ]
    },{_id:1,did:1,updatedAt:1})

    // Step 1: Sort the array by updatedAt in descending order
    result2.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    // Step 2: Filter the array to get the unique did based on the latest updatedAt value
    const uniqueDids = new Map();
    result2.forEach(item => {
        if (!uniqueDids.has(item.did)) {
            uniqueDids.set(item.did, item);
        }
    });

    // Convert the Map to an array of unique did entries
    const uniqueDidArray = Array.from(uniqueDids.values());

    // Step 3: Group the filtered results by month and year
    const groupedByMonthYear = uniqueDidArray.reduce((acc, item) => {
        const date = new Date(item.updatedAt);
        const year = date.getFullYear();
        const month = date.toLocaleString('default', { month: 'short' });
        const duration = `${year}-${month}`;

        if (!acc[duration]) {
            acc[duration] = 0;
        }
        acc[duration]++;
        return acc;
    }, {});

    // Step 4: Format the result as requested
    const result = Object.keys(groupedByMonthYear).map(duration => ({
        duration,
        count: groupedByMonthYear[duration]
    }));

    // max count 
    const maxCount = result.reduce((max, item) => item.count > max ? item.count : max, result[0].count);

    // console.log(maxCount);

    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Most recent events by device ID retrieved successfully.",
      monthlyDataCount: result.reverse(),
      maxCount:maxCount
    });

  } else if (filter == "weekly") {

    const productionData = await productionModel.find(
      {
        $and:[{"productType":{$ne:"Suction"} },{"purpose":"Demo"}]
      }
    )
    // console.log(22,prodAndStatus)
    
    const deviceIdss = productionData.map((item) => {
      return item.deviceId
    })
    
    const now = new Date();

    const past28Days = new Date();
    past28Days.setDate(now.getDate() - 28);

    // Query to find documents updated in the last 28 days
    const query = {
      updatedAt: {
        $gte: past28Days,
        $lte: now
      }
    }
    
    // console.log(12,deviceIdss)
    const eventDataa = await event_ventilator_collection.find({
      $and:[{ did: { $in: deviceIdss } },{updatedAt: {$gte: past28Days, $lte: now}}]
    })
    // console.log(11,eventDataa)
    // Prepare week intervals
    const weeks = [
      { duration: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 28), count: 0, start: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 28), end: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 21) },
      { duration: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 21), count: 0, start: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 21), end: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14) },
      { duration: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14), count: 0, start: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14), end: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7) },
      { duration: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7), count: 0, start: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7), end: now }
    ];

    // Track the latest occurrence of each did
    const uniqueDidMap = new Map();

    eventDataa.forEach(event => {
      const { did, updatedAt } = event;
      if (!uniqueDidMap.has(did) || uniqueDidMap.get(did) < updatedAt) {
        uniqueDidMap.set(did, updatedAt);
      }
    });

    // Count unique did occurrences per week
    uniqueDidMap.forEach(updatedAt => {
      weeks.forEach(week => {
        if (updatedAt >= week.start && updatedAt <= week.end) {
          week.count++;
        }
      });
    });

    const result = weeks.map(week => ({ duration: week.duration, count: week.count }));

    // I need format this result
    const formattedResult = result.map(entry => {
      const date = new Date(entry.duration)
      const day = date.getUTCDate();
      const month = monthNames[date.getUTCMonth()]
      const formattedDuration = `${day}-${month}`
      return {
        duration:formattedDuration,
        count:entry.count,
      }
    })

    let maxCount = -Infinity
    for (item of formattedResult) {
      if (item.count > maxCount) {
        maxCount = item.count
      }
    }

    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Most recent events by device ID retrieved successfully.",
      weeklyDataCount:formattedResult,
      maxCount
    });
    
  } else if (filter == "today") {
        const prodData = await productionModel.find({$and:[{purpose:"Demo"},{productType:{$ne:"Suction"}}]},{_id:1,purpose:1,deviceId:1})
        const deviceIds = prodData.map((item) => {
          return item.deviceId
        })
        
        const moment = require('moment-timezone');
        // Get the current date and time in the Asia/Kolkata time zone
        const currentDate = moment.tz("Asia/Kolkata").format('YYYY-MM-DD HH:mm:ss');
        const currentDateInKolkata = moment.tz("Asia/Kolkata");
        const twoHourBefore = moment(currentDateInKolkata).subtract(2, 'hours').toDate();
        const fourHourBefore = moment(currentDateInKolkata).subtract(4, 'hours').toDate();  
        const sixHourBefore = moment(currentDateInKolkata).subtract(6, 'hours').toDate(); 
        const eightHourBefore = moment(currentDateInKolkata).subtract(8, 'hours').toDate(); 
        const tenHourBefore = moment(currentDateInKolkata).subtract(10, 'hours').toDate();    
        const twelHourBefore = moment(currentDateInKolkata).subtract(12, 'hours').toDate();
        const forteenHourBefore = moment(currentDateInKolkata).subtract(14, 'hours').toDate();
        const sixteenHourBefore = moment(currentDateInKolkata).subtract(16, 'hours').toDate();
        const eighteenHourBefore = moment(currentDateInKolkata).subtract(18, 'hours').toDate();
        const twentyHourBefore = moment(currentDateInKolkata).subtract(20, 'hours').toDate();
        const twentytwoHourBefore = moment(currentDateInKolkata).subtract(22, 'hours').toDate();
        const twentyFourHourBefore = moment(currentDateInKolkata).subtract(24, 'hours').toDate();
  
        // Define the aggregate pipeline
        const pipeline = [
          {
            $match: {
              did: { $in: deviceIds },
              updatedAt: { $gte: twentyFourHourBefore, $lte: currentDateInKolkata.toDate() }
            }
          },
          {
            $facet: {
              eventsForLast2Hr: [
                { $match: { updatedAt: { $gte: twoHourBefore } } },
                { $group: { _id: "$did", latestEvent: { $last: "$$ROOT" } } },
                { $replaceRoot: { newRoot: "$latestEvent" } }
              ],
              eventsForLast4Hr: [
                { $match: { updatedAt: { $gte: fourHourBefore } } },
                { $group: { _id: "$did", latestEvent: { $last: "$$ROOT" } } },
                { $replaceRoot: { newRoot: "$latestEvent" } }
              ],
              eventsForLast6Hr: [
                { $match: { updatedAt: { $gte: sixHourBefore } } },
                { $group: { _id: "$did", latestEvent: { $last: "$$ROOT" } } },
                { $replaceRoot: { newRoot: "$latestEvent" } }
              ],
              eventsForLast8Hr: [
                { $match: { updatedAt: { $gte: eightHourBefore } } },
                { $group: { _id: "$did", latestEvent: { $last: "$$ROOT" } } },
                { $replaceRoot: { newRoot: "$latestEvent" } }
              ],
              eventsForLast10Hr: [
                { $match: { updatedAt: { $gte: tenHourBefore } } },
                { $group: { _id: "$did", latestEvent: { $last: "$$ROOT" } } },
                { $replaceRoot: { newRoot: "$latestEvent" } }
              ],
              eventsForLast12Hr: [
                { $match: { updatedAt: { $gte: twelHourBefore } } },
                { $group: { _id: "$did", latestEvent: { $last: "$$ROOT" } } },
                { $replaceRoot: { newRoot: "$latestEvent" } }
              ],
              eventsForLast14Hr: [
                { $match: { updatedAt: { $gte: forteenHourBefore } } },
                { $group: { _id: "$did", latestEvent: { $last: "$$ROOT" } } },
                { $replaceRoot: { newRoot: "$latestEvent" } }
              ],
              eventsForLast16Hr: [
                { $match: { updatedAt: { $gte: sixteenHourBefore } } },
                { $group: { _id: "$did", latestEvent: { $last: "$$ROOT" } } },
                { $replaceRoot: { newRoot: "$latestEvent" } }
              ],
              eventsForLast18Hr: [
                { $match: { updatedAt: { $gte: eighteenHourBefore } } },
                { $group: { _id: "$did", latestEvent: { $last: "$$ROOT" } } },
                { $replaceRoot: { newRoot: "$latestEvent" } }
              ],
              eventsForLast20Hr: [
                { $match: { updatedAt: { $gte: twentyHourBefore } } },
                { $group: { _id: "$did", latestEvent: { $last: "$$ROOT" } } },
                { $replaceRoot: { newRoot: "$latestEvent" } }
              ],
              eventsForLast22Hr: [
                { $match: { updatedAt: { $gte: twentytwoHourBefore } } },
                { $group: { _id: "$did", latestEvent: { $last: "$$ROOT" } } },
                { $replaceRoot: { newRoot: "$latestEvent" } }
              ],
              eventsForLast24Hr: [
                { $match: { updatedAt: { $gte: twentyFourHourBefore } } },
                { $group: { _id: "$did", latestEvent: { $last: "$$ROOT" } } },
                { $replaceRoot: { newRoot: "$latestEvent" } }
              ],
            }
          }
        ];
        
        const results = await event_ventilator_collection.aggregate(pipeline);

        const todayActiveDeviceCount = [
          {
            duration:moment.tz("Asia/Kolkata").subtract(2, 'hours').format('HH:mm'),
            count:results[0].eventsForLast2Hr.length,
          },
          {
            duration:moment.tz("Asia/Kolkata").subtract(4, 'hours').format('HH:mm'),
            count:results[0].eventsForLast4Hr.length,
          },
          {
            duration:moment.tz("Asia/Kolkata").subtract(6, 'hours').format('HH:mm'),
            count:results[0].eventsForLast6Hr.length,
          },
          {
            duration:moment.tz("Asia/Kolkata").subtract(8, 'hours').format('HH:mm'),
            count:results[0].eventsForLast8Hr.length,
          },
          {
            duration:moment.tz("Asia/Kolkata").subtract(10, 'hours').format('HH:mm'),
            count:results[0].eventsForLast10Hr.length,
          },
          {
            duration:moment.tz("Asia/Kolkata").subtract(12, 'hours').format('HH:mm'),
            count:results[0].eventsForLast12Hr.length,
          },
          {
            duration:moment.tz("Asia/Kolkata").subtract(14, 'hours').format('HH:mm'),
            count:results[0].eventsForLast14Hr.length,
          },
          {
            duration:moment.tz("Asia/Kolkata").subtract(16, 'hours').format('HH:mm'),
            count:results[0].eventsForLast16Hr.length,
          },
          {
            duration:moment.tz("Asia/Kolkata").subtract(18, 'hours').format('HH:mm'),
            count:results[0].eventsForLast18Hr.length,
          },
          {
            duration:moment.tz("Asia/Kolkata").subtract(20, 'hours').format('HH:mm'),
            count:results[0].eventsForLast20Hr.length,
          },
          {
            duration:moment.tz("Asia/Kolkata").subtract(22, 'hours').format('HH:mm'),
            count:results[0].eventsForLast22Hr.length,
          },
          {
            duration:moment.tz("Asia/Kolkata").subtract(24, 'hours').format('HH:mm'),
            count:results[0].eventsForLast24Hr.length,
          },
        ]
        
        let maxCount = -Infinity
        for (const item of todayActiveDeviceCount) {
          if (item.count > maxCount) {
            maxCount = item.count
          }
        }
        return res.status(200).json({
          statusCode: 200,
          statusValue: "SUCCESS",
          message: "Most recent events by device ID retrieved successfully.",
          todayActiveDeviceCount,
          maxCount
        });
  }  
      
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    });
  }
}

const getDeviceCountForAgvaPro = async (req, res) => {
  try {

    // device count for agva pro and suction
    const productionData = await productionModel.find({$and:[{deviceId:{$ne:""}},{productType:{$ne:"Suction"}}]})
    
    const statusData = await statusModel.find({deviceId:{$ne:""}})
 
    const productionDeviceIds = productionData.map(device => device.deviceId);

    // Create a dictionary to count ACTIVE and INACTIVE messages
    const messageCount = {
      ACTIVE: 0,
      INACTIVE: 0,
    };

    // Count of devices with purpose 'Demo' among ACTIVE devices
    let totalDemoData = 0;

    // Iterate over the statusData array
    statusData.forEach(status => {
      // Check if the deviceId exists in the productionDeviceIds array
      if (productionDeviceIds.includes(status.deviceId)) {
        // Increment the respective message count
        if (status.message.trim() === "ACTIVE") {
          messageCount.ACTIVE++;
          
          // Check if the device has purpose 'Demo'
          const device = productionData.find(device => device.deviceId === status.deviceId);
          if (device && device.purpose === 'Demo') {
            totalDemoData++;
          }
        } else if (status.message.trim() === 'INACTIVE') {
          messageCount.INACTIVE++;
        }
      }
    });


    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Data count retrieved successfully.",
      agvaProData:[{
        totalDevicesCount:(messageCount.ACTIVE)+(messageCount.INACTIVE),
        ActiveDevicesCount:messageCount.ACTIVE, 
        InactiveDevicesCount:messageCount.INACTIVE,
        totalActiveDemoDevicesCount:totalDemoData,
        // testData:extraDeviceIds
      }]
    });
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    });
  }
};



/**
 * query {req.params.filterType}
 * GET - /api/logger/logs/getTotalDevicesCount/:filterType
 * description -  admin access only
 */
const getTotalDevicesDataCount = async (req, res) => {
  try {
    var curDate = new Date().toJSON().slice(0, 10);
    var filterDate = new Date();
    var last7days = (filterDate.getTime() - (7 * 24 * 60 * 60 * 1000));

    filterDate.setTime(last7days);
    var expectedDateWeekly = filterDate.toJSON().slice(0, 10);

    var filterDate2 = new Date();
    var last30days = (filterDate2.getTime() - (30 * 24 * 60 * 60 * 1000));
    filterDate2.setTime(last30days);
    var expectedDateMonthly = filterDate2.toJSON().slice(0, 10);

    if (req.params.filterType == "Weekly" || req.params.filterType == "weekly") {
      // Logic
      const aggregateLogic = [
        {
          $match: { "createdAt": { $gte: new Date(expectedDateWeekly), $lt: new Date(curDate) } }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { createdAt: -1 }
        }
      ]
      // use of logic
      const weeklyDataCount = await Device.aggregate(aggregateLogic).sort({ createdAt: -1 })
      let sortedData = weeklyDataCount.sort((a, b) => {
        return new Date(a._id) - new Date(b._id);
      })

      const totalCounts = weeklyDataCount.reduce((acc, cur) => {
        return acc + cur.count;
      }, 0);
      return res.status(200).json({
        statusCode: 200,
        statusValue: "SUCCESS",
        message: "Weekly data counts get successfully.",
        data: {
          totalCounts: totalCounts ? totalCounts : 0,
          weeklyCounts: weeklyDataCount ? sortedData : 0,
        }
      })
    } else if (req.params.filterType == "Monthly" || req.params.filterType == "monthly") {

      const aggregateLogic = [
        {
          $match: { "createdAt": { $gte: new Date(expectedDateMonthly), $lt: new Date(curDate) } }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { createdAt: -1 }
        }
      ]
      // use of logic
      const monthlyDataCount = await Device.aggregate(aggregateLogic)
      let sortedData = monthlyDataCount.sort((a, b) => {
        return new Date(a._id) - new Date(b._id);
      })

      const totalCounts = monthlyDataCount.reduce((acc, cur) => {
        return acc + cur.count;
      }, 0);

      return res.status(200).json({
        statusCode: 200,
        statusValue: "SUCCESS",
        message: "Monthly data counts get successfully.",
        data: {
          totalCounts: totalCounts ? totalCounts : 0,
          monthlyCounts: monthlyDataCount ? sortedData : 0,
        }
      })
    }
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    })
  }
}

const getTotalDevicesDataCount1 = async (req, res) => {
  try {
    var curDate = new Date().toJSON().slice(0, 10);
    var filterDate = new Date();
    var last7days = (filterDate.getTime() - (7 * 24 * 60 * 60 * 1000));

    filterDate.setTime(last7days);
    var expectedDateWeekly = filterDate.toJSON().slice(0, 10);

    var filterDate2 = new Date();
    var last30days = (filterDate2.getTime() - (30 * 24 * 60 * 60 * 1000));
    filterDate2.setTime(last30days);
    var expectedDateMonthly = filterDate2.toJSON().slice(0, 10);

    if (req.params.filterType == "Weekly" || req.params.filterType == "weekly") {
      const totalDevicesCount = await Device.find({
        createdAt: {
          $gte: new Date(expectedDateWeekly).toISOString(),
          $lte: new Date(curDate).toISOString()
        },
      }).countDocuments();

      return res.status(200).json({
        statusCode: 200,
        statusValue: "SUCCESS",
        message: "Weekly data counts get successfully.",
        data: {
          totalDevices: totalDevicesCount ? totalDevicesCount : 0,
        }
      })
    } else if (req.params.filterType == "Monthly" || req.params.filterType == "monthly") {
      const totalDevicesCount = await Device.find({
        createdAt: {
          $gte: new Date(expectedDateMonthly).toISOString(),
          $lte: new Date(curDate).toISOString()
        },
      }).countDocuments();

      return res.status(200).json({
        statusCode: 200,
        statusValue: "SUCCESS",
        message: "Monthly data counts get successfully.",
        data: {
          totalDevices: totalDevicesCount ? totalDevicesCount : 0,
        }
      })
    }
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    })
  }
}

/**
 * data - {req.body, req.params}
 * GET - /api/logger/logs/getTotalActiveDevicesCount/:filterType
 * description -  admin access only
 */
const getTotalActiveDevicesCount = async (req, res) => {
  try {
    var curDate = new Date().toJSON().slice(0, 10);
    var filterDate = new Date();
    var last7days = (filterDate.getTime() - (7 * 24 * 60 * 60 * 1000));

    filterDate.setTime(last7days);
    var expectedDateWeekly = filterDate.toJSON().slice(0, 10);

    var filterDate2 = new Date();
    var last30days = (filterDate2.getTime() - (30 * 24 * 60 * 60 * 1000));
    filterDate2.setTime(last30days);
    var expectedDateMonthly = filterDate2.toJSON().slice(0, 10);

    if (req.params.filterType == "Weekly" || req.params.filterType == "weekly") {

      const aggregateLogic = [
        {
          $match: { "createdAt": { $gte: new Date(expectedDateWeekly), $lt: new Date(curDate) }, "message": "ACTIVE" }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { createdAt: -1 }
        }
      ]
      // use of logic
      const weeklyDataCount = await statusModel.aggregate(aggregateLogic)
      const totalCounts = weeklyDataCount.reduce((acc, cur) => {
        return acc + cur.count;
      }, 0);
      return res.status(200).json({
        statusCode: 200,
        statusValue: "SUCCESS",
        message: "Weekly data counts get successfully.",
        data: {
          totalCounts: totalCounts ? totalCounts : 0,
          weeklyCounts: weeklyDataCount ? weeklyDataCount : 0,
        }
      })
    } else if (req.params.filterType == "Monthly" || req.params.filterType == "monthly") {
      const aggregateLogic = [
        {
          $match: { "createdAt": { $gte: new Date(expectedDateMonthly), $lt: new Date(curDate) }, "message": "ACTIVE" }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { createdAt: -1 }
        }
      ]
      // use of logic
      const monthlyDataCount = await statusModel.aggregate(aggregateLogic)
      const totalCounts = monthlyDataCount.reduce((acc, cur) => {
        return acc + cur.count;
      }, 0);

      return res.status(200).json({
        statusCode: 200,
        statusValue: "SUCCESS",
        message: "Monthly data counts get successfully.",
        data: {
          totalCounts: totalCounts ? totalCounts : 0,
          monthlyCounts: monthlyDataCount ? monthlyDataCount : 0,
        }
      })
    }
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    })
  }
}

/**
 * data - {req.body, req.params}
 * GET - /api/logger/logs/getDevicesNeedingAttention/:filterType
 * description -  admin access only
 */
const getDevicesNeedingAttention = async (req, res) => {
  try {
    var curDate = new Date().toJSON().slice(0, 10);
    var filterDate = new Date();
    var last7days = (filterDate.getTime() - (7 * 24 * 60 * 60 * 1000));

    filterDate.setTime(last7days);
    var expectedDateWeekly = filterDate.toJSON().slice(0, 10);

    var filterDate2 = new Date();
    var last30days = (filterDate2.getTime() - (30 * 24 * 60 * 60 * 1000));
    filterDate2.setTime(last30days);
    var expectedDateMonthly = filterDate2.toJSON().slice(0, 10);

    if (req.params.filterType == "Weekly" || req.params.filterType == "weekly") {
      const aggregateLogic = [
        {
          $match: { "createdAt": { $gte: new Date(expectedDateWeekly), $lt: new Date(curDate) }, }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { createdAt: -1 }
        }
      ]
      // use of logic
      const weeklyDataCount = await servicesModel.aggregate(aggregateLogic)
      const totalCounts = weeklyDataCount.reduce((acc, cur) => {
        return acc + cur.count;
      }, 0);
      return res.status(200).json({
        statusCode: 200,
        statusValue: "SUCCESS",
        message: "Weekly data counts get successfully.",
        data: {
          totalCounts: totalCounts ? totalCounts : 0,
          weeklyCounts: weeklyDataCount ? weeklyDataCount : 0,
        }
      })
    } else if (req.params.filterType == "Monthly" || req.params.filterType == "monthly") {
      const aggregateLogic = [
        {
          $match: { "createdAt": { $gte: new Date(expectedDateMonthly), $lt: new Date(curDate) }, }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { createdAt: -1 }
        }
      ]
      // use of logic
      const monthlyDataCount = await servicesModel.aggregate(aggregateLogic)
      const totalCounts = monthlyDataCount.reduce((acc, cur) => {
        return acc + cur.count;
      }, 0);

      return res.status(200).json({
        statusCode: 200,
        statusValue: "SUCCESS",
        message: "Monthly data counts get successfully.",
        data: {
          totalCounts: totalCounts ? totalCounts : 0,
          monthlyCounts: monthlyDataCount ? monthlyDataCount : 0,
        }
      })
    }
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    })
  }
}

// replace deviceId by new deviceID
const replaceDeviceId = async (req, res) => {
  try {
    const schema = Joi.object({
      deviceId: Joi.string().min(16).max(16).required(),
      newDeviceId: Joi.string().min(16).max(16).required()
    })
    let validationResult = schema.validate(req.body);
    if (validationResult.error) {
      return res.status(200).json({
        statusValue: 0,
        statusCode: 400,
        message: validationResult.error.details[0].message,
      })
    }

    const aboutData = await aboutDeviceModel.findOne({deviceId:req.body.deviceId})
    const prodData = await productionModel.findOne({deviceId:req.body.deviceId})
    if (!aboutData || !prodData) {
      return res.status(200).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "deviceId does not exists."
      })
    }

    const updateAbout = await aboutDeviceModel.findOneAndUpdate({deviceId:req.body.deviceId},{deviceId:req.body.newDeviceId})
    const updateProd = await productionModel.findOneAndUpdate({deviceId:req.body.deviceId},{deviceId:req.body.newDeviceId})
    if (updateProd && updateAbout) {

      await accountsHistoryModel.updateMany({deviceId:req.body.deviceId},{deviceId:req.body.newDeviceId})
      await accountsModel.findOneAndUpdate({deviceId:req.body.deviceId},{deviceId:req.body.newDeviceId})
      await markAsShippedModel.findOneAndUpdate({deviceId:req.body.deviceId},{deviceId:req.body.newDeviceId})
      await RegisterDevice.findOneAndUpdate({DeviceId:req.body.deviceId},{DeviceId:req.body.newDeviceId})
      await returnDeviceModel.updateMany({deviceId:req.body.deviceId},{deviceId:req.body.newDeviceId})
      await s3BucketModel.updateMany({deviceId:req.body.deviceId},{deviceId:req.body.newDeviceId})
      await s3BucketInsModel.updateMany({deviceId:req.body.deviceId},{deviceId:req.body.newDeviceId})
      await s3BucketProdModel.updateMany({deviceId:req.body.deviceId},{deviceId:req.body.newDeviceId})
      await s3shippingBucketModel.updateMany({deviceId:req.body.deviceId},{deviceId:req.body.newDeviceId})
      await s3ewayBillBucketModel.updateMany({deviceId:req.body.deviceId},{deviceId:req.body.newDeviceId})
      await s3invoiceBucketModel.updateMany({deviceId:req.body.deviceId},{deviceId:req.body.newDeviceId})
      await s3PatientFileModel.updateMany({deviceId:req.body.deviceId},{deviceId:req.body.newDeviceId})
      await s3poBucketModel.updateMany({deviceId:req.body.deviceId},{deviceId:req.body.newDeviceId})
      await s3ReturnPoBucketModel.updateMany({deviceId:req.body.deviceId},{deviceId:req.body.newDeviceId})
      await servicesModel.updateMany({deviceId:req.body.deviceId},{deviceId:req.body.newDeviceId})
      await s3PatientFileModel.updateMany({deviceId:req.body.deviceId},{deviceId:req.body.newDeviceId})
      
      return res.status(200).json({
        statusCode: 200,
        statusValue: "SUCCESS",
        message: "deviceId updated successfully.",
        data: req.body,
      })
    }

    return res.status(400).json({
      statusCode: 400,
      statusValue: "FAIL",
      message: "Error! while updating deviceId",
      data: req.body
    })

  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    });
  }
}




module.exports = {
  createDevice,
  updateDevice,
  getDeviceById,
  deleteSingleDevice,
  getAllDevices,
  addDeviceService,
  getServicesById,
  saveStatus,
  getDeviceOverviewById,
  addAboutDevice,
  updateDevices,
  // addDispatchDetails,
  getAboutByDeviceId,
  sendAndReceiveData,
  assignedDeviceToUser,
  getAssignedDeviceById,
  deleteDeviceAccessFromAst,
  getAdminDashboardDataCount,
  getTotalDevicesDataCount,
  getTotalDevicesDataCount1,
  getTotalActiveDevicesCount,
  getDevicesNeedingAttention,
  getDispatchData,
  getDispatchDataById,
  getDevicesByHospital,
  updateAboutData,
  trackDeviceLocation,
  verifyOtpSms,
  updateTicketStatus,
  closeTicket,
  getAllServices,
  getDeviceAccessUsersByDeviceId,
  getDeviceAccessUsers,
  returnDevice,
  getReturnDeviceData,
  replaceDeviceId,
  updateAddtofocus,
  saveStatusV2,
  getSignleFocusDevice,
  getDeviceCountData,
  deleteDeviceAccessFromDoctor,
  getDeviceAccessAstList,
  getDeviceAccessDoctList,
  getDispatchDataV2,
  addDeviceServiceV2,
  getAllServicesV2,
  getDeviceByIdV2,
  updatePaymentStatus,
  getAgvaProAndSuctionDataCount,
  getDeviceCountForAgvaPro,
  getWMYDataCountForAgvaPro,
  getActiveDevicesCountForAgvaPro,
  getWMYDemoDataCountForAgvaPro,
  getActiveDemoDevicesCountForAgvaPro
}