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
const { deviceIdArr, trendsDataKey } = require('../middleware/msgResponse');
const alert_ventilator_collectionV2 = require('../model/alert_ventilator_collection_v2');
const event_ventilator_collection_v2 = require('../model/event_ventilator_collection_v2');
const { default: mongoose } = require('mongoose');
const trends_ventilator_collectionV2_model = require('../model/trends_ventilator_collection_v2')

///
const admin = require("firebase-admin");
// Initialize Firebase Admin SDK
const serviceAccount = require("../agvaapp-firebase-adminsdk-u6pru-1e70064b68.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// fcm services
// const {initializeApp, applicationDefault} = require("firebase-admin/app");
// const {getMessaging} = require('firebase-admin/messaging');
const fcmTokenModel = require('../model/fcmTockenModel');
const { registerDevice } = require('./RegisterDevice');
const statusModelV2 = require('../model/statusModelV2');
const logModelV2 = require('../model/logModelV2');
const fcmNotificationModel = require('../model/fcmNotificationModel');
const { title } = require('process');
const sendDeviceReqModel = require('../model/sendDeviceReqModel');
const sendDeviceAlertEmail = require("../helper/sendDeviceAlertEmail");
const event_ventilator_collection_debug = require('../model/event_ventilator_collection_debug');

// initializeApp({
//   credential: applicationDefault(),
//   projectId: 'agvaapp'
// })
// end fcm services


const createLogsV2 = async (req, res) => {
  try {
    const { project_code } = req.params;
    // check project exist or not
    const findProjectWithCode = await Projects.findOne({ code: project_code });
    // console.log(11,"124546")
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

// get device alarm data by did
const getAlertsById = async (req, res) => {
  const { did } = req.params;
  // Pagination
  let { page, limit } = req.query;
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 1000;

  if (limit <= 0) {
    limit = 1000; // Set a default limit to prevent fetching too many records
  }

  const skip = (page - 1) * limit;
  try {
    // Fetch data with pagination and sorting applied directly in the query
    const findDeviceById = await alert_ventilator_collection.find({ did })
      .select({ __v: 0, createdAt: 0, updatedAt: 0 })
      .sort({ "ack.date": -1 })
      .skip(skip)
      .limit(limit);

    // Count total documents for pagination info
    const totalCount = await alert_ventilator_collection.countDocuments({ did });

    if (findDeviceById.length<1) {
      // console.log(true)
      return res.status(400).json({
        status: 0,
        statusCode: 400,
        message: "Data not found",
        data: []
      })
    }
    // Process and format the result
    const splitedArr = findDeviceById.map(item => ({
      _id: item._id,
      did: item.did,
      type: item.type,
      ack: {
        msg: item.ack.msg,
        code: item.ack.code,
        date: item.ack.date.split('T')[0],
        time: item.ack.date.split('T')[1], // Use ISO string for date-time splitting
      },
      priority: item.priority,
    }));

    if (findDeviceById.length < 1) {
      return res.status(400).json({
        status: "FAIL",
        statusCode: 400,
        message: 'Data not found.',
      });
    }
    // Send the response
    if (!!req.query.startDate || !!req.query.endDate) {
     
      const filterAlertsByDate = (splitedArr, startDate, endDate) => {
        // Create Date objects from the input strings
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Set end date to the end of the day
      
        // Filter the data
        return splitedArr.filter(item => {
          const itemDate = new Date(item.ack.date);
          return itemDate >= start && itemDate <= end;
        });
      };  
      const filteredData = filterAlertsByDate(splitedArr, req.query.startDate, req.query.endDate)
      return res.status(200).json({
        status: 1,
        statusCode: 200,
        message: 'Data retrieved successfully.',
        data: {
          findDeviceById: filteredData,
        },
        totalDataCount: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
      });
    }
    

    return res.status(200).json({
      status: 1,
      statusCode: 200,
      message: 'Data retrieved successfully.',
      data: {
        findDeviceById: splitedArr,
      },
      totalDataCount: totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    });
    

  } catch (error) {
    console.error('Error fetching data:', error);
    return res.status(500).json({
      status: 0,
      statusCode: 500,
      data: {
        err: {
          generatedTime: new Date(),
          errMsg: 'Internal Server Error',
          msg: 'An error occurred while fetching data',
          type: 'Server Error',
        },
      },
    });
  }
}



// get alarm data by did for new projects
const getAlertsByIdV2 = async (req, res) => {
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

    const findDeviceById = await alert_ventilator_collectionV2.find({ did: did }).select({ __v: 0, createdAt: 0, updatedAt: 0 }).sort({ "ack.date": -1 });

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

    const paginateArray = (findDeviceById, page, limit) => {
      const skip = findDeviceById.slice((page - 1) * limit, page * limit);
      return skip;
    };
    let finalArrData = paginateArray(findDeviceById, page, limit);
    var splitedArr = [];
    let modifiedArr = finalArrData.map((item) => {
      let objItem = {
        _id: item._id,
        did: item.did,
        type: item.type,
        ack: {
          msg: item.ack.msg,
          code: item.ack.code,
          date: item.ack.date.split('T')[0],
          time: item.ack.date.split('T')[1],
        },
        priority: item.priority,
      }
      splitedArr.push(objItem)
    })

    if (findDeviceById.length < 1) {
      return res.status(400).json({
        status: "FAIL",
        statusCode: 400,
        message: 'Data not found.',
      });
    }
    return res.status(200).json({
      status: 1,
      statusCode: 200,
      message: 'Data get successfully.',
      data: {
        findDeviceById: splitedArr
      },
      totalDataCount: findDeviceById.length,
      totalPages: Math.ceil((findDeviceById.length) / limit),
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
    let { page, limit } = req.query;
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
      limit = 10;
    }

    // const { did } = req.params;
    // const rawData = await trends_ventilator_collection.find({ did: did }).sort({ _id: -1 }).limit(50);
    // const uniqueData = new Map(
    //   rawData.map(item => [item.time, item])
    // )
    // const findDeviceById = [...uniqueData.values()]
    const { did } = req.params;
    const rawData = await trends_ventilator_collection.find({ did }).sort({ _id: -1 }).limit(50).lean();

    const uniqueDataMap = rawData.reduce((map, item) => map.set(item.time, item), new Map());

    // Convert the map values back to an array
    const findDeviceById = Array.from(uniqueDataMap.values());

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
    if (!did) {
      return res.status(404).json({
        status: 0,
        statusCode: 404,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'deviceId not found',
            msg: 'deviceId not found',
            type: 'Client Error',
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
    // // for pagination
    // const paginateArray = (findDeviceById, page, limit) => {
    //   const skip = findDeviceById.slice((page - 1) * limit, page * limit);
    //   return skip;
    // };

    // let finalData = paginateArray(findDeviceById, page, limit)
    // // for count
    // const count = findDeviceById.length
    // // const collectionName=require(`../model/${findDeviceById.collection_name}.js`);
    // // console.log(collectionName,'collectionName');

    // // for dynamic UI data
    // let data2;
    // let checkCode = await trends_ventilator_collection.find({ did: did }).sort({ _id: -1 }).limit(1)
    // checkCode = !!checkCode[0] ? checkCode[0] : []
    // if (checkCode.type == "002" || "") {
    //   data2 = [trendsDataKey[0]]
    // } else if (checkCode.type == "003") {
    //   data2 = [trendsDataKey[1]]
    // }

    // if (finalData.length > 0) {
    //   return res.status(200).json({
    //     status: 1,
    //     statusCode: 200,
    //     message: 'successfull',
    //     //   data: {
    //     //     findDeviceById: finalData
    //     //   },
    //     //   message: 'successfull'
    //     // });
    //     data: {
    //       findDeviceById: finalData
    //     },
    //     data2: data2,
    //     totalDataCount: count,
    //     totalPages: Math.ceil(count / limit),
    //     currentPage: page
    //   })
    // }
    // return res.status(400).json({
    //   status: 0,
    //   statusCode: 400,
    //   message: "Data not found",
    //   data: []
    // })

    const paginateArray = (dataArray, page, limit) => {
      const offset = (page - 1) * limit;
      return dataArray.slice(offset, offset + limit);
    };
    
    const finalData = paginateArray(findDeviceById, page, limit);
    const count = findDeviceById.length;
    
    const checkCode = await trends_ventilator_collection
      .findOne({ did })
      .sort({ _id: -1 })
      .lean() || {}; // Fetch the most recent document or default to an empty object
    
    // Determine UI data based on `checkCode.type`
    let data2;
    if (checkCode.type === "002" || checkCode.type === "") {
      data2 = [trendsDataKey[0]];
    } else if (checkCode.type === "003") {
      data2 = [trendsDataKey[1]];
    }
    
    // Handle the response
    if (finalData.length > 0) {
      return res.status(200).json({
        status: 1,
        statusCode: 200,
        message: 'Successful',
        data: {
          findDeviceById: finalData,
          data2: data2,
          totalDataCount: count,
          totalPages: Math.ceil(count / limit),
          currentPage: page
        }
      });
    }
    
    return res.status(400).json({
      status: 0,
      statusCode: 400,
      message: "Data not found",
      data: []
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
const getTrendsByIdV2 = async (req, res) => {
  try {
    let { page, limit } = req.query;
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
    const findDeviceById = await trends_ventilator_collectionV2_model.find({ did: did }).sort({ _id: -1 }).limit(100);
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
    if (!did) {
      return res.status(404).json({
        status: 0,
        statusCode: 404,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'deviceId not found',
            msg: 'deviceId not found',
            type: 'Client Error',
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

    // check Device code
    let data2;
    let checkCode = await trends_ventilator_collectionV2_model.find({ did: did }).sort({ _id: -1 }).limit(1)
    checkCode = !!checkCode[0] ? checkCode[0] : []
    if (checkCode.type == "002" || "") {
      data2 = [trendsDataKey[0]]
    } else if (checkCode.type == "003") {
      data2 = [trendsDataKey[1]]
    }
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
          findDeviceById: finalData
        },
        data2: data2,
        totalDataCount: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page
      })
    }
    return res.status(400).json({
      status: 0,
      statusCode: 400,
      message: "Data not found",
      data: {}
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

    const findDeviceById = await logModel.find({ deviceId: device }).select({ __v: 0, createdAt: 0, updatedAt: 0 }).sort({ _id: -1 });
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
    const paginateArray = (findDeviceById, page, limit) => {
      const skip = findDeviceById.slice((page - 1) * limit, page * limit);
      return skip;
    };
    let finalArrData = paginateArray(findDeviceById, page, limit);

    var splitedArr = [];
    let modifiedArr = finalArrData.map((item) => {
      let objItem = {
        _id: item._id,
        deviceId: item.deviceId,
        message: item.message,
        version: item.version,
        file: item.file,
        date: item.date.split('T')[0],
        time: item.date.split('T')[1],
      }
      splitedArr.push(objItem)
    })

    // CheckData empty or not
    if (findDeviceById.length < 1) {
      return res.status(400).json({
        status: "FAIL",
        statusCode: 400,
        message: 'Data not found.',
      });
    }
    return res.status(200).json({
      status: 1,
      statusCode: 200,
      message: 'Data get successfully.',
      data: {
        findDeviceById: splitedArr,
      },
      totalDataCount: findDeviceById.length,
      totalPages: Math.ceil((findDeviceById.length) / limit),
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


const getLogsByIdV2 = async (req, res) => {
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

    const findDeviceById = await logModelV2.find({ deviceId: device }).select({ __v: 0, createdAt: 0, updatedAt: 0 }).sort({ _id: -1 });
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
    const paginateArray = (findDeviceById, page, limit) => {
      const skip = findDeviceById.slice((page - 1) * limit, page * limit);
      return skip;
    };
    let finalArrData = paginateArray(findDeviceById, page, limit);

    var splitedArr = [];
    let modifiedArr = finalArrData.map((item) => {
      let objItem = {
        _id: item._id,
        deviceId: item.deviceId,
        message: item.message,
        version: item.version,
        file: item.file,
        date: item.date.split('T')[0],
        time: item.date.split('T')[1],
      }
      splitedArr.push(objItem)
    })

    // CheckData empty or not
    if (findDeviceById.length < 1) {
      return res.status(400).json({
        status: "FAIL",
        statusCode: 400,
        message: 'Data not found.',
      });
    }
    return res.status(200).json({
      status: 1,
      statusCode: 200,
      message: 'Data get successfully.',
      data: {
        findDeviceById: splitedArr,
      },
      totalDataCount: findDeviceById.length,
      totalPages: Math.ceil((findDeviceById.length) / limit),
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

    let { page, limit} = req.query;
    // Ensure valid page and limit values
    if (isNaN(page) || page <= 0) page = 1;
    if (isNaN(limit) || limit <= 0) limit = 9999;

    const findDeviceById = await event_ventilator_collection
      .find({ did })
      .select('-createdAt -updatedAt -__v')
      .sort({ _id: -1 });

    const maxDate = new Date(Math.max(...findDeviceById.map(el => new Date(el.date))));

    const diffInHours = Math.abs((Date.now() - maxDate.getTime()) / (1000 * 60 * 60));

    const state = (diffInHours >= 24 || diffInHours < 0) ? 'inactive' : 'active';

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

    const paginateArray = (findDeviceById, page, limit) => {
      const skip = findDeviceById.slice((page - 1) * limit, page * limit);
      return skip;
    };
    let finalArrData = paginateArray(findDeviceById, page, limit)
    var splitedArr = [];
    let modifiedArr = finalArrData.map((item) => {
      let objItem = {
        _id: item._id,
        did: item.did,
        type: item.type,
        message: item.message,
        date: item.date.split('T')[0],
        time: item.date.split('T')[1],
      }
      splitedArr.push(objItem)
    })
    // console.log(Arr)
    // console.log(modifiedArr)
    if (findDeviceById.length < 1) {
      return res.status(400).json({
        status: "FAIL",
        statusCode: 400,
        message: 'Data not found.',
      });
    }
    // console.log(splitedArr)
    // Send the response
    if (!!req.query.startDate || !!req.query.endDate) {
      // console.log(true)

      const filterEventsByDate = (splitedArr, startDate, endDate) => {
        
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); 
      
        
        return splitedArr.filter(item => {
          const itemDate = new Date(item.date);
          return itemDate >= start && itemDate <= end;
        });
      };  
      const filteredData = filterEventsByDate(splitedArr, req.query.startDate, req.query.endDate)
      // console.log(11, filteredData)
      return res.status(200).json({
        status: 1,
        statusCode: 200,
        data: {
          findDeviceById: filteredData,
        },
        message: 'successfull',
        //state:findDeviceById.find().sort({date:-1}).limit(1)
        state: state,
        totalDataCount: findDeviceById.length,
        totalPages: Math.ceil((findDeviceById.length) / limit),
        currentPage: page
      });
    }

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
      totalPages: Math.ceil((findDeviceById.length) / limit),
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


const getEventsByDate = async (req, res) => {
  try {
    // Pagination
    let { page, limit } = req.query;
    if (!page || page === "undefined") {
      page = 1;
    }
    if (!limit || limit === "undefined" || parseInt(limit) === 0) {
      limit = 9999;
    }

    const findDeviceById = await event_ventilator_collection.find({ did: did }).select({ createdAt: 0, updatedAt: 0, __v: 0 }).sort({ _id: -1 });

    
   

    
    const paginateArray = (findDeviceById, page, limit) => {
      const skip = findDeviceById.slice((page - 1) * limit, page * limit);
      return skip;
    };
    let finalArrData = paginateArray(findDeviceById, page, limit)
    var splitedArr = [];
    let modifiedArr = finalArrData.map((item) => {
      let objItem = {
        _id: item._id,
        did: item.did,
        type: item.type,
        message: item.message,
        date: item.date.split('T')[0],
        time: item.date.split('T')[1],
      }
      splitedArr.push(objItem)
    })
    // console.log(Arr)
    // console.log(modifiedArr)
    if (findDeviceById.length < 1) {
      return res.status(400).json({
        status: "FAIL",
        statusCode: 400,
        message: 'Data not found.',
      });
    }
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
      totalPages: Math.ceil((findDeviceById.length) / limit),
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

const getEventsByIdV2 = async (req, res) => {
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

    const findDeviceById = await event_ventilator_collection_v2.find({ did: did }).select({ createdAt: 0, updatedAt: 0, __v: 0 }).sort({ _id: -1 });

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

    const paginateArray = (findDeviceById, page, limit) => {
      const skip = findDeviceById.slice((page - 1) * limit, page * limit);
      return skip;
    };
    let finalArrData = paginateArray(findDeviceById, page, limit)
    var splitedArr = [];
    let modifiedArr = finalArrData.map((item) => {
      let objItem = {
        _id: item._id,
        did: item.did,
        type: item.type,
        message: item.message,
        date: item.date.split('T')[0],
        time: item.date.split('T')[1],
      }
      splitedArr.push(objItem)
    })
    // console.log(Arr)
    // console.log(modifiedArr)
    if (findDeviceById.length < 1) {
      return res.status(400).json({
        status: "FAIL",
        statusCode: 400,
        message: 'Data not found.',
      });
    }
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
      totalPages: Math.ceil((findDeviceById.length) / limit),
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

    var activeDevices = await statusModel.find({ message: "ACTIVE" }, { __v: 0 }).sort({ updatedAt: -1 });
    var inactiveDevices = await statusModel.find({ message: "INACTIVE" }, { __v: 0 }).sort({ updatedAt: -1 });
    var finalArr = [...activeDevices, ...inactiveDevices]

    // For search
    var key = "deviceId";
    if (req.query.search && req.query.search !== "undefined") {
      finalArr = await statusModel.find({ deviceId: { $regex: ".*" + search + ".*", $options: "i" } }, { __v: 0 }).sort({ updatedAt: -1 });
    }

    // Remove duplicate devices
    let arrayUniqueByKey = [...new Map(finalArr.map(item => [item[key], item])).values()];

    // For pagination
    const paginateArray = (arrayUniqueByKey, page, limit) => {
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
        totalPages: Math.ceil((arrayUniqueByKey.length) / limit),
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
    const activeDevices = await statusModel.aggregate([
      {
        $match: {
          "message": "ACTIVE",
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
        $match: { deviceId: { $regex: ".*" + search + ".*", $options: "i" } }
      },
      {
        $project: {
          "createdAt": 0, "__v": 0, "deviceInfo.__v": 0, "deviceInfo.createdAt": 0,
          "deviceInfo.updatedAt": 0, "deviceInfo.Status": 0,
        }
      },
      {
        $sort: { updatedAt: -1 },
      },
    ]);
    const inactiveDevices = await statusModel.aggregate([
      {
        $match: {
          "message": "INACTIVE",
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
        $match: { deviceId: { $regex: ".*" + search + ".*", $options: "i" } }
      },
      {
        $project: {
          "createdAt": 0, "__v": 0, "deviceInfo.__v": 0, "deviceInfo.createdAt": 0,
          "deviceInfo.updatedAt": 0, "deviceInfo.Status": 0,
        }
      },
      {
        $sort: { updatedAt: -1 },
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
    const loggedInUser = await User.findById({ _id: verified.user });

    // get data by user role
    if (loggedInUser.userType == "User") {

      const assignDevices = await assignDeviceTouserModel.findOne({ userId: loggedInUser._id });
      const deviceIds = assignDevices.Assigned_Devices;
      const tempIds = deviceIds.map((item) => item.DeviceId)

      for (let i = 0; i < tempIds.length; i++) {
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
      const paginateArray = (resultArr, page, limit) => {
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
          totalPages: Math.ceil((resultArr.length) / limit),
          currentPage: page,
          // tempData: allDevices,
        })
      }
      // const lData = await paginateArray.find({deviceId:{in:tempIds}})
      // console.log(lData,lData)
    }
    // console.log(333, resultArr)
    // For pagination
    const paginateArray = (arrayUniqueByKey, page, limit) => {
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
        totalPages: Math.ceil((arrayUniqueByKey.length) / limit),
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
    const loggedInUser = await User.findById({ _id: verified.user });
    // console.log(loggedInUser.hospitalName)
    // Declare blank obj
    let filterObj = {};
    // check user
    if (!!loggedInUser && loggedInUser.userType === "User") {
      filterObj = {
        $match: {
          $and: [
            { "deviceInfo.Hospital_Name": loggedInUser.hospitalName },
            // {"deviceReqData.userId":loggedInUser._id},
            { deviceId: { $regex: ".*" + search + ".*", $options: "i" } }
          ]
        }
      }
    } else if (!!loggedInUser && loggedInUser.userType === "Nurse") {
      filterObj = {
        $match: {
          $and: [
            { "deviceInfo.Hospital_Name": loggedInUser.hospitalName },
            // {"deviceReqData.userId":loggedInUser._id},
            { deviceId: { $regex: ".*" + search + ".*", $options: "i" } }
          ]
        }
      }
    }
    else if (!!loggedInUser && loggedInUser.userType === "Doctor" || !!loggedInUser && loggedInUser.userType === "Assistant") {
      filterObj = {
        $match: {
          $and: [
            { "deviceInfo.Hospital_Name": loggedInUser.hospitalName },
            // {"deviceReqData.userId":loggedInUser._id},
            { deviceId: { $regex: ".*" + search + ".*", $options: "i" } }
          ]
        }
      }
    }
    // else if (!!loggedInUser && loggedInUser.userType === "Assistant") {
    //   filterObj = {
    //     $match: {$and:[
    //       {"deviceInfo.Hospital_Name":loggedInUser.hospitalName},
    //       // {"deviceReqData.userId":loggedInUser._id},
    //       {deviceId: { $regex: ".*" + search + ".*", $options: "i" }}
    //     ]}
    //   }
    // } 
    else {
      filterObj = {
        $match: { deviceId: { $regex: ".*" + search + ".*", $options: "i" } }
      }
    }


    // check user

    const activeDevices = await statusModel.aggregate([
      {
        $match: {
          "message": "ACTIVE",
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
          "deviceReqData": { "$first": "$deviceReqData" },
        }
      },
      // Extract the joined embeded fields into top level fields
      {
        "$set": { "isAssigned": "$deviceReqData.isAssigned" },
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
        $sort: { updatedAt: -1 },
      },
    ])

    const inactiveDevices = await statusModel.aggregate([
      {
        $match: {
          "message": "INACTIVE",
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
          "deviceReqData": { "$first": "$deviceReqData" },
        }
      },
      // Extract the joined embeded fields into top level fields
      {
        "$set": { "isAssigned": "$deviceReqData.isAssigned" },
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
        $sort: { updatedAt: -1 },
      },
    ]);
    var finalArr = [...activeDevices, ...inactiveDevices];
    // remove duplicate records
    var key = "deviceId";
    let arrayUniqueByKey = [...new Map(finalArr.map(item => [item[key], item])).values()];

    // filter data on the basis of userType
    if (loggedInUser.userType == "User" || loggedInUser.userType == "Nurse") {
      const assignedDeviceIds = await assignDeviceTouserModel.find({ userId: loggedInUser._id })
      const deviceIds = assignedDeviceIds.map(item => item.deviceId)
      filteredData = arrayUniqueByKey.filter(item => deviceIds.includes(item.deviceId))
      arrayUniqueByKey = filteredData
    }

    // For pagination\
    const paginateArray = (arrayUniqueByKey, page, limit) => {
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
        totalPages: Math.ceil((arrayUniqueByKey.length) / limit),
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
    const loggedInUser = await User.findById({ _id: verified.user });
    // console.log(loggedInUser.hospitalName)
    // Declare blank obj
    let filterObj = {};
    // check user
    if (!!loggedInUser && loggedInUser.userType === "User") {
      filterObj = {
        $match: {
          $and: [
            { "deviceInfo.Hospital_Name": loggedInUser.hospitalName },
            { "deviceInfo.addTofocus": true },
            // {"deviceReqData.userId":loggedInUser._id},
            { deviceId: { $regex: ".*" + search + ".*", $options: "i" } }
          ]
        }
      }
    } else {
      filterObj = {
        $match: {
          $or: [
            { "deviceInfo.addTofocus": true },
            { deviceId: { $regex: ".*" + search + ".*", $options: "i" } },
          ]
        }
      }
    }


    // check user

    const activeDevices = await statusModel.aggregate([
      {
        $match: {
          "message": "ACTIVE",
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
          "deviceReqData": { "$first": "$deviceReqData" },
        }
      },
      // Extract the joined embeded fields into top level fields
      {
        "$set": { "isAssigned": "$deviceReqData.isAssigned" },
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
        $sort: { updatedAt: -1 },
      },
    ]);

    const inactiveDevices = await statusModel.aggregate([
      {
        $match: {
          "message": "INACTIVE",
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
          "deviceReqData": { "$first": "$deviceReqData" },
        }
      },
      // Extract the joined embeded fields into top level fields
      {
        "$set": { "isAssigned": "$deviceReqData.isAssigned" },
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
        $sort: { updatedAt: -1 },
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
    const paginateArray = (arrayUniqueByKey, page, limit) => {
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
        totalPages: Math.ceil((arrayUniqueByKey.length) / limit),
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
    if (!page || page === "undefined" || page == null) {
      page = 1;
    }
    if (!limit || limit === "undefined" || parseInt(limit) === 0 || limit === null) {
      limit = 99999;
    }

    // get loggedin user details
    const token = req.headers["authorization"].split(' ')[1];
    const verified = await jwtr.verify(token, process.env.JWT_SECRET);
    const loggedInUser = await User.findById({ _id: verified.user });
    // console.log(loggedInUser.hospitalName)
    // Declare blank obj
    // Construct filter object based on user type
    const searchRegex = { $regex: ".*" + search + ".*", $options: "i" };
    const deviceFilter = {
      $or: [
        { deviceId: searchRegex },
        { "deviceInfo.Hospital_Name": searchRegex },
        { "deviceInfo.Alias_Name": searchRegex },
      ]
    };

    let filterObj = {};

    // check user
    if (!!loggedInUser && loggedInUser.userType === "Hospital-Admin") {
      filterObj = {
        $match: {
          $and: [
            { "deviceInfo.Hospital_Name": loggedInUser.hospitalName },
            {
              $or: [
                { deviceId: { $regex: ".*" + search + ".*", $options: "i" } },
                { "deviceInfo.Hospital_Name": { $regex: ".*" + search + ".*", $options: "i" } },
                { "prodDataInfo.serialNumber": { $regex: ".*" + search + ".*", $options: "i" } },
                { "prodDataInfo.purpose": { $regex: ".*" + search + ".*", $options: "i" } }
              ]
            }
          ]
        }
      }
    }
    else if (!!loggedInUser && loggedInUser.userType === "Super-Admin") {
      filterObj = {
        $match: {
          $or: [
            { deviceId: { $regex: ".*" + search + ".*", $options: "i" } },
            { "deviceInfo.Hospital_Name": { $regex: ".*" + search + ".*", $options: "i" } },
            { "prodDataInfo.serialNumber": { $regex: ".*" + search + ".*", $options: "i" } },
            { "prodDataInfo.purpose": { $regex: ".*" + search + ".*", $options: "i" } }
          ]
        }
      }
    } else if (!!loggedInUser && loggedInUser.userType === "Dispatch") {
      filterObj = {
        $match: {
          $or: [
            { deviceId: { $regex: ".*" + search + ".*", $options: "i" } },
            { "deviceInfo.Hospital_Name": { $regex: ".*" + search + ".*", $options: "i" } },
            { "prodDataInfo.serialNumber": { $regex: ".*" + search + ".*", $options: "i" } },
            { "prodDataInfo.purpose": { $regex: ".*" + search + ".*", $options: "i" } }
          ]
        }
      }
    } else if (!!loggedInUser && loggedInUser.userType === "Production") {
      filterObj = {
        $match: {
          $or: [
            { deviceId: { $regex: ".*" + search + ".*", $options: "i" } },
            { "deviceInfo.Hospital_Name": { $regex: ".*" + search + ".*", $options: "i" } },
            { "prodDataInfo.serialNumber": { $regex: ".*" + search + ".*", $options: "i" } },
            { "prodDataInfo.purpose": { $regex: ".*" + search + ".*", $options: "i" } }
          ]
        }
      }
    } else if (!!loggedInUser && loggedInUser.userType === "User") {
      filterObj = {
        $match: {
          $and: [
            { "deviceInfo.Hospital_Name": loggedInUser.hospitalName },
            {
              $or: [
                { deviceId: { $regex: ".*" + search + ".*", $options: "i" } },
                { "deviceInfo.Hospital_Name": { $regex: ".*" + search + ".*", $options: "i" } },
                { "prodDataInfo.serialNumber": { $regex: ".*" + search + ".*", $options: "i" } },
                { "prodDataInfo.purpose": { $regex: ".*" + search + ".*", $options: "i" } }
              ]
            }
          ]
        }
      }
    }
    else if (!!loggedInUser && loggedInUser.userType === "Assistant") {
      const findDoctor = await User.findOne({$and:[{securityCode:loggedInUser.securityCode},{userType:"Doctor"}]})
      filterObj = {
        $match: {
          $and: [
            { "deviceInfo.Hospital_Name": { $in: findDoctor.accessHospital } },
            {
              $or: [
                { deviceId: { $regex: ".*" + search + ".*", $options: "i" } },
                { "deviceInfo.Hospital_Name": { $regex: ".*" + search + ".*", $options: "i" } },
                { "prodDataInfo.serialNumber": { $regex: ".*" + search + ".*", $options: "i" } },
                { "prodDataInfo.purpose": { $regex: ".*" + search + ".*", $options: "i" } }
              ]
            }
          ]
        }
      }
    }
    else if (!!loggedInUser && loggedInUser.userType === "Doctor") {
      // console.log(loggedInUser.accessHospital)
      filterObj = {
        $match: {
          $and: [
            { "deviceInfo.Hospital_Name": { $in: loggedInUser.accessHospital } },
            {
              $or: [
                { deviceId: { $regex: ".*" + search + ".*", $options: "i" } },
                { "deviceInfo.Hospital_Name": { $regex: ".*" + search + ".*", $options: "i" } },
                { "prodDataInfo.serialNumber": { $regex: ".*" + search + ".*", $options: "i" } },
                { "prodDataInfo.purpose": { $regex: ".*" + search + ".*", $options: "i" } }
              ]
            }
          ]
        }
      }
    } else {
      filterObj = {
        $match: {
          $or: [
            { deviceId: { $regex: ".*" + search + ".*", $options: "i" } },
            { "deviceInfo.Hospital_Name": { $regex: ".*" + search + ".*", $options: "i" } },
            { "prodDataInfo.serialNumber": { $regex: ".*" + search + ".*", $options: "i" } },
            { "prodDataInfo.purpose": { $regex: ".*" + search + ".*", $options: "i" } }
          ]
        }
      }
    }

    const getDeviceData = async (message) => {
      return statusModel.aggregate([
        {
          $match: { message }
        },
        {
          $lookup: {
            from: "registerdevices",
            localField: "deviceId",
            foreignField: "DeviceId",
            as: "deviceInfo"
          }
        },
        {
          $lookup: {
            from: "productions",
            localField: "deviceId",
            foreignField: "deviceId",
            as: "prodDataInfo"
          }
        },
        filterObj,
        {
          $lookup: {
            from: "alert_ventilator_collections",
            let: { deviceId: "$deviceId" },
            pipeline: [
              { $match: { $expr: { $eq: ["$did", "$$deviceId"] } } },
              { $sort: { "createdAt": -1 } },
              { $limit: 1 }
            ],
            as: "alarmData"
          }
        },
        {
          $lookup: {
            from: "patient_ventilator_collections",
            let: { deviceId: "$deviceId" },
            pipeline: [
              { $match: { $expr: { $eq: ["$deviceId", "$$deviceId"] } } },
              { $sort: { "createdAt": -1 } },
              { $limit: 1 }
            ],
            as: "patientData"
          }
        },
        {
          "$set": {
            "prodDataInfo": { "$first": "$prodDataInfo" },
          }
        },
        // Extract the joined embeded fields into top level fields
        {
          "$set": { "purpose": "$prodDataInfo.purpose", "serialNumber": "$prodDataInfo.serialNumber", "dispatchDate": "$prodDataInfo.dispatchDate" },
        },
        {
          $project: {
            "createdAt": 0,
            "__v": 0,
            "deviceInfo.__v": 0,
            "deviceInfo.createdAt": 0,
            "deviceInfo.isAssigned": 0,
            "deviceInfo.updatedAt": 0,
            "deviceInfo.Status": 0,
            "prodDataInfo": 0,
          }
        },
        {
          $sort: { updatedAt: -1 }
        }
      ]);
    };

    const [activeDevices, inactiveDevices] = await Promise.all([
      getDeviceData("ACTIVE"),
      getDeviceData("INACTIVE")
    ]);

    const finalArr = [...activeDevices, ...inactiveDevices];

    // remove duplicate records
    var key = "deviceId";
    let updatedArray = []
    let arrayUniqueByKey = [...new Map(finalArr.map(item => [item[key], item])).values()];

    // show isAssigned key for doctor role or assistant role
    if (!!loggedInUser && (loggedInUser.userType === "Doctor" || loggedInUser.userType === "Assistant")) {

      const deviceReqData = await sendDeviceReqModel.find({ $and: [{ securityCode: loggedInUser.securityCode }, { isAssigned: "Pending" }] })
      // console.log(12345, deviceReqData)
      const assignDeviceData = await assignDeviceTouserModel.find({ securityCode: loggedInUser.securityCode })
      // console.log(12333, assignDeviceData)

      arrayUniqueByKey.forEach(device => {
        const assigned = assignDeviceData.find(d => d.deviceId === device.deviceId);
        const requested = deviceReqData.find(d => d.deviceId === device.deviceId && d.isAssigned === 'Pending');

        if (assigned) {
          device.isAssigned = 'Accepted';
        } else if (requested) {
          device.isAssigned = 'Pending';
        } else {
          device.isAssigned = 'Request';
        }
      });

      arrayUniqueByKey.sort((a, b) => {
        const order = { 'Accepted': 1, 'Pending': 2, 'Request': 3 };
        return order[a.isAssigned] - order[b.isAssigned];
      })
      updatedArray = arrayUniqueByKey;

    }
    //  else if (!!loggedInUser && (loggedInUser.userType === "Assistant")) {
    //   const assignDeviceData = await assignDeviceTouserModel.find({ $and:[{securityCode: loggedInUser.securityCode},{isAssigned:"Accepted"}]},{deviceId:1})
    //   // console.log(12, assignDeviceData)
    //   const assignDeviceIds = assignDeviceData.map(device => device.deviceId);

    //   const filteredArrayUniqueByKey = arrayUniqueByKey.filter(item => assignDeviceIds.includes(item.deviceId));

    //   // updatedArray = filteredArrayUniqueByKey; 
    //   // console.log(123, filteredArrayUniqueByKey)

    //   // For pagination
    //   const paginateArray = (filteredArrayUniqueByKey, page, limit) => {
    //     const skip = filteredArrayUniqueByKey.slice((page - 1) * limit, page * limit);
    //     return skip;
    //   };

    //   var allDevices = paginateArray(filteredArrayUniqueByKey, page, limit)
    //   if (filteredArrayUniqueByKey.length > 0) {
    //     return res.status(200).json({
    //       status: 200,
    //       statusValue: "SUCCESS",
    //       message: "Event lists has been retrieved successfully.",
    //       data: { data: allDevices, },
    //       totalDataCount: filteredArrayUniqueByKey.length,
    //       totalPages: Math.ceil((filteredArrayUniqueByKey.length) / limit),
    //       currentPage: page,
    //       // tempData: allDevices,
    //     })
    //   }
    //   return res.status(400).json({
    //     status: 400,
    //     statusValue: "FAIL",
    //     message: 'Data not found.',
    //     data: {}
    //   });

    // }

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


const getAllDeviceIdForApp = async (req, res) => {
  try {
    // Search
    var search = "";
    if (req.query.search && req.query.search !== "undefined") {
      search = req.query.search;
    }
    let { page, limit } = req.query;

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    if (limit <= 0) {
      limit = 10; // Set a default limit to prevent fetching too many records
    }

    const skip = (page - 1) * limit;

    // Get logged-in user details
    const token = req.headers["authorization"].split(' ')[1];
    const verified = await jwtr.verify(token, process.env.JWT_SECRET);
    const loggedInUser = await User.findById({ _id: verified.user });

    // Construct filter object based on user type
    let filterObj;
    if (loggedInUser) {
      const hospitalFilter = { "deviceInfo.Hospital_Name": loggedInUser.hospitalName };
      const deviceFilter = { deviceId: { $regex: `.*${search}.*`, $options: "i" } };

      switch (loggedInUser.userType) {
        case "Hospital-Admin":
        case "User":
        case "Assistant":
          filterObj = { $and: [hospitalFilter, deviceFilter] };
          break;
        case "Doctor":
          filterObj = { $and: [{ "deviceInfo.Hospital_Name": { $in: loggedInUser.accessHospital } }, deviceFilter] };
          break;
        default:
          filterObj = deviceFilter;
      }
    } else {
      filterObj = { deviceId: { $regex: `.*${search}.*`, $options: "i" } };
    }

    // Aggregation pipeline for active and inactive devices
    const buildPipeline = (status) => [
      { $match: { message: status } },
      { $lookup: { from: "registerdevices", localField: "deviceId", foreignField: "DeviceId", as: "deviceInfo" } },
      { $match: filterObj },
      {
        $lookup: {
          from: "alert_ventilator_collection_v2",
          let: { deviceId: "$deviceId" },
          pipeline: [
            { $match: { $expr: { $eq: ["$did", "$$deviceId"] } } },
            { $sort: { "createdAt": -1 } },
            { $limit: 1 }
          ],
          as: "alarmData"
        }
      },
      {
        $lookup: {
          from: "patient_ventilator_collection_v2",
          let: { deviceId: "$deviceId" },
          pipeline: [
            { $match: { $expr: { $eq: ["$deviceId", "$$deviceId"] } } },
            { $sort: { "createdAt": -1 } },
            { $limit: 1 }
          ],
          as: "patientData"
        }
      },
      {
        $project: {
          createdAt: 0, __v: 0, "deviceInfo.__v": 0, "deviceInfo.createdAt": 0, "deviceInfo.isAssigned": 0,
          "deviceInfo.updatedAt": 0, "deviceInfo.Status": 0
        }
      },
      { $sort: { updatedAt: -1 } }
    ];

    const [activeDevices, inactiveDevices] = await Promise.all([
      statusModelV2.aggregate(buildPipeline("ACTIVE")),
      statusModelV2.aggregate(buildPipeline("INACTIVE"))
    ]);

    // Combine and remove duplicate records
    const finalArr = [...activeDevices, ...inactiveDevices];
    const arrayUniqueByKey = [...new Map(finalArr.map(item => [item.deviceId, item])).values()];

    // Show isAssigned key for Doctor or Assistant role
    if (loggedInUser && (loggedInUser.userType === "Doctor" || loggedInUser.userType === "Assistant")) {
      const assignDeviceData = loggedInUser.userType === "Doctor" || loggedInUser.userType === "Assistant"
        ? await assignDeviceTouserModel.find({ userId: loggedInUser._id })
        : await assignDeviceTouserModel.find({ securityCode: loggedInUser.securityCode });

      const assignDeviceMap = assignDeviceData.reduce((map, assign) => {
        map[assign.deviceId] = assign.isAssigned === 'Accepted';
        return map;
      }, {});

      const filteredArray = arrayUniqueByKey.filter(item => assignDeviceMap[item.deviceId] !== undefined);
      filteredArray.forEach(item => {
        item.isAssigned = assignDeviceMap[item.deviceId];
      });

      const paginatedDevices = filteredArray.slice(skip, skip + limit);
      return res.status(200).json({
        status: 200,
        statusValue: "SUCCESS",
        message: "Event lists have been retrieved successfully.",
        data: { data: paginatedDevices },
        totalDataCount: filteredArray.length,
        totalPages: Math.ceil(filteredArray.length / limit),
        currentPage: page,
      });
    }

    // Pagination for other roles
    const paginatedDevices = arrayUniqueByKey.slice(skip, skip + limit);
    return res.status(200).json({
      status: 200,
      statusValue: "SUCCESS",
      message: "Event lists have been retrieved successfully.",
      data: { data: paginatedDevices },
      totalDataCount: arrayUniqueByKey.length,
      totalPages: Math.ceil(arrayUniqueByKey.length / limit),
      currentPage: page,
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



const getAllDeviceIdV2 = async (req, res) => {
  try {
    // Search
    var search = "";
    if (req.query.search && req.query.search !== "undefined") {
      search = req.query.search;
    }
    let { page, limit } = req.query;

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    if (limit <= 0) {
      limit = 10; // Set a default limit to prevent fetching too many records
    }

    // Get logged-in user details
    const token = req.headers["authorization"].split(' ')[1];
    const verified = await jwtr.verify(token, process.env.JWT_SECRET);
    const loggedInUser = await User.findById({ _id: verified.user });

    // Create filter object based on user type
    const searchFilter = {
      $or: [
        { deviceId: { $regex: `.*${search}.*`, $options: "i" } },
        { "deviceInfo.Hospital_Name": { $regex: `.*${search}.*`, $options: "i" } },
        { "deviceInfo.Alias_Name": { $regex: `.*${search}.*`, $options: "i" } },
      ]
    };

    let filterObj = { $match: searchFilter };

    if (loggedInUser) {
      const hospitalMatch = { "deviceInfo.Hospital_Name": loggedInUser.hospitalName };
      const accessHospitalMatch = { "deviceInfo.Hospital_Name": { $in: loggedInUser.accessHospital } };

      switch (loggedInUser.userType) {
        case "Hospital-Admin":
        case "User":
        case "Assistant":
          filterObj = { $match: { $and: [hospitalMatch, searchFilter] } };
          break;
        case "Doctor":
          filterObj = { $match: { $and: [accessHospitalMatch, searchFilter] } };
          break;
        // "Super-Admin", "Dispatch", "Production" have the same filter logic as the default case
      }
    }

    // Aggregation pipeline to fetch devices
    const getDevices = async (message) => {
      return statusModelV2.aggregate([
        { $match: { $and: [{ message }, { type: req.params.projectCode }] } },
        {
          $lookup: {
            from: "registerdevices",
            localField: "deviceId",
            foreignField: "DeviceId",
            as: "deviceInfo"
          }
        },
        filterObj,
        {
          $project: {
            "createdAt": 0, "__v": 0, "deviceInfo.__v": 0, "deviceInfo.createdAt": 0,
            "deviceInfo.updatedAt": 0, "deviceInfo.Status": 0,
          }
        },
        { $sort: { updatedAt: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit }
      ]);
    };

    // Fetch active and inactive devices
    const [activeDevices, inactiveDevices] = await Promise.all([
      getDevices("ACTIVE"),
      getDevices("INACTIVE")
    ]);

    // Combine and remove duplicates
    const finalArr = [...activeDevices, ...inactiveDevices];
    const arrayUniqueByKey = [...new Map(finalArr.map(item => [item.deviceId, item])).values()];

    // For pagination
    const paginatedDevices = arrayUniqueByKey.slice((page - 1) * limit, page * limit);

    if (arrayUniqueByKey.length > 0) {
      return res.status(200).json({
        status: 200,
        statusValue: "SUCCESS",
        message: "Event lists have been retrieved successfully.",
        data: { data: paginatedDevices },
        totalDataCount: arrayUniqueByKey.length,
        totalPages: Math.ceil(arrayUniqueByKey.length / limit),
        currentPage: page
      });
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
    // await sendDeviceAlertEmail("rohanrana@agvahealthtech.com", "724963b4f3ae2a8f", "Standby mode activated", "2024-02-27 17:29:00")
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
   
    const checkAlert = await modelReference.find({ did: did })
    // console.log(13, checkAlert)
    if (checkAlert.length > 999) {
      const length = checkAlert.length;
      const deletedArr = checkAlert.slice(0, 1001)
      deletedArr.map(async (item) => {
        await modelReference.deleteMany({ _id: item._id })
      })
      // Delete documents for each 'did' except the latest two

    }

    // Save lastActive in status model
    // const statusData = await statusModel.find({})

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

   

    // end email code

    var alertsErrArr = [];
    var alertsErrMsgArr = [];

    alerts.map((alert) => {
      alertsErrArr.push(alert.status);
      if (alert.status === 'rejected') {
        alertsErrMsgArr.push(alert.reason.message);
      }
    });

    // find ward no
    const deviceDetails = await RegisterDevice.findOne({ DeviceId: req.body.did })
    let Ward_No = !!(deviceDetails.Ward_No) ? deviceDetails.Ward_No : ""
    if (!alertsErrArr.includes('rejected')) {
      // check alarm level
      if (req.body.priority == "ALARM_CRITICAL_LEVEL") {
        // console.log(13, req.body)
         // sent email code
      
          
        // // check deviceId for particular fcm token
        const checkDeviceId = await fcmTokenModel.find({ deviceIds: { $in: req.body.did } })

        // Iterate through each fcmToken and send a notification
        checkDeviceId.forEach(device => {
          const receivedToken = device.fcmToken;
          const message = {
            notification: {
              title: "AgVa-Pro-Ventilator-Alert",
              body: `ALARM_CRITICAL_LEVEL | Ward - ${Ward_No} | Patient Disconnected. | Date-Time : ${date}`,
            },
            data: {
              screen: "/notification"
            },
            token: receivedToken,
          };
          // console.log(11,message.notification) 
          admin.messaging().send(message)
            .then(async (response) => {
              // console.log(13, message)
              await fcmNotificationModel.findOneAndUpdate(
                { token: "2sfsr3564dve512" }, 
                { notification: message.notification, data: message.data, token: message.token }, 
                { upsert: true }
              )
              console.log("Notification sent successfully:", response);
            })
            .catch((error) => {
              console.error("Error sending notification:", error);
            });
        });
      }

      // Check if email needs to be sent once per day with 1-hour interval
      const ackArr = req.body.ack;
      const checkAck = ackArr.some(item => ["ACK0824", "ACK0786", "ACK0789", "ACK0782"].includes(item.code));
 
      // if (checkAck) {
      //   const currentTime = new Date();
      //   const existingAlert = await modelReference.findOne({ did: req.body.did, 'ack.code': { $in: ["ACK0824", "ACK0786", "ACK0789", "ACK0782"] } });
 
      //   if (!existingAlert || !existingAlert.lastEmailSent || (currentTime - new Date(existingAlert.lastEmailSent)) >= 7200000) {
      //     // Prepare email details
      //     const formattedDate = `${String(currentTime.getDate()).padStart(2, '0')}-${String(currentTime.getMonth() + 1).padStart(2, '0')}-${currentTime.getFullYear()}`;
      //     let hours = currentTime.getHours();
      //     const minutes = String(currentTime.getMinutes()).padStart(2, '0');
      //     const ampm = hours >= 12 ? 'PM' : 'AM';
      //     hours = hours % 12 || 12;
      //     const formattedTime = `${hours}:${minutes} ${ampm}`;
 
      //     const allEmails = [
      //       // { email: 'support@agvahealthtech.com' }, 
      //       // { email: 'info@agvahealthtech.com' }, 
      //       { email: 'shivprakash@agvahealthtech.com' }
      //     ];
 
      //     ackArr.forEach(ackItem => {
      //       if (["ACK0824", "ACK0786", "ACK0789", "ACK0782"].includes(ackItem.code)) {
      //         allEmails.forEach(item => {
      //           sendDeviceAlertEmail(item.email, req.body.did, ackItem.msg, formattedDate, formattedTime);
      //         });
      //       }
      //     });
 
      //     // Update the database to indicate that the email has been sent
      //     await modelReference.updateMany({ did: req.body.did }, { $set: { lastEmailSent: new Date() } });
      //   }
      // }
      if (checkAck) {
        const currentTime = new Date();
        const twoHoursInMillis = 7200000;
      
        // Find an existing alert for the device that has specific ACK codes
        const existingAlert = await modelReference.findOne({
          did: req.body.did,
          'ack.code': { $in: ["ACK0824", "ACK0786", "ACK0789", "ACK0782"] }
        });
      
        // Check if an email was not sent within the last 2 hours
        if (!existingAlert || !existingAlert.lastEmailSent || (currentTime - new Date(existingAlert.lastEmailSent)) >= twoHoursInMillis) {
          // Prepare email details
          const formattedDate = `${String(currentTime.getDate()).padStart(2, '0')}-${String(currentTime.getMonth() + 1).padStart(2, '0')}-${currentTime.getFullYear()}`;
          let hours = currentTime.getHours();
          const minutes = String(currentTime.getMinutes()).padStart(2, '0');
          const ampm = hours >= 12 ? 'PM' : 'AM';
          hours = hours % 12 || 12;
          const formattedTime = `${hours}:${minutes} ${ampm}`;
      
          // Email recipients
          const allEmails = [
            // { email: 'support@agvahealthtech.com' }, 
            // { email: 'info@agvahealthtech.com' }, 
            { email: 'shivprakash@agvahealthtech.com' }
          ];
      
          // Find the first matching ACK code and its message
          const ackMatched = ackArr.find(ackItem =>
            ["ACK0824", "ACK0786", "ACK0789", "ACK0782"].includes(ackItem.code)
          );
      
          // Send email if an ACK code matches
          if (ackMatched) {
            allEmails.forEach(item => {
              // Use the ackMatched.msg in the email
              sendDeviceAlertEmail(item.email, req.body.did, ackMatched.msg, formattedDate, formattedTime);
            });
      
            // Update the database to indicate that the email has been sent
            await modelReference.updateMany(
              { did: req.body.did },
              { $set: { lastEmailSent: new Date() } }
            );
          }
        }
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
    if (req.params.productCode == "002") {
      return res.status(404).json({
        status: 404,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Product code must be 003 || 004 || 005 || 006',
            msg: 'Product code must be 003 || 004 || 005 || 006',
            type: 'MongoDb Error',
          },
        },
      });
    }

    const { did, type, ack, date } = req.body

    // check alert data
    const checkAlert = await alert_ventilator_collectionV2.find({ did: did })
    // const checkAlert = await modelReference.find({did:did})
    // console.log(13, checkAlert)
    if (checkAlert.length > 999) {
      const length = checkAlert.length;
      const deletedArr = checkAlert.slice(0, 1001)
      deletedArr.map(async (item) => {
        await alert_ventilator_collectionV2.deleteMany({ _id: item._id })
      })
      // Delete documents for each 'did' except the latest two

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

    // find ward no
    const deviceDetails = await RegisterDevice.findOne({ DeviceId: req.body.did })
    let Ward_No = !!(deviceDetails.Ward_No) ? deviceDetails.Ward_No : ""

    if (!alertsErrArr.includes('rejected')) {
      // check alarm level
      if (req.body.priority == "ALARM_CRITICAL_LEVEL") {
        // check deviceId for particular fcm token
        const checkDeviceId = await fcmTokenModel.find({ deviceIds: { $in: req.body.did } })
        checkDeviceId.forEach(device => {
          const receivedToken = device.fcmToken;
          const message = {
            notification: {
              title: "AgVa-Pro-Ventilator-Alert",
              body: `ALARM_CRITICAL_LEVEL | Ward - ${Ward_No} | Patient Disconnected. | Date-Time : ${date}`,

            },
            token: receivedToken,
          };

          admin.messaging().send(message)
            .then((response) => {
              console.log("Notification sent successfully:", response);
            })
            .catch((error) => {
              console.error("Error sending notification:", error);
            });
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

    // For current date and time
    const currentDateTime = new Date();

    const year = currentDateTime.getFullYear();
    const month = String(currentDateTime.getMonth() + 1).padStart(2, '0');
    const day = String(currentDateTime.getDate()).padStart(2, '0');

    const hours = String(currentDateTime.getHours()).padStart(2, '0');
    const minutes = String(currentDateTime.getMinutes()).padStart(2, '0');
    const seconds = String(currentDateTime.getSeconds()).padStart(2, '0');

    const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    if (SaveEvents) {
      await statusModel.updateMany({ deviceId: did }, { $set: { message: "ACTIVE", lastActive: formattedDateTime } })
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


// create or save device id from ventilators
const createEventsForDebug = async (req, res, next) => {
  try {
    const { project_code } = req.params;
    
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
    // check duplicate events data
    const eventsData = await event_ventilator_collection_debug.find({$and:[{did:req.body.did},{type:req.body.type},{message:req.body.message},{date:req.body.date}]})
    if (eventsData.length>0) {
      return res.status(201).json({
        status: 201,
        // data: { eventCounts: SaveEvents.length },
        message: 'Duplicate records!!',
      });
    } 
    const events = new event_ventilator_collection_debug({
      did: did,
      message: message,
      type: type,
      date: date,
    });

    console.log(`did : ${did} message : ${message} type : ${type} date : ${date}`);
    const SaveEvents = await events.save();

    // For current date and time
    // const currentDateTime = new Date();

    // const year = currentDateTime.getFullYear();
    // const month = String(currentDateTime.getMonth() + 1).padStart(2, '0');
    // const day = String(currentDateTime.getDate()).padStart(2, '0');

    // const hours = String(currentDateTime.getHours()).padStart(2, '0');
    // const minutes = String(currentDateTime.getMinutes()).padStart(2, '0');
    // const seconds = String(currentDateTime.getSeconds()).padStart(2, '0');

    // const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    if (SaveEvents) {
      // await statusModel.updateMany({ deviceId: did }, { $set: { message: "ACTIVE", lastActive: formattedDateTime } })
      return res.status(201).json({
        status: 201,
        data: { eventCounts: SaveEvents.length },
        message: 'Event has been added successfully!',
      });
    }
    else {
      return res.status(500).json({
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

    if (req.params.productCode == "002") {
      return res.status(404).json({
        status: 0,
        data: {
          err: {
            generatedTime: new Date(),
            errMsg: 'Product code must be 003 || 004 || 005 || 006',
            msg: 'Product code must be 003 || 004 || 005 || 006',
            type: 'MongoDb Error',
          },
        },
      });
    }
    //console.log(modelReference,'modelReference');
    const { did, type, message, date } = req.body;
    // console.log(123, req.body)
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
    // const events = new event_ventilator_collection_v2({
    //   did: did,
    //   message: message,
    //   type: type,
    //   date: date,
    // });
    const events = await event_ventilator_collection_v2.findOneAndUpdate(
      { did: "d3wr53vht7f" },
      {
        did: !!(req.body.did) ? req.body.did : "",
        message: !!(req.body.message) ? req.body.message : "",
        type: !!(req.body.type) ? req.body.type : "",
        date: !!(req.body.date) ? req.body.date : "",
      }, { upsert: true });

    console.log(`did : ${did} message : ${message} type : ${type} date : ${date}`);

    // For current date and time
    const currentDateTime = new Date();

    const year = currentDateTime.getFullYear();
    const month = String(currentDateTime.getMonth() + 1).padStart(2, '0');
    const day = String(currentDateTime.getDate()).padStart(2, '0');

    const hours = String(currentDateTime.getHours()).padStart(2, '0');
    const minutes = String(currentDateTime.getMinutes()).padStart(2, '0');
    const seconds = String(currentDateTime.getSeconds()).padStart(2, '0');

    const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    await statusModelV2.updateMany({ deviceId: did }, { $set: { message: "ACTIVE", lastActive: formattedDateTime } })

    return res.status(201).json({
      status: 201,
      message: 'Event has been added successfully!',
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
};


const createTrends = async (req, res, next) => {
  try {

    const { project_code } = req.params;
    const findProjectWithCode = await Projects.findOne({ code: project_code });
    //console.log(findProjectWithCode,'findProjectWithProjectCode----')

    const errors = validationResult(req);
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

    const collectionName = findProjectWithCode.trends_collection_name;
    console.log(collectionName, 'collectionName-----')
    const modelReference = require(`../model/${collectionName}`);
    console.log(modelReference, 'modelReference');
    const { did, time, type, mode, pip, peep, mean_Airway, vti, vte, mve, mvi, fio2, respiratory_Rate, ie, tinsp, texp, averageLeak, sPo2, pr } = req.body;
    if (!did) {
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
    // console.log(55, req.body)
    const trends = await new modelReference({
      did: did,
      time: !!time ? time : "",
      type: !!type ? type : "002",
      mode: !!mode ? mode : "",
      pip: !!pip ? pip : "",
      peep: !!peep ? peep : "",
      mean_Airway: !!mean_Airway ? mean_Airway : "",
      vti: !!vti ? vti : "",
      vte: !!vte ? vte : "",
      mve: !!mve ? mve : "",
      mvi: !!mvi ? mvi : "",
      fio2: !!fio2 ? fio2 : "",
      respiratory_Rate: !!respiratory_Rate ? respiratory_Rate : "",
      ie: !!ie ? ie : "",
      tinsp: !!tinsp ? tinsp : "",
      texp: !!texp ? texp : "",
      averageLeak: !!averageLeak ? averageLeak : "",
      sPo2: !!sPo2 ? sPo2 : "",
      pr: !!pr ? pr : "",
    });
    const SaveTrends = await trends.save(trends);
    
    // For current date and time
    const currentDateTime = new Date();

    const year = currentDateTime.getFullYear();
    const month = String(currentDateTime.getMonth() + 1).padStart(2, '0');
    const day = String(currentDateTime.getDate()).padStart(2, '0');

    const hours = String(currentDateTime.getHours()).padStart(2, '0');
    const minutes = String(currentDateTime.getMinutes()).padStart(2, '0');
    const seconds = String(currentDateTime.getSeconds()).padStart(2, '0');

    const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    await statusModel.updateMany({ deviceId: did }, { $set: { message: "ACTIVE", lastActive: formattedDateTime } })
    // console.log(11,SaveTrends)
    // console.log('Agva Pro', req.body)

    if (deviceIdArr.includes(SaveTrends.did)) {
      console.log(true)

    } else {
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

    var SaveTrends;
    if (req.params.project_code == "003") {
      const { did, time, spo2, pr, hr, ecgRR, iBP_S, iBP_D, cgm, etCo2, rr, nibp_S, nibp_D, temp1, temp2, iBP2_S, iBP2_D } = req.body;
      const trends = await new trends_ventilator_collectionV2_model({
        did: did,
        time: !!time ? time : "",
        spo2: !!spo2 ? spo2 : "",
        pr: !!pr ? pr : "",
        hr: !!hr ? hr : "",
        ecgRR: !!ecgRR ? ecgRR : "",
        iBP_S: !!iBP_S ? iBP_S : "",
        iBP_D: !!iBP_D ? iBP_D : "",
        cgm: !!cgm ? cgm : "",
        etCo2: !!etCo2 ? etCo2 : "",
        rr: !!rr ? rr : "",
        nibp_S: !!nibp_S ? nibp_S : "",
        nibp_D: !!nibp_D ? nibp_D : "",
        temp1: temp1 ? temp1 : "",
        temp2: temp2 ? temp2 : "",
        iBP2_S: !!iBP2_S ? iBP2_S : "",
        iBP2_D: !!iBP2_D ? iBP2_D : "",
        type: req.params.project_code,
      });
      SaveTrends = await trends.save(trends);

    } else if (req.params.project_code == "004") {
      const { did, time, type, mode, pip, peep, mean_Airway, vti, vte, mve, mvi, fio2, respiratory_Rate, ie, tinsp, texp, averageLeak, sPo2, pr } = req.body;
      const trends = await new trends_ventilator_collection({
        did: did,
        time: !!time ? time : "",
        type: req.params.project_code,
        mode: !!mode ? mode : "",
        pip: !!pip ? pip : "",
        peep: !!peep ? peep : "",
        mean_Airway: !!mean_Airway ? mean_Airway : "",
        vti: !!vti ? vti : "",
        vte: !!vte ? vte : "",
        mve: !!mve ? mve : "",
        mvi: !!mvi ? mvi : "",
        fio2: !!fio2 ? fio2 : "",
        respiratory_Rate: !!respiratory_Rate ? respiratory_Rate : "",
        ie: !!ie ? ie : "",
        tinsp: !!tinsp ? tinsp : "",
        texp: !!texp ? texp : "",
        averageLeak: !!averageLeak ? averageLeak : "",
        sPo2: !!sPo2 ? sPo2 : "",
        pr: !!pr ? pr : "",
      });
      SaveTrends = await trends.save(trends);

    }

    // console.log(11,SaveTrends)
    // console.log('Instead of Agva Pro',req.body)

    if (deviceIdArr.includes(SaveTrends.did)) {
      console.log(true)

    } else {
      deviceIdArr.push(SaveTrends.did)

    }
    if (SaveTrends) {

      // For current date and time
      const currentDateTime = new Date();

      const year = currentDateTime.getFullYear();
      const month = String(currentDateTime.getMonth() + 1).padStart(2, '0');
      const day = String(currentDateTime.getDate()).padStart(2, '0');

      const hours = String(currentDateTime.getHours()).padStart(2, '0');
      const minutes = String(currentDateTime.getMinutes()).padStart(2, '0');
      const seconds = String(currentDateTime.getSeconds()).padStart(2, '0');

      const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

      await statusModelV2.updateMany({ deviceId: did }, { $set: { message: "ACTIVE", lastActive: formattedDateTime } })

      return res.status(201).json({
        status: 1,
        data: { eventCounts: SaveTrends.length },
        message: 'Trends add!',
      });
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
  createTrendsV2,
  getAllDeviceIdV2,
  getAlertsByIdV2,
  getTrendsByIdV2,
  getEventsByIdV2,
  getLogsByIdV2,
  getAllDeviceIdForApp,
  createEventsForDebug
};