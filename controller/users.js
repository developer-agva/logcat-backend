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
// console.log(11,redisClient)
const Joi = require('joi');
const User = require('../model/users');
const sendEmail = require('../helper/sendEmail.js');
const sendInBlueEmail = require('../helper/sendInBlueEmail.js');
const errorHandler = require('../middleware/errorHandler.js');
const {sendOtp} = require('../helper/sendOtp');
const activityModel = require('../model/activityModel');
const registeredHospitalModel = require('../model/registeredHospitalModel.js');
const assignTicketModel = require('../model/assignTicketModel.js');
const sendSms = require('../helper/sendSms.js');
const otpVerificationModel = require('../model/otpVerificationModel.js');
const aboutDeviceModel = require('../model/aboutDeviceModel');
const sendDeviceReqModel = require('../model/sendDeviceReqModel.js');
const assignDeviceTouserModel = require('../model/assignedDeviceTouserModel.js');
require("dotenv").config({ path: "../.env" });
var unirest = require("unirest");
/**
 * api      POST @/api/logger/register
 * desc     @register for logger access only
 */
const registerUser = async (req, res) => {
  try {
    const schema = Joi.object({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      hospitalName: Joi.string().required(),
      designation:Joi.string().required(),
      department:Joi.string().required(),
      contactNumber:Joi.string().required(),
      email: Joi.string().email().required(),
      passwordHash: Joi.string().min(5).max(10).required(),
      // countryName:Joi.string().required(),
      // stateName: Joi.string().required(),
      speciality:Joi.string().required(),
      userType: Joi.string().required(),
      securityCode : Joi.string().allow("").optional(),
    });
    let result = schema.validate(req.body);
    if (result.error) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: result.error.details[0].message,
      })
    }

    const checkEmail = await User.findOne({ email: req.body.email });
    if (checkEmail) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message:
          "The email is already in use. Please try to login using the email address or sign up with a different email address. ",
      });
    }
    
    // check hospital name
    const checkHospital = await registeredHospitalModel.findOne({Hospital_Name:req.body.hospitalName});
    if (!checkHospital) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Error! Wrong hospital name.",
      });
    }

    // make password encrypted
    const salt = await bcrypt.genSalt();
    let mpwd = await bcrypt.hash(req.body.passwordHash, salt);

    // console.log(11,req.body)
    if (req.body.userType === "Doctor") {
      var securityCode = Math.floor(100000 + Math.random() * 900000);
      const insertData = new User({
        firstName:req.body.firstName,
        lastName:req.body.lastName,
        hospitalName:req.body.hospitalName,
        designation:req.body.designation,
        department:req.body.department,
        contactNumber:req.body.contactNumber,
        email:req.body.email,
        passwordHash:mpwd,
        userType:req.body.userType,
        image:"",
        isSuperAdmin:false,
        accountStatus:"Initial",
        requestedOn:new Date(),
        speciality:req.body.speciality,
        securityCode:securityCode
        // countryName:req.body.countryName,
        // stateName:req.body.stateName
      });
      const saveDoc2 = await insertData.save();
      if (saveDoc2) {
        return res.status(201).json({
          statusCode:201,
          statusValue:"SUCCESS",
          message:"Congratulations! You have successfully signed up with us , Please wait for approval.",
          data:saveDoc2
        })
      }
      return res.status(400).json({
        statusCode:400,
        statusValue:"FAIL",
        message:"Error ! Doctor registration failed.",
      })
    }
    
    // check securityCode
    const checkCode = await User.findOne({securityCode:req.body.securityCode})
    if (!checkCode) {
      return res.status(400).json({
        statusCode:400,
        statusValue:"FAIL",
        message:"Error ! Wrong security code.",
      })
    }
    // console.log(12, req.body)
    const insertData = new User({
      firstName:req.body.firstName,
      lastName:req.body.lastName,
      hospitalName:req.body.hospitalName,
      designation:req.body.designation,
      department:req.body.department,
      contactNumber:req.body.contactNumber,
      email:req.body.email,
      passwordHash:mpwd,
      userType:!!(req.body.userType) ? req.body.userType : "User",
      image:"",
      isSuperAdmin:false,
      accountStatus:"Initial",
      requestedOn:new Date(),
      speciality:req.body.speciality,
      securityCode:req.body.securityCode,
      // countryName:req.body.countryName,
      // stateName:req.body.stateName
    });
    const saveDoc = await insertData.save();
   
    
    // Send the email
    // const emailSubject = "Welcome to our Logcat";
    // const emailText = "Please verify your email id";
    // await sendEmail(insertData.email, emailSubject, emailText);
    // await sendInBlueEmail(insertData.email);
    if (saveDoc) {
      return res.status(201).json({
        statusCode:201,
        statusValue:"SUCCESS",
        message:"Congratulations! You have successfully signed up with us , Please wait for approval.",
        data:saveDoc
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
 * api      POST @/api/logger/register-for-dashboard
 * desc     @registerUserForSuperAdmin for logger access only
 */
const registerUserForSuperAdmin = async (req, res) => {
  try {
    const schema = Joi.object({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      email: Joi.string().email().required(),
      employeeId: Joi.string().required(),
      passwordHash: Joi.string().min(5).max(10).required(),
      countryName:Joi.string().required(),
      stateName: Joi.string().required(),
      userType: Joi.string().required(),
    });
    let result = schema.validate(req.body);
    if (result.error) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: result.error.details[0].message,
      })
    }
    const checkEmail = await User.findOne({ email: req.body.email });
    if (checkEmail) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message:
          "The email is already in use. Please try to login using the email address or sign up with a different email address. ",
      });
    }
    // check hospital name
    // const checkHospital = await registeredHospitalModel.findOne({Hospital_Name:req.body.hospitalName});
    // if (!checkHospital) {
    //   return res.status(400).json({
    //     statusCode: 400,
    //     statusValue: "FAIL",
    //     message: "Error! Wrong hospital name.",
    //   });
    // }
    const salt = await bcrypt.genSalt();
    let mpwd = await bcrypt.hash(req.body.passwordHash, salt);
  
    const insertData = new User({
      firstName:req.body.firstName,
      lastName:req.body.lastName,
      email:req.body.email,
      employeeId:req.body.employeeId,
      passwordHash:mpwd,
      userType:req.body.userType,
      image:"",
      isSuperAdmin:false,
      accountStatus:"Active",
      countryName:req.body.countryName,
      stateName:req.body.stateName
    });
    const saveDoc = await insertData.save();
    // Send the email
    // const emailSubject = "Welcome to our Logcat";
    // const emailText = "Please verify your email id";
    // await sendEmail(insertData.email, emailSubject, emailText);
    // await sendInBlueEmail(insertData.email);
    if (saveDoc) {
      return res.status(201).json({
        statusCode:201,
        statusValue:"SUCCESS",
        message:"Data added successfully.",
        data:saveDoc
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
* api      POST @/api/logger/verify-otp
* desc     @verifyOtpSms for public route
*/
const sendOtpSms = async (req, res) => {
  try {
    const contactNumber = `+91${req.params.contactNumber}`; 
    const number = req.params.contactNumber;
    var otpValue = Math.floor(1000 + Math.random() * 9000);
    const checkOtp = await otpVerificationModel.findOne({ contactNumber: contactNumber });
    const errors = validationResult(req);
    //  console.log(11,checkOtp)

    if (!!checkOtp && checkOtp.isVerified == true) {
      return res.status(400).json({
        statusCode: 400,
        statusValue:"FAIL",
        message:"Contact Number already verified.",
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: errors
              .array()
              .map((err) => {
                return `${err.msg}: ${err.param}`;})
                .join(' | '),
            msg: 'Contact Number already verified.',
            type: 'ValidationError',
            statusCode:400,
          },
        },
      });
      // console.log()
    }
    
    if (!!contactNumber) {
      await otpVerificationModel.findOneAndUpdate(
        {contactNumber:contactNumber},
        {
          contactNumber:contactNumber,
          otp:otpValue,
          isVerified:false,
        },{upsert:true},
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
          return res.status(200).json({
            statusCode:201,
            statusValue:"SUCCESS",
            message:"Otp Sent Successfully.",
            otp:otpValue
          })
        }  
        return res.status(400).json({
          statusCode:400,
          statusValue:"FAIL",
          message:"Otp not sent.",
        })   
    }

    // const twilio = require('twilio');

    // const accountSid = process.env.ACCOUNTSID
    
    // const authToken = process.env.AUTHTOKEN

    // const twilioPhone = process.env.TWILIOPHONE

    // const contactNumber = `+91${req.params.contactNumber}`;
    // const client = new twilio(accountSid, authToken); 

    // var otp = Math.floor(1000 + Math.random() * 9000);
    // // check verified or not
    // const checkOtp = await otpVerificationModel.findOne({ contactNumber: contactNumber });
    // const errors = validationResult(req);
    
    // // console.log(11,checkOtp)
    // if (!!checkOtp && checkOtp.isVerified == true) {
    //   return res.status(400).json({
    //     statusCode: 400,
    //     statusValue:"FAIL",
    //     message:"Contact Number already verified.",
    //     data: {
    //       err: {
    //         generatedTime: new Date(),
    //         errMsg: errors
    //           .array()
    //           .map((err) => {
    //             return `${err.msg}: ${err.param}`;})
    //             .join(' | '),
    //         msg: 'Contact Number already verified.',
    //         type: 'ValidationError',
    //         statusCode:400,
    //       },
    //     },
    //   });
    //   // console.log()
    // }
    // if(!!contactNumber) {
    //   await otpVerificationModel.findOneAndUpdate(
    //     {contactNumber:contactNumber},
    //     {
    //       contactNumber:contactNumber,
    //       otp:otp,
    //       isVerified:false,
    //     },{upsert:true},
    //   );
    //   const sendSms = client.messages
    //         .create({
    //             body: `Your AgVa Healthcare registration verification OTP is : ${otp}`,
    //             from: twilioPhone,
    //             to: contactNumber
    //         })
    //         .then(message => console.log(`Message sent with SID: ${message.sid}`))
    //         .catch(error => console.error(`Error sending message: ${error.message}`));
    //   if (sendSms) {
    //     return res.status(200).json({
    //       statusCode:201,
    //       statusValue:"SUCCESS",
    //       message:"Otp Send Successfully.",
    //       otp:otp
    //     })
    //   }  
    //   return res.status(400).json({
    //     statusCode:400,
    //     statusValue:"FAIL",
    //     message:"Otp not sened.",
    //   })   
    // }
    
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
* api      POST @/api/logger/verify-otp
* desc     @verifyOtpSms for public route
*/
const verifyOtpSms = async (req, res) => {
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
    const checkOtp = await otpVerificationModel.findOne({ otp: req.body.otp });
    const errors = validationResult(req);
    // remove +91 from contactNumber
    var phoneNumberWithCountryCode = checkOtp.contactNumber;
    var phoneNumberWithoutCountryCode = phoneNumberWithCountryCode.replace('+91', '');

    // console.log(11,checkOtp)
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
    if (checkOtp.isVerified == true) {
      return res.status(400).json({
        statusCode: 400,
        statusValue:"FAIL",
        message:"Contact Number already verified.",
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: errors
              .array()
              .map((err) => {
                return `${err.msg}: ${err.param}`;})
                .join(' | '),
            msg: 'Contact Number already verified.',
            type: 'ValidationError',
            statusCode:400,
          },
        },
      });
      // console.log()
    }
    
    await otpVerificationModel.findOneAndUpdate({otp:req.body.otp},{isVerified:true})
    await Users.findOneAndUpdate({contactNumber:phoneNumberWithoutCountryCode},{otp:req.body.otp,accountStatus:"Active"})
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
 *
 * @param {email, passwordHash} req
 * @param {token} res
 * @api     POST @/api/logger/login
 */
const loginUser = async (req, res) => {
  try {
    const { email, passwordHash } = req.body;
    // console.log(process.env.JWT_SECRET)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
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
            msg: 'Invalid data entered.',
            type: 'ValidationError',
          },
        },
      });
    }

    const isUserExist = await Users.findOne({ email: email});
    // const isUserExist = await Users.findOne({ email: email, accountStatus:"Approved" });   
    if (!isUserExist) {
      return res.status(404).json({
        statusCode: 404,
        statusValue:"FAIL",
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'User does not exist',
            msg: 'User does not exist',
            type: 'User does not exist',
          },
        },
      });
    }
    if (isUserExist.accountStatus !== "Active") {
      return res.status(404).json({
        statusCode: 404,
        statusValue:"FAIL",
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Your account is not active.',
            msg: 'Your account is not active',
            type: 'Your account is not active',
          },
        },
      });
    }
    const isPasswordCorrect = await bcrypt.compare(
      passwordHash,
      isUserExist.passwordHash
    );
    if (!isPasswordCorrect) {
      return res.status(401).json({
        statusCode: 401,
        statusValue:"FAIL",
        message:"You have entered wrong credentials ! please enter correct credentials.",
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Password is incorrect',
            msg: 'Password is incorrect',
            type: 'Internal Server Error',
          },
        },
      });
    }
    const getAddr = await registeredHospitalModel.findOne({Hospital_Name:isUserExist.hospitalName})
    const id = { user: isUserExist._id };
    const token = await jwtr.sign(id, process.env.JWT_SECRET, {
      expiresIn: '15d',
    });
    await Users.findByIdAndUpdate({_id:isUserExist._id},{lastLogin:new Date()},{upsert:true});
    // console.log(token)
    // req.session.user = {
    //   name:isUserExist._id
    // }
    // console.log(123, req.session.user);
    // await sendSms();
    return res.status(200).json({
      statusCode: 200,
      statusValue:"SUCCESS",
      message: `Logged in Successfully!`,
      data2: req.user,
      data: {
        _id:isUserExist._id,
        token: token,
        name: `${isUserExist.firstName ? isUserExist.firstName : ""} ${ isUserExist.lastName ? isUserExist.lastName : ""}`,
        email: isUserExist.email,
        hospitalName:isUserExist.hospitalName,
        hospitalAddress:!!(getAddr) ? getAddr.Hospital_Address : "",
        image: isUserExist.image,
        userType:isUserExist.userType,
        isSuperAdmin: isUserExist.isSuperAdmin,
        userStatus:isUserExist.userStatus,
        securityCode:isUserExist.securityCode,
        designation:!!(isUserExist.designation) ? isUserExist.designation : "",
        contactNumber:!!(isUserExist.contactNumber) ? isUserExist.contactNumber : "",
        speciality:!!(isUserExist.speciality) ? isUserExist.speciality : "", 
        accessHospital:!!(isUserExist.accessHospital) ? isUserExist.accessHospital : ""
      }
    });
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message: "Internal server error!",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      },
    });
  }
};


/**
 * api      POST @/api/logger/users/add-experience
 * desc     @addUserExperience individual users
 */
const addUserExperience = async (req, res) => {
  try {
    const schema = Joi.object({
      userId: Joi.string().required(),
      associationName: Joi.string().required(),
      // workAddress: Joi.string().allow("").optional(),
      // startDate: Joi.string().required(),
      // endDate: Joi.string().allow("").optional(),
      workEmail: Joi.string().required(),
      workPhoneNo: Joi.string().required(),
      designation: Joi.string().required(),
      department: Joi.string().required(),
      // workType: Joi.string().required(),
      skills: Joi.string().allow("").optional(),
    })
    let result = schema.validate(req.body);
    if (result.error) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: result.error.details[0].message,
      })
    }
    const checkUser = await Users.findOne({_id:mongoose.Types.ObjectId(req.body.userId)})
    // console.log(11,checkUser.profile)
    if (!checkUser) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "User id does not exist",
      })
    }
    // find Hospital details
    const hospitalData = await registeredHospitalModel.findOne({Hospital_Name:req.body.associationName});
    if (!hospitalData) {
      // console.log(hospitalData)
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Invalid Hospital name."
      })
    }
    const checkData = await Users.findOne({
      "_id":mongoose.Types.ObjectId(req.body.userId),
      "profile.associationName":req.body.associationName,
    })
    // console.log(checkUser)
    if (!!checkData) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: `Association ${req.body.associationName} already added.`,
      })
    }
    let bodyObj = {
      userId:req.body.userId,
      associationName:req.body.associationName,
      workAddress:!!(hospitalData.Hospital_Address) ? `${hospitalData.Hospital_Address}, ${hospitalData.State}, ${hospitalData.City}, ${hospitalData.Pincode}` : "",
      startDate: new Date(),
      endDate:"",
      workEmail:req.body.workEmail,
      workPhoneNo:req.body.workPhoneNo,
      designation:req.body.designation,
      department:req.body.department,
      skills:""
    }
    // console.log("_id :", req.body._id, Users._id)
    const updateUser = await Users.findByIdAndUpdate(
      {_id:mongoose.Types.ObjectId(req.body.userId)},
      {$push:{profile:bodyObj}},
      { upsert:true }
    );
    if (!updateUser) {
      return res.status(404).json({
        statusCode: 404,
        statusValue:"FAIL",
        message:"Error! while adding work experience."
      });
    }
    await Users.findByIdAndUpdate({_id:mongoose.Types.ObjectId(req.body.userId)},{$push:{accessHospital:req.body.associationName}},{upsert:true})
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: 'Work experience added successfully!',
      data: updateUser
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
};

/**
 * api      PUT @/api/logger/users/update-primary-email
 * desc     @endAssociation individual users
 */
const updatePrimaryEmail = async (req, res) => {
  try {
    const schema = Joi.object({
      userId: Joi.string().required(),
      email : Joi.string().required()
    })
    let result = schema.validate(req.body);
    if (result.error) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: result.error.details[0].message,
      })
    }

    const checkUser = await Users.findOne({
      "_id":mongoose.Types.ObjectId(req.body.userId)
    })
    // console.log(checkUser)
    if (!checkUser) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Wrong !! userId.",
      })
    }
    const updateUser = await Users.findOneAndUpdate(
      {
        "_id":mongoose.Types.ObjectId(req.body.userId)
      },
      {
        "email":req.body.email
      },
    );
    if (!updateUser) {
      return res.status(404).json({
        statusCode: 404,
        statusValue:"FAIL",
        message:"Error! while updating primary email."
      });
    }
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: 'Primary email updated successfully!',
      data: updateUser
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
};


/**
 * api      PUT @/api/logger/users/end-association
 * desc     @endAssociation individual users
 */
const endAssociation = async (req, res) => {
  try {
    const schema = Joi.object({
      userId: Joi.string().required(),
      profileId : Joi.string().required()
    })
    let result = schema.validate(req.body);
    if (result.error) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: result.error.details[0].message,
      })
    }

    const checkUser = await Users.findOne({
      "_id":mongoose.Types.ObjectId(req.body.userId),
      "profile._id":mongoose.Types.ObjectId(req.body.profileId)
    })
    // console.log(checkUser)
    if (!checkUser) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Wrong !! userId or profileId.",
      })
    }
    var updateData = {
      $set: {
        "profile.$.endDate": new Date(),
      }
    };
    const updateUser = await Users.updateOne(
      {
        "_id":mongoose.Types.ObjectId(req.body.userId),
        "profile._id":mongoose.Types.ObjectId(req.body.profileId)
      },
      updateData
    );
    if (!updateUser) {
      return res.status(404).json({
        statusCode: 404,
        statusValue:"FAIL",
        message:"Error! while adding end association."
      });
    }
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: 'Association end date added successfully!',
      data: updateUser
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
};


/**
 * api      PUT @/api/logger/users/update-experience
 * desc     @updateUserExperience individual users
 */
const updateUserExperience = async (req, res) => {
  try {
    const schema = Joi.object({
      userId: Joi.string().required(),
      profileId : Joi.string().required(),
      associationName: Joi.string().required(),
      workAddress: Joi.string().allow().optional(),
      workEmail: Joi.string().required(),
      workPhoneNo: Joi.string().required(),
      designation: Joi.string().required(),
      department: Joi.string().required(),
      // startDate: Joi.string().required()
    })
    let result = schema.validate(req.body);
    if (result.error) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: result.error.details[0].message,
      })
    }
   
    const checkUser = await Users.findOne({
      "_id":mongoose.Types.ObjectId(req.body.userId),
      "profile._id":mongoose.Types.ObjectId(req.body.profileId)
    })
    // check hospital
    const hospitalData = await registeredHospitalModel.findOne({Hospital_Name:req.body.associationName});
    if (!hospitalData) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Wrong !! Invalid hospital name.",
      })
    }
    // console.log(checkUser)
    if (!checkUser) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Wrong !! userId or profileId.",
      })
    }
    var updateData = {
      $set: {
          "profile.$.userId": mongoose.Types.ObjectId(req.body.userId),
          "profile.$._id": mongoose.Types.ObjectId(req.body.profileId),
          "profile.$.associationName": req.body.associationName,
          "profile.$.workAddress": !!hospitalData ? `${hospitalData.Hospital_Address}, ${hospitalData.State}, ${hospitalData.City}, ${hospitalData.Pincode}` : "",
          // "profile.$.startDate": req.body.startDate,
          // "profile.$.endDate": req.body.endDate,
          "profile.$.workEmail": req.body.workEmail,
          "profile.$.workPhoneNo": req.body.workPhoneNo,
          "profile.$.designation": req.body.designation,
          "profile.$.department": req.body.department,
          // "profile.$.workType": !!(req.body.workType) ? req.body.workType : "",
          // "profile.$.skills": !!(req.body.skills) ? req.body.skills : "",
      }
    };
    const updateUser = await Users.updateOne(
      {
        "_id":mongoose.Types.ObjectId(req.body.userId),
        "profile._id":mongoose.Types.ObjectId(req.body.profileId)
      },
      updateData
    );
    if (!updateUser) {
      return res.status(404).json({
        statusCode: 404,
        statusValue:"FAIL",
        message:"Error! while updating work experience."
      });
    }
    if (!!(req.body.associationName)) {
      await Users.findByIdAndUpdate({_id:mongoose.Types.ObjectId(req.body.userId)},{$push:{accessHospital:req.body.associationName}},{upsert:true})
    }
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: 'Work details updated successfully!',
      data: updateUser
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
};


/**
 * api      PUT @/api/logger/users/update-experience
 * desc     @updateUserExperience individual users
 */
const updateUserExperiencee = async (req, res) => {
  try {
    const schema = Joi.object({
      userId: Joi.string().required(),
      profileId : Joi.string().required(),
      associationName: Joi.string().required(),
      workAddress: Joi.string().required(),
      startDate: Joi.string().required(),
      endDate: Joi.string().required(),
      workEmail: Joi.string().required(),
      workPhoneNo: Joi.string().required(),
      designation: Joi.string().required(),
      department: Joi.string().required(),
      workType: Joi.string().allow("").optional(),
      skills: Joi.string().allow("").optional(),
    })
    let result = schema.validate(req.body);
    if (result.error) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: result.error.details[0].message,
      })
    }

    const checkUser = await Users.findOne({
      "_id":mongoose.Types.ObjectId(req.body.userId),
      "profile._id":mongoose.Types.ObjectId(req.body.profileId)
    })
    // console.log(checkUser)
    if (!checkUser) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Wrong !! userId or profileId.",
      })
    }
    var updateData = {
      $set: {
          "profile.$.userId": mongoose.Types.ObjectId(req.body.userId),
          "profile.$._id": mongoose.Types.ObjectId(req.body.profileId),
          "profile.$.associationName": req.body.associationName,
          "profile.$.workAddress": req.body.workAddress,
          "profile.$.startDate": req.body.startDate,
          "profile.$.endDate": req.body.endDate,
          "profile.$.workEmail": req.body.workEmail,
          "profile.$.workPhoneNo": req.body.workPhoneNo,
          "profile.$.designation": req.body.designation,
          "profile.$.department": req.body.department,
          "profile.$.workType": !!(req.body.workType) ? req.body.workType : "",
          "profile.$.skills": !!(req.body.skills) ? req.body.skills : "",
      }
    };
    const updateUser = await Users.updateOne(
      {
        "_id":mongoose.Types.ObjectId(req.body.userId),
        "profile._id":mongoose.Types.ObjectId(req.body.profileId)
      },
      updateData
    );
    if (!updateUser) {
      return res.status(404).json({
        statusCode: 404,
        statusValue:"FAIL",
        message:"Error! while updating work experience."
      });
    }
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: 'Work details updated successfully!',
      data: updateUser
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
};


/**
 * api      PUT @/api/logger/users/update
 * desc     @updateUserProfile individual users
 */
const updateUserProfile = async (req, res) => {
  try {
    let {userId, name, email} = req.body;
    let arr = name.split(" ");
    const checkUser = await Users.findOne({_id:mongoose.Types.ObjectId(req.body.userId)})
    // console.log("_id :", req.body._id, Users._id)
    const updateUser = await Users.findByIdAndUpdate({_id:mongoose.Types.ObjectId(req.body.userId)},{
      firstName:arr[0]? arr[0] : checkUser.firstName,
      lastName:arr[1]? arr[1] : checkUser.lastName,
      email:req.body.email,
    }, { new:true });
    if (!updateUser) {
      return res.status(404).json({
        statusCode: 404,
        statusValue:"FAIL",
        message:"Error! while updating profile."
      });
    }
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: 'Profile details updated successfully!',
      data: updateUser
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
};

// const userForgetPassword = async (req, res) => {
//   try {
//     const { email } = req.body;

//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         status: 0,
//         data: {
//           err: {
//             generatedTime: new Date(),
//             errMsg: errors
//               .array()
//               .map((err) => {
//                 return `${err.msg}: ${err.param}`;
//               })
//               .join(' | '),
//             msg: 'Invalid data entered.',
//             type: 'ValidationError',
//           },
//         },
//       });
//     }

//     const user = await Users.findOne({ email });

//     if (!user) {
//       return res.status(404).json({
//         status: 0,
//         data: {
//           err: {
//             generatedTime: new Date(),
//             errMsg: 'Email does not exist!',
//             msg: 'Email does not exist!',
//             type: 'Internal Server Error',
//           },
//         },
//       });
//     }

//     const otp = makeId(6);

//     // store email in ForgetPassword Model
//     const store = await new ForgetPassword({
//       email: user.email,
//       otp,
//       user: user._id,
//     });

//     const storeOTP = await store.save(store);
//     if (!storeOTP) {
//       return res.status(500).json({
//         status: 0,
//         data: {
//           err: {
//             generatedTime: new Date(),
//             errMsg: 'Otp not send.',
//             msg: 'Otp not send.',
//             type: 'Internal ServerError',
//           },
//         },
//       });
//     }

//     const url = `${otp}`;

//     new Email(email, url).forgetPassword();

//     return res
//       .status(200)
//       .json({ success: true, message: `Email send to you!` });
//   } catch (err) {
//     return res.status(500).json({
//       status: -1,
//       data: {
//         err: {
//           generatedTime: new Date(),
//           errMsg: err.stack,
//           msg: err.message,
//           type: err.name,
//         },
//       },
//     });
//   }
// };

/**
 * @desc        Reset password
 * @Endpoint    Post @/api/users/resetPasemailsword
 * @access      Token access
 */
const resetForgetPassword = async (req, res) => {
  try {
    const schema = Joi.object({
      email: Joi.string().required(),
    })
    let result = schema.validate(req.body);
    if (result.error) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: result.error.details[0].message,
      });
    };
    const checkUser = await Users.findOne({email:req.body.email});
    const errors = validationResult(req);
    if (!checkUser) {
      return res.status(400).json({
        statusCode: 400,
        statusValue:"FAIL",
        message:"User does not exixts",
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: errors
              .array()
              .map((err) => {
                return `${err.msg}: ${err.param}`;})
                .join(' | '),
            msg: 'User does not exixts',
            type: 'ValidationError',
            statusCode:400,
          },
        },
      });
    }
    var otp = Math.floor(1000 + Math.random() * 9000);
    const saveOtp = await Users.findByIdAndUpdate(
      {_id:checkUser._id},
      {otp:otp},
      {upsert:true}
    );
    await sendOtp(checkUser.email, otp)
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


const verifyOtp = async (req, res) => {
  try {
    // console.log(req.body)
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
    // console.log()
    const checkOtp = await Users.find({ otp:req.body.otp });
    // console.log(checkOtp)
    const errors = validationResult(req);
    // console.log(errors)
    if (checkOtp.length<1) {
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
    } else {
      res.status(200).json({
        statusCode: 200,
        statusValue: "SUCCESS",
        message: "Otp verified successfully."
      })
    }
    
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
 * @desc - logger access only
 * @api - /api/logger/auth/generate-newpassword
 * @method - PUT
 */
const generateNewPassword = async (req, res) => {
  try {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      passwordHash: Joi.string().required()
    })
    let result = schema.validate(req.body);
    if (result.error) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: result.error.details[0].message,
      })
    }
    const salt = await bcrypt.genSalt();
    let mpwd = await bcrypt.hash(req.body.passwordHash, salt);
    const updateUser = await Users.findOneAndUpdate(
      {email:req.body.email},
      {passwordHash:mpwd},
      {upsert:true}
    )
    // console.log("_id :", req.body._id, Users._id)
    if (!updateUser) {
      return res.status(404).json({
        statusCode: 404,
        statusValue:"FAIL",
        message:"Error! while generate new password."
      });
    }
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: 'User details updated successfully!',
      data: updateUser
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
};


/**
 * @desc - logger access only
 * @api - /api/logger/logs/logout
 * @method - POST
 */
const logoutUser = async (req, res) => {
  try {
    const gettoken = req.headers["authorization"].split(" ")[1];
    const data = await jwtr.destroy(req.jti);
    // console.log(1234, data)
    // console.log(jwtr);
    if (data) {
      return res.status(200).json({ 
        status: 200, 
        statusValue: "SUCCESS", 
        message: 'Logged out successfully!' });
    }
    return res.status(400).json({
      statusCode: 400,
      statusValue:"FAIL",
      message:"User not loggedin!"
    })
  } catch (err) {
    return res.status(500).json({
      status: 500,
      statusValue:"FAIL",
      data:{
        file:"users/logoutUser",
        name:err.name,
        error:err.stack,
      }
    });
  }
};


/**
 * @desc - update your passwrd
 * @api - PUT /api/logger/users/changepassword
 * @returns json data
 */
const userPasswordChange = async (req, res) => {
  try {
    const schema = Joi.object({
      _id: Joi.string().required(),
      currentPassword: Joi.string().required(),
      newPasswordHash: Joi.string().min(3).max(15).required(),
    })
    let result = schema.validate(req.body);
    if (result.error) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: result.error.details[0].message,
      })
    }

    const isUserExist = await Users.findById({ _id: mongoose.Types.ObjectId(req.body._id)})
    if (!isUserExist) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "User does not exist with this user id"
      })
    }
    const isPasswordCorrect = await bcrypt.compare(
      req.body.currentPassword,
      isUserExist.passwordHash
    );
    
    if (!isPasswordCorrect) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Incorrect current password!! enter correct current password."
      })
    }
    const salt = await bcrypt.genSalt();
    let mpwd = await bcrypt.hash(req.body.newPasswordHash, salt);
    const updateDoc = await Users.findByIdAndUpdate(
      { _id: mongoose.Types.ObjectId(req.body._id) },
      { passwordHash: mpwd }
    )
    res.status(200).json({
      statusCode: 200,
      statusValue: "FAIL",
      message: "Password has been changed successfully.",
      data: updateDoc
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
 * @desc - get user profile by userId
 * @api - GET /api/logger/users/userId 
 * @returns json data
 */
const getUserProfileById = async (req, res) => {
  try {
    let userData = {}
    userData = await Users.findById({_id:req.params.userId})
    .select({createdAt:0, updatedAt:0, __v:0, otp:0});

    let profile = userData.profile
  
    profile.sort((a, b) => {
      // Convert string dates to Date objects
      const endDateA = new Date(a.endDate);
      const endDateB = new Date(b.endDate);
  
      // Handle cases where endDate is empty
      if (!a.endDate) return -1; // a comes first
      if (!b.endDate) return 1; // b comes first
  
      // Compare endDate values
      return  endDateB - endDateA;
    });
  
    if (!userData) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "User not found!"
      })
    } 
    return res.status(200).json({
      statusCode: 200,
      statusValue:"SUCCESS",
      message:"Get user profile successfully!",
      // data:userData
      data:{
        _id:userData._id,
        firstName:userData.firstName,
        lastName:userData.lastName,
        email:userData.email,
        hospitalName:userData.hospitalName,
        designation:userData.designation,
        contactNumber:userData.contactNumber,
        department:userData.department,
        speciality:userData.speciality,
        passwordHash:userData.passwordHash,
        profile:profile,
      }
    });

  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message:"Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    })
  }
}

/**
 * @desc - get user profile experience by Id
 * @api - GET /api/logger/users/userId 
 * @returns json data
 */
const getUserProfileByExpId = async (req, res) => {
  try {
    const token = req.headers["authorization"].split(' ')[1];
    const verified = await jwtr.verify(token, process.env.JWT_SECRET);
    const loggedInUser = await User.findById({_id:verified.user});
    // console.log(loggedInUser.profile)
    const profileData = loggedInUser.profile;
    // const getData = await profileData.find(ele => )
    var finalData = profileData.find((obj) => {
      if (obj._id == req.params.id) {
        return obj;
      }
    }
    );
    // console.log(11,finalData)
    if (!!finalData) {
      return res.status(200).json({
        statusCode: 200,
        statusValue:"SUCCESS",
        message:"Get user profile successfully!",
        data:finalData
      });
    } 
    return res.status(400).json({
      statusCode: 400,
      statusValue: "FAIL",
      message: "User not found!"
    })
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message:"Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    })
  }
}


/**
 * @desc - get user status by email
 * @api - GET /api/logger/user-status/:email
 * @returns json data
 */
const getUserStatus = async (req, res) => {
  try {
    // console.log(req.params)
    const userData = await Users.findOne({email:req.params.email})
    .select({createdAt:0, updatedAt:0, __v:0, otp:0});
    if (!userData) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "User not found!"
      })
    } 
    return res.status(200).json({
      statusCode: 200,
      statusValue:"SUCCESS",
      message:"Get user data successfully!",
      data:userData
    });

  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      statusValue: "FAIL",
      message:"Internal server error",
      data: {
        generatedTime: new Date(),
        errMsg: err.stack,
      }
    })
  }
}


/**
 * @desc - get all activities
 * @api - /api/logger/users/user-activity
 * @returns json data
 */
const getActivity = async (req, res) => {
  try {
    // for search
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
      limit = 9999;
    }
    const skip = page > 0 ? (page - 1) * limit : 0

    const getData = await activityModel.find({email:{ $regex: ".*" + search + ".*", $options: "i" }})
    .select({_id:0,__v:0,updatedAt:0})
    .sort({createdAt:-1})
    .skip(skip)
    .limit(limit);
    
    const count = await activityModel.find({email:{ $regex: ".*" + search + ".*", $options: "i" }})
    .sort({createdAt:-1})
    .countDocuments();

    if (getData.length>0) {
      return res.status(200).json({
        statusCode:200,
        statusValue:"SUCCESS",
        message:"Users activity list get successfully.",
        data:getData,
        totalDataCount: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page
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
 * @desc - get all users
 * @api - /api/logger/users-list
 * @returns json data
 */
const getAllUsers = async (req, res) => {
  try {
    // for checking user roles
    const token = req.headers["authorization"].split(' ')[1];
    const verified = await jwtr.verify(token, process.env.JWT_SECRET);
    // console.log(123, verified.user)
    const checkUser = await User.findById({_id:verified.user})
  
    // Pagination
    let { page, limit } = req.query;
    if (!page || page === "undefined") {
      page = 1;
    }
    if (!limit || limit === "undefined" || parseInt(limit) === 0) {
      limit = 1000;
    }
    const skip = page > 0 ? (page - 1) * limit : 0

    // Initialize empty obj
    // let filterObj = {};
    // // check user role
    if (checkUser.userType == "Hospital-Admin") {
      const getUsers = await User.find({$and:[{hospitalName:checkUser.hospitalName},{userType:"User"},{accountStatus:{$ne:"Initial"}}]})
      .select({ passwordHash: 0, __v: 0, createdAt: 0, updatedAt: 0, otp: 0 })
      .sort({createdAt:-1})
      .skip(skip)
      .limit(limit);

      const count = await User.find({$and:[{hospitalName:checkUser.hospitalName},{userType:"User"},{accountStatus:{$ne:"Initial"}}]})
      .sort({createdAt:-1})
      .countDocuments();

      if (getUsers.length>0) {
        return res.status(200).json({
          statusCode:200,
          statusValue:"SUCCESS",
          message:"Users list get successfully.",
          data:getUsers,
          totalDataCount: count,
          totalPages: Math.ceil(count / limit),
          currentPage: page
        })
      }
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Data not found.",
        data: []
      })
    } else {
      const getUsers = await User.find({$and:[{userType:"User"},{accountStatus:{$ne:"Initial"}}]})
      .select({ passwordHash: 0, __v: 0, createdAt: 0, updatedAt: 0, otp: 0 })
      .sort({createdAt:-1})
      .skip(skip)
      .limit(limit);

      const count = await User.find({$and:[{userType:"User"},{accountStatus:{$ne:"Initial"}}]})
      .sort({createdAt:-1})
      .countDocuments();

      if (getUsers.length>0) {
        return res.status(200).json({
          statusCode:200,
          statusValue:"SUCCESS",
          message:"Users list get successfully.",
          data:getUsers,
          totalDataCount: count,
          totalPages: Math.ceil(count / limit),
          currentPage: page
        })
      }
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Data not found.",
        data: []
      })
    }
    // filterObj = {$and:[{userType:"User"},{accountStatus:{$ne:"Initial"}}]}
    
    
    // Count 
   

    
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
 * @desc - get all employee list
 * @api - /api/logger/employee-list
 * @returns json data
 */
const getAllEmployeeList = async (req, res) => {
  try {
    // for checking user roles
    const token = req.headers["authorization"].split(' ')[1];
    const verified = await jwtr.verify(token, process.env.JWT_SECRET);
    // console.log(123, verified.user)
    const checkUser = await User.findById({_id:verified.user})
  
    // Pagination
    let { page, limit } = req.query;
    if (!page || page === "undefined") {
      page = 1;
    }
    if (!limit || limit === "undefined" || parseInt(limit) === 0) {
      limit = 1000;
    }
    const skip = page > 0 ? (page - 1) * limit : 0

    // Initialize empty obj
    // let filterObj = {};
    // check user role
    // if (checkUser.userType == "Hospital-Admin") {
    //   filterObj = {$and:[{hospitalName:checkUser.hospitalName},{userType:"User"},{accountStatus:{$ne:"Initial"}}]}
    // }
    // filterObj = {$and:[{userType:"User"},{accountStatus:{$ne:"Initial"}}]}
    const getUsers = await User.find({$or:[{userType:"Production"},{userType:"Dispatch"},{userType:"Service-Engineer"},{userType:"Support"},{userType:"Accounts"}]})
    .select({ passwordHash: 0, __v: 0, createdAt: 0, updatedAt: 0, otp: 0 })
    .sort({createdAt:-1})
    .skip(skip)
    .limit(limit);
    
    // Count 
    const count = await User.find({$or:[{userType:"Production"},{userType:"Dispatch"},{userType:"Service-Engineer"},{userType:"Support"},{userType:"Accounts"}]})
    .sort({createdAt:-1})
    .countDocuments();

    if (getUsers.length>0) {
      return res.status(200).json({
        statusCode:200,
        statusValue:"SUCCESS",
        message:"Users list get successfully.",
        data:getUsers,
        totalDataCount: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page
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
 * @desc - get all active users
 * @api - /api/logger/active-users-list
 * @returns json data
 */
const getAssistantList = async (req, res) => {
  try {

    // Pagination
    let { page, limit } = req.query;
    if (!page || page === "undefined") {
      page = 1;
    }
    if (!limit || limit === "undefined" || parseInt(limit) === 0) {
      limit = 1000;
    }
    const skip = page > 0 ? (page - 1) * limit : 0

    // for checking user roles
    const token = req.headers["authorization"].split(' ')[1];
    const verified = await jwtr.verify(token, process.env.JWT_SECRET);
    // console.log(123, verified.user)
    const checkUser = await User.findById({ _id: verified.user })

    // Initialize variable
    let getAssistantList;
    if (checkUser.userType == "Super-Admin") {
      getAssistantList = await User.find({
        $and: [
          // { securityCode: checkUser.securityCode },
          {
            $or: [
              { userType: "Assistant" },
              { userType: "Doctor" },
              { userType: "Hospital-Admin" }
            ]
          },
          { accountStatus: "Active" }
        ]
      })
      .select({ passwordHash: 0, __v: 0, createdAt: 0, updatedAt: 0, otp: 0 })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
       
      const count = await User.find({$and: [{$or: [{ userType: "Assistant" },{ userType: "Doctor" },{ userType: "Hospital-Admin" }]},{ accountStatus: "Active" }]
      })
      .select({ passwordHash: 0, __v: 0, createdAt: 0, updatedAt: 0, otp: 0 })
      .sort({ createdAt: -1 })
      .countDocuments();

      // listing the users
      if (getAssistantList.length > 0) {
        return res.status(200).json({
          statusCode: 200,
          statusValue: "SUCCESS",
          message: "Assistant list get successfully.",
          data: getAssistantList,
          // data2: !!assignedAstList ? getAssistantList : []
          totalDataCount: count,
          totalPages: Math.ceil(count / limit),
          currentPage: page
        })
      }
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Data not found.",
        data: []
      })
    }
    // Get users on the basis of role
    getAssistantList = await User.find({
        $and: [
          { securityCode: checkUser.securityCode },
          {
            $or: [
              { userType: "Assistant" }
            ]
          },
          { accountStatus: "Active" }
        ]
      })
      .select({ passwordHash: 0, __v: 0, createdAt: 0, updatedAt: 0, otp: 0 })
      .sort({ createdAt: -1 })
      .limit(1);

    const astId = getAssistantList[0]
    let assignedAstList = await assignDeviceTouserModel.findOne({assistantId:astId._id})

    // console.log(11, assignedAstList)
    // const assignedAstList = await assignDeviceTouserModel.find({$and:[{userId:checkUser._id},{assistantId:{$ne:""}}]})
    // // console.log(12, assignedAstList)
    // let filteredArray = []
    // if(!!assignedAstList) {
    //   filteredArray = getUsers.filter(obj1 => assignedAstList.some(obj2 => (obj1._id != obj2.assistantId ||obj2 == undefined)))
    // }
    // filteredArray = getUsers
    // console.log(13,filteredArray)


    if (getAssistantList.length > 0) {
      return res.status(200).json({
        statusCode: 200,
        statusValue: "SUCCESS",
        message: "Assistant list get successfully.",
        data: getAssistantList,
        data2: !!assignedAstList ? getAssistantList : []
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
 * @desc - get all active users
 * @api - /api/logger/active-users-list
 * @returns json data
 */
const getAllActiveUSers = async (req, res) => {
  try {
    // for checking user roles
    const token = req.headers["authorization"].split(' ')[1];
    const verified = await jwtr.verify(token, process.env.JWT_SECRET);
    // console.log(123, verified.user)
    const checkUser = await User.findById({ _id: verified.user })

    // Pagination
    let { page, limit } = req.query;
    if (!page || page === "undefined") {
      page = 1;
    }
    if (!limit || limit === "undefined" || parseInt(limit) === 0) {
      limit = 1000;
    }
    const skip = page > 0 ? (page - 1) * limit : 0

    // Initialize variables
    let getUsers
    let count

    // Get users on the basis of role
    if (checkUser.userType == "Doctor") {
      getUsers = await User.find({
        $and: [
          { hospitalName: checkUser.hospitalName },
          {
            $or: [
              { userType: "User" },
              { userType: "Assistant" }
            ]
          },
          { accountStatus: "Active" }
        ]
      })
        .select({ passwordHash: 0, __v: 0, createdAt: 0, updatedAt: 0, otp: 0 })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      // count users
      count = await User.find({
        $and: [
          { hospitalName: checkUser.hospitalName },{ $or: [{ userType: "User" },{ userType: "Assistant" }] },{ accountStatus: "Active" }
        ]
      })
        .sort({ createdAt: -1 })
        .countDocuments();

    } else if (checkUser.userType == "Hospital-Admin") {
      getUsers = await User.find({
        $and: [
          { hospitalName: checkUser.hospitalName },
          {
            $or: [
              { userType: "User" },
              { userType: "Assistant" },
              { userType: "Doctor" }
            ]
          },
          { accountStatus: "Active" }
        ]
      })
        .select({ passwordHash: 0, __v: 0, createdAt: 0, updatedAt: 0, otp: 0 })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      // count users
      count = await User.find({
        $and: [
          { hospitalName: checkUser.hospitalName }, 
          { $or: [{ userType: "User" },{ userType: "Assistant" },{ userType: "Doctor" }] },
          { accountStatus: "Active" }
        ]
      })
        .sort({ createdAt: -1 })
        .countDocuments();
    }

    if (getUsers.length > 0) {
      return res.status(200).json({
        statusCode: 200,
        statusValue: "SUCCESS",
        message: "Users list get successfully.",
        data: getUsers,
        totalDataCount: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page
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
 * @desc - get all active users
 * @api - /api/logger/active-users-list
 * @returns json data
 */
const getAllInactiveUsers = async (req, res) => {
  try {
    // for checking user roles
    const token = req.headers["authorization"].split(' ')[1];
    const verified = await jwtr.verify(token, process.env.JWT_SECRET);
    // console.log(123, verified.user)
    const checkUser = await User.findById({ _id: verified.user })

    // Pagination
    let { page, limit } = req.query;
    if (!page || page === "undefined") {
      page = 1;
    }
    if (!limit || limit === "undefined" || parseInt(limit) === 0) {
      limit = 1000;
    }
    const skip = page > 0 ? (page - 1) * limit : 0

    // Initialize variables
    let getUsers
    let count

    // Get users on the basis of role
    if (checkUser.userType == "Doctor") {
      getUsers = await User.find({
        $and: [
          { hospitalName: checkUser.hospitalName },
          {
            $or: [
              { userType: "User" },
              { userType: "Assistant" }
            ]
          },
          { accountStatus: "Inactive" }
        ]
      })
        .select({ passwordHash: 0, __v: 0, createdAt: 0, updatedAt: 0, otp: 0 })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      // count users
      count = await User.find({
        $and: [
          { hospitalName: checkUser.hospitalName },{ $or: [{ userType: "User" },{ userType: "Assistant" }] },{ accountStatus: "Inactive" }
        ]
      })
        .sort({ createdAt: -1 })
        .countDocuments();

    } else if (checkUser.userType == "Hospital-Admin") {
      getUsers = await User.find({
        $and: [
          { hospitalName: checkUser.hospitalName },
          {
            $or: [
              { userType: "User" },
              { userType: "Assistant" },
              { userType: "Doctor" }
            ]
          },
          { accountStatus: "Inactive" }
        ]
      })
        .select({ passwordHash: 0, __v: 0, createdAt: 0, updatedAt: 0, otp: 0 })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      // count users
      count = await User.find({
        $and: [
          { hospitalName: checkUser.hospitalName }, { $or: [{ userType: "User" },{ userType: "Assistant" },{ userType: "Doctor" }] },{ accountStatus: "Inactive" }
        ]
      })
        .sort({ createdAt: -1 })
        .countDocuments();
    }

    if (getUsers.length > 0) {
      return res.status(200).json({
        statusCode: 200,
        statusValue: "SUCCESS",
        message: "Users list get successfully.",
        data: getUsers,
        totalDataCount: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page
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



// get admin list
const getAllActiveAdmin = async (req, res) => {
  try {
    // for checking user roles
    const token = req.headers["authorization"].split(' ')[1];
    const verified = await jwtr.verify(token, process.env.JWT_SECRET);
    // console.log(123, verified.user)
    const checkUser = await User.findById({_id:verified.user})
  
    // Pagination
    let { page, limit } = req.query;
    if (!page || page === "undefined") {
      page = 1;
    }
    if (!limit || limit === "undefined" || parseInt(limit) === 0) {
      limit = 1000;
    }
    const skip = page > 0 ? (page - 1) * limit : 0
    
    // get data by user role

    const getUsers = await User.find({$and:[{userType:"Hospital-Admin"}]})
      .select({ passwordHash: 0, __v: 0, createdAt: 0, updatedAt: 0, otp: 0 })
      .sort({createdAt:-1})
      .skip(skip)
      .limit(limit);

    // Count 
    const count = await User.find({$and:[{userType:"Hospital-Admin"}]})
    .sort({createdAt:-1})
    .countDocuments();

    if (getUsers.length>0) {
      return res.status(200).json({
        statusCode:200,
        statusValue:"SUCCESS",
        message:"Hospital Admin list get successfully.",
        data:getUsers,
        totalDataCount: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page
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
 * @desc - get all Inactive users
 * @api - /api/logger/inactive-users-list
 * @returns json data
 */
const getAllPendingUsers = async (req, res) => {
  try {
    // for checking user roles
    const token = req.headers["authorization"].split(' ')[1];
    const verified = await jwtr.verify(token, process.env.JWT_SECRET);
    // console.log(123, verified.user)
    const checkUser = await User.findById({ _id: verified.user })

    // Pagination
    let { page, limit } = req.query;
    if (!page || page === "undefined") {
      page = 1;
    }
    if (!limit || limit === "undefined" || parseInt(limit) === 0) {
      limit = 1000;
    }
    const skip = page > 0 ? (page - 1) * limit : 0

    // get data by user role
    let getUsers
    let count

    if (checkUser.userType == "Doctor") {
      getUsers = await User.find({
        $and: [
          { hospitalName: checkUser.hospitalName },
          {
            $or: [
              { userType: "User" },
              { userType: "Assistant" }
            ]
          },
          { accountStatus: "Initial" }
        ]
      })
        .select({ passwordHash: 0, __v: 0, createdAt: 0, updatedAt: 0, otp: 0 })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      // count users
      count = await User.find({
        $and: [
          { hospitalName: checkUser.hospitalName },
          { $or: [{ userType: "User" },{ userType: "Assistant" }] },
          { accountStatus: "Initial" }
        ]
      })
        .sort({ createdAt: -1 })
        .countDocuments();

    } else if (checkUser.userType == "Hospital-Admin") {
      getUsers = await User.find({
        $and: [
          { hospitalName: checkUser.hospitalName },
          {
            $or: [
              { userType: "User" },
              { userType: "Assistant" },
              { userType: "Doctor" }
            ]
          },
          { accountStatus: "Initial" }
        ]
      })
        .select({ passwordHash: 0, __v: 0, createdAt: 0, updatedAt: 0, otp: 0 })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      // count users
      count = await User.find({
        $and: [
          { hospitalName: checkUser.hospitalName },
          { $or: [{ userType: "User" },{ userType: "Assistant" },{ userType: "Doctor" }] },
          { accountStatus: "Initial" }
        ]
      })
        .sort({ createdAt: -1 })
        .countDocuments();
    }
    if (getUsers.length > 0) {
      return res.status(200).json({
        statusCode: 200,
        statusValue: "SUCCESS",
        message: "Pending users get successfully.",
        data: getUsers,
        totalDataCount: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page
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
 * @desc - get all user
 * @api - /api/logger/users-list
 * @returns json data
*/
const getServiceEngList = async (req, res) => {
  try {
    // Pagination
    let { page, limit } = req.query;
    if (!page || page === "undefined") {
      page = 1;
    }
    if (!limit || limit === "undefined" || parseInt(limit) === 0) {
      limit = 1000;
    }
    const skip = page > 0 ? (page - 1) * limit : 0
    const getUsers = await User.find({$and:[{userType:"Service-Engineer"},{userStatus:"Active"}]})
    .select({ passwordHash: 0, __v: 0, createdAt: 0, updatedAt: 0, otp: 0 })
    .sort({userStatus:1})
    .skip(skip)
    .limit(limit);

    // Count 
    const count = await User.find({userType:"Service-Engineer"})
    .sort({userStatus:1})
    .countDocuments();

    if (getUsers.length>0) {
      return res.status(200).json({
        statusCode:200,
        statusValue:"SUCCESS",
        message:"Users list get successfully.",
        data:getUsers,
        totalDataCount: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page
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
 * @desc - change user status by userId
 * @api - PUT /api/logger/change-userType/userId
 * @returns json data
 */
const changeUserStatus = async (req, res) => {
  try {
    const schema = Joi.object({
      userStatus: Joi.string().valid("Active", "Inactive").required(),
      email: Joi.string().required(),
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
    const updateDoc = await Users.findOneAndUpdate({ email:req.body.email }, {
      userStatus: req.body.userStatus
    }, { new: true });
    if (!updateDoc) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "data not update."
      })
    }
    if (req.body.userStatus === "Inactive") {
      await assignTicketModel.updateMany({service_engineer:req.body.email},{$set:{service_engineer:"--Not Avl--"}}) 
      return res.status(200).json({
        statusCode: 200,
        statusValue: "SUCCESS",
        message: "User status changed successfully.",
        data: updateDoc
      })
    }
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "User status changed successfully.",
      data: updateDoc
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
 * @desc - change user account status by userId
 * @api - PUT /api/logger/change-userType/userId
 * @returns json data
 */
const changeUserAcStatus = async (req, res) => {
  try {
    const schema = Joi.object({
      accountStatus: Joi.string().valid("Active","Inactive").required()
    })
    let result = schema.validate(req.body);
    if (result.error) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: result.error.details[0].message,
      })
    }
    // const userId = req.params.userId
    // console.log(12, userId)
    const checkUser = await Users.findById({_id:req.params.userId})
    // console.log(11, checkUser)
    if (!checkUser) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "User not found with this userId"
      })
    }
    
    const updateDoc = await Users.findOneAndUpdate({_id:req.params.userId}, {
      accountStatus: req.body.accountStatus
    },{upsert:true});
    if (!updateDoc) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "data not update."
      })
    }
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "User account status updated successfully.",
      data: updateDoc
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
 * @desc - change user type by userId
 * @api - PUT /api/logger/change-userType/userId
 * @returns json data
 */
const changeUserType = async (req, res) => {
  try {
    const schema = Joi.object({
      userType: Joi.string().valid('Admin', 'User', 'Dispatch', 'Production', 'Support', 'Service-Engineer','Nurse', 'Hospital-Admin').required()
    })
    let result = schema.validate(req.body);
    if (result.error) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: result.error.details[0].message,
      })
    }
    const userId = req.params.userId;
    const checkUser = await Users.findById({ _id: mongoose.Types.ObjectId(userId) })
    if (!checkUser) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "User not found with this userId"
      })
    }
    const updateDoc = await Users.findByIdAndUpdate({ _id: mongoose.Types.ObjectId(userId) }, {
      userType: req.body.userType
    }, { new: true });
    if (!updateDoc) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "data not update."
      })
    }
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Usertype changed successfully.",
      data: updateDoc
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
 * @desc - get single user details
 * @api - GET /api/logger/users/userId
 * @returns json data
 */
const getUserByUserId = async (req, res) => {
  try {
    const user = await Users.findById(req.user).select('-passwordHash');
    // console.log(123,user)
    if (!user) {
      return res.status(404).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'User not found',
            msg: 'User not found',
            type: 'MongoDBError',
          },
        },
      });
    }

    res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      data: { user },
      message: 'User get successfully',
    });
  } catch (err) {
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
};

/**
 * @desc - delete user by admin or superadmin
 * @api - DELETE /api/logger/users/delete-byid/:id
 * @returns json data
 */
const deleteSingleUser = async (req, res) => {
  try {
    const id = req.params.id;
    const checkUser = await Users.findById({ _id: mongoose.Types.ObjectId(id) })
    if (!checkUser) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "User not found with this userId"
      })
    }
    const deleteDoc = await Users.findByIdAndDelete({ _id: mongoose.Types.ObjectId(id) }, { new: true });
    if (!deleteDoc) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "data not update."
      })
    }
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "User deleted successfully.",
      data: deleteDoc
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


// User send req for device access
const acceptOrRejectdeviceReq = async (req, res) => {
  try {
    const schema = Joi.object({
      deviceId: Joi.string().required(),
      userId: Joi.string().required(),
      isAssigned: Joi.string().required(),
    })
    let result = schema.validate(req.body);
    if (result.error) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: result.error.details[0].message,
      })
    }

    // check already exists
    const checkData = await assignDeviceTouserModel.findOne({ $and:[{deviceId:req.body.deviceId}, {userId:mongoose.Types.ObjectId(req.body.userId)}]});
    if (!!checkData) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "DeviceId already assigned to user"
      })
    }
    // for loggedin user details
    const token = req.headers["authorization"].split(' ')[1];
    const verified = await jwtr.verify(token, process.env.JWT_SECRET);
    const loggedInUser = await User.findById({_id:verified.user}); 

    // find securityCode
    const findCode = await User.findById({_id:mongoose.Types.ObjectId(req.body.userId)})
    // console.log(findCode)
    if (!findCode) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Doctor security code does not exists."
      })
    }
    const reqData = new assignDeviceTouserModel({
      deviceId:req.body.deviceId,
      userId:mongoose.Types.ObjectId(req.body.userId),
      assignedBy:!!(loggedInUser.email) ? loggedInUser.email : "",
      hospitalName:!!(loggedInUser.hospitalName) ? loggedInUser.hospitalName : "",
      deviceType:"Ventilator",
      status:true,
      isAssigned:req.body.isAssigned,
      securityCode:findCode.securityCode,  
    })
    const saveDoc = await reqData.save();
    await sendDeviceReqModel.findOneAndRemove({deviceId:req.body.deviceId,userId:mongoose.Types.ObjectId(req.body.userId)})
    if (!saveDoc) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "data not added."
      })
    }
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Request approved successfully.",
      data: saveDoc
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

// User send req for device access
const assignHospitalToAssistant = async (req, res) => {
  try {
    const schema = Joi.object({
      hospitalName: Joi.string().required(),
      assistantId: Joi.string().required(),
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
    // for loggedin user details
    const token = req.headers["authorization"].split(' ')[1];
    const verified = await jwtr.verify(token, process.env.JWT_SECRET);
    const loggedInUser = await User.findById({_id:verified.user}); 
    
    // check already exists
    const checkData = await assignDeviceTouserModel.findOne({ $and:[{securityCode:loggedInUser.securityCode},{assistantId:req.body.assistantId}]});
    if (!!checkData) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "You have already assigned."
      })
    }
   
    const assignData = await assignDeviceTouserModel.updateMany(
    {$and:[{userId:loggedInUser._id},{hospitalName:req.body.hospitalName}]},
    {
      assistantId:req.body.assistantId,
      securityCode:loggedInUser.securityCode
    })
    // console.log(11,req.body)
    if (!!assignData) {
      return res.status(200).json({
        statusCode: 200,
        statusValue: "SUCCESS",
        message: "Data added successfully.",
        data: assignData
      })
    }
    return res.status(400).json({
      statusCode: 400,
      statusValue: "FAIL",
      message: "Error ! while adding data",
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

// remove access from assistant
const removeHospitalAccessFromAst = async (req, res) => {
  try {
    // // for loggedin user details
    // const token = req.headers["authorization"].split(' ')[1];
    // const verified = await jwtr.verify(token, process.env.JWT_SECRET);
    // const loggedInUser = await User.findById({_id:verified.user});
    
    // const totalDeviceData = 
    // [
    // {
    //     "deviceId": '3a77a7d5197dbb6a',
    //     "addTofocus": true,
    //     "deviceInfo": [
    //                     {
    //                         "_id": "652179593cf0fea97f09b8b9",
    //                         "DeviceId": "3a77a7d5197dbb6a",
    //                         "Hospital_Name": "KGMU Lucknow",
    //                         "isAssigned": true,
    //                         "addTofocus": false
    //                     }
    //                 ]
    //   },
    //   {
    //     "deviceId": '746ec924d3845797',
    //     "addTofocus": false,
    //     "deviceInfo": [
    //                     {
    //                         "_id": "65eff595b5bccf2599bb5bad",
    //                         "DeviceId": "746ec924d3845797",
    //                         "Hospital_Name": "AIIMS DELHI",
    //                         "addTofocus": false,
    //                         "isAssigned": false
    //                     }
    //                 ]
    //   }
    // ]

    // let assignDeviceData = 
    // [
    //   {
    //     "userId": "65f03f9bc176567af5200042",
    //     "assignedBy": 'kgmu-admin@gmail.com',
    //     "deviceId": '3a77a7d5197dbb6a',
    //     "status": true,
    //     "isAssigned": 'Accepted',
    //     "hospitalName": 'KGMU Lucknow'
    //   },
    //   {
    //     "userId": "65f03f9bc176567af5200042",
    //     "assignedBy": 'kgmu-admin@gmail.com',
    //     "deviceId": '3a77a7d5197dbb64',
    //     "status": true,
    //     "isAssigned": 'Accepted',
    //     "hospitalName": 'KGMU Lucknow'
    //   },
    //   {
    //     "userId": "65f03f9bc176567af5200042",
    //     "assignedBy": 'kgmu-admin@gmail.com',
    //     "deviceId": '3a77a7d5197dbb64',
    //     "status": true,
    //     "isAssigned": 'Accepted',
    //     "hospitalName": 'KGMU Lucknow'
    //   }
    // ]
    
    // // Map data for isAssigned key
    // function updateisAssigned(totalDeviceData, assignDeviceData) {
    //   // Map deviceId to assignDeviceData for faster lookup
    //   const assignDeviceMap = assignDeviceData.reduce((acc, cur) =>{
    //     acc[cur.deviceId] = cur
    //     return acc
    //   }, {})
    //   console.log(12,assignDeviceMap)
    //   // Update isAssigned based on matching deviceId
    //   return totalDeviceData.map(item => {
    //     // assignDeviceMap this is single {} with deviceId value key
    //     const assignInfo = assignDeviceMap[item.deviceId];
    //     console.log(14,assignInfo)
    //     if (assignInfo && assignInfo.isAssigned === 'Accepted') {
    //       item.isAssigned = true;
    //     }  else {
    //       item.isAssigned = false;
    //     }
    //     return item; 
    //   })
    // }

    // updatedArray = updateisAssigned(totalDeviceData, assignDeviceData);
    // console.log(13,updatedArray)

    // let prodData = await aboutDeviceModel.find({},{deviceId:1, address:1})

    // Create an object to store unique records based on deviceId
    // let uniqueRecords = {}

    // // Filter the array to keep only unique records based on deviceId
    // assignDeviceData.forEach(item => {
    //   uniqueRecords[item.deviceId] = item
    // })
    // console.log(12,uniqueRecords)
    // let uniqueArray = Object.values(uniqueRecords);
    // // console.log()
    
    // return res.status(200).json({
    //   statusCode: 200,
    //   statusValue: "SUCCESS",
    //   message: "Data added successfully.",
    //   data: uniqueArray
    // })

    const schema = Joi.object({
      hospitalName: Joi.string().required(),
      assistantId: Joi.string().required(),
    })
    let result = schema.validate(req.body);
    if (result.error) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: result.error.details[0].message,
      })
    }
    
    // for loggedin user details
    const token = req.headers["authorization"].split(' ')[1];
    const verified = await jwtr.verify(token, process.env.JWT_SECRET);
    const loggedInUser = await User.findById({_id:verified.user}); 

    // check already exists
    const checkData = await assignDeviceTouserModel.find({ $and:[{hospitalName:req.body.hospitalName},{assistantId:req.body.assistantId}]});
    if (checkData.length == 0) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Data not found."
      })
    }
   
    const assignData = await assignDeviceTouserModel.updateMany(
    {$and:[{hospitalName:req.body.hospitalName},{assistantId:req.body.assistantId}]},
    {
      assistantId:"",
    })
    // console.log(11,req.body)
    if (!!assignData) {
      return res.status(200).json({
        statusCode: 200,
        statusValue: "SUCCESS",
        message: "Assistant remove successfully.",
        data: assignData
      })
    }
    return res.status(400).json({
      statusCode: 400,
      statusValue: "FAIL",
      message: "Error ! while removing data",
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

// User send req for device access
const sendReqForDevice = async (req, res) => {
  try {
    const schema = Joi.object({
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
    

    // for loggedin user details
    const token = req.headers["authorization"].split(' ')[1];
    const verified = await jwtr.verify(token, process.env.JWT_SECRET);
    const loggedInUser = await User.findById({_id:verified.user}); 
    // check data
    const checkData = await sendDeviceReqModel.findOne({$and:[{userId:loggedInUser._id},
      {deviceId:req.body.deviceId}]});
    if (!!checkData) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "You have already sent request.",
      })
    }  
    const reqData = new sendDeviceReqModel({
      requestedBy:!!(loggedInUser.email) ? loggedInUser.email : "",
      userId:loggedInUser._id,
      deviceId:req.body.deviceId,
      hospitalName:!!(loggedInUser.hospitalName) ? loggedInUser.hospitalName : "NA",
      deviceType:"Ventilator",
      status:true,
      isAssigned:"Pending",
    })
    const saveDoc = await reqData.save();
    if (!saveDoc) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "data not added."
      })
    }
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Request sended successfully.",
      data: saveDoc
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


// get device req list for hospital-admin role
const getUserDeviceReq = async (req, res) => {
  try {
    const token = req.headers["authorization"].split(' ')[1];
    const verified = await jwtr.verify(token, process.env.JWT_SECRET);
    const loggedInUser = await User.findById({_id:verified.user});    
    const getReqData = await sendDeviceReqModel.find({
      hospitalName:!!(loggedInUser.hospitalName)?loggedInUser.hospitalName:"KGMU Lucknow"
    })
    
    if (getReqData.length<1) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "data not added."
      })
    }
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Request has been get successfully.",
      data: getReqData,
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


module.exports = {
  registerUser,
  loginUser,
  updateUserProfile,
  logoutUser,
  // userForgetPassword,
  resetForgetPassword,
  userPasswordChange,
  getUserByUserId,
  getUserProfileById,
  getAllUsers,
  getAllActiveUSers,
  getAllPendingUsers,
  changeUserAcStatus,
  deleteSingleUser,
  getServiceEngList,
  changeUserType,
  verifyOtp,
  generateNewPassword,
  getActivity,
  changeUserStatus,
  getUserStatus,
  sendOtpSms,
  verifyOtpSms,
  registerUserForSuperAdmin,
  sendReqForDevice,
  getUserDeviceReq,
  getAllActiveAdmin,
  acceptOrRejectdeviceReq,
  addUserExperience,
  updateUserExperience,
  getUserProfileByExpId,
  endAssociation,
  updatePrimaryEmail,
  getAllEmployeeList,
  getAllInactiveUsers,
  assignHospitalToAssistant,
  getAssistantList,
  removeHospitalAccessFromAst
};