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
// let redisClient = require("../config/redisInit");
// const JWTR = require("jwt-redis").default;
// const jwtr = new JWTR(redisClient);
require("dotenv").config({ path: "../.env" });
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
      Alias_Name: Joi.string().required()
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
    const getAddTofocusList = await Device.find({addTofocus:true})
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
};

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
    var otp = Math.floor(1000 + Math.random() * 9000);
    // var serialNo = Math.floor(1000 + Math.random() * 9000);
    // for otp sms on mobile
    const twilio = require('twilio');

    const accountSid = process.env.ACCOUNTSID

    const authToken = process.env.AUTHTOKEN
    
    const twilioPhone = process.env.TWILIOPHONE
    
    const contactNo = `+91${req.body.contactNo}`;
    const client = new twilio(accountSid, authToken);

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
    const checkData = await servicesModel.findOne({ $and: [{ deviceId: req.body.deviceId }, { message: req.body.message }, { isVerified: true }] });
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

    const newServices = new servicesModel({
      deviceId: req.body.deviceId,
      message: req.body.message,
      date: req.body.date,
      serialNo: otp,
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
    const savedServices = await newServices.save();

    const getLastData = await servicesModel.find({ contactNo: req.body.contactNo }).sort({ createdAt: -1 });
    // console.log(11, getLastData) 
    if (!!savedServices) {
      await servicesModel.findOneAndUpdate(
        { serialNo: getLastData[0].serialNo },
        {
          otp: getLastData[0].serialNo,
          isVerified: false,
        },
      );
      const sendSms = client.messages
        .create({
          body: `Your AgVa Healthcare registration verification OTP is : ${otp}`,
          from: twilioPhone,
          to: contactNo
        })
        .then(message => console.log(`Message sent with SID: ${message.sid}`))
        .catch(error => console.error(`Error sending message: ${error.message}`));
      if (sendSms) {
        // findlast inserted data
        return res.status(201).json({
          statusCode: 201,
          statusValue: "SUCCESS",
          message: "Data added successfully.",
          otp: otp
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
    var otp = Math.floor(1000 + Math.random() * 9000);
    // var serialNo = Math.floor(1000 + Math.random() * 9000);
    // for otp sms on mobile
    const twilio = require('twilio');
  
    const accountSid = process.env.ACCOUNTSID

    const authToken = process.env.AUTHTOKEN
    
    const twilioPhone = process.env.TWILIOPHONE
    
    const contactNo = `+91${req.body.contactNo}`;
    const client = new twilio(accountSid, authToken);

    const checkTicket = await servicesModel.findById({ _id: mongoose.Types.ObjectId(req.body._id)});
    
    if (!!checkTicket) {
      // console.log(13,otp)
      await servicesModel.findOneAndUpdate(
        { _id: mongoose.Types.ObjectId(req.body._id) },
        {
          otp: otp,
          UID: req.body.UId,
          serviceEngName: req.body.serviceEngName,
        }, { upsert: true },
      );
      const sendSms = client.messages
        .create({
          body: `Your AgVa Healthcare service request verification OTP is : ${otp}`,
          from: twilioPhone,
          to: contactNo
        })
        .then(message => console.log(`Message sent with SID: ${message.sid}`))
        .catch(error => console.error(`Error sending message: ${error.message}`));
      if (sendSms) {
        // findlast inserted data
        return res.status(201).json({
          statusCode: 201,
          statusValue: "SUCCESS",
          message: "OTP has been send successfully.",
          otp: otp
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
        "$sort": { "createdAt": -1 }
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

    // const newStatus = new statusModel(req.body);
    const saveDoc = await statusModelV2.updateMany(
      {
        deviceId: req.body.deviceId
      },
      {
        deviceId: req.body.deviceId,
        message: req.body.message,
        health: req.body.health,
        last_hours: req.body.last_hours,
        total_hours: req.body.total_hours,
        address: req.body.address,
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
    // const errors = validationResult(req);
    // if(!!isSerialNo) {
    //   return res.status(400).json({
    //     statusCode: 400,
    //     statusValue:"FAIL",
    //     message:"This Serial No. already in used.",
    //     data: {
    //       err: {
    //         generatedTime: new Date(),
    //         errMsg: errors
    //           .array()
    //           .map((err) => {
    //             return `${err.msg}: ${err.param}`;
    //           })
    //           .join(' | '),
    //         msg: 'This Serial No. already in used.',
    //         type: 'ValidationError',
    //         statusCode:400,
    //       },
    //     },
    //   });
    // }

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
          otherRef: !!(req.body.otherRef) ? req.body.otherRef : "NA"
        },
        { upsert: true }
      )
      // for update shipmentMode
      await productionModel.findOneAndUpdate({ shipmentMode: "inprocess" })
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
        otherRef: !!(req.body.otherRef) ? req.body.otherRef : "NA"
      },
      { upsert: true }
    );
    await productionModel.findOneAndUpdate({ shipmentMode: "inprocess" })
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
    // console.log(req.body)
    // const saveDispatchData = await aboutDeviceModel.findOneAndUpdate(

    // )
    const saveDispatchData = await aboutDeviceModel.findOneAndUpdate(
      { $or: [{ deviceId: req.body.deviceId }, { serial_no: req.body.serial_no }] },
      req.body,
      { upsert: true }
    )
    // const saveDoc = await saveDispatchData.save();
    if (!saveDispatchData) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Error!! Data not updated."
      });
    }
    // for user logs activity 
    const token = req.headers["authorization"].split(' ')[1];
    const verified = await jwtr.verify(token, process.env.jwtr_SECRET);
    const loggedInUser = await User.findById({ _id: verified.user });
    var bodyData = { ...req.body, email: loggedInUser.email }
    await dispatchActivityLogModel.findOneAndUpdate(bodyData, bodyData, { upsert: true })

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

// get dispatched device location
const trackDeviceLocation = async (req, res) => {
  try {
    const getData = await aboutDeviceModel.find({ deviceId: req.params.deviceId });
    if (getData.length < 1) {
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
      data: getData,
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


let redisClient = require("../config/redisInit");
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
    const verified = await jwtr.verify(token, process.env.jwtr_SECRET);

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
        "userId": mongoose.Types.ObjectId(item),
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
      userId: mongoose.Types.ObjectId(req.body._id),
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
    const data = await assignDeviceTouserModel.find({ userId: mongoose.Types.ObjectId(userId) })
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
    const verified = await jwtr.verify(token, process.env.jwtr_SECRET);
    const loggedInUser = await User.findById({ _id: verified.user }, { firstName: 1, lastName: 1, email: 1, hospitalName: 1, designation: 1, speciality: 1 });
    var pipline = [
      // Match
      {
        "$match": { status: true, userId: mongoose.Types.ObjectId(userId) },
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



const deleteDeviceAccessUser = async (req, res) => {
  try {
    // for logger activity
    // const token = req.headers["authorization"].split(' ')[1];
    // const verified = await jwtrr.verify(token, process.env.jwtr_SECRET);
    // const loggedInUser = await User.findById({_id:verified.user});
    const removeData = await assignDeviceTouserModel.findByIdAndDelete(
      { _id: mongoose.Types.ObjectId(req.params._id) },
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
  deleteDeviceAccessUser,
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
  saveStatusV2
}
