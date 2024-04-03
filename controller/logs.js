const fs = require('fs');
const Projects = require('../model/project');
const alert_ventilator_collection = require('../model/alert_ventilator_collection');
const trends_ventilator_collection = require('../model/trends_ventilator_collection');
const ventilator_collection = require('../model/ventilator_collection');
const event_ventilator_collection = require('../model/event_ventilator_collection');
const { getDaysArray } = require('../helper/helperFunctions');
const Device = require('../model/device');
const Email = require('../utils/email');
const decompress = require('decompress');
const { validationResult } = require('express-validator');
const AWS = require('aws-sdk');
const path = require('path');
const deviceIdModel = require('../model/device_ventilator_collection');
const statusModel = require('../model/statusModel');
const logModel = require('../model/logModel');
const RegisterDevice = require('../model/RegisterDevice');
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  Bucket: process.env.S3_BUCKET,
  region: 'ap-south-1',
});
const User = require('../model/users');
const assignDeviceTouserModel = require('../model/assignedDeviceTouserModel');
let redisClient = require("../config/redisInit");
const JWTR = require("jwt-redis").default;
const jwtr = new JWTR(redisClient);
const {deviceIdArr} = require('../middleware/msgResponse');
const alert_ventilator_collectionV2 = require('../model/alert_ventilator_collection_v2');
const event_ventilator_collection_v2 = require('../model/event_ventilator_collection_v2');
const { default: mongoose } = require('mongoose');
const trends_ventilator_collectionV2_model = require('../model/trends_ventilator_collection_v2')

// fcm services
const {initializeApp, applicationDefault} = require("firebase-admin/app");
const {getMessaging} = require('firebase-admin/messaging');
const fcmTokenModel = require('../model/fcmTockenModel');

initializeApp({
  credential: applicationDefault(),
  projectId: 'agvaapp'
})
// end fcm services


const createLogsV2 = async (req, res) => {
  try {
    const { project_code } = req.params;
    // check project exist or not
    const findProjectWithCode = await Projects.findOne({ code: project_code });

    if (!findProjectWithCode) {
      return res.status(404).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Project not found',
            msg: 'Project not found',
            type: 'Validation Error',
          },
        },
      });
    }

    const collectionName = findProjectWithCode.collection_name;

    const modelReference = require(`../model/${collectionName}`);

    const d = new Date();

    if (req.contentType === 'json') {
      const { version, type, log, device } = req.body;

      const Dvc = await new Device({
        did: device.did,
        name: device.name,
        manufacturer: device.manufacturer,
        os: {
          name: device.os.name,
          type: device.os.type,
        },
        battery: device.battery,
      });

      const isDeviceSaved = await Dvc.save(Dvc);

      if (!isDeviceSaved) {
        res.status(500).json({
          status: 0,
          data: {
            err: {
              generatedTime: new Date(),
              errMsg: 'Device not saved',
              msg: 'Device not saved',
              type: 'MongodbError',
            },
          },
        });
      }

      if (!log.msg) {
        return res.status(400).json({
          status: 0,
          data: {
            err: {
              generatedTime: new Date(),
              errMsg: 'Log message is required',
              msg: 'Log message is required',
              type: 'ValidationError',
            },
          },
        });
      }

      const putDataIntoLoggerDb = await new modelReference({
        version: version,
        type: type,
        device: isDeviceSaved._id,
        log: {
          file: log.file,
          date: log.date || d.toISOString(),
          filePath: '',
          message: decodeURI(log.msg),
          type: log.type,
        },
      });

      const isLoggerSaved = await putDataIntoLoggerDb.save(putDataIntoLoggerDb);

      if (!isLoggerSaved) {
        return res.status(500).json({
          status: 0,
          data: {
            err: {
              generatedTime: new Date(),
              errMsg: 'Project not saved',
              msg: 'Project not saved',
              type: 'Internal Server Error',
            },
          },
        });
      } else {
        var sentEmails = [];
        var sentEmailErrArr = [];
        var sentEmailErrMsgArr = [];

        if (log.type == 'error' && findProjectWithCode.reportEmail.length) {
          let emailPromise = findProjectWithCode.reportEmail.map((email) => {
            const url = `${log.msg}`;
            // console.log(url)
            return new Email(email, url).sendCrash();
          });

          sentEmails = await Promise.allSettled(emailPromise);

          sentEmails.length
            ? sentEmails.map((sentEmail) => {
              sentEmailErrArr.push(sentEmail.status);
              if (sentEmail.status === 'rejected') {
                sentEmailErrMsgArr.push(sentEmail.reason.message);
              }
            })
            : sentEmailErrArr,
            (sentEmailErrMsgArr = []);
        }

        res.status(201).json({
          status: 1,
          data: {
            crashEmail:
              log.type === 'error'
                ? {
                  status: sentEmailErrArr.includes('rejected') ? 0 : 1,
                  errMsg: sentEmailErrMsgArr.length
                    ? sentEmailErrMsgArr.join(' | ')
                    : '',
                  msg: sentEmailErrMsgArr.length
                    ? `Error sending ${sentEmailErrMsgArr.length} out of ${sentEmails.length} log(s)`
                    : 'Email(s) sent successfully.',
                }
                : {},
          },
          message: 'Successful',
        });
      }
    } else if (req.contentType === 'formData') {
      const files = await decompress(
        req.file.path,
        `./public/uploads/${req.body.did}`
      );

      // Delete zip file after unzipping it
      fs.unlinkSync(`./${req.file.path}`);

      console.log('files length: ', files.length);
      const Dvc = await new Device({
        did: req.body.did,
        name: req.body.deviceName,
        manufacturer: req.body.manufacturer,
        os: {
          name: req.body.osName,
          type: req.body.osType,
        },
        battery: req.body.battery,
      });

      const isDeviceSaved = await Dvc.save(Dvc);

      if (!isDeviceSaved) {
        return res.status(500).json({
          status: 0,
          data: {
            err: {
              generatedTime: new Date(),
              errMsg: 'Device not saved',
              msg: 'Device not saved',
              type: 'MongodbError',
            },
          },
        });
      }

      let s3Promise =
        files.length &&
        files.map((file) => {
          const fileContent = fs.readFileSync(
            `${__dirname}/../public/uploads/${req.body.did}/${file.path}`
          );
          // Setting up S3 upload parameters
          const params = {
            Bucket: process.env.S3_BUCKET,
            Key: `${req.body.did}/${file.path}`,
            Body: fileContent,
          };
          console.log('params', params);
          return s3.upload(params).promise();
        });

      let fileNamePromise =
        files.length &&
        files.map(async (file) => {
          console.log(file.path);
          let putDataIntoLoggerDb = await new modelReference({
            version: req.body.version,
            type: req.body.type,
            device: isDeviceSaved._id,
            log: {
              file: file.path,
              date: d.toISOString(),
              filePath: `${req.body.did}/${file.path}`,
              message: '',
              type: 'error',
            },
          });
          return putDataIntoLoggerDb.save(putDataIntoLoggerDb);
        });

      let s3Response = await Promise.allSettled(s3Promise);
      let logs = await Promise.allSettled(fileNamePromise);

      var logsErrArr = [];
      var logsErrMsgArr = [];

      logs.length &&
        logs.map((log) => {
          logsErrArr.push(log.status);
          if (log.status === 'rejected') {
            logsErrMsgArr.push(log.reason.message);
          }
        });

      if (!logsErrArr.includes('fulfilled')) {
        return res.status(400).json({
          status: logsErrMsgArr.length === logs.length ? -1 : 0,
          data: {
            err: {
              generatedTime: new Date(),
              errMsg: logsErrMsgArr.join(' | '),
              msg: `Error saving ${logsErrMsgArr.length} out of ${logs.length} log(s)`,
              type: 'ValidationError',
            },
          },
        });
      } else {
        var s3ResponseStatus = [];
        var emailPromise = [];
        var sentEmails = [];
        var sentEmailErrArr = [];
        var sentEmailErrMsgArr = [];

        if (findProjectWithCode.reportEmail.length) {
          emailPromise = findProjectWithCode.reportEmail.map((email) => {
            logs.map((log) => {
              const url = `${log.value.log.filePath}`;
              return new Email(email, url).sendCrash();
            });
          });

          sentEmails = await Promise.allSettled(emailPromise);

          sentEmails.length
            ? sentEmails.map((sentEmail) => {
              sentEmailErrArr.push(sentEmail.status);
              if (sentEmail.status === 'rejected') {
                sentEmailErrMsgArr.push(sentEmail.reason.message);
              }
            })
            : sentEmailErrArr,
            (sentEmailErrMsgArr = []);
        }

        s3ResponseStatus =
          s3Response.length && s3Response.map((s3Res) => s3Res.status);

        // Delete Files after saving to DB and S3
        if (!s3ResponseStatus.includes('rejected')) {
          files.length &&
            files.map(async (file) => {
              fs.unlinkSync(
                path.join('public', 'uploads', `${req.body.did}/${file.path}`)
              );
            });
        }

        res.status(201).json({
          status: 1,
          data: {
            crashEmail: sentEmails.length
              ? {
                status:
                  sentEmailErrArr.length &&
                    sentEmailErrArr.includes('rejected')
                    ? 0
                    : 1,
                errMsg: sentEmailErrMsgArr.length
                  ? sentEmailErrMsgArr.join(' | ')
                  : '',
                msg: sentEmailErrMsgArr.length
                  ? `Error sending ${sentEmailErrMsgArr.length} out of ${sentEmails.length} log(s)`
                  : 'Email(s) sent successfully.',
              }
              : {},
          },
          message: 'Successful',
        });
      }
    }
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

const getAlertsById = async (req, res) => {
  try {
    const { did } = req.params;
    // Pagination
    let { page, limit } = req.query;
    if (!page || page === "undefined") {
      page = 1;
    }
    if (!limit || limit === "undefined" || parseInt(limit) === 0) {
      limit = 9999;
    }

    const findDeviceById = await alert_ventilator_collection.find({ did: did }).select({__v:0,createdAt:0,updatedAt:0}).sort({"ack.date":-1});

    //console.log(findDeviceById, 'findDeviceById');
    if (!findDeviceById) {
      return res.status(404).json({
        status: 0,
        statusCode: 404,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'device not found',
            msg: 'device not found',
            type: 'Client Error',
          },
        },
      });
    }
   
    const paginateArray =  (findDeviceById, page, limit) => {
      const skip = findDeviceById.slice((page - 1) * limit, page * limit);
      return skip;
    };
    let finalArrData = paginateArray(findDeviceById, page, limit);
    var splitedArr = [];
    let modifiedArr = finalArrData.map((item) => { 
      let objItem = {
        _id:item._id,
        did:item.did,
        type:item.type,
        ack:{
          msg:item.ack.msg,
          code:item.ack.code,
          date:item.ack.date.split('T')[0],
          time:item.ack.date.split('T')[1],
        },
        priority:item.priority,
      }
      splitedArr.push(objItem)
    })

    return res.status(200).json({
      status: 1,
      statusCode: 200,
      message: 'Data get successfully.',
      data: {
        findDeviceById: splitedArr
      },
      totalDataCount: findDeviceById.length,
      totalPages: Math.ceil( (findDeviceById.length)/ limit),
      currentPage: page
    });

  }
  catch (err) {
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
}

// get device trends by deviceId
const getTrendsById = async (req, res) => {
  try {
    let { page, limit} = req.query;
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

    const { did } = req.params;
    const findDeviceById = await trends_ventilator_collection.find({ did: did }).sort({_id:-1}).limit(100);
    if (!findDeviceById) {
      return res.status(404).json({
        status: 0,
        statusCode: 404,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'device not found',
            msg: 'device not found',
            type: 'Client Error',
          },
        },
      });
    }
    if(!did){
      return res.status(404).json({
        status:0,
        statusCode: 404,
        data:{
          err:{
            generatedTime:new Date(),
            errMsg:'deviceId not found',
            msg:'deviceId not found',
            type:'Client Error',
          },
        },
      });
    }

    //console.log(findDeviceById, 'findDeviceById');
    if (!findDeviceById) {
      return res.status(404).json({
        status: 0,
        statusCode: 404,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'device not found',
            msg: 'device not found',
            type: 'Client Error',
          },
        },
      });
    }
    // for pagination
    const paginateArray = (findDeviceById, page, limit) => {
      const skip = findDeviceById.slice((page - 1) * limit, page * limit);
      return skip;
    };

    let finalData = paginateArray(findDeviceById, page, limit)
    // for count
    const count = findDeviceById.length
    // const collectionName=require(`../model/${findDeviceById.collection_name}.js`);
    // console.log(collectionName,'collectionName');
    if (finalData.length > 0) {
      return res.status(200).json({
        status: 1,
        statusCode: 200,
        message: 'successfull',
      //   data: {
      //     findDeviceById: finalData
      //   },
      //   message: 'successfull'
      // });
        data: {
          findDeviceById:finalData
        },
        totalDataCount: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page
      })
    }
    return res.status(400).json({
      status:0,
      statusCode:400,
      message:"Data not found",
      data:{}
    })
  }
  catch (err) {
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
}

const getLogsById = async (req, res) => {
  try {
    const { device } = req.params;
    // Pagination
    let { page, limit } = req.query;
    if (!page || page === "undefined") {
      page = 1;
    }
    if (!limit || limit === "undefined" || parseInt(limit) === 0) {
      limit = 9999;
    }

    const findDeviceById = await logModel.find({ deviceId:device }).select({__v:0,createdAt:0,updatedAt:0}).sort({_id:-1});
    if (!findDeviceById) {
      return res.status(404).json({
        status: 0,
        statusCode: 404,
        data: {
          err: {
            generatedTime: newDate(),
            errMsg: 'device not found',
            msg: 'device not found',
            type: 'client Error',
          },
        },
      });
    }
    const paginateArray =  (findDeviceById, page, limit) => {
      const skip = findDeviceById.slice((page - 1) * limit, page * limit);
      return skip;
    };
    let finalArrData = paginateArray(findDeviceById, page, limit);

    var splitedArr = [];
    let modifiedArr = finalArrData.map((item) => { 
      let objItem = {
        _id:item._id,
        deviceId:item.deviceId,
        message:item.message,
        version:item.version,
        file:item.file,
        date:item.date.split('T')[0],
        time:item.date.split('T')[1],
      }
      splitedArr.push(objItem)
    })

    return res.status(200).json({
      status: 1,
      statusCode: 200,
      message: 'Data get successfully.',
      data: {
        findDeviceById: splitedArr,
      },
      totalDataCount: findDeviceById.length,
      totalPages: Math.ceil((findDeviceById.length)/limit),
      currentPage: page
    });
  }
  catch (err) {
    return res.status(500).json({
      status: -1,
      data: {
        err: {
          generatedTime: newDate(),
          errMsg: err.stack,
          msg: err.message,
          type: err.name,
        },
      },
    });
  }
}


const getEventsById = async (req, res) => {
  try {
    
    const { did } = req.params;
    // Pagination
    let { page, limit } = req.query;
    if (!page || page === "undefined") {
      page = 1;
    }
    if (!limit || limit === "undefined" || parseInt(limit) === 0) {
      limit = 9999;
    }

    const findDeviceById = await event_ventilator_collection.find({ did: did }).select({createdAt:0, updatedAt:0, __v:0}).sort({_id:-1});

    const maxDate = new Date(
      Math.max(
        ...findDeviceById.map(element => {
          return new Date(element.date);
        }),
      ),
    );
    //console.log(maxDate);  
    const dt1 = new Date(maxDate);
    //console.log(dt1)
    const dt2 = new Date();
    // dt=new Date(maxDate);
    //dt=new Date();
    var diff = (dt2.getTime() - dt1.getTime()) / 1000;
    diff = Math.trunc(Math.abs(diff / (60 * 60)));
    //console.log(diff)
    if (diff >= 24 || diff < 0) {
      state = 'inactive';
    }
    else {
      state = 'active';
    }

    //console.log(findDeviceById, 'findDeviceById');
    if (!findDeviceById) {
      return res.status(404).json({
        status: 0,
        statusCode: 404,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'device not found',
            msg: 'device not found',
            type: 'Client Error',
          },
        },
      });
    }
    
    const paginateArray =  (findDeviceById, page, limit) => {
      const skip = findDeviceById.slice((page - 1) * limit, page * limit);
      return skip;
    };
    let finalArrData = paginateArray(findDeviceById, page, limit)
    var splitedArr = [];
    let modifiedArr = finalArrData.map((item) => { 
      let objItem = {
        _id:item._id,
        did:item.did,
        type:item.type,
        message:item.message,
        date:item.date.split('T')[0],
        time:item.date.split('T')[1],
      }
      splitedArr.push(objItem)
    })
    // console.log(Arr)
    // console.log(modifiedArr)
    return res.status(200).json({
      status: 1,
      statusCode: 200,
      data: {
        findDeviceById: splitedArr,
      },
      message: 'successfull',
      //state:findDeviceById.find().sort({date:-1}).limit(1)
      state: state,
      totalDataCount: findDeviceById.length,
      totalPages: Math.ceil( (findDeviceById.length)/ limit),
      currentPage: page
    });
  }
  catch (err) {
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
}


// Get all deviceId
const getAllDeviceId1 = async (req, res) => {
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
    
    var activeDevices = await statusModel.find({ message:"ACTIVE" }, { __v:0 }).sort({updatedAt:-1});
    var inactiveDevices = await statusModel.find({ message:"INACTIVE" }, { __v:0 }).sort({updatedAt:-1});
    var finalArr = [...activeDevices,...inactiveDevices]
    
    // For search
    var key = "deviceId";
    if (req.query.search && req.query.search !== "undefined") {
      finalArr = await statusModel.find({deviceId: { $regex: ".*" + search + ".*", $options: "i" }},{__v:0}).sort({updatedAt:-1});
    }

    // Remove duplicate devices
    let arrayUniqueByKey = [...new Map(finalArr.map(item => [item[key], item])).values()];
    
    // For pagination
    const paginateArray =  (arrayUniqueByKey, page, limit) => {
      const skip = arrayUniqueByKey.slice((page - 1) * limit, page * limit);
      return skip;
    };

    var allDevices = paginateArray(arrayUniqueByKey, page, limit)
    if (arrayUniqueByKey.length > 0) {
      return res.status(200).json({
        status: 200,
        statusValue: "SUCCESS",
        message: "Event lists has been retrieved successfully.",
        data: { data: allDevices, },
        totalDataCount: arrayUniqueByKey.length,
        totalPages: Math.ceil( (arrayUniqueByKey.length)/ limit),
        currentPage: page
      })
    }
    return res.status(400).json({
      status: 400,
      statusValue: "FAIL",
      message: 'Data not found.',
      data: {}
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


// get all devices
const getAllDeviceId2 = async (req, res) => {
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
    const activeDevices = await statusModel.aggregate( [
      {
        $match: {
          "message":"ACTIVE",
        }
      },
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
        $match: {deviceId: { $regex: ".*" + search + ".*", $options: "i" }}
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
    ]);
   const inactiveDevices = await statusModel.aggregate( [
    {
      $match: {
        "message":"INACTIVE",
      }
    },
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
      $match: {deviceId: { $regex: ".*" + search + ".*", $options: "i" }}
    },
    {
      $project:{
        "createdAt":0, "__v":0, "deviceInfo.__v":0,"deviceInfo.createdAt":0,
        "deviceInfo.updatedAt":0,"deviceInfo.Status":0,
      }
    },
    {
      $sort: { updatedAt:-1 },
    },
  ]);
  var finalArr = [...activeDevices, ...inactiveDevices];
  // remove duplicate records
  var key = "deviceId";
  let arrayUniqueByKey = [...new Map(finalArr.map(item => [item[key], item])).values()];

  let resArr1 = [];
  let resArr2 = [];
  // filter data on the basis of userType
  const token = req.headers["authorization"].split(' ')[1];
  const verified = await jwtr.verify(token, process.env.JWT_SECRET);
  const loggedInUser = await User.findById({_id:verified.user});
  
  // get data by user role
  if (loggedInUser.userType == "User") {

    const assignDevices = await assignDeviceTouserModel.findOne({userId:loggedInUser._id});
    const deviceIds = assignDevices.Assigned_Devices;
    const tempIds = deviceIds.map((item) => item.DeviceId)
    
    for (let i = 0; i<tempIds.length; i++) {
      arrayUniqueByKey.map((item) => {
        if (item.deviceId == tempIds[i] && item.message === "ACTIVE") {
          resArr1.push(item)
        } else if (item.deviceId == tempIds[i] && item.message === "INACTIVE") {
          resArr2.push(item)
        } else {
          return false;
        }
      });
    }
    
    let resultArr = [...resArr1, ...resArr2];
    const paginateArray =  (resultArr, page, limit) => {
      const skip = resultArr.slice((page - 1) * limit, page * limit);
      return skip;
    };  
    
    var allDevices = paginateArray(resultArr, page, limit)
      if (resultArr.length > 0) {
        return res.status(200).json({
          status: 200,
          statusValue: "SUCCESS",
          message: "Event lists has been retrieved successfully.",
          data: { data: allDevices, },
          totalDataCount: resultArr.length,
          totalPages: Math.ceil( (resultArr.length)/ limit),
          currentPage: page,
          // tempData: allDevices,
        })
      }
    // const lData = await paginateArray.find({deviceId:{in:tempIds}})
    // console.log(lData,lData)
  }
  // console.log(333, resultArr)
  // For pagination
  const paginateArray =  (arrayUniqueByKey, page, limit) => {
  const skip = arrayUniqueByKey.slice((page - 1) * limit, page * limit);
  return skip;
  };

    

  var allDevices = paginateArray(arrayUniqueByKey, page, limit)
  if (arrayUniqueByKey.length > 0) {
    return res.status(200).json({
      status: 200,
      statusValue: "SUCCESS",
      message: "Event lists has been retrieved successfully.",
      data: { data: allDevices, },
      totalDataCount: arrayUniqueByKey.length,
      totalPages: Math.ceil( (arrayUniqueByKey.length)/ limit),
      currentPage: page,
      // tempData: allDevices,
    })
  }
  return res.status(400).json({
    status: 400,
    statusValue: "FAIL",
    message: 'Data not found.',
    data: {}
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
}

/**
 * searching
 * @param {*} req 
 * @param {*} res 
 * @returns [{object}]
 */
const getAllDevicesForUsers = async (req, res) => {
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

    // get loggedin user details
    const token = req.headers["authorization"].split(' ')[1];
    const verified = await jwtr.verify(token, process.env.JWT_SECRET);
    const loggedInUser = await User.findById({_id:verified.user});
    // console.log(loggedInUser.hospitalName)
    // Declare blank obj
    let filterObj = {};
    // check user
    if (!!loggedInUser && loggedInUser.userType === "User") {
    filterObj = {
      $match: {$and:[
        {"deviceInfo.Hospital_Name":loggedInUser.hospitalName},
        // {"deviceReqData.userId":loggedInUser._id},
        {deviceId: { $regex: ".*" + search + ".*", $options: "i" }}
      ]}
    }
  } else if (!!loggedInUser && loggedInUser.userType === "Nurse") {
    filterObj = {
      $match: {$and:[
        {"deviceInfo.Hospital_Name":loggedInUser.hospitalName},
        // {"deviceReqData.userId":loggedInUser._id},
        {deviceId: { $regex: ".*" + search + ".*", $options: "i" }}
      ]}
    }
  } 
  else if (!!loggedInUser && loggedInUser.userType === "Doctor") {
    filterObj = {
      $match: {$and:[
        {"deviceInfo.Hospital_Name":loggedInUser.hospitalName},
        // {"deviceReqData.userId":loggedInUser._id},
        {deviceId: { $regex: ".*" + search + ".*", $options: "i" }}
      ]}
    }
  }
  else if (!!loggedInUser && loggedInUser.userType === "Assistant") {
    filterObj = {
      $match: {$and:[
        {"deviceInfo.Hospital_Name":loggedInUser.hospitalName},
        // {"deviceReqData.userId":loggedInUser._id},
        {deviceId: { $regex: ".*" + search + ".*", $options: "i" }}
      ]}
    }
  } else {
    filterObj = {
      $match:{deviceId: { $regex: ".*" + search + ".*", $options: "i" }}
    } 
  }
    
    
    // check user
  
  const activeDevices = await statusModel.aggregate([
    {
      $match: {
        "message":"ACTIVE",
      }
    },
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
      $lookup:
      {
        from: "assigned_devices_tousers",
        localField: "deviceId",
        foreignField: "deviceId",
        as: "deviceReqData"
      }
    },
    
    // For this data model, will always be 1 record in right-side
    // of join, so take 1st joined array element
    {
      "$set": {
        "deviceReqData": {"$first": "$deviceReqData"},
      }
    },
    // Extract the joined embeded fields into top level fields
    {
      "$set": {"isAssigned": "$deviceReqData.isAssigned"},
    },
    filterObj,
    // {
    //   $project:{
    //     "createdAt":0, "__v":0, "deviceInfo.__v":0,"deviceInfo.createdAt":0,
    //     "deviceInfo.updatedAt":0, "deviceInfo.Status":0,
    //   }
    // },
    {
      $lookup:
      {
        from: "alert_ventilator_collections",
        let: { deviceId: "$deviceId" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$did", "$$deviceId"] }
            }
          },
          {
            $sort: { "createdAt": -1 } // Sorting by age in descending order
          },
          {
            $limit: 1 // Limiting to 1 result per deviceId
          }
        ],
        as: "alarmData"
      },
    },
    {
      "$unset": [
        "deviceReqData",
        "__v",
        "createdAt",
        "deviceInfo.__v",
        "deviceInfo.createdAt",
        "deviceInfo.updatedAt",
        "deviceInfo.Status"
      ]
    },
    {
      $sort: { updatedAt:-1 },
    },
  ])
   
  const inactiveDevices = await statusModel.aggregate([
    {
      $match: {
        "message":"INACTIVE",
      }
    },
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
      $lookup:
      {
        from: "assigned_devices_tousers",
        localField: "deviceId",
        foreignField: "deviceId",
        as: "deviceReqData"
      }
    },
    // For this data model, will always be 1 record in right-side
    // of join, so take 1st joined array element
    {
      "$set": {
        "deviceReqData": {"$first": "$deviceReqData"},
      }
    },
    // Extract the joined embeded fields into top level fields
    {
      "$set": {"isAssigned": "$deviceReqData.isAssigned"},
    },
    filterObj,
    {
      $lookup:
      {
        from: "alert_ventilator_collections",
        let: { deviceId: "$deviceId" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$did", "$$deviceId"] }
            }
          },
          {
            $sort: { "createdAt": -1 } // Sorting by age in descending order
          },
          {
            $limit: 1 // Limiting to 1 result per deviceId
          }
        ],
        as: "alarmData"
      },
    },
    {
      "$unset": [
        "deviceReqData",
        "__v",
        "createdAt",
        "deviceInfo.__v",
        "deviceInfo.createdAt",
        "deviceInfo.updatedAt",
        "deviceInfo.Status"
      ]
    },
    {
      $sort: { updatedAt:-1 },
    },
  ]);
  var finalArr = [...activeDevices, ...inactiveDevices];
  // remove duplicate records
  var key = "deviceId";
  let arrayUniqueByKey = [...new Map(finalArr.map(item => [item[key], item])).values()];
   
  // filter data on the basis of userType
  if (loggedInUser.userType == "User" || loggedInUser.userType == "Nurse") {
    const assignedDeviceIds = await assignDeviceTouserModel.find({userId:mongoose.Types.ObjectId(loggedInUser._id)})
    const deviceIds = assignedDeviceIds.map(item => item.deviceId)
    filteredData = arrayUniqueByKey.filter(item => deviceIds.includes(item.deviceId)) 
    arrayUniqueByKey = filteredData
  }
  
  // For pagination\
  const paginateArray =  (arrayUniqueByKey, page, limit) => {
    const skip = arrayUniqueByKey.slice((page - 1) * limit, page * limit);
    return skip;
  }

  var allDevices = paginateArray(arrayUniqueByKey, page, limit)
  if (arrayUniqueByKey.length > 0) {
    return res.status(200).json({
      status: 200,
      statusValue: "SUCCESS",
      message: "Event lists has been retrieved successfully.",
      data: { data: allDevices, },
      totalDataCount: arrayUniqueByKey.length,
      totalPages: Math.ceil( (arrayUniqueByKey.length)/limit),
      currentPage: page,
      // tempData: allDevices,
    })
  }
  return res.status(400).json({
    status: 400,
    statusValue: "FAIL",
    message: 'Data not found.',
    data: {}
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

// get all focused device for users
const getAllFocusedDevicesForUsers = async (req, res) => {
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

    // get loggedin user details
    const token = req.headers["authorization"].split(' ')[1];
    const verified = await jwtr.verify(token, process.env.JWT_SECRET);
    const loggedInUser = await User.findById({_id:verified.user});
    // console.log(loggedInUser.hospitalName)
    // Declare blank obj
    let filterObj = {};
    // check user
    if (!!loggedInUser && loggedInUser.userType === "User") {
    filterObj = {
      $match: {$and:[
        {"deviceInfo.Hospital_Name":loggedInUser.hospitalName},
        {"deviceInfo.addTofocus":true},
        // {"deviceReqData.userId":loggedInUser._id},
        {deviceId: { $regex: ".*" + search + ".*", $options: "i" }}
      ]}
    }
  } else {
    filterObj = {
      $match:{$or:[
        {"deviceInfo.addTofocus":true},
        {deviceId: { $regex: ".*" + search + ".*", $options: "i" }},
      ]}
    } 
  }
    
    
  // check user
  
  const activeDevices = await statusModel.aggregate([
    {
      $match: {
        "message":"ACTIVE",
      }
    },
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
      $lookup:
      {
        from: "assigned_devices_tousers",
        localField: "deviceId",
        foreignField: "deviceId",
        as: "deviceReqData"
      }
    },
    // For this data model, will always be 1 record in right-side
    // of join, so take 1st joined array element
    {
      "$set": {
        "deviceReqData": {"$first": "$deviceReqData"},
      }
    },
    // Extract the joined embeded fields into top level fields
    {
      "$set": {"isAssigned": "$deviceReqData.isAssigned"},
    },
    filterObj,
    // {
    //   $project:{
    //     "createdAt":0, "__v":0, "deviceInfo.__v":0,"deviceInfo.createdAt":0,
    //     "deviceInfo.updatedAt":0, "deviceInfo.Status":0,
    //   }
    // },
    {
      "$unset": [
        "deviceReqData",
        "__v",
        "createdAt",
        "deviceInfo.__v",
        "deviceInfo.createdAt",
        "deviceInfo.updatedAt",
        "deviceInfo.Status"
      ]
    },
    {
      $sort: { updatedAt:-1 },
    },
  ]);
   
  const inactiveDevices = await statusModel.aggregate([
    {
      $match: {
        "message":"INACTIVE",
      }
    },
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
      $lookup:
      {
        from: "assigned_devices_tousers",
        localField: "deviceId",
        foreignField: "deviceId",
        as: "deviceReqData"
      }
    },
    // For this data model, will always be 1 record in right-side
    // of join, so take 1st joined array element
    {
      "$set": {
        "deviceReqData": {"$first": "$deviceReqData"},
      }
    },
    // Extract the joined embeded fields into top level fields
    {
      "$set": {"isAssigned": "$deviceReqData.isAssigned"},
    },
    filterObj,
    {
      "$unset": [
        "deviceReqData",
        "__v",
        "createdAt",
        "deviceInfo.__v",
        "deviceInfo.createdAt",
        "deviceInfo.updatedAt",
        "deviceInfo.Status"
      ]
    },
    {
      $sort: { updatedAt:-1 },
    },
  ]);
  var finalArr = [...activeDevices, ...inactiveDevices];
  // remove duplicate records
  var key = "deviceId";
  let arrayUniqueByKey = [...new Map(finalArr.map(item => [item[key], item])).values()];

  // let resArr1 = [];
  // let resArr2 = [];
  // filter data on the basis of userType
 
  // console.log(loggedInUser)
  // get data by user role
  // console.log(333, resultArr)
  // For pagination
  const paginateArray =  (arrayUniqueByKey, page, limit) => {
  const skip = arrayUniqueByKey.slice((page - 1) * limit, page * limit);
  return skip;
  };

  var allDevices = paginateArray(arrayUniqueByKey, page, limit)
  if (arrayUniqueByKey.length > 0) {
    return res.status(200).json({
      status: 200,
      statusValue: "SUCCESS",
      message: "Event lists has been retrieved successfully.",
      data: { data: allDevices, },
      totalDataCount: arrayUniqueByKey.length,
      totalPages: Math.ceil( (arrayUniqueByKey.length)/ limit),
      currentPage: page,
      // tempData: allDevices,
    })
  }
  return res.status(400).json({
    status: 400,
    statusValue: "FAIL",
    message: 'Data not found.',
    data: {}
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


// get all devices by on the basis of userType
const getAllDeviceId = async (req, res) => {
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

    // get loggedin user details
    const token = req.headers["authorization"].split(' ')[1];
    const verified = await jwtr.verify(token, process.env.JWT_SECRET);
    const loggedInUser = await User.findById({_id:verified.user});
    // console.log(loggedInUser.hospitalName)
    // Declare blank obj
    let filterObj = {};
    // check user
    if (!!loggedInUser && loggedInUser.userType === "Hospital-Admin") {
      filterObj = {
        $match: {$and:[
          {"deviceInfo.Hospital_Name":loggedInUser.hospitalName},
          {deviceId: { $regex: ".*" + search + ".*", $options: "i" }}
        ]}
      }
    } else if(!!loggedInUser && loggedInUser.userType === "Super-Admin") {
      filterObj = {
        $match:{deviceId: { $regex: ".*" + search + ".*", $options: "i" }}
      }
    } else if(!!loggedInUser && loggedInUser.userType === "Dispatch") {
      filterObj = {
        $match:{deviceId: { $regex: ".*" + search + ".*", $options: "i" }}
    } 
  } else if (!!loggedInUser && loggedInUser.userType === "Production") {
    filterObj = {
      $match:{deviceId: { $regex: ".*" + search + ".*", $options: "i" }}
    } 
  } else if (!!loggedInUser && loggedInUser.userType === "User") {
    filterObj = {
      $match: {$and:[
        {"deviceInfo.Hospital_Name":loggedInUser.hospitalName},
        {deviceId: { $regex: ".*" + search + ".*", $options: "i" }}
      ]}
    }
  } 
  else if (!!loggedInUser && loggedInUser.userType === "Assistant") {
    filterObj = {
      $match: {$and:[
        {"deviceInfo.Hospital_Name":loggedInUser.hospitalName},
        {deviceId: { $regex: ".*" + search + ".*", $options: "i" }}
      ]}
    }
  }
  else if (!!loggedInUser && loggedInUser.userType === "Doctor") {
    // console.log(loggedInUser.accessHospital)
    filterObj = {
      $match: {$and:[
        {"deviceInfo.Hospital_Name":{$in:loggedInUser.accessHospital}},
        {deviceId: { $regex: ".*" + search + ".*", $options: "i" }}
      ]}
    }
  } else {
    filterObj = {
      $match:{deviceId: { $regex: ".*" + search + ".*", $options: "i" }}
    } 
  }
    
    
    // check user
  
  const activeDevices = await statusModel.aggregate([
    {
      $match: {
        "message":"ACTIVE",
      }
    },
    {
      $lookup:
      {
        from: "registerdevices",
        localField: "deviceId",
        foreignField: "DeviceId",
        as: "deviceInfo"
      }
    },
    filterObj,
    {
      $project:{
        "createdAt":0, "__v":0, "deviceInfo.__v":0,"deviceInfo.createdAt":0,"deviceInfo.isAssigned":0,
        "deviceInfo.updatedAt":0, "deviceInfo.Status":0,
      }
    },
    {
      $sort: { updatedAt:-1 },
    },
  ]);
   
  
  const inactiveDevices = await statusModel.aggregate([
    {
      $match: {
        "message":"INACTIVE",
      }
    },
    {
      $lookup:
        {
          from: "registerdevices",
          localField: "deviceId",
          foreignField: "DeviceId",
          as: "deviceInfo"
        }
    },
    filterObj,
    {
      $project:{
        "createdAt":0, "__v":0, "deviceInfo.__v":0,"deviceInfo.createdAt":0,"deviceInfo.isAssigned":0,
        "deviceInfo.updatedAt":0,"deviceInfo.Status":0,
      }
    },
    {
      $sort: { updatedAt:-1 },
    },
  ]);

    var finalArr = [...activeDevices, ...inactiveDevices];
    // remove duplicate records
    var key = "deviceId";
    let updatedArray = []
    let arrayUniqueByKey = [...new Map(finalArr.map(item => [item[key], item])).values()];


    // show isAssigned key for doctor role or assistant role
    if (!!loggedInUser && (loggedInUser.userType === "Doctor")) {
      const assignDeviceData = await assignDeviceTouserModel.find({ userId: loggedInUser._id })

      // map data for isAssigned key 
      function updateIsAssigned(arrayUniqueByKey, assignDeviceData) {
        // Map deviceId to assignDeviceData for faster lookup
        const assignDeviceMap = assignDeviceData.reduce((map, assign) => {
          map[assign.deviceId] = assign;
          return map;
        }, {});

        // Update isAssigned based on matching deviceId
        return arrayUniqueByKey.map(item => {
          const assignInfo = assignDeviceMap[item.deviceId];
          // console.log(11,assignInfo)
          if (assignInfo && assignInfo.isAssigned === 'Accepted') {
            item.isAssigned = true;
          } else {
            item.isAssigned = false;
          }
          return item;
        });
      }

      updatedArray = updateIsAssigned(arrayUniqueByKey, assignDeviceData);
      // console.log(123, updatedArray);

    } else if (!!loggedInUser && (loggedInUser.userType === "Assistant")) {
      const assignDeviceData = await assignDeviceTouserModel.find({ securityCode: loggedInUser.securityCode })
      // start
      function updateAndFilterArray(arrayUniqueByKey, assignDeviceData) {
        // Map deviceId to isAssigned for faster lookup
        const isAssignedMap = assignDeviceData.reduce((map, assign) => {
          map[assign.deviceId] = assign.isAssigned === 'Accepted';
          return map;
        }, {});

        // Filter and update arrayUniqueByKey
        const filteredArray = arrayUniqueByKey.filter(item => {
          const isAssigned = isAssignedMap[item.deviceId];
          if (isAssigned !== undefined) {
            item.addTofocus = isAssigned;
            return true;
          }
          return false;
        });

        return filteredArray;
      }

      const filteredArray = updateAndFilterArray(arrayUniqueByKey, assignDeviceData);
      // console.log(123,filteredArray);
      const paginateArray = (filteredArray, page, limit) => {
        const skip = filteredArray.slice((page - 1) * limit, page * limit);
        return skip;
      };

      var allDevices = paginateArray(filteredArray, page, limit)
      
      return res.status(200).json({
        status: 200,
        statusValue: "SUCCESS",
        message: "Event lists has been retrieved successfully.",
        data: !!allDevices ? { data: allDevices } : {},
        totalDataCount: filteredArray.length,
        totalPages: Math.ceil((filteredArray.length) / limit),
        currentPage: page,
        // tempData: allDevices,
      })

    }

    updatedArray = arrayUniqueByKey

    // For pagination
    const paginateArray = (updatedArray, page, limit) => {
      const skip = updatedArray.slice((page - 1) * limit, page * limit);
      return skip;
    };

    var allDevices = paginateArray(updatedArray, page, limit)
    if (updatedArray.length > 0) {
      return res.status(200).json({
        status: 200,
        statusValue: "SUCCESS",
        message: "Event lists has been retrieved successfully.",
        data: { data: allDevices, },
        totalDataCount: updatedArray.length,
        totalPages: Math.ceil((updatedArray.length) / limit),
        currentPage: page,
        // tempData: allDevices,
      })
    }
    return res.status(400).json({
      status: 400,
      statusValue: "FAIL",
      message: 'Data not found.',
      data: {}
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
 * desc     Alert
 * api      POST @/api/logger/logs/alerts/:projectCode
 */
const createAlerts = async (req, res, next) => {
  try {
    const { project_code } = req.params;
    // check project exist or not
    const findProjectWithCode = await Projects.findOne({ code: project_code });
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 0,
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

    if (!findProjectWithCode) {
      return res.status(404).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Project does not exist',
            msg: 'Project does not exist',
            type: 'MongoDb Error',
          },
        },
      });
    }
    const collectionName = findProjectWithCode.alert_collection_name;

    const modelReference = require(`../model/${collectionName}`);
    const { did, type, ack, priority, date } = req.body;
    let dbSavePromise = ack.map(async (ac) => {
      const putDataIntoLoggerDb = await new modelReference({
        did: did,
        ack: {
          msg: ac.msg,
          code: ac.code,
          date: ac.timestamp,
        },
        type: type,
        priority: priority,
        date: date
      });

      return putDataIntoLoggerDb.save(putDataIntoLoggerDb);
    });
    
    let alerts = await Promise.allSettled(dbSavePromise);
    //console.log(alerts,'alerts');

    var alertsErrArr = [];
    var alertsErrMsgArr = [];

    alerts.map((alert) => {
      alertsErrArr.push(alert.status);
      if (alert.status === 'rejected') {
        alertsErrMsgArr.push(alert.reason.message);
      }
    });

    if (!alertsErrArr.includes('rejected')) {
      return res.status(201).json({
        status: 1,
        data: { alertCount: alerts.length },
        message: 'Successful',
      });
    } else {
      res.status(400).json({
        status: alertsErrArr.length === alerts.length ? -1 : 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: alertsErrMsgArr.join(' | '),
            msg: `Error saving ${alertsErrMsgArr.length} out of ${alerts.length} alert(s)`,
            type: 'ValidationError',
          },
        },
      });
    }
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
 * desc     Alert
 * api      POST @/api/logger/logs/alerts-new/:projectCode
 */
const createAlertsNew = async (req, res) => {
  try {
    const { project_code } = req.params;
    // check project exist or not
    const findProjectWithCode = await Projects.findOne({ code: project_code });
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 0,
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
    // console.log(11,req.body)
    if (!findProjectWithCode) {
      return res.status(404).json({
        status: 404,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Project does not exist',
            msg: 'Project does not exist',
            type: 'MongoDb Error',
          },
        },
      });
    }
    const collectionName = findProjectWithCode.alert_collection_name;
    
    const modelReference = require(`../model/${collectionName}`);
    const { did, type, ack, date } = req.body;
    // console.log(12,req.body)
    // ack = req.body.ack
    // if (ack.length<1) {
    //   return res.status(400).json({
    //     status: 400,
    //     data: req.body,
    //     message: 'ack array is empty',
    //   });
    // }
    // { ack: [], did: 'd6edb19162a04c8b', type: '002' }
    // check alert exist or not
    const checkAlert = await modelReference.find({did:did})
    if (!!checkAlert.length>0) {
      await modelReference.deleteMany({did:did})
    }
    let dbSavePromise = ack.map(async (ac) => {
      const putDataIntoLoggerDb = await new modelReference({
        did: did,
        ack: {
          msg: ac.msg,
          code: ac.code,
          date: ac.timestamp,
        },
        type: type,
        priority: ac.priority,
        date: date
      });

      return putDataIntoLoggerDb.save(putDataIntoLoggerDb);
    });
    
    let alerts = await Promise.allSettled(dbSavePromise);
    //console.log(alerts,'alerts');

    var alertsErrArr = [];
    var alertsErrMsgArr = [];

    alerts.map((alert) => {
      alertsErrArr.push(alert.status);
      if (alert.status === 'rejected') {
        alertsErrMsgArr.push(alert.reason.message);
      }
    });

    if (!alertsErrArr.includes('rejected')) {
      // checl alarm level
      if (req.body.priority === "ALARM_HIGH_LEVEL") {
        // check deviceId for particular fcm token
        const checkDeviceId = await fcmTokenModel.find({deviceIds:{$in:req.body.did}})
        
       
        // console.log(11,checkDeviceId)
        // start fcm services for notification
        checkDeviceId.forEach(element => {
          
          const receivedToken = element.fcmToken;
          const message = {
            notification: {
              title:"AgVa-Pro-Ventilator-Alert",
              body:"TC-9 Ventilator patient disconnected.",
            },
            token:receivedToken,
          }
          getMessaging()
          .send(message) 
        });
      }

      // end fcm services
      return res.status(201).json({
        status: 201,
        data: { alertCount: alerts.length },
        message: 'Successful',
      });
    } else {
      res.status(400).json({
        status: alertsErrArr.length === alerts.length ? -1 : 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: alertsErrMsgArr.join(' | '),
            msg: `Error saving ${alertsErrMsgArr.length} out of ${alerts.length} alert(s)`,
            type: 'ValidationError',
          },
        },
      });
    }
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
}


/**
 * desc     Alert
 * api      POST @/api/logger/logs/alerts-new/v2/:productCode
 */
const createAlertsNewV2 = async (req, res) => {
  try {
    // console.log(11,req.body)
    if (req.params.productCode !== "003") {
      return res.status(404).json({
        status: 404,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Product code must be 003',
            msg: 'Product code must be 003',
            type: 'MongoDb Error',
          },
        },
      });
    }
  
    const { did, type, ack, date } = req.body

    // check alert data
    const checkAlert = await alert_ventilator_collectionV2.find({did:did})
    if (!!checkAlert.length>0) {
      await alert_ventilator_collectionV2.deleteMany({did:did})
    }

    // save alert data
    let dbSavePromise = ack.map(async (ac) => {
      const putDataIntoLoggerDb = await new alert_ventilator_collectionV2({
        did: did,
        ack: {
          msg: ac.msg,
          code: ac.code,
          date: ac.timestamp,
        },
        type: type,
        priority: ac.priority,
        date: date
      })

      return putDataIntoLoggerDb.save(putDataIntoLoggerDb);
    });
    
    let alerts = await Promise.allSettled(dbSavePromise);
    //console.log(alerts,'alerts');

    var alertsErrArr = [];
    var alertsErrMsgArr = [];

    alerts.map((alert) => {
      alertsErrArr.push(alert.status);
      if (alert.status === 'rejected') {
        alertsErrMsgArr.push(alert.reason.message);
      }
    });

    if (!alertsErrArr.includes('rejected')) {
      // check alarm level
      if (req.body.priority === "ALARM_HIGH_LEVEL") {
        // start fcm services for notification
       
        const receivedToken = "dZW3I-7PR5urOZkKbzhfgU:APA91bGn3mWcBIAj4q31IZufjGyGEAKXox7dfpImspXXw24JcR6zmvYCgggkK2qorIJwLWVQgyT5kdPVm_ckpDaF2x82QSXUGTng0kRS7DdfFgjWhtKl8Qxyf06BQBpz3scV9R_zzJU7";
        const message = {
            notification: {
              title:"AgVa-Pro-Ventilator-Alert",
              body:"TC-9 Ventilator patient disconnected.",
            },
            token:receivedToken,
        }
        getMessaging()
        .send(message)
      }
      
      // end fcm services

      return res.status(201).json({
        status: 201,
        data: { alertCount: alerts.length },
        message: 'Successful',
      });
    } else {
      res.status(400).json({
        status: alertsErrArr.length === alerts.length ? -1 : 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: alertsErrMsgArr.join(' | '),
            msg: `Error saving ${alertsErrMsgArr.length} out of ${alerts.length} alert(s)`,
            type: 'ValidationError',
          },
        },
      });
    }
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
}

// create or save device id from ventilators
const createEvents = async (req, res, next) => {
  try {
    const { project_code } = req.params;
    const findProjectWithCode = await Projects.findOne({ code: project_code });
    //console.log(findProjectWithCode,'findProjectWithProjectCode----')
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 0,
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
    if (!findProjectWithCode) {
      return res.status(404).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Project does not exist',
            msg: 'Project does not exist',
            type: 'MongoDb Error',
          },
        },
      });
    }
    const collectionName = findProjectWithCode.event_collection_name;
    //console.log(collectionName,'collectionName-----')
    const modelReference = require(`../model/${collectionName}`);
    //console.log(modelReference,'modelReference');
    const { did, type, message, date } = req.body;
    // console.log(`did : ${did}`)
    if (!did || !type || !message || !date) {
      return res.status(400).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Please fill all the details.',
            msg: 'Please fill all the details.',
            type: 'Client Error',
          },
        },
      });
    }
    const events = await new modelReference({
      did: did,
      message: message,
      type: type,
      date: date,
    });

    console.log(`did : ${did} message : ${message} type : ${type} date : ${date}`);

    const SaveEvents = await events.save(events);
    if (SaveEvents) {
      res.status(201).json({
        status: 201,
        data: { eventCounts: SaveEvents.length },
        message: 'Event has been added successfully!',

      });
    }
    else {
      res.status(500).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Some error happened during registration',
            msg: 'Some error happened during registration',
            type: 'MongodbError',
          },
        },
      }); I
    }
  }
  catch (err) {
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

// create events or save device id -- for all upcomming products
const createEventsV2 = async (req, res, next) => {
  try {
    
    if (req.params.productCode !== "003") {
      return res.status(404).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Product code must be 003',
            msg: 'Product code must be 003',
            type: 'MongoDb Error',
          },
        },
      });
    }
    
    //console.log(modelReference,'modelReference');
    const { did, type, message, date } = req.body;
    // console.log(`did : ${did}`)
    if (!did || !type || !message || !date) {
      return res.status(400).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Please fill all the details.',
            msg: 'Please fill all the details.',
            type: 'Client Error',
          },
        },
      });
    }
    // const dd = await event_ventilator_collection_v2.find()
    const events = new event_ventilator_collection_v2({
      did: did,
      message: message,
      type: type,
      date: date,
    });
    console.log(req.body)
    console.log(`did : ${did} message : ${message} type : ${type} date : ${date}`);

    const SaveEvents = await events.save(events);
    if (SaveEvents) {
      res.status(201).json({
        status: 201,
        data: { eventCounts: SaveEvents.length },
        message: 'Event has been added successfully!',
      });
    }
    else {
      return res.status(400).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'data not added',
            msg: 'Some error happened during registration',
            type: 'MongodbError',
          },
        },
      }); I
    }
  }
  catch (err) {
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


const createTrends = async (req, res, next) => {
  try {

    const { project_code } = req.params;
    const findProjectWithCode = await Projects.findOne({ code: project_code });
    //console.log(findProjectWithCode,'findProjectWithProjectCode----')

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 0,
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
    if (!findProjectWithCode) {
      return res.status(404).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Project does not exist',
            msg: 'Project does not exist',
            type: 'MongoDb Error',
          },
        },
      });
    }



    const collectionName = findProjectWithCode.trends_collection_name;
    console.log(collectionName,'collectionName-----')
    const modelReference = require(`../model/${collectionName}`);
    console.log(modelReference,'modelReference');
    const { did,time, type,mode,pip,peep,mean_Airway,vti,vte,mve,mvi,fio2,respiratory_Rate,ie,tinsp,texp,averageLeak,sPo2,pr} = req.body;
    if (!did || !time || !type ||!mode|| !pip|| !peep|| !mean_Airway|| !vti|| !vte|| !mve|| !mvi|| !fio2|| !respiratory_Rate|| !ie|| !tinsp|| !texp|| !averageLeak || !sPo2 || !pr) {
      return res.status(400).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Please fill all the details.',
            msg: 'Please fill all the details.',
            type: 'Client Error',
          },
        },
      });

    }
    const trends = await new modelReference({
      did:did,
      time:time,
       type:type,
       mode:mode,
       pip:pip,
       peep:peep,
       mean_Airway:mean_Airway,
       vti:vti,
       vte:vte,
       mve:mve,
       mvi:mvi,
       fio2:fio2,
       respiratory_Rate:respiratory_Rate,
       ie:ie,
       tinsp:tinsp,
       texp:texp,
       averageLeak:averageLeak,
       sPo2:sPo2,
       pr:pr
    });
    const SaveTrends = await trends.save(trends);
    // console.log(11,SaveTrends)
    // console.log(22,req.body)

    if(deviceIdArr.includes(SaveTrends.did)) {
      console.log(true)
      
    }else{
      deviceIdArr.push(SaveTrends.did)
      
    }
    if (SaveTrends) {
      return res.status(201).json({
        status: 1,
        data: { eventCounts: SaveTrends.length },
        message: 'Trends add!',
      });
    }

    else {
      res.status(500).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Some error happened during registration',
            msg: 'Some error happened during registration',
            type: 'MongodbError',
          },
        },
      }); I
    }
  }
  catch (err) {
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


const createTrendsV2 = async (req, res) => {
  try {

    const { project_code } = req.params;
    const findProjectWithCode = req.params.project_code;
    // if (req.params.) {

    // }
    //console.log(findProjectWithCode,'findProjectWithProjectCode----')

    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //   return res.status(400).json({
    //     status: 0,
    //     data: {
    //       err: {
    //         generatedTime: new Date(),
    //         errMsg: errors
    //           .array()
    //           .map((err) => {
    //             return `${err.msg}: ${err.param}`;
    //           })
    //           .join(' | '),
    //         msg: 'Invalid data entered.',
    //         type: 'ValidationError',
    //       },
    //     },
    //   });
    // }
    if (!findProjectWithCode) {
      return res.status(404).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Project does not exist',
            msg: 'Project does not exist',
            type: 'MongoDb Error',
          },
        },
      });
    }
    
    const { did, time, spo2, pr, hr, ecgRR, iBP_S, iBP_D, cgm, etCo2, rr, nibp_S, nibp_D, temp1, temp2, iBP2_S, iBP2_D} = req.body;
    // if (!!did || !!time || !!spo2 || !!pr || !!hr || !!ecgRR || !!iBP_S || !!iBP_D || !!cgm || !!etCo2 || !!rr || !!nibp_S || !!nibp_D || !!temp1 || !!temp2 || !!iBP2_S || !!iBP2_D) {
    //   return res.status(400).json({
    //     status: 0,
    //     data: {
    //       err: {
    //         generatedTime: new Date(),
    //         errMsg: 'Please fill all the details.',
    //         msg: 'Please fill all the details.',
    //         type: 'Client Error',
    //       },
    //     },
    //   });
    // }
    const trends = await new trends_ventilator_collectionV2_model({
      did:did, 
      time:time, 
      spo2:spo2, 
      pr:pr, 
      hr:hr, 
      ecgRR:ecgRR, 
      iBP_S:iBP_S, 
      iBP_D:iBP_D, 
      cgm:cgm, 
      etCo2:etCo2, 
      rr:rr, 
      nibp_S:nibp_S, 
      nibp_D:nibp_D, 
      temp1:temp1, 
      temp2:temp2, 
      iBP2_S:iBP2_S, 
      iBP2_D:iBP2_D,
      type:findProjectWithCode,
    });
    const SaveTrends = await trends.save(trends);
    // console.log(11,SaveTrends)
    // console.log(22,req.body)

    if(deviceIdArr.includes(SaveTrends.did)) {
      console.log(true)
      
    }else{
      deviceIdArr.push(SaveTrends.did)
      
    }
    if (SaveTrends) {
      return res.status(201).json({
        status: 1,
        data: { eventCounts: SaveTrends.length },
        message: 'Trends add!',
      });
    }

    else {
      res.status(500).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Some error happened during registration',
            msg: 'Some error happened during registration',
            type: 'MongodbError',
          },
        },
      }); I
    }
  }
  catch (err) {
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


const getTrendsWithFilter = async (req, res) => {
  try {
    const { projectCode } = req.params;

    if (!req.query.projectType) {
      return res.status(400).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Project type is required',
            msg: 'Project type is required',
            type: 'Client Error',
          },
        },
      });
    }

    const isProjectExist = await Projects.findOne({ code: projectCode });
    if (!isProjectExist) {
      return res.status(404).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Project not found.',
            msg: 'Project not found.',
            type: 'Internal Server Error',
          },
        },
      });
    }

    const collectionName = require(`../model/${isProjectExist.trends_collection_name}.js`);

    let dt = new Date(req.query.endDate);
    dt.setDate(dt.getDate() + 1);

    var sortOperator = { $sort: {} };
    let sort = req.query.sort || '-createdAt';

    sort.includes('-')
      ? (sortOperator['$sort'][sort.replace('-', '')] = -1)
      : (sortOperator['$sort'][sort] = 1);

    var matchOperator = {
      $match: {
        createdAt: {
          $gte: new Date(req.query.startDate),
          $lte: dt,
        },
        type: req.query.projectType,
      },
    };

    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 500;
    let skip = (page - 1) * limit;
    //console.log(sortOperator);

    const data = await collectionName.aggregate([
      {
        $facet: {
          totalRecords: [
            matchOperator,
            {
              $count: 'total',
            },
          ],
          data: [
            matchOperator,
            sortOperator,
            { $skip: skip },
            { $limit: limit },
          ],
        },
      },
    ]);
    //console.log(data,'data');

    return res.status(200).json({
      status: 1,
      message: 'Getting all trends',
      data: {
        count: data[0]?.totalRecords[0]?.total,
        pageLimit: data[0]?.data.length,
        alerts: data[0]?.data,
      },
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
 * desc     get project withpt filter
 * api      @/api/logger/projects/getDetails/:projectCode
 *
 */
const getFilteredLogs = async (req, res) => {
  try {
    const { projectCode } = req.params;

    if (!req.query.projectType) {
      return res.status(400).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Project type is required',
            msg: 'Project type is required',
            type: 'Client Error',
          },
        },
      });
    }
    console.time('TIME TAKEN IN THE OPERATION');
    const isProjectExist = await Projects.findOne({ code: projectCode });
    if (!isProjectExist) {
      return res.status(404).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Project not found',
            msg: 'Project not found',
            type: 'Client Error',
          },
        },
      });
    }

    const collectionName = require(`../model/${isProjectExist.collection_name}.js`);
    //console.log(collectionName,'collectionName');

    let dt = new Date(req.query.endDate);
    dt.setDate(dt.getDate() + 1);

    var sortOperator = { $sort: {} };
    let sort = req.query.sort || '-createdAt';

    sort.includes('-')
      ? (sortOperator['$sort'][sort.replace('-', '')] = -1)
      : (sortOperator['$sort'][sort] = 1);

    var matchOperator = {
      $match: {
        'log.date': {
          $gte: new Date(req.query.startDate),
          $lte: dt,
        },
        type: req.query.projectType,
      },
    };
    let logMatch = req.query.logType;
    logMatch
      ? (matchOperator['$match']['log.type'] = logMatch)
      : delete matchOperator['$match']['log.type'];

    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 500;
    let skip = (page - 1) * limit;

    const data = await collectionName.aggregate([
      {
        $facet: {
          totalRecords: [
            matchOperator,
            {
              $count: 'total',
            },
          ],
          data: [
            matchOperator,
            {
              $lookup: {
                from: 'devices',
                localField: 'device',
                foreignField: '_id',
                as: 'device',
              },
            },
            {
              $unwind: '$device',
            },
            sortOperator,
            { $skip: skip },
            { $limit: limit },
          ],
        },
      },
    ]);
    console.timeEnd('TIME TAKEN IN THE OPERATION');
    return res.status(200).json({
      status: 1,
      message: 'Getting all logs',
      data: {
        count: data[0]?.totalRecords[0]?.total,
        pageLimit: data[0]?.data.length,
        logs: data[0]?.data,
      },

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
 * desc     get project with filter
 * api      @/api/logger/projects/getDetails/:projectCode
 *
 */
const getAlertsWithFilter = async (req, res) => {
  try {
    const { projectCode } = req.params;

    if (!req.query.projectType) {
      return res.status(400).json({
        status: 0,
        statusCode: 400,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Project type is required',
            msg: 'Project type is required',
            type: 'Client Error',
          },
        },
      });
    }

    const isProjectExist = await Projects.findOne({ code: projectCode });
    if (!isProjectExist) {
      return res.status(404).json({
        status: 0,
        statusCode: 404,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Project not found.',
            msg: 'Project not found.',
            type: 'Internal Server Error',
          },
        },
      });
    }

    const collectionName = require(`../model/${isProjectExist.alert_collection_name}.js`);

    let dt = new Date(req.query.endDate);
    dt.setDate(dt.getDate() + 1);

    var sortOperator = { $sort: {} };
    let sort = req.query.sort || '-createdAt';

    sort.includes('-')
      ? (sortOperator['$sort'][sort.replace('-', '')] = -1)
      : (sortOperator['$sort'][sort] = 1);

    var matchOperator = {
      $match: {
        createdAt: {
          $gte: new Date(req.query.startDate),
          $lte: dt,
        },
        type: req.query.projectType,
      },
    };

    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 500;
    let skip = (page - 1) * limit;
    //console.log(sortOperator);

    const data = await collectionName.aggregate([
      {
        $facet: {
          totalRecords: [
            matchOperator,
            {
              $count: 'total',
            },
          ],
          data: [
            matchOperator,
            sortOperator,
            { $skip: skip },
            { $limit: limit },
          ],
        },
      },
    ]);
    //console.log(data,'data');

    return res.status(200).json({
      status: 1,
      statusCode: 200,
      message: 'Getting all alerts',
      data: {
        count: data[0]?.totalRecords[0]?.total,
        pageLimit: data[0]?.data.length,
        alerts: data[0]?.data,
      },
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


const getEventsWithFilter = async (req, res) => {
  try {
    const { projectCode } = req.params;

    if (!req.query.projectType) {
      return res.status(400).json({
        status: 0,
        statusCode: 400,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Project type is required',
            msg: 'Project type is required',
            type: 'Client Error',
          },
        },
      });
    }

    const isProjectExist = await Projects.findOne({ code: projectCode });
    if (!isProjectExist) {
      return res.status(404).json({
        status: 0,
        statusCode: 404,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Project not found.',
            msg: 'Project not found.',
            type: 'Internal Server Error',
          },
        },
      });
    }

    const collectionName = require(`../model/${isProjectExist.event_collection_name}.js`);

    let dt = new Date(req.query.endDate);
    dt.setDate(dt.getDate() + 1);

    var sortOperator = { $sort: {} };
    let sort = req.query.sort || '-createdAt';

    sort.includes('-')
      ? (sortOperator['$sort'][sort.replace('-', '')] = -1)
      : (sortOperator['$sort'][sort] = 1);

    var matchOperator = {
      $match: {
        createdAt: {
          $gte: new Date(req.query.startDate),
          $lte: dt,
        },
        type: req.query.projectType,
      },
    };

    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 500;
    let skip = (page - 1) * limit;
    console.log(sortOperator);
    const data = await collectionName.aggregate([
      {
        $facet: {
          totalRecords: [
            matchOperator,
            {
              $count: 'total',
            },
          ],
          data: [
            matchOperator,
            sortOperator,
            { $skip: skip },
            { $limit: limit },
          ],
        },
      },
    ]);

    return res.status(200).json({
      status: 1,
      statusCode: 200,
      message: 'Getting all events',
      data: {
        count: data[0]?.totalRecords[0]?.total,
        pageLimit: data[0]?.data.length,
        events: data[0]?.data,
      },
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


const crashFreeUsersDatewise = async (req, res) => {
  try {
    const { projectCode } = req.params;

    if (!req.query.projectType) {
    }

    if (!projectCode) {
      return res.status(500).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: '`Project code not provided.',
            msg: '`Project code not provided.',
            type: 'Internal Server Error',
          },
        },
      });
    }
    const projectCollection = await Projects.findOne({ code: projectCode });
    if (!projectCollection) {
      return res.status(404).json({
        status: 0,
        statusCode: 404,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Project not found.',
            msg: 'Project not found.',
            type: 'MongoDB Error',
          },
        },
      });
    }
    const collectionName = require(`../model/${projectCollection.collection_name}.js`);
    console.log('collectionName', collectionName)

    let dt = new Date(req.query.endDate);
    dt.setDate(dt.getDate() + 1);

    const countResponse = await collectionName.aggregate([
      {
        $match: {
          $and: [
            {
              'log.date': {
                $gte: new Date(req.query.startDate),
                $lte: dt,
              },
            },
            { 'log.type': { $ne: 'error' } },
            { type: req.query.projectType },
          ],
        },
      },
      {
        $lookup: {
          from: 'devices',
          localField: 'device',
          foreignField: '_id',
          as: 'device',
        },
      },
      {
        $group: {
          _id: '$device.did',
        },
      },
    ]);
    const response = await collectionName.aggregate([
      {
        $match: {
          $and: [
            {
              'log.date': {
                $gte: new Date(req.query.startDate),
                $lte: dt,
              },
            },
            { 'log.type': { $ne: 'error' } },
            { type: req.query.projectType },
          ],
        },
      },
      {
        $lookup: {
          from: 'devices',
          localField: 'device',
          foreignField: '_id',
          as: 'device',
        },
      },
      {
        $group: {
          _id: {
            DATE: { $substr: ['$log.date', 0, 10] },
            did: '$device.did',
          },
          data: { $sum: 1 },
        },
      },
      // // { $sort: { "DATE": -1 } },
      {
        $project: {
          _id: 0,
          date: '$_id.DATE',
          did: '$_id.did',
          data: 1,
        },
      },
      {
        $group: {
          _id: null,
          stats: { $push: '$$ROOT' },
        },
      },
      {
        $project: {
          stats: {
            $map: {
              input: getDaysArray(new Date(req.query.startDate), dt),
              as: 'date_new',
              in: {
                $let: {
                  vars: {
                    dateIndex: { $indexOfArray: ['$stats.date', '$$date_new'] },
                  },
                  in: {
                    $cond: {
                      if: { $ne: ['$$dateIndex', -1] },
                      then: {
                        $arrayElemAt: ['$stats', '$$dateIndex'],
                      },
                      else: {
                        date: { $substr: [{ $toDate: '$$date_new' }, 0, 10] },
                        did: null,
                        data: 0,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      {
        $unwind: '$stats',
      },
      {
        $replaceRoot: {
          newRoot: '$stats',
        },
      },
    ]);
    res.status(200).json({
      status: 1,
      statusCode: 200,
      data: { response, count: countResponse.length || 0 },
      message: 'Crash free users on the basis of date.',
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


const crashlyticsData = async (req, res) => {
  try {
    const { projectCode } = req.params;

    if (!req.query.projectType) {
      return res.status(400).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'project type is required',
            msg: 'project type is required',
            type: 'Client Error',
          },
        },
      });
    }

    if (!req.query.logMsg) {
      return res.status(400).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Log message not provided.',
            msg: 'Log message not provided.',
            type: 'ValidationError',
          },
        },
      });
    }

    var trimmedLogMsg;
    if (req.query.logMsg.length > 26) {
      trimmedLogMsg = req.query.logMsg.substring(0, 26);
    } else trimmedLogMsg = req.query.logMsg;
    trimmedLogMsg = trimmedLogMsg.replace('[', '');
    console.log(trimmedLogMsg, 'trimmedLogMsg');

    if (!projectCode) {
      return res.status(400).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Project code not provided.',
            msg: 'Project code not provided.',
            type: 'Mongodb Error',
          },
        },
      });
    }
    const projectCollection = await Projects.findOne({ code: projectCode });
    if (!projectCollection) {
      return res.status(404).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Project not found',
            msg: 'Project not found',
            type: 'Internal Server Error',
          },
        },
      });
    }
    // console.log(projectCollection);
    const collectionName = require(`../model/${projectCollection.collection_name}.js`);
    console.log(collectionName, 'collectionName');
    const versionResponse = await collectionName.aggregate([
      {
        $match: {
          $and: [
            // {$unwind : '$log'},
            {
              'log.date': {
                $gte: new Date(req.query.startDate),
                $lte: new Date(req.query.endDate),
              },
            },
            { 'log.message': { $regex: trimmedLogMsg } },
            { type: req.query.projectType },
          ],
        },
      },
      {
        $group: {
          _id: '$version',
          data: { $sum: 1 },
        },
      },
    ]);
    console.log(versionResponse, 'versionResponse');
    const osArchitectureResponse = await collectionName.aggregate([
      {
        $match: {
          $and: [
            // {$unwind : '$log'},
            {
              'log.date': {
                $gte: new Date(req.query.startDate),
                $lte: new Date(req.query.endDate),
              },
            },
            { 'log.message': { $regex: trimmedLogMsg } },
            { type: req.query.projectType },
          ],
        },
      },
      {
        $lookup: {
          from: 'devices',
          localField: 'device',
          foreignField: '_id',
          as: 'device',
        },
      },
      {
        $group: {
          _id: '$device.os.name',
          data: { $sum: 1 },
        },
      },
    ]);
    console.log(osArchitectureResponse, 'osArchitectureResponse')
    const modelNameResponse = await collectionName.aggregate([
      {
        $match: {
          $and: [
            // {$unwind : '$log'},
            {
              'log.date': {
                $gte: new Date(req.query.startDate),
                $lte: new Date(req.query.endDate),
              },
            },
            { 'log.message': { $regex: trimmedLogMsg } },
            { type: req.query.projectType },
          ],
        },
      },
      {
        $lookup: {
          from: 'devices',
          localField: 'device',
          foreignField: '_id',
          as: 'device',
        },
      },
      {
        $group: {
          _id: '$device.name',
          data: { $sum: 1 },
        },
      },
    ]);
    console.log(modelNameResponse, 'modelNameResponse')
    res.status(200).json({
      status: 1,
      data: { versionResponse, osArchitectureResponse, modelNameResponse },
      message: 'Crashlytics data on the basis of date.',
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


const crashlyticsData2 = async (req, res) => {
  try {
    const { did } = req.params;

    // if (!req.query.projectType) {
    //   return res.status(400).json({
    //     status: 0,
    //     data: {
    //       err: {
    //         generatedTime: new Date(),
    //         errMsg: 'project type is required',
    //         msg: 'project type is required',
    //         type: 'Client Error',
    //       },
    //     },
    //   });
    // }

    if (!req.query.logMsg) {
      return res.status(400).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Log message not provided.',
            msg: 'Log message not provided.',
            type: 'ValidationError',
          },
        },
      });
    }

    var trimmedLogMsg;
    if (req.query.logMsg.length > 26) {
      trimmedLogMsg = req.query.logMsg.substring(0, 26);
    } else trimmedLogMsg = req.query.logMsg;
    trimmedLogMsg = trimmedLogMsg.replace('[', '');
    console.log(trimmedLogMsg, 'trimmedLogMsg');

    if (!did) {
      return res.status(400).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'DeviceId not provided.',
            msg: 'DeviceId not provided.',
            type: 'Mongodb Error',
          },
        },
      });
    }
    const projectCollection = await Projects.findOne({ did: did });
    if (!projectCollection) {
      return res.status(404).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Project not found',
            msg: 'Project not found',
            type: 'Internal Server Error',
          },
        },
      });
    }
    // console.log(projectCollection);
    const collectionName = require(`../model/${projectCollection.collection_name}.js`);
    console.log(collectionName, 'collectionName');
    const versionResponse = await collectionName.aggregate([
      {
        $match: {
          $and: [
            // {$unwind : '$log'},
            {
              'log.date': {
                $gte: new Date(req.query.startDate),
                $lte: new Date(req.query.endDate),
              },
            },
            { 'log.message': { $regex: trimmedLogMsg } },
            { type: req.query.projectType },
          ],
        },
      },
      {
        $group: {
          _id: '$version',
          data: { $sum: 1 },
        },
      },
    ]);
    console.log(versionResponse, 'versionResponse');
    const osArchitectureResponse = await collectionName.aggregate([
      {
        $match: {
          $and: [
            // {$unwind : '$log'},
            {
              'log.date': {
                $gte: new Date(req.query.startDate),
                $lte: new Date(req.query.endDate),
              },
            },
            { 'log.message': { $regex: trimmedLogMsg } },
            { type: req.query.projectType },
          ],
        },
      },
      {
        $lookup: {
          from: 'devices',
          localField: 'device',
          foreignField: '_id',
          as: 'device',
        },
      },
      {
        $group: {
          _id: '$device.os.name',
          data: { $sum: 1 },
        },
      },
    ]);
    console.log(osArchitectureResponse, 'osArchitectureResponse')
    const modelNameResponse = await collectionName.aggregate([
      {
        $match: {
          $and: [
            // {$unwind : '$log'},
            {
              'log.date': {
                $gte: new Date(req.query.startDate),
                $lte: new Date(req.query.endDate),
              },
            },
            { 'log.message': { $regex: trimmedLogMsg } },
            { type: req.query.projectType },
          ],
        },
      },
      {
        $lookup: {
          from: 'devices',
          localField: 'device',
          foreignField: '_id',
          as: 'device',
        },
      },
      {
        $group: {
          _id: '$device.name',
          data: { $sum: 1 },
        },
      },
    ]);
    console.log(modelNameResponse, 'modelNameResponse')
    res.status(200).json({
      status: 1,
      data: { versionResponse, osArchitectureResponse, modelNameResponse },
      message: 'Crashlytics data on the basis of date.',
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


// UNUSED
const getErrorCountByOSArchitecture = async (req, res) => {
  try {
    const { projectCode } = req.params;
    const isProjectExist = await Projects.findOne({ code: projectCode });

    if (!req.query.projectType) {
      return res.status(400).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Project code not provided.',
            msg: 'Project code not provided.',
            type: 'Mongodb Error',
          },
        },
      });
    }

    if (!isProjectExist) {
      return res.status(404).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Project not found',
            msg: 'Project not found',
            type: 'Internal Server Error',
          },
        },
      });
    }

    const collectionName = require(`../model/${isProjectExist.collection_name}.js`);
    const typeWiseCount = await collectionName.aggregate([
      { $match: { 'log.type': 'error', type: req.query.projectType } },
      {
        $lookup: {
          from: 'devices',
          localField: 'device',
          foreignField: '_id',
          as: 'device',
        },
      },
      { $group: { _id: '$device.os.name', count: { $sum: 1 } } },
    ]);

    return res.status(200).json({
      status: 1,
      data: {
        typeWiseCount,
      },
      message: 'successfull',
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


const getLogsByLogType = async (req, res) => {
  try {
    const { projectCode } = req.params;

    if (!req.params.projectCode) {
      return res.status(400).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Project type not provided.',
            msg: 'Project type not provided.',
            type: 'Mongodb Error',
          },
        },
      });
    }

    const isProjectExist = await Projects.findOne({ code: projectCode });
    if (!isProjectExist) {
      return res.status(404).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Project not found',
            msg: 'Project not found',
            type: 'Internal Server Error',
          },
        },
      });
    }

    if (!req.query.projectType) {
      return res.status(400).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Project type not provided.',
            msg: 'Project type not provided.',
            type: 'Mongodb Error',
          },
        },
      });
    }

    if (!req.query.startDate || !req.query.endDate) {
      return res.status(400).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Provide start date and end date.',
            msg: 'Provide start date and end date.',
            type: 'ValidationError',
          },
        },
      });
    }

    const collectionName = require(`../model/${isProjectExist.collection_name}.js`);
    console.log(collectionName, 'collectionName')

    let dt = new Date(req.query.endDate);
    dt.setDate(dt.getDate() + 1);

    const typeWiseCount = await collectionName.aggregate([
      {
        $match: {
          'log.date': {
            $gte: new Date(req.query.startDate),
            $lte: dt,
          },
          type: req.query.projectType,
        },
      },
      { $group: { _id: '$log.type', count: { $sum: 1 } } },
      { $project: { logType: '$_id', count: 1, _id: 0 } },
    ]);
    const totalLogCount = await collectionName.aggregate([
      {
        $match: {
          'log.date': {
            $gte: new Date(req.query.startDate),
            $lte: dt,
          },
          type: req.query.projectType,
        },
      },
      { $group: { _id: 'null', count: { $sum: 1 } } },
    ]);
    const lastLogEntry = await collectionName.findOne().sort({ createdAt: -1 });

    return res.status(200).json({
      status: 1,
      data: {
        totalLogCount: totalLogCount.length ? totalLogCount[0].count : null,
        typeWiseCount,
        lastLogEntry: lastLogEntry ? lastLogEntry.createdAt : null,
      },
      message: 'successfull',
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


const dateWiseCrashCount = async (req, res) => {
  try {
    const { projectCode } = req.params;

    if (!req.query.projectType) {
      return res.status(400).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Project type not provided.',
            msg: 'Project type not provided.',
            type: 'Mongodb Error',
          },
        },
      });
    }

    if (!projectCode) {
      return res.status(400).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Project code not provided.',
            msg: 'Project code not provided.',
            type: 'Mongodb Error',
          },
        },
      });
    }
    const projectCollection = await Projects.findOne({ code: projectCode });
    if (!projectCollection) {
      return res.status(404).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Project not found',
            msg: 'Project not found',
            type: 'Internal Server Error',
          },
        },
      });
    }
    const collectionName = require(`../model/${projectCollection.collection_name}.js`);

    let dt = new Date(req.query.endDate);
    dt.setDate(dt.getDate() + 1);

    const countResponse = await collectionName.aggregate([
      {
        $match: {
          $and: [
            {
              'log.date': {
                $gte: new Date(req.query.startDate),
                $lte: dt,
              },
            },
            { type: req.query.projectType },
            { 'log.type': 'error' },
          ],
        },
      },
      {
        $lookup: {
          from: 'devices',
          localField: 'device',
          foreignField: '_id',
          as: 'device',
        },
      },
      {
        $group: {
          _id: '$device.did',
        },
      },
    ]);
    const response = await collectionName.aggregate([
      {
        $match: {
          'log.date': {
            $gte: new Date(req.query.startDate),
            $lte: dt,
          },
          'log.type': 'error',
          type: req.query.projectType,
        },
      },
      {
        $group: {
          _id: {
            DATE: { $substr: ['$log.date', 0, 10] },
          },
          data: { $sum: 1 },
        },
      },
      // { $sort: { "DATE": -1 } },
      {
        $project: {
          _id: 0,
          date: '$_id.DATE',
          data: 1,
        },
      },
      {
        $group: {
          _id: null,
          stats: { $push: '$$ROOT' },
        },
      },
      {
        $project: {
          stats: {
            $map: {
              input: getDaysArray(new Date(req.query.startDate), dt),
              as: 'date_new',
              in: {
                $let: {
                  vars: {
                    dateIndex: { $indexOfArray: ['$stats.date', '$$date_new'] },
                  },
                  in: {
                    $cond: {
                      if: { $ne: ['$$dateIndex', -1] },
                      then: {
                        $arrayElemAt: ['$stats', '$$dateIndex'],
                      },
                      else: {
                        date: { $substr: [{ $toDate: '$$date_new' }, 0, 10] },
                        data: 0,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      {
        $unwind: '$stats',
      },
      {
        $replaceRoot: {
          newRoot: '$stats',
        },
      },
    ]);
    res.status(200).json({
      status: 1,
      data: { response, count: countResponse.length || 0 },
      message: 'Log count on the basis of date.',
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

const dateWiseLogOccurrencesByLogMsg = async (req, res) => {
  try {
    const { projectCode } = req.params;

    if (!req.query.projectType) {
      return res.status(400).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Project Type not provided.',
            msg: 'Project Type not provided.',
            type: 'Mongodb Error',
          },
        },
      });
    }

    if (!projectCode) {
      return res.status(404).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Project not found',
            msg: 'Project not found',
            type: 'Internal Server Error',
          },
        },
      });
    }
    const projectCollection = await Projects.findOne({ code: projectCode });
    if (!projectCollection) {
      return res.status(404).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Project not found',
            msg: 'Project not found',
            type: 'Internal Server Error',
          },
        },
      });
    }

    if (!req.query.logMsg) {
      return res.status(400).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Log message not provided.',
            msg: 'Log message not provided.',
            type: 'ValidationError',
          },
        },
      });
    }

    var trimmedLogMsg;
    if (req.query.logMsg.length > 26) {
      trimmedLogMsg = req.query.logMsg.substring(0, 26);
    } else trimmedLogMsg = req.query.logMsg;
    if (trimmedLogMsg.includes('(') && !trimmedLogMsg.includes(')')) {
      trimmedLogMsg = trimmedLogMsg.concat(')');
    }
    trimmedLogMsg = trimmedLogMsg.replace('[', '');

    const collectionName = require(`../model/${projectCollection.collection_name}.js`);
    const response = await collectionName.aggregate([
      {
        $match: {
          $and: [
            // {$unwind : '$log'},
            {
              'log.date': {
                $gte: new Date(req.query.startDate),
                $lte: new Date(req.query.endDate),
              },
            },
            { 'log.message': { $regex: trimmedLogMsg } },
            { type: req.query.projectType },
          ],
        },
      },
      {
        $group: {
          _id: {
            DATE: { $substr: ['$log.date', 0, 10] },
          },
          data: { $sum: 1 },
        },
      },
      // { $sort: { "DATE": -1 } },
      {
        $project: {
          _id: 0,
          date: '$_id.DATE',
          data: 1,
        },
      },
      {
        $group: {
          _id: null,
          stats: { $push: '$$ROOT' },
        },
      },
      {
        $project: {
          stats: {
            $map: {
              input: getDaysArray(
                new Date(req.query.startDate),
                new Date(req.query.endDate)
              ),
              as: 'date_new',
              in: {
                $let: {
                  vars: {
                    dateIndex: { $indexOfArray: ['$stats.date', '$$date_new'] },
                  },
                  in: {
                    $cond: {
                      if: { $ne: ['$$dateIndex', -1] },
                      then: {
                        $arrayElemAt: ['$stats', '$$dateIndex'],
                      },
                      else: {
                        date: { $substr: [{ $toDate: '$$date_new' }, 0, 10] },
                        data: 0,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      {
        $unwind: '$stats',
      },
      {
        $replaceRoot: {
          newRoot: '$stats',
        },
      },
    ]);
    res.status(200).json({
      status: 1,
      data: { response },
      message: 'Log count per log message on the basis of date.',
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
const dateWiseLogOccurrencesByLogMsgWithDeviceId = async (req, res) => {
  try {
    const { did } = req.params;

    // if (!req.query.projectType) {
    //   return res.status(400).json({
    //     status: 0,
    //     data: {
    //       err: {
    //         generatedTime: new Date(),
    //         errMsg: 'Project Type not provided.',
    //         msg: 'Project Type not provided.',
    //         type: 'Mongodb Error',
    //       },
    //     },
    //   });
    // }

    if (!did) {
      return res.status(404).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'DeviceId not found',
            msg: 'DeviceId not found',
            type: 'Internal Server Error',
          },
        },
      });
    }
    const projectCollection = await Projects.findOne({ did: did });
    if (!projectCollection) {
      return res.status(404).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Project not found',
            msg: 'Project not found',
            type: 'Internal Server Error',
          },
        },
      });
    }

    if (!req.query.logMsg) {
      return res.status(400).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Log message not provided.',
            msg: 'Log message not provided.',
            type: 'ValidationError',
          },
        },
      });
    }

    var trimmedLogMsg;
    if (req.query.logMsg.length > 26) {
      trimmedLogMsg = req.query.logMsg.substring(0, 26);
    } else trimmedLogMsg = req.query.logMsg;
    if (trimmedLogMsg.includes('(') && !trimmedLogMsg.includes(')')) {
      trimmedLogMsg = trimmedLogMsg.concat(')');
    }
    trimmedLogMsg = trimmedLogMsg.replace('[', '');

    const collectionName = require(`../model/${projectCollection.collection_name}.js`);
    const response = await collectionName.aggregate([
      {
        $match: {
          $and: [
            // {$unwind : '$log'},
            {
              'log.date': {
                $gte: new Date(req.query.startDate),
                $lte: new Date(req.query.endDate),
              },
            },
            { 'log.message': { $regex: trimmedLogMsg } },
            { type: req.query.projectType },
          ],
        },
      },
      {
        $group: {
          _id: {
            DATE: { $substr: ['$log.date', 0, 10] },
          },
          data: { $sum: 1 },
        },
      },
      // { $sort: { "DATE": -1 } },
      {
        $project: {
          _id: 0,
          date: '$_id.DATE',
          data: 1,
        },
      },
      {
        $group: {
          _id: null,
          stats: { $push: '$$ROOT' },
        },
      },
      {
        $project: {
          stats: {
            $map: {
              input: getDaysArray(
                new Date(req.query.startDate),
                new Date(req.query.endDate)
              ),
              as: 'date_new',
              in: {
                $let: {
                  vars: {
                    dateIndex: { $indexOfArray: ['$stats.date', '$$date_new'] },
                  },
                  in: {
                    $cond: {
                      if: { $ne: ['$$dateIndex', -1] },
                      then: {
                        $arrayElemAt: ['$stats', '$$dateIndex'],
                      },
                      else: {
                        date: { $substr: [{ $toDate: '$$date_new' }, 0, 10] },
                        data: 0,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      {
        $unwind: '$stats',
      },
      {
        $replaceRoot: {
          newRoot: '$stats',
        },
      },
    ]);
    res.status(200).json({
      status: 1,
      data: { response },
      message: 'Log count per log message on the basis of date.',
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

// UNUSED
const getLogsCountWithOs = async (req, res) => {
  try {
    const { projectCode } = req.params;
    if (!projectCode) {
      return res.status(400).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Project code not provided.',
            msg: 'Project code not provided.',
            type: 'Mongodb Error',
          },
        },
      });
    }

    const projectCollection = await Projects.findOne({ code: projectCode });
    if (!projectCollection) {
      // throw new AppError(`Project not found.`, 404); // NJ-changes 13 Apr
      return res.status(404).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Project not found',
            msg: 'Project not found',
            type: 'Internal Server Error',
          },
        },
      });
    }

    const collectionName = require(`../model/${projectCollection.collection_name}.js`);

    const osTotalCount = await collectionName.countDocuments();
    const osParticularCount = await collectionName.aggregate([
      {
        $lookup: {
          from: 'devices',
          localField: 'device',
          foreignField: '_id',
          as: 'device',
        },
      },
      { $group: { _id: '$device.os.name', count: { $sum: 1 } } },
      { $project: { osArchitecture: '$_id', count: 1, _id: 0 } },
    ]);

    // console.log(osParticularCount);
    return res.status(200).json({
      status: 1,
      data: {
        deviceCount: osTotalCount,
        osParticularCount: osParticularCount[0].count,
      },
      message: 'successfull',
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

// UNUSED
const getLogsCountWithModelName = async (req, res) => {
  try {
    const { projectCode } = req.params;
    if (!projectCode) {
      // throw new AppError(`Project code not provided.`, 400); // NJ-changes 13 Apr
      return res.status(404).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Project Code not found',
            msg: 'Project Code not found',
            type: 'Mongodb Error',
          },
        },
      });
    }

    const projectCollection = await Projects.findOne({ code: projectCode });
    if (!projectCollection) {
      // throw new AppError(`Project not found.`, 404); // NJ-changes 13 Apr
      return res.status(404).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Project not found',
            msg: 'Project not found',
            type: 'Internal Server Error',
          },
        },
      });
    }

    const collectionName = require(`../model/${projectCollection.collection_name}.js`);

    const modelTotalCount = await collectionName.countDocuments();
    const modelNameParticularCount = await collectionName.aggregate([
      {
        $lookup: {
          from: 'devices',
          localField: 'device',
          foreignField: '_id',
          as: 'device',
        },
      },
      { $group: { _id: '$device.name', count: { $sum: 1 } } },
      { $project: { modelName: '$_id', count: 1, _id: 0 } },
    ]);
    return res.status(200).json({
      status: 1,
      data: {
        deviceCount: modelTotalCount,
        modelNameParticularCount: modelNameParticularCount[0].count,
      },
      message: 'successfull',
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
const getCrashOccurrenceByLogMsgWithDeviceId = async (req, res) => {
  try {
    const { did } = req.params;
    if (!did) {
      return res.status(400).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'DeviceId is required',
            msg: 'DeviceId is required',
            type: 'mongodb Error'

          }
        }
      });
    }


    if (!req.query.logMsg) {
      return res.status(400).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Message not provided.',
            msg: 'Message not provided.',
            type: 'Mongodb Error',
          },
        },
      });
    }
    // console.log(req.query.logMsg, 'ftrtdefffffffff');
    var trimmedLogMsg;
    if (req.query.logMsg.length > 26) {
      trimmedLogMsg = req.query.logMsg.substring(0, 26);
    } else trimmedLogMsg = req.query.logMsg;
    trimmedLogMsg = trimmedLogMsg.replace('[', '');

    const projectCollection = await Projects.findOne({ did: did });
    console.log(projectCollection, "projectCollection");
    if (!projectCollection) {
      return res.status(400).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Project code not provided.',
            msg: 'Project code not provided.',
            type: 'Mongodb Error',
          },
        },
      });
    }

    const collectionName = require(`../model/${projectCollection.collection_name}.js`);
    console.log(collectionName);

    const response = await collectionName.aggregate([
      {
        $match: {
          $and: [
            // {did:req.query.macId },
            { 'log.message': { $regex: trimmedLogMsg } },
            { 'log.type': 'error' },
            { type: req.query.projectType },
          ],
        },
      },
      {
        $lookup: {
          from: 'devices',
          localField: 'device',
          foreignField: '_id',
          as: 'device',
        },
      },
      {
        $group: {
          _id: '$device.did',
          count: { $sum: 1 }
        }
      },
    ]);
    console.log(response, 'response');


    return res.status(200).json({
      status: 1,
      data: {
        response,
      },
      message: 'successfull',
    });


  }
  catch (err) {
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
}

const getCrashOccurrenceByLogMsg = async (req, res) => {
  try {
    const { projectCode } = req.params;

    if (!req.query.projectType) {
      return res.status(404).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Project type not found',
            msg: 'Project type not found',
            type: 'Internal Server Error',
          },
        },
      });
    }

    if (!projectCode) {
      return res.status(400).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Project code not provided.',
            msg: 'Project code not provided.',
            type: 'Mongodb Error',
          },
        },
      });
    }

    if (!req.query.msg) {
      return res.status(400).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Message not provided.',
            msg: 'Message not provided.',
            type: 'Mongodb Error',
          },
        },
      });
    }

    var trimmedLogMsg;
    if (req.query.msg.length > 26) {
      trimmedLogMsg = req.query.msg.substring(0, 26);
    } else trimmedLogMsg = req.query.msg;
    trimmedLogMsg = trimmedLogMsg.replace('[', '');

    const projectCollection = await Projects.findOne({ code: projectCode });
    console.log(projectCollection, "projectCollection");

    if (!projectCollection) {
      return res.status(400).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Project code not provided.',
            msg: 'Project code not provided.',
            type: 'Mongodb Error',
          },
        },
      });
    }
    //console.log(collectionName);

    const collectionName = require(`../model/${projectCollection.collection_name}.js`);
    console.log(collectionName);

    const response = await collectionName.aggregate([
      {
        $match: {
          $and: [
            // {did:req.query.macId },
            { 'log.message': { $regex: trimmedLogMsg } },
            { 'log.type': 'error' },
            { type: req.query.projectType },
          ],
        },
      },
      {
        $lookup: {
          from: 'devices',
          localField: 'device',
          foreignField: '_id',
          as: 'device',
        },
      },
      {
        $group: {
          _id: '$device.did',
          count: { $sum: 1 }
        }
      },
    ]);
    console.log(response, 'response');


    return res.status(200).json({
      status: 1,
      data: {
        response,
      },
      message: 'successfull',
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

// UNUSED
const getErrorCountByVersion = async (req, res) => {
  try {
    const { projectCode } = req.params;
    const isProjectExist = await Projects.findOne({ code: projectCode });

    if (!req.query.projectType) {
      // throw new AppError(`project type is required`, 400); // NJ-changes 13 Apr
      return res.status(404).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Project type not found',
            msg: 'Project type not found',
            type: 'Internal server Error',
          },
        },
      });
    }

    if (!isProjectExist) {
      return res.status(404).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Project not found',
            msg: 'Project not found',
            type: 'Internal Server Error',
          },
        },
      });
    }

    const collectionName = require(`../model/${isProjectExist.collection_name}.js`);
    const typeWiseCount = await collectionName.aggregate([
      { $match: { 'log.type': 'error', type: req.query.projectType } },
      { $group: { _id: '$version', count: { $sum: 1 } } },
    ]);

    return res.status(200).json({
      status: 1,
      data: {
        typeWiseCount,
      },
      message: 'successfull',
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



module.exports = {
  createLogsV2,
  createAlerts,
  createAlertsNew,
  createTrends,
  getFilteredLogs,
  getAlertsById,
  getTrendsById,
  getTrendsWithFilter,
  getEventsById,
  getAlertsWithFilter,
  getEventsWithFilter,
  crashFreeUsersDatewise,
  crashlyticsData,
  getErrorCountByOSArchitecture,
  getLogsByLogType,
  dateWiseCrashCount,
  dateWiseLogOccurrencesByLogMsg,
  getLogsCountWithOs,
  getLogsCountWithModelName,
  getCrashOccurrenceByLogMsg,
  getErrorCountByVersion,
  createEvents,
  getLogsById,
  getAllDeviceId,
  getAllDevicesForUsers,
  crashlyticsData2,
  getCrashOccurrenceByLogMsgWithDeviceId,
  dateWiseLogOccurrencesByLogMsgWithDeviceId,
  getAllFocusedDevicesForUsers,
  createAlertsNewV2,
  createEventsV2,
  createTrendsV2
};





















/**
 * Hey Mike, How's it going ?
 * Not bad, John. Just trying to survive another monday, you know ?
 * I hear you. Mondays can be tough. Anyting exciting happening this week?
 * Not really, just the usual work grind. I have got that project deadline on friday. so it's heads 
 * down for me.
 * 
 * Ah, the joy of project deadlines. i have got a meeting with clients tomorrow. they always have last 
 * minute changes.
 * Okay tell me about it. clients seem to have sixth sense for that. How's the family?
 * they are good. the kids are keeping us our toes, as usual. how about yours ?
 * same here. Little league practice, dance classes - it's like running ataxi service sometimes.
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 */
















