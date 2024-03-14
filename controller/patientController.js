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
const mongoose = require('mongoose')

/**
 * api      POST @/patient/save-uhid-details
 * desc     @saveUhid for publickly access
 */
const saveUhid = async (req, res) => {
  try {
    const deviceDetails = await RegisterDevice.findOne({DeviceId:req.body.deviceId});
    const patientData = await patientModel.findOneAndUpdate(
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
 * api      POST @/patient/save-uhid-details
 * desc     @saveUhid for publickly access
 */
const saveDiagnose = async (req, res) => {
  try {
    const diagnoseData = await patientModel.findOne({UHID:req.params.UHID});
    const arr1 = diagnoseData.medicalDiagnosis;
    const arr2 = [req.body];
    const finalArr = [...arr1,...arr2];
    
    const patientData = await patientModel.findOneAndUpdate(
      {UHID:req.params.UHID},
      {
        medicalDiagnosis:finalArr
      },
      { upsert: true }
    );
  
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
      // data: patientData
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
    const loggedInUser = await User.findById({_id:verified.user});

    const patientData = await patientModel.findOneAndUpdate(
      {_id:mongoose.Types.ObjectId(req.params.id)},
      {
        UHID:!!(req.body.UHID) ? req.body.UHID : "",
        age:!!(req.body.age) ? req.body.age : "",
        deviceId:!!(req.body.deviceId) ? req.body.deviceId : "",
        weight:!!(req.body.weight) ? req.body.weight : "",
        height:!!(req.body.height) ? req.body.height : "",
        patientName:!!(req.body.patientName) ? req.body.patientName : "",
        hospitalName:!!(loggedInUser.hospitalName) ? loggedInUser.hospitalName : "",
        dosageProvided:!!(req.body.dosageProvided) ? req.body.dosageProvided : "",
        ward_no:!!(req.body.ward_no) ? req.body.ward_no : "",
        doctor_name:!!(req.body.doctor_name) ? req.body.doctor_name : "",
      },
      { upsert: true }
    );
    if (!patientData) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Data not added."
      });
    }
    res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Data added successfully.",
      // data: patientData
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
    // Declare blank object
    // let filterObj = {};
    // if (!!loggedInUser && loggedInUser.userType == "Doctor"|| loggedInUser.userType == "Assistant") {
        
    // }
      // get device list on the basis of user hospital name
      const deviceData = await statusModel.aggregate([
        {
          $lookup:
          {
            from: "registerdevices",
            localField: "deviceId",
            foreignField: "DeviceId",
            as: "deviceInfo"
          }
        },
        {
          $match:{"deviceInfo.Hospital_Name":loggedInUser.hospitalName}
        },
        {
          $project:{
            "createdAt":0, "__v":0, "deviceInfo.__v":0,"deviceInfo.createdAt":0,
            "deviceInfo.updatedAt":0, "deviceInfo.Status":0,
          }
        },
        {
          $sort: { updatedAt:-1 },
        },
      ])

      // get deviceIds
      let deviceIds = deviceData.map((item) => item.deviceId)
      deviceIds = [...new Set(deviceIds)]
      
      // Get patient list
      const getList = await patientModel.find({deviceId:{$in:deviceIds}},{__v:0,createdAt:0,updatedAt:0,})
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
      const getList = await patientModel.find({deviceId:req.params.deviceId},{__v:0,createdAt:0,updatedAt:0})
      .sort({ createdAt: -1 });
      
      // for pagination
      const paginateArray =  (getList, page, limit) => {
        const skip = getList.slice((page - 1) * limit, page * limit);
        return skip;
      }
      
      let allData = paginateArray(getList, page, limit)

      if (!!allData.length>0) {
        return res.status(200).json({
          statusCode: 200,
          statusValue: "SUCCESS",
          message: "Patient list get successfully.",
          data: allData,
          currentData: [allData[0]],
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
 * api      GET @/patient/get-patient-details/:UHID
 * desc     @getDataByUhid for logger access only
 */
const getDataById = async (req, res) => {
  try {
    const getData = await patientModel.findOne({_id:mongoose.Types.ObjectId(req.params.id)},{__v:0,});
    
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
  getAllUhidBydeviceId
}
