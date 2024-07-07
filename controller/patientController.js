const Joi = require('joi');
const patientModel = require('../model/patientModel');
const s3PatientFileModel = require('../model/s3PatientFileModel');
// let redisClient = require("../config/redisInit");
const User = require('../model/users');
const RegisterDevice = require('../model/RegisterDevice');
const statusModel = require('../model/statusModel');
const { validationResult } = require('express-validator');
let redisClient = require("../config/redisInit");
const JWTR = require("jwt-redis").default;
const jwtr = new JWTR(redisClient);
require("dotenv").config({ path: "../.env" });
const mongoose = require('mongoose');
const assignDeviceTouserModel = require('../model/assignedDeviceTouserModel');
const patientModelV2 = require('../model/patientModelV2');
const patientDischargeModelV2 = require('../model/patientDischargeModelV2');
const aboutDeviceModel = require('../model/aboutDeviceModel');

/**
 * api      POST @/patient/save-uhid-details
 * desc     @saveUhid for publickly access
 */
const saveUhid = async (req, res) => {
  try {
    const deviceDetails = await RegisterDevice.findOne({DeviceId:req.body.deviceId});
    const patientData = await patientModel.findOneAndUpdate(
      { UHID:"" },
      { 
        UHID:!!(req.body.UHID) ? req.body.UHID : "",
        deviceId:!!(req.body.deviceId) ? req.body.deviceId : "",
        age:!!(req.body.age) ? req.body.age : "",
        weight:!!(req.body.weight) ? req.body.weight : "",
        height:!!(req.body.height) ? req.body.height : "",
        ward_no:!!(req.body.ward_no) ? req.body.ward_no : "",
        alias_name:!!(deviceDetails) ? deviceDetails.Alias_Name : "",
        patientProfile:!!(req.body.patientProfile) ? req.body.patientProfile : "",
        bed_no: !!(req.body.bed_no) ? req.body.bed_no : ""
      },
      { upsert: true, new: true }
    )
    
    // if (!patientData) {
    //   return res.status(200).json({
    //     statusCode: 200,
    //     statusValue: "SUCCESS",
    //     message: "Data added successfully.",
    //     data: patientData
    //   });
    // }
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Data added successfully.",
      data: patientData
    });
  } catch (error) {
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
};


/**
 * api      POST @/patient/save-uhid-details/v2
 * desc     @saveUhid for publickly access
 */
const saveUhidV2 = async (req, res) => {
  try {
    const deviceDetails = await RegisterDevice.findOne({DeviceId:req.body.deviceId});
    const patientData = await patientModelV2.findOneAndUpdate(
      { UHID:"Agva121" },
      { 
        UHID:!!(req.body.UHID) ? req.body.UHID : "",
        deviceId:!!(req.body.deviceId) ? req.body.deviceId : "",
        age:!!(req.body.age) ? req.body.age : "",
        weight:!!(req.body.weight) ? req.body.weight : "",
        height:!!(req.body.height) ? req.body.height : "",
        ward_no:!!(req.body.ward_no) ? req.body.ward_no : "",
        alias_name:!!(deviceDetails) ? deviceDetails.Alias_Name : "",
        patientProfile:!!(req.body.patientProfile) ? req.body.patientProfile : "",
        projectCode:!!(req.params.projectCode) ? req.params.projectCode : ""
      },
      { upsert: true, new: true }
    )
    
    // if (!patientData) {
    //   return res.status(200).json({
    //     statusCode: 200,
    //     statusValue: "SUCCESS",
    //     message: "Data added successfully.",
    //     data: patientData
    //   });
    // }
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Data added successfully.",
      data: patientData
    });
  } catch (error) {
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
};


/**
 * api      POST @/patient/save-patient-discharge/v2
 * desc     @savePatientDischargeData for publickly access
 */
const savePatientDischargeData = async (req, res) => {
  try {
    // const deviceDetails = await RegisterDevice.findOne({DeviceId:req.body.deviceId});
    const patientData = await patientDischargeModelV2.findOneAndUpdate(
      { UHID:"Agva121121" },
      { 
        patient_profile:!!(req.body.patient_profile) ? req.body.patient_profile : "",
        weight:!!(req.body.weight) ? req.body.weight : "",
        height:!!(req.body.height) ? req.body.height : "",
        age:!!(req.body.age) ? req.body.age : "",
        gender:!!(req.body.gender) ? req.body.gender : "",
        UHID:!!(req.body.UHID) ? req.body.UHID : "",
        deviceId:!!(req.body.deviceId) ? req.body.deviceId : "",
        projectCode:!!(req.params.projectCode) ? req.params.projectCode : ""
      },
      { upsert: true, new: true }
    )
    
    // if (!patientData) {
    //   return res.status(200).json({
    //     statusCode: 200,
    //     statusValue: "SUCCESS",
    //     message: "Data added successfully.",
    //     data: patientData
    //   });
    // }
    return res.status(201).json({
      statusCode: 201,
      statusValue: "SUCCESS",
      message: "Data added successfully.",
      data: patientData
    });
  } catch (error) {
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
};



/**
 * api      POST @/patient/save-uhid-details
 * desc     @saveUhid for publickly access
 */
const saveDiagnose = async (req, res) => {
  try {
    // Get current date and time in India time zone
    const indiaTime = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).formatToParts(new Date());

    // Parse the parts into an object
    const indiaTimeObj = {};
    indiaTime.forEach(({ type, value }) => {
      indiaTimeObj[type] = value;
    });

    // Format the date and time
    const formattedDate = `${indiaTimeObj.year}-${indiaTimeObj.month}-${indiaTimeObj.day} ${indiaTimeObj.hour}:${indiaTimeObj.minute}:${indiaTimeObj.second}`; 
    //End date time 

    const diagnoseData = await patientModel.findOne({UHID:req.params.UHID});
    const prevDiagnose = diagnoseData.medicalDiagnosis;
    // console.log(11, prevDiagnose)

    const {medication,stats} = req.body;

    if (prevDiagnose.length>0) {
      // console.log(true)
      const arr2 = [{
        medication:medication,
        report:!!(diagnoseData.location) ? diagnoseData.location : "NA",
        dateTime:formattedDate,
        stats:!!(stats) ? stats : "NA",
      }];
      const finalArr = [...prevDiagnose,...arr2];
      console.log(12,finalArr)
      
      const patientData = await patientModel.findOneAndUpdate(
        {UHID:req.params.UHID},
        {
          medicalDiagnosis:finalArr
        },
        { upsert: true }
      ); 
      res.status(200).json({
        statusCode: 201,
        statusValue: "SUCCESS",
        message: "Data added successfully.",
      });
    } else if (prevDiagnose.length<1) {
      const arr2 = [{
        medication:medication,
        report:!!(diagnoseData.location) ? diagnoseData.location : "NA",
        dateTime:formattedDate,
        stats:!!(req.body.stats) ? req.body.stats : "NA",
      }];
        
      const patientData = await patientModel.findOneAndUpdate(
        {UHID:req.params.UHID},{medicalDiagnosis:arr2},{ upsert: true })
      if (!diagnoseData) {
        return res.status(400).json({
          statusCode: 400,
          statusValue: "FAIL",
          message: "Data not added."
        });
      }
      res.status(200).json({
        statusCode: 201,
        statusValue: "SUCCESS",
        message: "Data added successfully.",
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
    })
  }
}


/**
 * api      POST @/patient/save-uhid-details
 * desc     @saveUhid for publickly access
 */
const updatePatientById = async (req, res) => {
  try {
    const token = req.headers["authorization"].split(' ')[1];
    const verified = await jwtr.verify(token, process.env.JWT_SECRET);
    // console.log(verified)
    // console.log(req.body)
    const loggedInUser = await User.findById({_id:verified.user});
    if (req.body.UHID == "") {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Data not added."
      });
    }

    // Get current date and time in India time zone
    const indiaTime = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).formatToParts(new Date());

    // Parse the parts into an object
    const indiaTimeObj = {};
    indiaTime.forEach(({ type, value }) => {
      indiaTimeObj[type] = value;
    });

    // Format the date and time
    const formattedDate = `${indiaTimeObj.year}-${indiaTimeObj.month}-${indiaTimeObj.day} ${indiaTimeObj.hour}:${indiaTimeObj.minute}:${indiaTimeObj.second}`;
    
    console.log(123, req.body)
    const getDispatchData = await aboutDeviceModel.findOne({deviceId:req.body.deviceId});
    const patientData = await patientModel.findOneAndUpdate(
      {UHID:req.body.UHID},
      {
        UHID:!!(req.body.UHID) ? req.body.UHID : "",
        age:!!(req.body.age) ? req.body.age : "",
        deviceId:!!(req.body.deviceId) ? req.body.deviceId : "",
        serial_no:!!getDispatchData ? getDispatchData.serial_no : "NA",
        weight:!!(req.body.weight) ? req.body.weight : "",
        height:!!(req.body.height) ? req.body.height : "",
        patientName:!!(req.body.patientName) ? req.body.patientName : "",
        hospitalName:!!(loggedInUser.hospitalName) ? loggedInUser.hospitalName : "",
        dosageProvided:!!(req.body.dosageProvided) ? req.body.dosageProvided : "",
        ward_no:!!(req.body.ward_no) ? req.body.ward_no : "",
        doctor_name:!!(req.body.doctor_name) ? req.body.doctor_name : "",
        bed_no:!!(req.body.bed_no) ? req.body.bed_no : "",
        hypertension:!!(req.body.hypertension) ? req.body.hypertension : false,
        diabetes:!!(req.body.diabetes) ? req.body.diabetes : false,
        bmi:!!(req.body.bmi) ? req.body.bmi : "NA",
        discharge:{startDateTime:!!(req.body.startDateTime) ? req.body.startDateTime : formattedDate}
      },
      { upsert: true }
    );
   
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Data added successfully.",
      data: patientData
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
    })
  }
}


/**
 * api      POST @/patient/save-uhid-details
 * desc     @saveUhid for publickly access
 */
const updatePatientDischarge = async (req, res) => {
  try {
    
    // Get current date and time in India time zone
    const indiaTime = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).formatToParts(new Date());

    // Parse the parts into an object
    const indiaTimeObj = {};
    indiaTime.forEach(({ type, value }) => {
      indiaTimeObj[type] = value;
    });

    // Format the date and time
    const formattedDate = `${indiaTimeObj.year}-${indiaTimeObj.month}-${indiaTimeObj.day} ${indiaTimeObj.hour}:${indiaTimeObj.minute}:${indiaTimeObj.second}`;
    if (req.body.status == "yes") {
      const patientData = await patientModel.findOneAndUpdate(
        {UHID:req.params.UHID},
        {
          discharge:{endDateTime:formattedDate,status:true},
        },
        { upsert: true }
      );
     
      return res.status(200).json({
        statusCode: 200,
        statusValue: "SUCCESS",
        message: "Data added successfully.",
        data: patientData
      });
    } else if (req.body.status == "no") {
      const patientData = await patientModel.findOneAndUpdate(
        {UHID:req.params.UHID},
        {
          discharge:{endDateTime:"",status:false},
        },
        { upsert: true }
      );
     
      return res.status(200).json({
        statusCode: 200,
        statusValue: "SUCCESS",
        message: "Data added successfully.",
        data: patientData
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
    })
  }
}


/**
 * api      GET @/patient/get-allUhid
 * desc     @getAllUhid for logger access only
 */
const getAllUhid = async (req, res) => {
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

    // Check userType
    const token = req.headers["authorization"].split(' ')[1];
    const verified = await jwtr.verify(token, process.env.JWT_SECRET);  
    
    // For logger user activity
    const loggedInUser = await User.findById({_id:verified.user});
    // console.log(loggedInUser)

    // Declare blank array
    let assignDeviceData = []
    if (!!loggedInUser && loggedInUser.userType == "Doctor") {
      assignDeviceData = await assignDeviceTouserModel.find({userId:loggedInUser._id})
      // console.log(assignDeviceData)
    } else if (loggedInUser.userType == "Assistant") {
      assignDeviceData = await assignDeviceTouserModel.find({securityCode:loggedInUser.securityCode})
      // console.log(22)
    }
    
    // Get deviceIds
    let deviceIds = assignDeviceData.map((item) => item.deviceId)
    deviceIds = [...new Set(deviceIds)]
      
    // Define list of patient list of access deviceIds
    const getList = await patientModel.aggregate([
      {
        $match:{deviceId:{$in:deviceIds}}
      },
      {
        "$match":{
          "$or":[
            { deviceId: { $regex: ".*" + search + ".*", $options: "i" } },
            { UHID: { $regex: ".*" + search + ".*", $options: "i" } },
            { patientName: { $regex: ".*" + search + ".*", $options: "i" } },
            { hospitalName: { $regex: ".*" + search + ".*", $options: "i" } },
          ]
        }
      },
      { $sort: { createdAt: -1 } },
      { $project: { __v: 0, createdAt: 0, updatedAt: 0 } }
    ])
      
      
    // Paginate data array
    const paginateArray =  (getList, page, limit) => {
      const skip = getList.slice((page - 1) * limit, page * limit);
      return skip;
    };
      
    var allDevices = paginateArray(getList, page, limit)
      
    // Check data length
    if (allDevices.length<1) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Data not found.",
        data: []
      })
    }
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Patient list get successfully.",
      data: allDevices,
      totalDataCount: getList.length,
      totalPages: Math.ceil( (getList.length)/ limit),
      currentPage: page,
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
 * api      GET @/patient/get-allUhid
 * desc     @getAllUhid for logger access only
 */
const getAllUhidV2 = async (req, res) => {
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

    // Check userType
    const token = req.headers["authorization"].split(' ')[1];
    const verified = await jwtr.verify(token, process.env.JWT_SECRET);  
    
    // For logger user activity
    const loggedInUser = await User.findById({_id:verified.user});
    // console.log(loggedInUser)
    // Declare blank object
    // let filterObj = {};
    let assignDeviceData = []
    if (!!loggedInUser && loggedInUser.userType == "Doctor") {
      assignDeviceData = await assignDeviceTouserModel.find({userId:loggedInUser._id})
      // console.log(assignDeviceData)
    } else if (loggedInUser.userType == "Assistant") {
      assignDeviceData = await assignDeviceTouserModel.find({assistantId:loggedInUser._id})
      // console.log(22)
    }
    
      // get deviceIds
      let deviceIds = assignDeviceData.map((item) => item.deviceId)
      deviceIds = [...new Set(deviceIds)]
      
      // Get patient list
      const getList = await patientModelV2.find({deviceId:{$in:deviceIds}},{__v:0,createdAt:0,updatedAt:0,})
      .sort({ createdAt: -1 });
      
      // Paginate data array
      const paginateArray =  (getList, page, limit) => {
        const skip = getList.slice((page - 1) * limit, page * limit);
        return skip;
      };
      
      var allDevices = paginateArray(getList, page, limit)
      
      // Check data length
      if (!getList) {
        return res.status(400).json({
          statusCode: 400,
          statusValue: "FAIL",
          message: "Data not found.",
          data: []
        })
      }
      return res.status(200).json({
        statusCode: 200,
        statusValue: "SUCCESS",
        message: "Patient list get successfully.",
        data: allDevices,
        totalDataCount: getList.length,
        totalPages: Math.ceil( (getList.length)/ limit),
        currentPage: page,
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
 * api      GET @/patient/get-allUhid/:deviceId
 * desc     @getAllUhid for logger access only
 */
const getAllUhidBydeviceId = async (req, res) => {
  try {
      // for pagination
      let page = req.query.page
      let limit = req.query.limit
      if (!page || page === "undefined") {
      page = 1;
      }
      if (!limit || limit === "undefined" || parseInt(limit) === 0) {
      limit = 999999;
      } 

      // get data
      let getList = await patientModel.find({deviceId:req.params.deviceId},{__v:0,createdAt:0,updatedAt:0})
      .sort({ createdAt: -1 });
      const currentData = getList[0]
      getList.shift()
      // console.log(11,pastList)
    
      // for pagination
      const paginateArray =  (getList, page, limit) => {
        const skip = getList.slice((page - 1) * limit, page * limit);
        return skip;
      }
      
      let allData = paginateArray(getList, page, limit)

      if (!!getList) {
        return res.status(200).json({
          statusCode: 200,
          statusValue: "SUCCESS",
          message: "Patient list get successfully.",
          data: allData,
          currentData: [currentData],
          totalDataCount: getList.length,
          totalPages: Math.ceil( (getList.length)/limit),
          currentPage: page,
        })
      }
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Data not found.",
        data: []
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
 * api      GET @/patient/get-allUhid/:deviceId
 * desc     @getAllUhid for logger access only
 */
const getAllUhidBydeviceIdV2 = async (req, res) => {
  try {
      // for pagination
      let page = req.query.page
      let limit = req.query.limit
      if (!page || page === "undefined") {
      page = 1;
      }
      if (!limit || limit === "undefined" || parseInt(limit) === 0) {
      limit = 999999;
      } 

      // get data
      let getList = await patientModelV2.find({deviceId:req.params.deviceId},{__v:0,createdAt:0,updatedAt:0})
      .sort({ createdAt: -1 });
      const currentData = getList[0]
      getList.shift()
      // console.log(11,pastList)
    
      // for pagination
      const paginateArray =  (getList, page, limit) => {
        const skip = getList.slice((page - 1) * limit, page * limit);
        return skip;
      }
      
      let allData = paginateArray(getList, page, limit)

      if (!!getList) {
        return res.status(200).json({
          statusCode: 200,
          statusValue: "SUCCESS",
          message: "Patient list get successfully.",
          data: allData,
          currentData: [currentData],
          totalDataCount: getList.length,
          totalPages: Math.ceil( (getList.length)/limit),
          currentPage: page,
        })
      }
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Data not found.",
        data: []
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
 * api      GET @/patient/get-allUhid
 * desc     @getAllUhid for logger access only
 */
const getAllUhids = async (req, res) => {
  try {
    const getList = await patientModel.find({},{UHID:1,_id:0})
      .sort({ createdAt: -1 });
    if (!getList) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Data not found.",
        data: []
      })
    }
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "UHID list get successfully.",
      data: getList
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
 * api      GET @/patient/get-allUhid
 * desc     @getAllUhid for logger access only
 */
const getAllUhidsV2 = async (req, res) => {
  try {
    const getList = await patientModelV2.find({},{UHID:1,_id:0})
      .sort({ createdAt: -1 });
    if (!getList) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Data not found.",
        data: []
      })
    }
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "UHID list get successfully.",
      data: getList
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
 * api      GET @/get-all-patient-discharge-data/v2/:projectCode
 * desc     @getAllPatientDischargeData for logger access only
 */
const getAllPatientDischargeData = async (req, res) => {
  try {
    const getList = await patientDischargeModelV2.find({projectCode:req.params.projectCode},{__v:0})
      .sort({ createdAt: -1 });
    if (!getList) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Data not found.",
        data: []
      })
    }
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Patient discharge data list get successfully.",
      data: getList
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
 * api      GET @/patient/get-patient-details/:UHID
 * desc     @getDataByUhid for logger access only
 */
const getDataById = async (req, res) => {
  try {
    const getData = await patientModel.findOne({_id:req.params.id},{__v:0,});
    
    // check UHID data
    if (!getData) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Data not found.",
      })
    }

    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Data get successfully.",
      data:getData,
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
 * api      GET @/patient/get-patient-details/:UHID
 * desc     @getDataByUhid for logger access only
 */
const getDataByIdV2 = async (req, res) => {
  try {
    const getData = await patientModelV2.findOne({_id:req.params.id},{__v:0,});

    // check UHID data
    if (!getData) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Data not found.",
      })
    }

    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Data get successfully.",
      data:getData,
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
 * api      GET @/patient/get-diagnose/:UHID
 * desc     @getDataByUhid for logger access only
 */
const getDiagnoseByUhid = async (req, res) => {
  try {
    const UHID = req.params.UHID;
    const getData = await patientModel.findOne({UHID:UHID},{__v:0,});
    const diagnoseData = getData.medicalDiagnosis
    
    // check UHID data
    if (diagnoseData.length<1) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Data not found.",
        data:[]
      })
    }
    
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Data get successfully.",
      data:getData.medicalDiagnosis,
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
 * api      GET @/patient/get-diagnose/:UHID
 * desc     @getDataByUhid for logger access only
 */
const getDiagnoseByUhidV2 = async (req, res) => {
  try {
    const UHID = req.params.UHID;
    const getData = await patientModelV2.findOne({UHID:UHID},{__v:0,});
    
    // check UHID data
    if (!getData) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Data not found.",
        data:[]
      })
    }
    
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Data get successfully.",
      data:getData.medicalDiagnosis,
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
 * api      DELETE @/patient/delete-patient/:id
 * desc     @deletePatientById for logger access only
*/
const deletePatientById = async (req, res) => {
  try {
    const id = req.params.id;
    const getPatient = await patientModel.findById({_id:id});
    const deleteData = await patientModel.findByIdAndDelete({_id:id});
    if(!!deleteData) {
      await s3PatientFileModel.findOneAndDelete({UHID:getPatient.UHID});
      return res.status(200).json({
        statusCode: 200,
        statusValue: "SUCCESS",
        message: "Data deleted successfully!",
      })
    }
    return res.status(400).json({
      statusCode: 400,
      statusValue: "FAIL",
      message: "Error ! while deleting patient data."
    })
  }
  catch (err) {
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



module.exports = {
  saveUhid,
  getAllUhid,
  getAllUhids,
  getDataById,
  saveDiagnose,
  updatePatientById,
  deletePatientById,
  getDiagnoseByUhid,
  getAllUhidBydeviceId,
  saveUhidV2,
  savePatientDischargeData,
  getAllPatientDischargeData,
  getDataByIdV2,
  getAllUhidBydeviceIdV2,
  getAllUhidV2,
  getDiagnoseByUhidV2,
  getAllUhidsV2,
  updatePatientDischarge
}
