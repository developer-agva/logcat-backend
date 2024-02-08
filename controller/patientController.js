const Joi = require('joi');
const patientModel = require('../model/patientModel');
const s3PatientFileModel = require('../model/s3PatientFileModel');
let redisClient = require("../config/redisInit");
const User = require('../model/users');
const RegisterDevice = require('../model/RegisterDevice');
const JWTR = require("jwt-redis").default;
const jwtr = new JWTR(redisClient);
// const jwt = require('jsonwebtoken')


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
    console.log(11,req.body)
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
    const patientData = await patientModel.findOneAndUpdate(
      {UHID:req.params.UHID},
      req.body,
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
 * api      GET @/patient/get-allUhid
 * desc     @getAllUhid for logger access only
 */
const getAllUhid = async (req, res) => {
  try {
    // check userType
    const token = req.headers["authorization"].split(' ')[1];
    const verified = await jwtr.verify(token, process.env.JWT_SECRET);  
    
    // for logger user activity
    const loggedInUser = await User.findById({_id:verified.user});
    
    if (loggedInUser.userType == "Admin"||"Nurse"||"Super-Admin") {
      const getList = await patientModel.find({patientName:{$ne:""}},{__v:0,createdAt:0,updatedAt:0,})
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
        message: "Patient list get successfully.",
        data: getList
      })
    }
    return res.status(400).json({
      statusCode: 400,
      statusValue: "FAIL",
      message: "You don't have permission",
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
const getDataByUhid = async (req, res) => {
  try {
    const UHID = req.params.UHID;
    const getData = await patientModel.findOne({UHID:UHID},{__v:0,});
    
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
  getDataByUhid,
  saveDiagnose,
  updatePatientById,
  deletePatientById,
  getDiagnoseByUhid
}
