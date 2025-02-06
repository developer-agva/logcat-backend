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



const getDeviceCountDetailsForGraph = async (req, res) => {
  try {
    const { product_code } = req.params;
    /** -------PRODUCTION DATA COUNT------ **/
    // Get all deviceIds from the statusModelV2 collection
    const deviceIds = await statusModelV2.distinct("deviceId", { type: product_code });
    // console.log("data1", deviceIds);

    // Get all registered devices where Hospital_Name is not 'AgVa Healthcare'
    const notIncludedIds = await trackSoldDemoDeviceModel.distinct("deviceId", {
      type: product_code,
      purpose: { $in: ["Demo", "Sold"] }
    });

    const demoDeviceIds = await trackSoldDemoDeviceModel.distinct("deviceId", {
      type: product_code,
      purpose: "Demo"
    });

    // console.log(123, notIncludedIds.length)

    const deviceIdsFromnotIncludedIds = notIncludedIds.map(item => item.deviceId);
    const filteredDeviceIds = deviceIds.filter(deviceId => !deviceIdsFromnotIncludedIds.includes(deviceId));

    const productionCount = [...new Set(filteredDeviceIds)]
    console.log(123, productionCount.length)


    return res.status(200).json({
      statusCode: 200,
      statusValue: "SUCCESS",
      message: "Device counts retrieved successfully.",
      data1: {
        demoCount: demoDeviceIds.length,
        productionCount: productionCount.length
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
      leadType
    } = req.body;

    if (!hospitalName || !email || !contact || !leadSource || !dealerName ||
      !address || !state || !city || !concernPersonName || !concernPersonContact || !pincode || !leadType) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: "All fields are required.",
      });
    }

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
      leadType
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
      leadType
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
        leadType
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

    const { dispatchedFrom, serialNumbers, deviceIds, docketNo, expectedDeliveryDate, deliveringVia } = req.body;
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
            deliveringVia
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

    const { totalAmount, expectedDeliveryDate, accessories, paymentTerms, remark, warrantyDuration, paymentType} = req.body;
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
            addedDate: leadAddedDate
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



const addDemoCompletedByLeadId = async (req, res) => {
  try {
    
    const { leadId } = req.params;
    const schema = Joi.object({
      feedBack: Joi.string().required(),
      expectedSalesDate: Joi.string().required(),
      amountQuoted: Joi.string().required(),
      expectedClosingAmount: Joi.string().required(),
    });
    
    const result = schema.validate(req.body);
    
    if (result.error) {
      return res.status(400).json({
        statusCode: 400,
        statusValue: "FAIL",
        message: result.error.details[0].message,
      });
    }
    const { feedBack, expectedSalesDate, amountQuoted, expectedClosingAmount } = req.body;

    const updatedLead = await leadModel.findOneAndUpdate(
      { leadId },
      {
        $set: {
          "completedDemo": [{
            feedBack,
            expectedSalesDate,
            amountQuoted,
            expectedClosingAmount
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
  addDeviceForSalesByLeadId
}