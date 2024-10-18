const bcrypt = require('bcrypt');
const { makeId } = require('../helper/helperFunctions');
const JWTR = require('jwt-redis').default;
const Users = require('../model/users');
// const ForgetPassword = require('../model/forgetPassword');
const Email = require('../utils/email');
let redisClient = require('../config/redisInit');
const { validationResult } = require('express-validator');
const verifyUserOrAdmin = require('../middleware/verifyUserOrAdmin');
const mongoose = require('mongoose');

const jwtr = new JWTR(redisClient);
const Joi = require('joi');
const User = require('../model/users');
const sendEmail = require('../helper/sendEmail.js');
const sendInBlueEmail = require('../helper/sendInBlueEmail.js');
const errorHandler = require('../middleware/errorHandler.js');
const {sendOtp} = require('../helper/sendOtp');
const emailVerificationModel = require('../model/emailVerificationModel');
var query = require('india-pincode-search');
const aboutDeviceModel = require('../model/aboutDeviceModel.js');
const productionModel = require('../model/productionModel.js');
const prodActivityLogModel = require('../model/productionActivityLogModel.js');
const dispatchActivityLogModel = require('../model/dispatchActivityLogModel.js');
const fcmTokenModel = require('../model/fcmTockenModel.js');
const fcmNotificationModel = require('../model/fcmNotificationModel.js');


/**
* api      POST @/api/common/send-verification-email
* desc     @sendVerificationEmail for logger access only
*/
const sendVerificationEmail = async (req, res) => {
    try {
        const schema = Joi.object({
          email: Joi.string().email().required(),
        })
        let result = schema.validate(req.body);
        if (result.error) {
            return res.status(400).json({
                statusCode: 400,
                statusValue: "FAIL",
                message: result.error.details[0].message,
            });
        };
        // console.log(req.body)
        const checkStatus = await emailVerificationModel.findOne({email:req.body.email})
        const errors = validationResult(req);
        if(!!checkStatus && checkStatus.status == "Verified") {
          return res.status(400).json({
            statusCode: 400,
            statusValue:"FAIL",
            message:"You have entered wrong credentials. Please enter valid credentials",
            data: {
              err: {
                generatedTime: new Date(),
                errMsg: errors
                  .array()
                  .map((err) => {
                    return `${err.msg}: ${err.param}`;
                  })
                  .join(' | '),
                msg: 'Already Verified',
                type: 'ValidationError',
                statusCode:400,
              },
            },
          });
        }

        var otp = Math.floor(1000 + Math.random() * 9000);
        const saveOtp = await emailVerificationModel.findOneAndUpdate({
            email:req.body.email
        },{
            email:req.body.email,
            otp:otp,
            status:"Notverified"
        }, {upsert: true, new: true});
        if (!saveOtp) {
            return res.status(400).json({
                statusCode: 400,
                statusValue: "FAIL",
                message: "otp not sended.",
            });
        }
        await sendOtp(req.body.email, otp)
        res.status(200).json({
            statusCode: 200,
            statusValue: "SUCCESS",
            message: "Otp send successfully.",
            otp
        });
        
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
* api      POST @/api/common/send-verification-email
* desc     @sendVerificationEmail for logger access only
*/
const sendFcmToken = async (req, res) => {
  try {
      const schema = Joi.object({
        fcmToken: Joi.string().required(),
        userId: Joi.string().required(),
      })
      let result = schema.validate(req.body);
      if (result.error) {
          return res.status(400).json({
              statusCode: 400,
              statusValue: "FAIL",
              message: result.error.details[0].message,
          });
      };
      // // check userId with different fcmToken
      // const checkUserIdWithDiffFcm = await fcmTokenModel.findOne({userId:req.body.userId})
      // if (!!checkUserIdWithDiffFcm) {
        
      // }
      // save fcmToken
      
      const saveData = await fcmTokenModel.findOneAndUpdate({$and:[{fcmToken:req.body.fcmToken},{userId:req.body.userId}]},{fcmToken:req.body.fcmToken, userId:req.body.userId},{upsert:true})
      const checkData = await fcmTokenModel.findOne({userId:req.body.userId})
      let deviceIds = checkData.deviceIds
      deviceIds = [...new Set(deviceIds)]
      // console.log(11, deviceIds)
      await fcmTokenModel.updateMany({userId:req.body.userId},{deviceIds:deviceIds})
      return res.status(200).json({
          statusCode: 200,
          statusValue: "SUCCESS",
          message: "Token has been saved successfully.",
          data:saveData
      });
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
* api      POST @/api/common/verify-otp
* desc     @verifyOtp for logger access only
*/
const verifyOtp = async (req, res) => {
    try {
      const schema = Joi.object({
        otp: Joi.string().required(),
      })
      let result = schema.validate(req.body);
      if (result.error) {
        return res.status(400).json({
          statusCode: 400,
          statusValue: "FAIL",
          message: result.error.details[0].message,
        })
      }
      const checkOtp = await emailVerificationModel.findOne({ otp: req.body.otp });
      const errors = validationResult(req);
      console.log(11,checkOtp)
      if (!checkOtp) {
        return res.status(400).json({
          statusCode: 400,
          statusValue:"FAIL",
          message:"You have entered wrong otp. Please enter valid OTP",
          data: {
            err: {
              generatedTime: new Date(),
              errMsg: errors
                .array()
                .map((err) => {
                  return `${err.msg}: ${err.param}`;})
                  .join(' | '),
              msg: 'Wrong OTP',
              type: 'ValidationError',
              statusCode:400,
            },
          },
        });
        // console.log()
      }
      
      await emailVerificationModel.findOneAndUpdate({otp:req.body.otp},{status:"Verified"})
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


/**
* api      GET @/common/search-by-pincode/:pincode
* desc     @getCountryByPincode for public access
*/
const getCountryByPincode = async (req, res) => {
  try {
    const getData = query.search(req.params.pincode);
    if (getData.length < 1) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Opps something went wrong! Or Invalid pincode.",
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
      message: "Internal server error.",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    });
  }
}


/**
* api      GET @/common/common/get-notification-list/:fcmToken
* desc     @getFcmNotification for public access
*/
const getFcmNotification = async (req, res) => {
  try {
    const getData = await fcmNotificationModel.find({token:req.params.fcmToken}).sort({createdAt:-1}).limit(5);
    if (getData.length < 1) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Or Invalid fcmToken. || or data not found.",
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
      message: "Internal server error.",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    });
  }
}


/**
* api      GET @/common/common/delete-notification-list/:id
* desc     @deleteFcmNotification for public access
*/
const deleteFcmNotification = async (req, res) => {
  try {
    const getData = await fcmNotificationModel.findByIdAndDelete({_id:req.params.id});
    if (!getData) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Opps something went wrong! Or Invalid id.",
      })
    }
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Data deleted successfully.",
      // data:getData,
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
* api      GET @/common/get-serial-number-list
* desc     @getDeviceSerialNumber for public access
*/
const getDeviceSerialNumber = async (req, res) => {
  try {
    const getData = await productionModel.find({serialNumber:{$ne:null}},{serialNumber:1})
    if (getData.length < 1) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Opps something went wrong!",
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
      message: "Internal server error.",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    });
  }
}

/**
* api      GET @/common/get-serial-number-list
* desc     @getDeviceSerialNumber for public access
*/
const getProdLogsData = async (req, res) => {
  try {
    // for aggregate logic
    var pipline = [
      // match
      {"$match":{"serialNumber":req.params.serialNo}},
      {
        "$lookup":{
          "from":"productions",
          "localField":"deviceId",
          "foreignField":"deviceId",
          "as":"prodData"
        }
      },
      {
        "$set":{"prodData":{"$first":"$prodData"}},
      },
      {
        "$unset": [
          "__v",
          "userId",
          // "prodData"
          // "otp",
          // "isVerified",
        ],
      },
    ]
    // get data
    const resData = await prodActivityLogModel.aggregate(pipline)
    var newArr = []
    resData.map((item) => {
      if (!!item.prodData) {
        newArr.push(item.prodData)
      }
    })
    // console.log(newArr)
    
    if (resData.length < 1) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "data not found",
      })
    }
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Data get successfully.",
      data:resData,
      data2:newArr
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
* api      GET @/common/get-serial-number-list
* desc     @getDeviceSerialNumber for public access
*/
const getDispatchLogsData = async (req, res) => {
  try {
    // for aggregate logic
    var pipline = [
      // match
      {"$match":{"serial_no":req.params.serialNo}},
      {
        "$lookup":{
          "from":"about_devices",
          "localField":"deviceId",
          "foreignField":"deviceId",
          "as":"dispatchData"
        }
      },
      {
        "$set":{"dispatchData":{"$first":"$dispatchData"}},
      },
      {
        "$unset": [
          "__v",
          "userId"
          // "otp",
          // "isVerified",
        ],
      },
    ]
    // get data
    const resData = await dispatchActivityLogModel.aggregate(pipline)
    
    if (resData.length < 1) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Opps something went wrong!",
      })
    }
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Data get successfully.",
      data:resData,
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




module.exports = {
    sendVerificationEmail,
    verifyOtp,
    getCountryByPincode,
    getDeviceSerialNumber,
    getProdLogsData,
    getDispatchLogsData,
    sendFcmToken,
    getFcmNotification,
    deleteFcmNotification
}