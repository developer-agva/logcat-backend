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
const axios = require('axios');
const { triggerEmail } = require("../helper/sendEmailOnCreateTicket.js");
const { sendOtpForDeviceLock } = require("../helper/sendOtp.js");
const statusModelV2 = require('../model/statusModelV2.js');
const statusModelV2History = require('../model/statusModelV2History.js');
const registeredDevice = require("../model/RegisterDevice.js")
const moment = require("moment-timezone");
const trackSoldDemoDeviceModel = require('../model/trackDemoSoldDeviceModel.js');
const leadModel = require('../model/leadModel.js');


const getDeviceCountDetails = async (req, res) => {
  try {
    const { product_code } = req.params;
    /** -------PRODUCTION DATA COUNT------ **/
    // Get all deviceIds from the statusModelV2 collection
    const deviceIds = await statusModelV2.distinct("deviceId", { type: product_code });
    // console.log("data1", deviceIds);

    // Get all registered devices where Hospital_Name is not 'AgVa Healthcare'
    const dispatchDemoAndSoldDevices = await leadModel.aggregate([
      {
        $match: {
          "dispatchDemo.0": { $exists: true },
          "dispatchSalesDevice.0": { $exists: true }
        }
      },
      {
        $project: {
          _id: 0,
          allDeviceIds: {
            $concatArrays: [
              {
                $reduce: {
                  input: "$dispatchDemo",
                  initialValue: [],
                  in: { $concatArrays: ["$$value", "$$this.deviceIds"] }
                }
              },
              {
                $reduce: {
                  input: "$dispatchSalesDevice",
                  initialValue: [],
                  in: { $concatArrays: ["$$value", "$$this.deviceIds"] }
                }
              }
            ]
          }
        }
      },
      {
        $unwind: "$allDeviceIds" // Flatten array to individual elements
      },
      {
        $group: {
          _id: null,
          allDeviceIds: { $addToSet: "$allDeviceIds" } // Remove duplicates
        }
      },
      {
        $project: {
          _id: 0,
          allDeviceIds: 1
        }
      }
    ]);
    
    // const demoDevices = dispatchDemoDevices[0].allDeviceIds
    const notIncludedIds = dispatchDemoAndSoldDevices[0].allDeviceIds

    // console.log(123, notIncludedIds.length)

    const deviceIdsFromnotIncludedIds = notIncludedIds;
    const filteredDeviceIds = deviceIds.filter(deviceId => !deviceIdsFromnotIncludedIds.includes(deviceId));

    const productionCount = [...new Set(filteredDeviceIds)]

    /**-----TOTAL DEVICE COUNT-------*/
    const deviceStatus = await statusModelV2.distinct("deviceId", { type: product_code })
    const totalDeviceCount = deviceStatus.length;

    // Get IST timestamps in string format
    const nowIST = moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");
    const last24HoursIST = moment().tz("Asia/Kolkata").subtract(24, "hours").format("YYYY-MM-DD HH:mm:ss");
    const last7DaysIST = moment().tz("Asia/Kolkata").subtract(7, "days").format("YYYY-MM-DD HH:mm:ss");

    /** ----------------- ACTIVE DEVICES (LAST 7 DAYS, LAST 24 HOURS) ----------------- **/

    const dispatchDemoDevices = await leadModel.aggregate([
      {
        $match: {
          "dispatchDemo.0": { $exists: true } 
        }
      },
      {
        $project: {
          _id: 0,
          deviceIds: {
            $reduce: {
              input: "$dispatchDemo",
              initialValue: [],
              in: { $concatArrays: ["$$value", "$$this.deviceIds"] }
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          allDeviceIds: { $push: "$deviceIds" }
        }
      },
      {
        $project: {
          _id: 0,
          allDeviceIds: { $reduce: { input: "$allDeviceIds", initialValue: [], in: { $concatArrays: ["$$value", "$$this"] } } }
        }
      }
    ]);
    
    const demoDevices = dispatchDemoDevices[0].allDeviceIds
    
    const matchedDeviceIds = demoDevices;

    const activeAggregation = await statusModelV2History.aggregate([
      {
        $match: {
          type: product_code,
          message: "ACTIVE",
          lastActive: { $exists: true, $ne: "" },
          deviceId: { $in: matchedDeviceIds },
        },
      },
      {
        $group: {
          _id: "$deviceId",
          lastActive: { $max: "$lastActive" },
        },
      },
      {
        $group: {
          _id: null,
          activeLast24Hours: {
            $sum: { $cond: [{ $gte: ["$lastActive", last24HoursIST] }, 1, 0] },
          },
          activeLast7Days: {
            $sum: { $cond: [{ $gte: ["$lastActive", last7DaysIST] }, 1, 0] },
          },
        },
      },
    ]);


    /** ----------------- INACTIVE DEVICES (LAST 7 DAYS) ----------------- **/
    const inactiveAggregation = await statusModelV2History.aggregate([
      {
        $match: {
          type: product_code,
          message: "INACTIVE",
          lastActive: { $gte: last7DaysIST, $lte: nowIST },
          deviceId: { $in: matchedDeviceIds },
        },
      },
      {
        $group: {
          _id: "$deviceId",
        },
      },
      {
        $group: {
          _id: null,
          inactiveLast7Days: { $sum: 1 },
        },
      },
    ]);

    // Prepare response
    const inactiveData = inactiveAggregation.length > 0 ? inactiveAggregation[0] : { inactiveLast7Days: 0 };
    // Prepare Response
    const activeData = activeAggregation.length > 0 ? activeAggregation[0] : {
      activeLast24Hours: 0,
      activeLast7Days: 0,
    };
    const response = {
      ...activeData,
      ...inactiveData,
      totalDeviceCount: totalDeviceCount,
      productionCount: productionCount.length,
    };

    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Device counts retrieved successfully.",
      data: response,
      test:demoDevices
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



const getTotalDeviceCountDetails = async (req, res) => {
  try {
    const { product_code } = req.params;
    /** -------PRODUCTION DATA COUNT------ **/
    // Get all deviceIds from the statusModelV2 collection
    const deviceIds = await statusModelV2.distinct("deviceId", { type: product_code });
    // console.log("data1", deviceIds);

    // Get all registered devices where Hospital_Name is not 'AgVa Healthcare'
    const dispatchDemoAndSoldDevices = await leadModel.aggregate([
      {
        $match: {
          "dispatchDemo.0": { $exists: true },
          "dispatchSalesDevice.0": { $exists: true }
        }
      },
      {
        $project: {
          _id: 0,
          allDeviceIds: {
            $concatArrays: [
              {
                $reduce: {
                  input: "$dispatchDemo",
                  initialValue: [],
                  in: { $concatArrays: ["$$value", "$$this.deviceIds"] }
                }
              },
              {
                $reduce: {
                  input: "$dispatchSalesDevice",
                  initialValue: [],
                  in: { $concatArrays: ["$$value", "$$this.deviceIds"] }
                }
              }
            ]
          }
        }
      },
      {
        $unwind: "$allDeviceIds" // Flatten array to individual elements
      },
      {
        $group: {
          _id: null,
          allDeviceIds: { $addToSet: "$allDeviceIds" } // Remove duplicates
        }
      },
      {
        $project: {
          _id: 0,
          allDeviceIds: 1
        }
      }
    ]);

    // const demoDevices = dispatchDemoDevices[0].allDeviceIds
    const notIncludedIds = dispatchDemoAndSoldDevices[0].allDeviceIds

    // console.log(123, notIncludedIds)

    const deviceIdsFromnotIncludedIds = notIncludedIds;
    const filteredDeviceIds = deviceIds.filter(deviceId => !deviceIdsFromnotIncludedIds.includes(deviceId));

    const productionCount = [...new Set(filteredDeviceIds)]

    const dispatchDemoDevices = await leadModel.aggregate([
      {
        $match: {
          "dispatchDemo.0": { $exists: true }
        }
      },
      {
        $project: {
          _id: 0,
          dispatchDemoDevices: {
            $reduce: {
              input: "$dispatchDemo", // Iterate over the dispatchDemo array
              initialValue: [],
              in: { $concatArrays: ["$$value", "$$this.deviceIds"] } // Concatenate deviceIds
            }
          }
        }
      },
      {
        $unwind: "$dispatchDemoDevices" // Flatten the array to individual elements
      },
      {
        $group: {
          _id: null,
          dispatchDemoDevices: { $addToSet: "$dispatchDemoDevices" } // Remove duplicates
        }
      },
      {
        $project: {
          _id: 0,
          dispatchDemoDevices: 1
        }
      }
    ]);
    
    const disDemoDevices = [... new Set(dispatchDemoDevices[0].dispatchDemoDevices)]
    // console.log(disDemoDevices)

    /**-----TOTAL DEVICE COUNT-------*/
    const deviceStatus = await statusModelV2.distinct("deviceId", { type: product_code })
    const totalDeviceCount = deviceStatus.length;

    // Get IST timestamps in string format
    const nowIST = moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");
    const last24HoursIST = moment().tz("Asia/Kolkata").subtract(24, "hours").format("YYYY-MM-DD HH:mm:ss");
    const last7DaysIST = moment().tz("Asia/Kolkata").subtract(7, "days").format("YYYY-MM-DD HH:mm:ss");

    /** ----------------- ACTIVE DEVICES (LAST 7 DAYS, LAST 24 HOURS) ----------------- **/
    
    // const demoDevices = dispatchDemoDevices[0].allDeviceIds
    
    // const matchedDeviceIds = demoDevices;

    const activeAggregation = await statusModelV2History.aggregate([
      {
        $match: {
          type: product_code,
          message: "ACTIVE",
          lastActive: { $exists: true, $ne: "" },
          // deviceId: { $in: matchedDeviceIds },
        },
      },
      {
        $group: {
          _id: "$deviceId",
          lastActive: { $max: "$lastActive" },
        },
      },
      {
        $group: {
          _id: null,
          activeLast24Hours: {
            $sum: { $cond: [{ $gte: ["$lastActive", last24HoursIST] }, 1, 0] },
          },
          activeLast7Days: {
            $sum: { $cond: [{ $gte: ["$lastActive", last7DaysIST] }, 1, 0] },
          },
        },
      },
    ]);


    // /** ----------------- INACTIVE DEVICES (LAST 7 DAYS) ----------------- **/
    const inactiveAggregation = await statusModelV2History.aggregate([
      {
        $match: {
          type: product_code,
          message: "INACTIVE",
          lastActive: { $gte: last7DaysIST, $lte: nowIST },
          // deviceId: { $in: matchedDeviceIds },
        },
      },
      {
        $group: {
          _id: "$deviceId",
        },
      },
      {
        $group: {
          _id: null,
          inactiveLast7Days: { $sum: 1 },
        },
      },
    ]);

    // // Prepare response
    const inactiveData = inactiveAggregation.length > 0 ? inactiveAggregation[0] : { inactiveLast7Days: 0 };
    // // Prepare Response
    const activeData = activeAggregation.length > 0 ? activeAggregation[0] : {
      activeLast24Hours: 0,
      activeLast7Days: 0,
    };
    const response = {
      ...activeData,
      ...inactiveData,
      totalDeviceCount: totalDeviceCount,
      productionCount: productionCount.length,
      demoCount: disDemoDevices.length,
    };

    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Device counts retrieved successfully.",
      data: response,
      // test:demoDevices
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


const getDeviceSummaryList = async (req, res) => {
  try {
    const { product_code } = req.params;
    const deviceIds = await statusModelV2.find(
      { type: product_code },
      { deviceId: 1, purpose: 1, message: 1, lastActive:1, _id: 0 }
    );
    
    // Fetch leads data
    const leadsData = await leadModel.find(
      {},
      {
        leadId: 1,
        hospitalName: 1,
        email: 1,
        contact: 1,
        leadSource: 1,
        dealerName: 1,
        state: 1,
        city: 1,
        dispatchSalesDevice: 1,
        dispatchDemo: 1,
      }
    );
    
    const result = [];
    
    leadsData.forEach((lead) => {
      const { leadId, hospitalName, email, contact, leadSource, dealerName, state, city, dispatchDemo, dispatchSalesDevice } = lead;
    
      deviceIds.forEach(({ deviceId, purpose, message, lastActive }) => {
        // Check if deviceId exists in dispatchDemo or dispatchSalesDevice
        const isInDemo = dispatchDemo?.some((demo) => demo.deviceIds.includes(deviceId));
        const isInSales = dispatchSalesDevice?.some((sales) => sales.deviceIds.includes(deviceId));
    
        if (isInDemo || isInSales) {
          result.push({
            leadId,
            hospitalName,
            email,
            contact,
            leadSource,
            dealerName,
            state,
            city,
            deviceId,
            purpose, // Now taken directly from statusModelV2
            message,
            lastActive
          });
        }
      });
    });
    
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Device summary retrieved successfully.",
      data: result,
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


const getYearMonthWiseDataCount = async (req, res) => {
  try {
    const { product_code } = req.params;
    const filter = req.query.filter;
    /** -------PRODUCTION DATA COUNT------ **/
    // Get all deviceIds from the statusModelV2 collection
    const deviceIds = await statusModelV2.distinct("deviceId", { type: product_code });
    // console.log("data1", deviceIds);

    // Get all registered devices where Hospital_Name is not 'AgVa Healthcare'
    const dispatchDemoDevices = await leadModel.aggregate([
      {
        $match: {
          "dispatchDemo.0": { $exists: true },
          // "dispatchDemo.0": { $exists: true } 
        }
      },
      {
        $project: {
          _id: 0,
          deviceIds: {
            $reduce: {
              input: "$dispatchDemo",
              initialValue: [],
              in: { $concatArrays: ["$$value", "$$this.deviceIds"] }
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          allDeviceIds: { $push: "$deviceIds" }
        }
      },
      {
        $project: {
          _id: 0,
          allDeviceIds: { $reduce: { input: "$allDeviceIds", initialValue: [], in: { $concatArrays: ["$$value", "$$this"] } } }
        }
      }
    ]);
    
    const demoDevices = [...new Set(dispatchDemoDevices[0].allDeviceIds)]
    // console.log("demo-devices", demoDevices)

    const dispatchSalesDevices = await leadModel.aggregate([
      {
        $match: {
          "dispatchSalesDevice.0": { $exists: true },
        }
      },
      {
        $project: {
          _id: 0,
          deviceIds: {
            $reduce: {
              input: "$dispatchSalesDevice",
              initialValue: [],
              in: { $concatArrays: ["$$value", "$$this.deviceIds"] }
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          allDeviceIds: { $push: "$deviceIds" }
        }
      },
      {
        $project: {
          _id: 0,
          allDeviceIds: { $reduce: { input: "$allDeviceIds", initialValue: [], in: { $concatArrays: ["$$value", "$$this"] } } }
        }
      }
    ]);
    
    const salesDevices = [...new Set(dispatchSalesDevices[0].allDeviceIds)]
    // console.log('sales-devices', salesDevices)
    const demoAndSalesIds = [...demoDevices, ...salesDevices]


    // console.log(123, notIncludedIds)
    const filteredDeviceIds = deviceIds.filter(deviceId => !demoAndSalesIds.includes(deviceId));

    const productionDeviceIds = [...new Set(filteredDeviceIds)]
    // console.log("prod-devices", productionDeviceIds)

    // /**-----TOTAL DEVICE COUNT-------*/
    const deviceStatus = await statusModelV2.distinct("deviceId", { type: product_code })
    const totalDevices = deviceStatus
    
    const currentYear = new Date().getFullYear();
    // Ensure all 12 months exist
    const allMonths = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    if (req.query.filter === "monthly") {
      // console.log(demoDevices)
      const aggregateQuery = [
        {
          $match: {
            deviceId: { $in: demoDevices },
            message: "ACTIVE" 
          },
        },
        {
          $addFields: {
            lastActiveDate: {
              $dateFromString: {
                dateString: "$lastActive",
                format: "%Y-%m-%d %H:%M:%S",
                onError: null, 
              },
            },
          },
        },
        {
          $match: {
            lastActiveDate: {
              $gte: new Date(`${currentYear}-01-01T00:00:00Z`), 
              $lt: new Date(`${currentYear + 1}-01-01T00:00:00Z`),
            },
          },
        },
        {
          $addFields: {
            month: { $dateToString: { format: "%m", date: "$lastActiveDate" } }, 
            monthName: { $dateToString: { format: "%B", date: "$lastActiveDate" } }, 
          },
        },
        {
          $group: {
            _id: "$month",
            monthName: { $first: "$monthName" }, 
            uniqueDevices: { $addToSet: "$deviceId" }, 
          },
        },
        {
          $project: {
            month: { $toInt: "$_id" }, 
            monthName: 1,
            count: { $size: "$uniqueDevices" }, 
          },
        },
        {
          $sort: { month: 1 }, 
        },
      ];
      const aggregateQuery2 = [
        {
          $match: {
            deviceId: { $in: demoDevices }
            // message: "ACTIVE" 
          },
        },
        {
          $addFields: {
            lastActiveDate: {
              $dateFromString: {
                dateString: "$lastActive",
                format: "%Y-%m-%d %H:%M:%S",
                onError: null, 
              },
            },
          },
        },
        {
          $match: {
            lastActiveDate: {
              $gte: new Date(`${currentYear}-01-01T00:00:00Z`), 
              $lt: new Date(`${currentYear + 1}-01-01T00:00:00Z`),
            },
          },
        },
        {
          $addFields: {
            month: { $dateToString: { format: "%m", date: "$lastActiveDate" } }, 
            monthName: { $dateToString: { format: "%B", date: "$lastActiveDate" } }, 
          },
        },
        {
          $group: {
            _id: "$month",
            monthName: { $first: "$monthName" }, 
            uniqueDevices: { $addToSet: "$deviceId" }, 
          },
        },
        {
          $project: {
            month: { $toInt: "$_id" }, 
            monthName: 1,
            count: { $size: "$uniqueDevices" }, 
          },
        },
        {
          $sort: { month: 1 }, 
        },
      ]; 
      // Execute aggregation
      const statusHistory = await statusModelV2History.aggregate(aggregateQuery);
      const statusHistory2 = await statusModelV2History.aggregate(aggregateQuery2);
      
      const finalResult = allMonths.map((month, index) => {
        const found = statusHistory.find(entry => entry.month === index + 1);
        return {
          month: month,
          count: found ? found.count : 0,
        };
      });
      const finalResult2 = allMonths.map((month, index) => {
        const found = statusHistory2.find(entry => entry.month === index + 1);
        return {
          month: month,
          count: found ? found.count : 0,
        };
      });

      return res.status(200).json({
        statusCode: 200,
        statusValue: "SUCCESS",
        message: "Device counts retrieved successfully.",
        demoDeviceCount: finalResult,
        totalDeviceCount:finalResult2
      });
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


const getYearMonthWiseDataCountForDevices = async (req, res) => {
  try {
    const { product_code } = req.params;
    // Get all deviceIds from the statusModelV2 collection
    const deviceStatus = await statusModelV2.distinct("deviceId", { type: product_code })
    const totalDevices = deviceStatus
    
    const currentYear = new Date().getFullYear();
    // Ensure all 12 months exist
    const allMonths = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

      // console.log(demoDevices)
      const aggregateQuery = [
        {
          $match: {
            deviceId: { $in: totalDevices },
            message: "ACTIVE" 
          },
        },
        {
          $addFields: {
            lastActiveDate: {
              $dateFromString: {
                dateString: "$lastActive",
                format: "%Y-%m-%d %H:%M:%S",
                onError: null, 
              },
            },
          },
        },
        {
          $match: {
            lastActiveDate: {
              $gte: new Date(`${currentYear}-01-01T00:00:00Z`), 
              $lt: new Date(`${currentYear + 1}-01-01T00:00:00Z`),
            },
          },
        },
        {
          $addFields: {
            month: { $dateToString: { format: "%m", date: "$lastActiveDate" } }, 
            monthName: { $dateToString: { format: "%B", date: "$lastActiveDate" } }, 
          },
        },
        {
          $group: {
            _id: "$month",
            monthName: { $first: "$monthName" }, 
            uniqueDevices: { $addToSet: "$deviceId" }, 
          },
        },
        {
          $project: {
            month: { $toInt: "$_id" }, 
            monthName: 1,
            count: { $size: "$uniqueDevices" }, 
          },
        },
        {
          $sort: { month: 1 }, 
        },
      ];
      const aggregateQuery2 = [
        {
          $match: {
            deviceId: { $in: totalDevices }
            // message: "ACTIVE" 
          },
        },
        {
          $addFields: {
            lastActiveDate: {
              $dateFromString: {
                dateString: "$lastActive",
                format: "%Y-%m-%d %H:%M:%S",
                onError: null, 
              },
            },
          },
        },
        {
          $match: {
            lastActiveDate: {
              $gte: new Date(`${currentYear}-01-01T00:00:00Z`), 
              $lt: new Date(`${currentYear + 1}-01-01T00:00:00Z`),
            },
          },
        },
        {
          $addFields: {
            month: { $dateToString: { format: "%m", date: "$lastActiveDate" } }, 
            monthName: { $dateToString: { format: "%B", date: "$lastActiveDate" } }, 
          },
        },
        {
          $group: {
            _id: "$month",
            monthName: { $first: "$monthName" }, 
            uniqueDevices: { $addToSet: "$deviceId" }, 
          },
        },
        {
          $project: {
            month: { $toInt: "$_id" }, 
            monthName: 1,
            count: { $size: "$uniqueDevices" }, 
          },
        },
        {
          $sort: { month: 1 }, 
        },
      ]; 
      // Execute aggregation
      const statusHistory = await statusModelV2History.aggregate(aggregateQuery);
      const statusHistory2 = await statusModelV2History.aggregate(aggregateQuery2);
      
      const finalResult = allMonths.map((month, index) => {
        const found = statusHistory.find(entry => entry.month === index + 1);
        return {
          month: month,
          count: found ? found.count : 0,
        };
      });
      const finalResult2 = allMonths.map((month, index) => {
        const found = statusHistory2.find(entry => entry.month === index + 1);
        return {
          month: month,
          count: found ? found.count : 0,
        };
      });

      return res.status(200).json({
        statusCode: 200,
        statusValue: "SUCCESS",
        message: "Device counts retrieved successfully.",
        activeDeviceCount: finalResult,
        totalDeviceCount:finalResult2
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

// console.log('check-data', getYearMonthWiseDataCount())


const getDeviceCountDetailsForGraph = async (req, res) => {
  try {
    const { product_code } = req.params;
    /** -------PRODUCTION DATA COUNT------ **/
    // Get all deviceIds from the statusModelV2 collection
    const deviceIds = await statusModelV2.distinct("deviceId", { type: product_code });
    // console.log("data1", deviceIds);

    // Get all registered devices where Hospital_Name is not 'AgVa Healthcare'
    const dispatchDemoDevices = await leadModel.aggregate([
      {
        $match: {
          "dispatchDemo.0": { $exists: true },
          // "dispatchDemo.0": { $exists: true } 
        }
      },
      {
        $project: {
          _id: 0,
          deviceIds: {
            $reduce: {
              input: "$dispatchDemo",
              initialValue: [],
              in: { $concatArrays: ["$$value", "$$this.deviceIds"] }
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          allDeviceIds: { $push: "$deviceIds" }
        }
      },
      {
        $project: {
          _id: 0,
          allDeviceIds: { $reduce: { input: "$allDeviceIds", initialValue: [], in: { $concatArrays: ["$$value", "$$this"] } } }
        }
      }
    ]);
    
    const demoDevices = [...new Set(dispatchDemoDevices[0].allDeviceIds)]
    
    const dispatchSalesDevices = await leadModel.aggregate([
      {
        $match: {
          "dispatchSalesDevice.0": { $exists: true },
        }
      },
      {
        $project: {
          _id: 0,
          deviceIds: {
            $reduce: {
              input: "$dispatchSalesDevice",
              initialValue: [],
              in: { $concatArrays: ["$$value", "$$this.deviceIds"] }
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          allDeviceIds: { $push: "$deviceIds" }
        }
      },
      {
        $project: {
          _id: 0,
          allDeviceIds: { $reduce: { input: "$allDeviceIds", initialValue: [], in: { $concatArrays: ["$$value", "$$this"] } } }
        }
      }
    ]);
    
    const salesDevices = [...new Set(dispatchSalesDevices[0].allDeviceIds)]
    const demoAndSalesIds = [...demoDevices, ...salesDevices]

    // console.log(123, notIncludedIds)
    const filteredDeviceIds = deviceIds.filter(deviceId => !demoAndSalesIds.includes(deviceId));

    const productionDeviceIds = [...new Set(filteredDeviceIds)]

    // /**-----TOTAL DEVICE COUNT-------*/
    const deviceStatus = await statusModelV2.distinct("deviceId", { type: product_code })
    const totalDevices = deviceStatus
    
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Device counts retrieved successfully.",
      data: {
        demoCount: demoDevices.length,
        salesCount: salesDevices.length,
        productionCount: productionDeviceIds.length,
        totalDeviceCount: totalDevices.length
      }
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


const addInitialLead = async (req, res) => {
  try {
    const { product_code } = req.params;
    const schema = Joi.object({
      hospitalName: Joi.string().required(),
      email: Joi.string().required(),
      contact: Joi.string().required(),
      leadSource: Joi.string().required(),
      dealerName: Joi.string().required(),
      address: Joi.string().required(),
      state: Joi.string().required(),
      city: Joi.string().required(),
      concernPersonName: Joi.string().required(),
      concernPersonContact: Joi.string().required(),
      pincode: Joi.string().required(),
      leadType: Joi.string().required(),
      visitingCardImageUrl: Joi.string().allow("").optional()
    });
    
    // Validate request body
    const result = schema.validate(req.body);
    
    if (result.error) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: result.error.details[0].message,
      });
    }
    
     const {hospitalName,email,contact,leadSource,dealerName,address,state,
      city,concernPersonName,concernPersonContact,pincode,leadType,visitingCardImageUrl} = req.body;

    const leadId = Math.floor(1000 + Math.random() * 9000).toString();
    const leadAddedDate = new Date().toISOString().split('T')[0];
    const bodydoc = new leadModel({
      leadId,
      hospitalName,
      email,
      contact,
      leadSource,
      dealerName,
      address,
      state,
      city,
      concernPersonName,
      concernPersonContact,
      pincode,
      leadAddedDate,
      leadType,
      visitingCardImageUrl: visitingCardImageUrl || ""
    })
    
    const saveDoc = await bodydoc.save();
    if (saveDoc) {
      return res.status(201).json({
        statusCode: 201,
        statusValue: "SUCCESS",
        message: "Lead created successfully.",
        data: saveDoc
      });
    }
    return res.status(400).json({
      statusCode: 400,
      statusValue: "FAIL",
      message: "Error! while adding data.",
      data: req.body
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


const getAllLeads = async (req, res) => {
  try {
    // Search
    let search = req.query.search ? req.query.search.trim() : "";

    // Pagination
    let { page, limit } = req.query;
    page = page && parseInt(page) > 0 ? parseInt(page) : 1;
    limit = limit && parseInt(limit) > 0 ? parseInt(limit) : 10;
    const skip = (page - 1) * limit;

    // Search query
    const searchQuery = search
      ? {
        $or: [
          { hospitalName: { $regex: ".*" + search + ".*", $options: "i" } },
          { email: { $regex: ".*" + search + ".*", $options: "i" } },
          { contact: { $regex: ".*" + search + ".*", $options: "i" } }
        ],
      }
      : {};

    // Fetch Leads with Pagination
    const leads = await leadModel
      .find(searchQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    leads.forEach((lead) => {
      if (lead.paymentUpdates && lead.paymentUpdates.length > 0) {
        lead.paymentUpdates = [lead.paymentUpdates[lead.paymentUpdates.length - 1]];
      }
    });  

    // Count total leads matching the query
    const count = await leadModel.countDocuments(searchQuery);
    

    if (leads.length > 0) {
      return res.status(200).json({
        statusCode: 200,
        statusValue: "SUCCESS",
        message: "Leads retrieved successfully.",
        data: leads,
        totalDataCount: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      });
    }
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "No leads found.",
      data: [],
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



const getLeadsCount = async (req, res) => {
  try {

    const leads = await leadModel.find({}, { leadType: 1, leadStatus: 1 })
    const leadsCount = leads.reduce((acc, lead) => {

      acc[lead.leadType] = (acc[lead.leadType] || 0) + 1;
      if (lead.leadStatus === "Active") {
        acc["ACTIVE LEADS"] += 1;
      }
      return acc;

    }, { "COLD LEADS": 0, "WARM LEADS": 0, "HOT LEADS": 0, "ACTIVE LEADS": 0 })

    const formattedLeadCounts = Object.keys(leadsCount).reduce((acc, item) => {
      // console.log(11, item)
      const words = item.toLowerCase().split(" ");
      // console.log(12, words)
      const camelCaseKey = words[0] + (words[1] ? words[1][0].toUpperCase()+words[1].slice(1):"");
      acc[camelCaseKey] = leadsCount[item];

      return acc;
    }, {})
    // console.log(formattedLeadCounts)

    if (leads.length > 0) {
      return res.status(200).json({
        statusCode: 200,
        statusValue: "SUCCESS",
        message: "Leads retrieved successfully.",
        data: formattedLeadCounts
      });
    }
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "No leads found.",
      data: {},
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


const updateLeadById = async (req, res) => {
  try {
    const { leadId } = req.params;
    const {
      hospitalName,
      email,
      contact,
      leadSource,
      dealerName,
      address,
      state,
      city,
      concernPersonName,
      concernPersonContact,
      pincode,
      leadType,
      visitingCardImageUrl
    } = req.body;

    // Check if lead exists
    const existingLead = await leadModel.findOne({ leadId });
    if (!existingLead) {
      return res.status(404).json({
        statusCode: 404,
        statusValue: "FAIL",
        message: "Lead not found.",
      });
    }

    // Update lead details
    const updatedLead = await leadModel.findOneAndUpdate(
      { leadId },
      {
        hospitalName,
        email,
        contact,
        leadSource,
        dealerName,
        address,
        state,
        city,
        concernPersonName,
        concernPersonContact,
        pincode,
        leadType,
        visitingCardImageUrl:visitingCardImageUrl || existingLead.visitingCardImageUrl
      },
      { new: true }
    );

    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Lead updated successfully.",
      data: updatedLead,
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


const updateScheduledDemoByLeadId = async (req, res) => {
  try {
    
    const { leadId } = req.params;
    const schema = Joi.object({
      deviceType: Joi.string().required(),
      contactPerson: Joi.string().required(),
      demoDate: Joi.string().required(),
    });
    
    // Validate request body
    const result = schema.validate(req.body);
    
    if (result.error) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: result.error.details[0].message,
      });
    }

    const { deviceType, contactPerson, demoDate } = req.body;

    const updatedLead = await leadModel.findOneAndUpdate(
      { leadId },
      {
        $set: {
          "scheduledDemo": [{
            deviceType,
            contactPerson,
            demoDate
          }]
        }
      },
      { new: true }
    );

    if (!updatedLead) {
      return res.status(404).json({
        statusCode: 404,
        statusValue: "FAIL",
        message: "Lead not found.",
      });
    }

    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Scheduled demo updated successfully.",
      data: updatedLead,
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


const updateDispatchDemoByLeadId = async (req, res) => {
  try {
    
    const { leadId } = req.params;
    const schema = Joi.object({
      dispatchedFrom: Joi.string().required(),
      serialNumbers: Joi.array().items(Joi.string()).required(),
      deviceIds: Joi.array().items(Joi.string()).required(),
      docketNo: Joi.string().required(),
      expectedDeliveryDate: Joi.string().required(),
      deliveringVia: Joi.string().required(),
      deliveryNoteImageUrl: Joi.string().allow("").optional(),
    }).custom((value, helpers) => {
      if (value.deviceIds.length !== value.serialNumbers.length) {
        return helpers.error("any.invalid", "deviceIds and serialNumbers must have the same length");
      }
      return value;
    });
    
    // Validate request body
    const result = schema.validate(req.body);
    
    if (result.error) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: result.error.details[0].message,
      });
    }

    const { dispatchedFrom, serialNumbers, deviceIds, docketNo, expectedDeliveryDate, deliveringVia, deliveryNoteImageUrl } = req.body;
    const updatedLead = await leadModel.findOneAndUpdate(
      { leadId },
      {
        $set: {
          "dispatchDemo": [{
            dispatchedFrom,
            serialNumbers,
            deviceIds,
            docketNo,
            expectedDeliveryDate,
            deliveringVia,
            deliveryNoteImageUrl: deliveryNoteImageUrl || ""
          }]
        }
      },
      { new: true }
    );
    

    if (!updatedLead) { 
      return res.status(404).json({
        statusCode: 404,
        statusValue: "FAIL",
        message: "Lead not found.",
      });
    }

    await statusModelV2.updateMany(
      { deviceId:{$in: deviceIds} },
      { $set: { purpose: "Demo" } }
    );
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Dispatch demo updated successfully.",
      data: updatedLead,
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



const addDeviceForSalesByLeadId = async (req, res) => {
  try {
    
    const { leadId } = req.params;
    const schema = Joi.object({
      totalAmount: Joi.string().required(),
      expectedDeliveryDate: Joi.string().required(),
      accessories: Joi.string().required(),
      paymentTerms: Joi.string().allow("").optional(),
      remark: Joi.string().allow("").optional(),
      warrantyDuration: Joi.string().allow("").optional(),
      paymentType: Joi.string().allow("").optional(),
      poImageUrl: Joi.string().allow("").optional(),
    });
    
    // Validate request body
    const result = schema.validate(req.body);
    
    if (result.error) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: result.error.details[0].message,
      });
    }

    const { totalAmount, expectedDeliveryDate, accessories, paymentTerms, remark, warrantyDuration, paymentType, poImageUrl} = req.body;
    const leadAddedDate = new Date().toISOString().split('T')[0];
    const updatedLead = await leadModel.findOneAndUpdate(
      { leadId },
      {
        $set: {
          "sales": [{
            totalAmount,
            expectedDeliveryDate,
            accessories,
            paymentTerms,
            remark,
            warrantyDuration,
            paymentType,
            salesStatus: "Pending",
            addedDate: leadAddedDate,
            poImageUrl: poImageUrl || ""
          }]
        }
      },
      { new: true }
    );

    if (!updatedLead) {
      return res.status(404).json({
        statusCode: 404,
        statusValue: "FAIL",
        message: "Lead not found.",
      });
    }

    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Sales updated successfully.",
      data: updatedLead,
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


const addDispatchForSalesByLeadId = async (req, res) => {
  try {
    const { leadId } = req.params;

    // Define Joi validation schema for dispatchSalesDevice
    const schema = Joi.object({
      serialNumbers: Joi.array().items(Joi.string()).required(),
      deviceIds: Joi.array().items(Joi.string()).required(),
      deliveringVia: Joi.string().required(),
      docketNo: Joi.string().required(),
      expectedDeliveryDate: Joi.string().required(),
      invoiceNumber: Joi.string().required(),
    }).custom((value, helpers) => {
      if (value.deviceIds.length !== value.serialNumbers.length) {
        return helpers.error("any.invalid", "deviceIds and serialNumbers must have the same length");
      }
      return value;
    });

    // Validate request body
    const result = schema.validate(req.body);
    if (result.error) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: result.error.details[0].message,
      });
    }

    const {
      serialNumbers,
      deviceIds,
      deliveringVia,
      docketNo,
      expectedDeliveryDate,
      invoiceNumber,
    } = req.body;

    // Get current date for addedDate field
    const leadAddedDate = new Date().toISOString().split("T")[0];

    // Find and update the lead document (overwrite `dispatchSalesDevice`)
    const updatedLead = await leadModel.findOneAndUpdate(
      { leadId },
      {
        $set: {
          dispatchSalesDevice: [
            {
              serialNumbers,
              deviceIds,
              deliveringVia,
              docketNo,
              expectedDeliveryDate,
              invoiceNumber,
              addedDate: leadAddedDate,
            },
          ],
        },
      },
      { new: true }
    );

    // If lead not found, return error
    if (!updatedLead) {
      return res.status(404).json({
        statusCode: 404,
        statusValue: "FAIL",
        message: "Lead not found.",
      });
    }
    
    await statusModelV2.updateMany(
      { deviceId:{$in: deviceIds} },
      { $set: { purpose: "Sold" } }
    );
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Dispatch sales data updated successfully.",
      data: updatedLead,
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


const addPaymentUpdatesByLeadId = async (req, res) => {
  try {
    const { leadId } = req.params;

    // Define Joi validation schema for dispatchSalesDevice
    const schema = Joi.object({
      // serialNumbers: Joi.array().items(Joi.string()).required(),
      // deviceIds: Joi.array().items(Joi.string()).required(),
      paymentReceived: Joi.string().required(),
      paymentTerms: Joi.string().allow("").optional(),
      paymentMode: Joi.string().required(),
      paymentImageUrl: Joi.string().required(),
      nextPaymentDate: Joi.string().optional(),
    });

    // Validate request body
    const result = schema.validate(req.body);
    if (result.error) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: result.error.details[0].message,
      });
    }

    const {
      // serialNumbers,
      // deviceIds,
      paymentTerms,
      paymentMode,
      nextPaymentDate,
      paymentImageUrl,
      paymentReceived
    } = req.body;
    
    // Calculate remainingAmount
    const leadData = await leadModel.findOne({ leadId }, { sales: 1, paymentUpdates: 1, dispatchSalesDevice:1});
    
    if (!leadData) {
      return res.status(404).json({ 
        statusCode: 404,
        statusValue: "FAIL",
        message: "Lead not found" 
      });
    }

    // Check if leadData and dispatchSalesDevice exist
    if (!leadData.dispatchSalesDevice || leadData.dispatchSalesDevice.length === 0) {
      return res.status(404).json({
          statusCode: 404,
          statusValue: "FAIL",
          message: "Dispatch sales device data not found. Please fill in the dispatch sales data before proceeding."
      });
    }

    // Extract serialNumbers and deviceIds from the first object in dispatchSalesDevice
    const { serialNumbers, deviceIds } = leadData.dispatchSalesDevice[0];

    const totalAmt = parseFloat(leadData.sales[0]?.totalAmount) || 0;
    const advanceAmt = parseFloat(leadData.sales[0]?.advanceAmount) || 0;

    // Sum all previous paymentReceived values
    const paymentReceivedTotal = leadData.paymentUpdates?.reduce((acc, curr) => {
      return acc + (parseFloat(curr.paymentReceived) || 0);
    }, 0) || 0;

    // Calculate remainingAmount as totalAmt - (advanceAmt + all previous paymentReceived amounts)
    let remainingAmount = (totalAmt - (advanceAmt + paymentReceivedTotal)).toString();

    // Subtract the new paymentReceived value from remainingAmount
    remainingAmount = (parseFloat(remainingAmount) - (parseFloat(paymentReceived) || 0)).toString();
    // Get current date for addedDate field
    const leadAddedDate = new Date().toISOString().split("T")[0];

    // Find and update the lead document (overwrite `dispatchSalesDevice`)
    const updatedLead = await leadModel.findOneAndUpdate(
      { leadId },
      {
        $push: {
          paymentUpdates: {
            serialNumbers,
            deviceIds,
            totalAmount: totalAmt,
            advanceAmount: advanceAmt,
            remainingAmount,
            paymentReceived,
            paymentTerms,
            paymentMode,
            nextExpectedPaymentDate: nextPaymentDate || "",
            addedDate:leadAddedDate,
            paymentImageUrl: paymentImageUrl || ""
          },
        },
      },
      { new: true }
    );

    // If lead not found, return error
    if (!updatedLead) {
      return res.status(404).json({
        statusCode: 404,
        statusValue: "FAIL",
        message: "Lead not found.",
      });
    }
    
    await statusModelV2.updateMany(
      { deviceId:{$in: deviceIds} },
      { $set: { purpose: "Sold" } }
    );
    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Dispatch sales data updated successfully.",
      data: updatedLead,
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


const addDeviceForSalesConfirmedByLeadId = async (req, res) => {
  try {
    const { leadId } = req.params;
    
    // Define Joi validation schema
    const schema = Joi.object({
      advanceAmount: Joi.string().required(),
      paymentProof: Joi.string().required(),
      commitedDeliveryDate: Joi.string().required(),
      scheduleOfPayment: Joi.string().required(),
      // remainingAmount: Joi.string().required(),
    });

    // Validate request body
    const result = schema.validate(req.body);
    if (result.error) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: result.error.details[0].message,
      });
    }

    const {
      advanceAmount,
      paymentProof,
      commitedDeliveryDate,
      scheduleOfPayment,
      // remainingAmount,
      // poImageUrl
    } = req.body;

    const lead = await leadModel.findOne({ leadId });
    if (!lead) {
      return res.status(404).json({
        statusCode: 404,
        statusValue: "FAIL",
        message: "Lead not found.",
      });
    }

    // Ensure totalAmount is present and valid
    if (!lead.sales[0].totalAmount || isNaN(parseFloat(lead.sales[0].totalAmount))) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "Invalid or missing totalAmount.",
      });
    }

    // Update the lead document with new sales data
    
    if (lead.sales && lead.sales.length > 0) {
      lead.sales[0].advanceAmount = advanceAmount;
      lead.sales[0].paymentProof = paymentProof;
      lead.sales[0].commitedDeliveryDate = commitedDeliveryDate;
      lead.sales[0].scheduleOfPayment = scheduleOfPayment;

      // Convert values to numbers for calculation
      const totalAmt = parseFloat(lead.sales[0].totalAmount);
      const advanceAmt = parseFloat(advanceAmount) || 0;
      lead.sales[0].remainingAmount = (totalAmt-advanceAmt).toString();

      lead.sales[0].salesStatus = "Confirmed";
      // lead.sales[0].poImageUrl = poImageUrl
    }

    await lead.save();

    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Sales updated successfully.",
      data: lead,
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


const addDemoCompletedByLeadId = async (req, res) => {
  try {
    
    const { leadId } = req.params;
    const schema = Joi.object({
      feedBack: Joi.string().required(),
      expectedSalesDate: Joi.string().required(),
      amountQuoted: Joi.string().required(),
      expectedClosingAmount: Joi.string().required(),
      feedBackReportImageUrl: Joi.string().allow("").optional()
    });
    
    const result = schema.validate(req.body);
    
    if (result.error) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: result.error.details[0].message,
      });
    }
    const { feedBack, expectedSalesDate, amountQuoted, expectedClosingAmount, feedBackReportImageUrl } = req.body;

    const updatedLead = await leadModel.findOneAndUpdate(
      { leadId },
      {
        $set: {
          "completedDemo": [{
            feedBack,
            expectedSalesDate,
            amountQuoted,
            expectedClosingAmount,
            feedBackReportImageUrl: feedBackReportImageUrl || ""
          }]
        }
      },
      { new: true }
    );

    if (!updatedLead) {
      return res.status(404).json({
        statusCode: 404,
        statusValue: "FAIL",
        message: "Lead not found.",
      });
    }

    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Demo data updated successfully.",
      data: updatedLead,
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


const getLeadById = async (req, res) => {
  try {
    const { leadId } = req.params;

    // Find the lead by leadId
    const lead = await leadModel.findOne({ leadId });

    if (!lead) {
      return res.status(404).json({
        statusCode: 404,
        statusValue: "FAIL",
        message: "Lead not found.",
      });
    }

    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Lead retrieved successfully.",
      data: lead,
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







module.exports = {
  getDeviceCountDetails,
  getDeviceCountDetailsForGraph,
  addInitialLead,
  getAllLeads,
  updateLeadById,
  updateScheduledDemoByLeadId,
  getLeadById,
  getLeadsCount,
  updateDispatchDemoByLeadId,
  addDemoCompletedByLeadId,
  addDeviceForSalesByLeadId,
  addDeviceForSalesConfirmedByLeadId,
  addDispatchForSalesByLeadId,
  addPaymentUpdatesByLeadId,
  getYearMonthWiseDataCount,
  getTotalDeviceCountDetails,
  getDeviceSummaryList,
  getYearMonthWiseDataCountForDevices
}