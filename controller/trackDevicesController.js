const express = require('express');
const mongoose = require('mongoose');
const calibrationModel = require('../model/calibrationModel.js')
const { validationResult } = require('express-validator');
// const Projects = require('../model/project.js');
const Joi = require('joi');
let redisClient = require("../config/redisInit");
const JWTR = require("jwt-redis").default;
const jwtr = new JWTR(redisClient);
const statusModelV2 = require("../model/statusModelV2.js")
const trackSoldDemoDeviceModel = require("../model/trackDemoSoldDeviceModel.js")


const saveDeviceTrackingHistory = async (req, res) => {
    try {
        const schema = Joi.object({
            deviceId: Joi.string().required(),
            state: Joi.string().required(),
            city: Joi.string().required(),
            ASM_RSM: Joi.string().required(),
            hospitalName: Joi.string().required(),
            purpose: Joi.string().required(),
            serialNumber:Joi.string().required(),
            startDate:Joi.string().required(),
            remarks:Joi.string().allow("").optional(),
        })
        let result = schema.validate(req.body);
        if (result.error) {
            // console.log(req.body);
            return res.status(201).json({
                status: 201,
                statusCode: 400,
                message: result.error.details[0].message,
            })
        }

        // get device data
        const deviceStatus = await statusModelV2.findOne({deviceId:req.body.deviceId});
        // console.log(deviceStatus)
        if (!deviceStatus) {
            return res.status(404).json({
                statusCode: 404,
                statusValue:false,
                message: "Wrong device Id || deviceId is not registered"
            });
        }
        const bodyDoc = new trackSoldDemoDeviceModel({
            userId:"test@agvahealthtech.com",
            deviceId:req.body.deviceId,
            state:req.body.state || "",
            city:req.body.city || "",
            ASM_RSM:req.body.ASM_RSM || "",
            hospitalName:req.body.hospitalName || "",
            purpose:req.body.purpose,
            serialNumber:req.body.serialNumber || "",
            type:deviceStatus.type || "",
            startDate:req.body.startDate || "",
            remarks:req.body.remarks || ""
        })
        const saveDoc = await bodyDoc.save();
        if(!saveDoc) {
            return res.status(400).json({
                statusCode: 400,
                statusValue:false,
                message: "Data not saved."
            });
        }
        return res.status(201).json({
            statusCode: 201,
            statusValue:true,
            message: "Data has been saved successfully."
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


const updateDeviceTrackingHistoryById = async (req, res) => {
    try {
        const { deviceId } = req.body;
        const recordId = req.params.id; // Get the record _id from request params

        // Validate deviceId
        const deviceStatus = await statusModelV2.findOne({ deviceId });
        if (!deviceStatus) {
            return res.status(404).json({
                statusCode: 404,
                statusValue: false,
                message: "Wrong device Id || deviceId is not registered",
            });
        }
        const historyData = await trackSoldDemoDeviceModel.findOne({_id:recordId});
        if (!historyData) {
            return res.status(404).json({
                statusCode: 404,
                statusValue: false,
                message: "Wrong Id || Id is not found.",
            });
        }
        // Prepare data for update
        const updateData = {
            userId: "",
            deviceId,
            state: req.body.state || historyData.state,
            city: req.body.city || historyData.city,
            ASM_RSM: req.body.ASM_RSM || historyData.ASM_RSM,
            hospitalName: req.body.hospitalName || historyData.hospitalName,
            purpose: req.body.purpose || historyData.purpose,
            serialNumber: req.body.serialNumber || historyData.serialNumber,
            type: deviceStatus.type || "",
            startDate:historyData.startDate,
            endDate: req.body.endDate || historyData.endDate,
            remarks: req.body.remarks || historyData.remarks
        };

        // Update document by _id from params
        const response = await trackSoldDemoDeviceModel.findByIdAndUpdate(
            recordId,
            { $set: updateData },
            { new: true } // Return the updated document
        );

        if (!response) {
            return res.status(404).json({
                statusCode: 404,
                statusValue: false,
                message: "Document with provided _id not found.",
            });
        }

        return res.status(200).json({
            statusCode: 200,
            statusValue: true,
            message: "Data has been updated successfully.",
            data: response,
        });
    } catch (err) {
        return res.status(500).json({
            statusCode: 500,
            statusValue: false,
            message: "An error occurred while processing the request.",
            error: {
                generatedTime: new Date(),
                errMsg: err.stack,
                msg: err.message,
                type: err.name,
            },
        });
    }
};


const getDeviceTrackingHistoryById = async (req, res) => {
    try {
        // get device data
        const deviceId = req.params.deviceId;
        // Extract pagination parameters with defaults
        const page = parseInt(req.query.page, 10) || 1; 
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        // Aggregation query with pagination
        const aggregateQuery = [
            {
                $match: {
                    deviceId: deviceId
                }
            },
            {
                $lookup: {
                    from: "device_status_v2", 
                    localField: "deviceId",  
                    foreignField: "deviceId",
                    as: "deviceStatus"       
                }
            },
            {
                $unwind: {
                    path: "$deviceStatus",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $replaceRoot: {
                    newRoot: {
                        $mergeObjects: ["$deviceStatus", "$$ROOT"]
                    }
                }
            },
            {
                $project: {
                    deviceStatus: 0
                }
            },
            {
                $sort: { _id: -1 }
            },
            {
                $skip: skip 
            },
            {
                $limit: limit
            }
        ];

        const aggResult = await trackSoldDemoDeviceModel.aggregate(aggregateQuery);
        // Check if result is empty
        if (!aggResult || aggResult.length === 0) {
            return res.status(404).json({
                status: 0,
                message: "No data found for the given device ID",
                statusCode: 404,
                data: []
            });
        }
        // Respond with paginated data
        res.status(200).json({
            statusValue: true,
            message: "Data fetched successfully",
            statusCode: 200,
            data: aggResult, 
            totalCounts:aggResult.length,
            currentPage: page,
            limit: limit,
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



const getDeviceTrackingHistory = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search;

        const filter = req.query.filter || "Demo";
        let filterMatch = {};
        if (filter === "Demo") {
            filterMatch["trackSalesData.purpose"] = "Demo";
        } else if (filter === "Sold") {
            filterMatch["trackSalesData.purpose"] = "Sold";
        } else if (filter === "All") {
            filterMatch["trackSalesData.purpose"] = { $in: ["Demo", "Sold"] };
        }

        const aggregateQuery = [
            {
                $match: {
                    type: req.params.type,
                },
            },
            {
                $lookup: {
                    from: "track_sales_devices",
                    localField: "deviceId",
                    foreignField: "deviceId",
                    as: "trackSalesData",
                },
            },
            {
                $unwind: {
                    path: "$trackSalesData",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $match: filterMatch,
            },
            ...(search 
                ? [
                    {
                        $match: {
                            $or: [
                                { "trackSalesData.deviceId": { $regex: search, $options: "i" } },
                                { "trackSalesData.serialNumber": { $regex: search, $options: "i" } },
                                { "trackSalesData.hospitalName": { $regex: search, $options: "i" } },
                                { "trackSalesData.ASM_RSM": { $regex: search, $options: "i" } },
                            ]
                        }
                    }
                ] 
                : []),
            {
                $sort: {
                    "_id": -1,
                },
            },
            {
                $group: {
                    _id: "$deviceId",
                    latestDeviceData: { $first: "$$ROOT" },
                },
            },
            {
                $replaceRoot: {
                    newRoot: "$latestDeviceData",
                },
            },
            {
                $addFields: {
                    sortKey: {
                        $cond: { if: { $eq: ["$message", "ACTIVE"] }, then: 0, else: 1 },
                    },
                },
            },
            {
                $sort: {
                    sortKey: 1, 
                    "_id": -1, 
                },
            },
            {
                $skip: skip,
            },
            {
                $limit: limit,
            },
        ];

        const aggResult = await statusModelV2.aggregate(aggregateQuery);

        if (!aggResult || aggResult.length === 0) {
            return res.status(404).json({
                status: 0,
                message: "No data found",
                statusCode: 404,
                data: [],
            });
        }

        res.status(200).json({
            statusValue: true,
            message: "Data fetched successfully",
            statusCode: 200,
            data: aggResult,
            totalCounts: aggResult.length,
            currentPage: page,
            limit: limit,
        });
    } catch (err) {
        res.status(500).json({
            status: -1,
            error: {
                message: err.message,
                stack: err.stack,
            },
        });
    }
};





module.exports = {
    saveDeviceTrackingHistory,
    getDeviceTrackingHistoryById,
    getDeviceTrackingHistory,
    updateDeviceTrackingHistoryById
}