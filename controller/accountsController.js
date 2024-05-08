const express = require('express');
const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const Projects = require('../model/project.js');
const Joi = require('joi');
const NodeGeocoder = require('node-geocoder');
const aboutDeviceModel = require('../model/aboutDeviceModel.js');
const accountsModel = require('../model/accountModel.js');
const productionModel = require('../model/productionModel.js');
const markAsShippedModel = require('../model/markAsShippedModel.js');
const accountsHistoryModel = require('../model/accountHistoryModel.js');


/**
 *  
 * api POST@/api/logger/accounts/save-data
 * desc create location for logger access only
 */
const saveMarkasShippedData = async (req, res) => {
    try {
        const schema = Joi.object({
            seriallNo: Joi.string().required(),
            // deviceId: Joi.string().required(),
            shippedThrough: Joi.string().required(),
            trackingNo: Joi.string().required(),
            vehicleNo: Joi.string().required(),
            shipperName: Joi.string().required(),
            shipperContact: Joi.string().required(),
            comments: Joi.string().required()
        })
        let result = schema.validate(req.body);
        if (result.error) {
            console.log(req.body);
            return res.status(200).json({
                status: 0,
                statusCode: 400,
                message: result.error.details[0].message,
            })
        }
        // get device details by serialNo
        // console.log(req.body)
        const checkAlreadyMarked = await markAsShippedModel.findOne({serialNo:req.body.seriallNo})
        // console.log(checkAlreadyMarked)
        const checkDevice = await productionModel.findOne({serialNumber:req.body.seriallNo})
        // if (!!checkAlreadyMarked) {
        //     return res.status(400).json({
        //         statusCode: 400,
        //         statusValue: "FAIL",
        //         message: "Data already exists with this serial number.",
        //     })
        // }
        const accountsDoc = await markAsShippedModel.findOneAndUpdate(
        {
            serialNo:req.body.seriallNo
        },
        {
            serialNo:req.body.seriallNo,
            deviceId:!!(checkDevice.deviceId) ? checkDevice.deviceId : "NA",
            shippedThrough:req.body.shippedThrough,
            trackingNo:req.body.trackingNo,
            vehicleNo:req.body.vehicleNo,

            shipperName:req.body.shipperName,
            shipperContact:req.body.shipperContact,
            comments:req.body.comments, 
            // document_ref_no:req.body.document_ref_no
        }, {upsert:true})
        if (!!accountsDoc) {
            await productionModel.findOneAndUpdate({serialNumber:req.body.seriallNo},{shipmentMode:"shipped"})
            return res.status(200).json({
                statusCode: 200,
                statusValue: "SUCCESS",
                message: "data added successfully.",
            })
        }
        await productionModel.findOneAndUpdate({serialNumber:req.body.seriallNo},{shipmentMode:"shipped"})
        return res.status(200).json({
            statusCode: 200,
            statusValue: "SUCCESS",
            message: "data added successfully.",
        })
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

// for saving shipping details
const saveAwaitingForShippedData = async (req, res) => {
    try {
        const schema = Joi.object({
            seriallNo: Joi.string().required(),
            // deviceId: Joi.string().required(),
            invoiceNo: Joi.string().allow("").optional(),
            ewaybillNo: Joi.string().allow("").optional(),
            billedTo: Joi.string().allow("").optional(),
            consinee: Joi.string().allow("").optional(),
            document_ref_no: Joi.string().allow("").optional(),
            consigneeAddress:Joi.string().allow("").optional(),
            irn: Joi.string().allow("").optional(),
            ackDate: Joi.string().allow("").optional(),
            ackNo: Joi.string().allow("").optional(),
        })
        let result = schema.validate(req.body);
        if (result.error) {
            // console.log(11,req.body);
            return res.status(200).json({
                status: 0,
                statusCode: 400,
                message: result.error.details[0].message,
            })
        }
        // get device details by serialNo
        const deviceData = await aboutDeviceModel.findOne({serial_no:req.body.seriallNo});
        if (!deviceData) {
            return res.status(400).json({
                statusCode: 400,
                statusValue: "FAIL",
                message: "No data found with this serial number",
            })
        }
        // check already exists or not
        // const checkData = await accountsModel.find({serialNo:req.body.seriallNo})
        // if (checkData.length>0) {
        //     return res.status(400).json({
        //         statusCode: 400,
        //         statusValue: "FAIL",
        //         message: "data already exists",
        //     })
        // }
        const accountData = await accountsModel.findOne({serialNo:req.body.seriallNo})
        if (!!accountData) {
            await accountsHistoryModel.findOneAndUpdate(
                {serialNo:"AGVATESTING09990"},
                {
                    serialNo:!!(accountData.serialNo) ? accountData.serialNo : "NA",
                    ackDate:!!(accountData.ackDate) ? accountData.ackDate : "NA",
                    ackNo:!!(accountData.ackNo) ? accountData.ackNo : "NA",
                    batchNo:!!(accountData.batchNo) ? accountData.batchNo : "NA",
                    billedTo:!!(accountData.billedTo) ? accountData.billedTo : "NA",
                    consigneeAddress:!!(accountData.consigneeAddress) ? accountData.consigneeAddress : "NA",
                    consinee:!!(accountData.consinee) ? accountData.consinee : "NA",
                    deviceId:!!(accountData.deviceId) ? accountData.deviceId : "NA",
                    document_ref_no:!!(accountData.document_ref_no) ? accountData.document_ref_no : "NA",
                    ewaybillNo:!!(accountData.ewaybillNo) ? accountData.ewaybillNo : "NA",
                    ewaybillPdf:!!(accountData.ewaybillPdf) ? accountData.ewaybillPdf : "NA",
                    invoiceNo:!!(accountData.invoiceNo) ? accountData.invoiceNo : "NA",
                    invoicePdf:!!(accountData.invoicePdf) ? accountData.invoicePdf : "NA",
                    irn:!!(accountData.irn) ? accountData.irn : "NA",
                    manufacturingDate:!!(accountData.manufacturingDate) ? accountData.manufacturingDate : "NA",
                },
                {upsert:true}
            )
        }
        await productionModel.findOneAndUpdate({serialNumber:req.body.seriallNo},{shipmentMode:"awaiting_for_shipped"})
        const accountsDoc = await accountsModel.findOneAndUpdate(
            {serialNo:req.body.seriallNo},
            {
                serialNo:req.body.seriallNo,
                deviceId:!!(deviceData.deviceId) ? deviceData.deviceId : "NA",
                batchNo:!!(deviceData.batch_no) ? deviceData.batch_no : "NA",
                manufacturingDate:!!(deviceData.date_of_manufacture) ? deviceData.date_of_manufacture : "NA",
                ewaybillNo:!!(req.body.ewaybillNo) ? req.body.ewaybillNo : "NA",
                invoiceNo:!!(req.body.invoiceNo) ? req.body.invoiceNo : "NA",
                billedTo:!!(req.body.billedTo) ? req.body.billedTo : "NA",
                consinee:!!(req.body.consinee) ? req.body.consinee : "NA", 
                consigneeAddress:!!(req.body.consigneeAddress) ? req.body.consigneeAddress : "NA",
                document_ref_no:!!(req.body.document_ref_no) ? req.body.document_ref_no : "NA",
                irn:!!(req.body.irn) ? req.body.irn : "NA",
                ackDate:!!(req.body.ackDate) ? req.body.ackDate : "NA",
                ackNo:!!(req.body.ackNo) ? req.body.ackNo : "NA"
            },{upsert:true}
        )
        const saveDoc = accountsDoc.save();
        // console.log(req.body.serialNo)
        if (!!accountsDoc) {
            return res.status(200).json({
                statusCode: 200,
                statusValue: "SUCCESS",
                message: "data added successfully.",
            }) 
        }
        return res.status(200).json({
            statusCode: 200,
            statusValue: "SUCCESS",
            message: "data added successfully.",
        }) 
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


// for saving shipping details
const updateAccountDataById = async (req, res) => {
    try {
        const schema = Joi.object({
            seriallNo: Joi.string().required(),
            // deviceId: Joi.string().required(),
            invoiceNo: Joi.string().allow("").optional(),
            ewaybillNo: Joi.string().allow("").optional(),
            billedTo: Joi.string().allow("").optional(),
            consinee: Joi.string().allow("").optional(),
            document_ref_no: Joi.string().allow("").optional(),
            consigneeAddress:Joi.string().allow("").optional(),
            irn: Joi.string().allow("").optional(),
            ackDate: Joi.string().allow("").optional(),
            ackNo: Joi.string().allow("").optional(),
        })
        let result = schema.validate(req.body);
        if (result.error) {
            // console.log(11,req.body);
            return res.status(200).json({
                status: 0,
                statusCode: 400,
                message: result.error.details[0].message,
            })
        }
        // get device details by serialNo
        const accountData = await accountsModel.findOne({serialNo:req.body.seriallNo});
        if (!accountData) {
            return res.status(400).json({
                statusCode: 400,
                statusValue: "FAIL",
                message: "No data found with this serial number",
            })
        }
        await productionModel.findOneAndUpdate({serialNumber:req.body.seriallNo},{shipmentMode:"awaiting_for_shipped"})
        const accountsDoc = await accountsModel.findOneAndUpdate(
            {serialNo:req.body.seriallNo},
            {
                ewaybillNo:req.body.ewaybillNo,
                invoiceNo:req.body.invoiceNo,
                billedTo:req.body.billedTo,
                consinee:req.body.consinee, 
                consigneeAddress:req.body.consigneeAddress,
                document_ref_no:req.body.document_ref_no,
                irn:req.body.irn,
                ackDate:req.body.ackDate,
                ackNo:req.body.ackNo},
                {upsert:true}
        )
       
        if (!!accountsDoc) {
            return res.status(200).json({
                statusCode: 200,
                statusValue: "SUCCESS",
                message: "data updated successfully.",
            }) 
        }
        return res.status(400).json({
            statusCode: 400,
            statusValue: "FAIL",
            message: "data not updated successfully.",
        }) 
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



// /**
//  * 
//  * @param {*} req 
//  * @param {*} res 
//  * api GET@/api/logger/
//  */
// const getAccountsDataa = async (req, res) => {
//     try {
//         // Search
//         var search = "";
//         if (req.query.search && req.query.search !== "undefined") {
//         search = req.query.search;
//         }
//         // for pagination
//         let page = req.query.page
//         let limit = req.query.limit
//         if (!page || page === "undefined") {
//         page = 1;
//         }
//         if (!limit || limit === "undefined" || parseInt(limit) === 0) {
//         limit = 999999;
//         }

//         // aggregate logic
//         var pipline = [
//              // Match
//             // {},
//             {
//                 "$lookup":{
//                   "from":"s3_invoice_buckets",
//                   "localField":"invoiceNo",
//                   "foreignField":"invoiceNo",
//                   "as":"invoiceData"
//                 }
//             },
//             {
//                 "$lookup":{
//                   "from":"s3_ewaybill_buckets",
//                   "localField":"ewaybillNo",
//                   "foreignField":"ewaybillNo",
//                   "as":"ewaybillData"
//                 }
//             },
//             {
//                 "$lookup":{
//                   "from":"about_devices",
//                   "localField":"deviceId",
//                   "foreignField":"deviceId",
//                   "as":"dispatchData"
//                 }
//             },

//             // For this data model, will always be 1 record in right-side
//             // of join, so take 1st joined array element
//             {
//                 "$set": {
//                   "invoiceData": {"$first": "$invoiceData"},
//                   "ewaybillData": {"$first": "$ewaybillData"},
//                   "dispatchData": {"$first": "$dispatchData"},
//                 }
//             },
//             // Extract the joined embeded fields into top level fields
//             {
//                 "$set": {"invoicePdf": "$invoiceData.location", "ewaybillPdf": "$ewaybillData.location"},
//             },
//             {
//                 "$unset": [
//                   "invoiceData",
//                   "ewaybillData",
//                   "__v",
//                   // "createdAt",
//                   "updatedAt",
//                   // "otp",
//                   // "isVerified",
//                 ]
//             },
//         ]
//         // get data
//         const resData = await accountsModel.aggregate(pipline);
//         return res.status(200).json({
//             statusCode: 200,
//             statusValue:"SUCCESS",
//             message:"Location data get successfully.",
//             data:resData
//         })
//     } catch (error) {
//         return res.status(500).json({
//             statusCode: 500,
//             statusValue: "FAIL",
//             message:"Internal server error",
//             data:{
//                 name:"locationCotroller/getLocationByDeviceId",
//                 error:error
//             }
//         })
//     }
// }


/**
 * 
 * @desc get all dispatch req data 
 * api GET@/api/logger/
 */
const getDispatchReqData = async (req, res) => {
    try {
        // Search
        var search = "";
        if (req.query.search && req.query.search !== "undefined") {
        search = req.query.search;
        }
        // for pagination
        let page = req.query.page
        let limit = req.query.limit
        if (!page || page === "undefined") {
        page = 1;
        }
        if (!limit || limit === "undefined" || parseInt(limit) === 0) {
        limit = 999999;
        }

        // aggregate logic
        var pipline = [
             // Match
            {
                "$match":{"shipmentMode":"inprocess"}
            },
            {
                "$lookup":{
                  "from":"about_devices",
                  "localField":"deviceId",
                  "foreignField":"deviceId",
                  "as":"dispatchData"
                }
            },

            // For this data model, will always be 1 record in right-side
            // of join, so take 1st joined array element
            {
                "$set": {
                  "dispatchData": {"$first": "$dispatchData"},
                }
            },

            // search operation
            {
                "$match":{"$or":[
                    { deviceId: { $regex: ".*" + search + ".*", $options: "i" } },
                    { serialNumber: { $regex: ".*" + search + ".*", $options: "i" } },
                ]}
            },
            // Extract the joined embeded fields into top level fields
            // {
            //     "$set": {"dispatchData": "$ewaybillData.location"},
            // },
            {
                "$unset": [
                  "__v",
                  // "createdAt",
                  "updatedAt",
                  // "otp",
                  // "isVerified",
                  "dispatchData.__v"
                ]
            },
        ]
        // get data
        const resData = await productionModel.aggregate(pipline);
        // console.log(resData)
        // for pagination
        const paginateArray =  (resData, page, limit) => {
            const skip = resData.slice((page - 1) * limit, page * limit);
            return skip;
        };
        
        let allData = paginateArray(resData, page, limit)

        if (!!resData.length>0) {
            return res.status(200).json({
                statusCode: 200,
                statusValue:"SUCCESS",
                message:"Accounts data get successfully.",
                data:allData,
                totalDataCount: resData.length,
                totalPages: Math.ceil( (resData.length)/limit),
                currentPage: page,
            })
        }
        return res.status(400).json({
            statusCode: 400,
            statusValue:"FAIL",
            message:"data not found."
        })
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            statusValue: "FAIL",
            message:"Internal server error",
            data:{
                name:"locationCotroller/getLocationByDeviceId",
                error:error
            }
        })
    }
}

/**
 * @desc get all accounts data submitted by a/c dept. 
 * api GET@/api/logger/
 */
const getAccountsData = async (req, res) => {
    try {
        
        // Search
        var search = "";
        if (req.query.search && req.query.search !== "undefined") {
            search = req.query.search;
        }
        // for pagination
        let page = req.query.page
        let limit = req.query.limit
        if (!page || page === "undefined") {
            page = 1;
        }
        if (!limit || limit === "undefined" || parseInt(limit) === 0) {
            limit = 999999;
        }

        // aggregate logic
        var pipline = [
             // Match
            // {},
            {
                "$lookup":{
                  "from":"s3_invoice_buckets",
                  "localField":"invoiceNo",
                  "foreignField":"invoiceNo",
                  "as":"invoiceData"
                }
            },
            {
                "$lookup":{
                  "from":"s3_ewaybill_buckets",
                  "localField":"ewaybillNo",
                  "foreignField":"ewaybillNo",
                  "as":"ewaybillData"
                }
            },
            {
                "$lookup":{
                  "from":"about_devices",
                  "localField":"deviceId",
                  "foreignField":"deviceId",
                  "as":"dispatchData"
                }
            },

            // For this data model, will always be 1 record in right-side
            // of join, so take 1st joined array element
            {
                "$set": {
                  "invoiceData": {"$first": "$invoiceData"},
                  "ewaybillData": {"$first": "$ewaybillData"},
                  "dispatchData": {"$first": "$dispatchData"},
                }
            },
            // Extract the joined embeded fields into top level fields
            {
                "$set": {"invoicePdf": "$invoiceData.location", "ewaybillPdf": "$ewaybillData.location"},
            },
            // search operation
            {
                "$match":{"$or":[
                    { deviceId: { $regex: ".*" + search + ".*", $options: "i" } },
                    { serialNo: { $regex: ".*" + search + ".*", $options: "i" } },
                ]}
            },
            {
                "$unset": [
                  "invoiceData",
                  "ewaybillData",
                  "__v",
                  "createdAt",
                  "updatedAt",
                  "dispatchData.__v"
                  // "otp",
                  // "isVerified",
                ]
            },
            {$sort:{"updatedAt":-1}},
        ]
        // get data
        const resData = await accountsModel.aggregate(pipline);
        // for pagination
        const paginateArray =  (resData, page, limit) => {
            const skip = resData.slice((page - 1) * limit, page * limit);
            return skip;
        }

        let allData = paginateArray(resData, page, limit)

        if (!!resData.length>0) {
            return res.status(200).json({
                statusCode: 200,
                statusValue:"SUCCESS",
                message:"Accounts data get successfully.",
                data:allData,
                totalDataCount: resData.length,
                totalPages: Math.ceil( (resData.length)/limit),
                currentPage: page,
            })
        }
        return res.status(400).json({
            statusCode: 400,
            statusValue:"FAIL",
            message:"data not found."
        })
        
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            statusValue: "FAIL",
            message:"Internal server error",
            data:{
                name:"locationCotroller/getLocationByDeviceId",
                error:error
            }
        })
    }
}


const getProductionListV2 = async (req, res) => {
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

        // aggregate logic
        var pipline = [
            // Match
           {"$match":{$or:[{shipmentMode:"req_doc"},{shipmentMode:"inprocess"}]}},
           // filter data from the above data list
            // search operation
            {
                "$match":{"$or":[
                    { deviceId: { $regex: ".*" + search + ".*", $options: "i" } },
                    { serialNumber: { $regex: ".*" + search + ".*", $options: "i" } },
                ]}
            },
            {
                "$sort":{"updatedAt":-1}
            },
            {
              "$unset":[
                "__v"
              ]
            }
       ]
        // get data
        const resData = await productionModel.aggregate(pipline)
        // for pagination
        const paginateArray =  (resData, page, limit) => {
            const skip = resData.slice((page - 1) * limit, page * limit);
            return skip;
        };
        let allData = paginateArray(resData, page, limit)

        if (!!resData.length>0) {
            return res.status(200).json({
                statusCode: 200,
                statusValue:"SUCCESS",
                message:"Production data get successfully.",
                data: allData,
                totalDataCount: resData.length,
                totalPages: Math.ceil( (resData.length)/ limit),
                currentPage: page,
            })
        }
        return res.status(400).json({
            statusCode: 400,
            statusValue:"FAIL",
            message:"data not found."
        })
        
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            statusValue: "FAIL",
            message:"Internal server error",
            data:{
                name:"locationCotroller/getLocationByDeviceId",
                error:error
            }
        })
    }
}

const getDispatchedDeviceList = async (req, res) => {
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

        // aggregate logic
        var pipline = [
            // Match
           {"$match":{"$or":
              [
                {shipmentMode:"shipped"},
                {shipmentMode:{$exists:false}},
                // { deviceId: { $regex: ".*" + search + ".*", $options: "i" } },
              ]
            }},
            // join production collection with about collection
            {
                "$lookup":{
                    "from":"about_devices",
                    "localField":"deviceId",
                    "foreignField":"deviceId",
                    "as":"deviceDetails"
                },
            },
            {
                "$lookup":{
                    "from":"s3_po_buckets",
                    "localField":"deviceId",
                    "foreignField":"deviceId",
                    "as":"poFilePdfData"
                },
            },
            // For this data model, will always be 1 record in right-side
            // of join, so take 1st joined array element
            {
                "$set":{
                    "deviceDetails": { "$first": "$deviceDetails" },
                    "poFilePdfData": { "$first": "$poFilePdfData" },
                }
            },
            // Extract the joined embeded fields into top level fields
            {
                "$set":{
                    "marketing_lead":"$deviceDetails.marketing_lead",
                    "soPdfFile": "$poFilePdfData.location",
                },
            },
            // filter data from the above data list
            // search operation
            {
                "$match":{"$or":[
                    { deviceId: { $regex: ".*" + search + ".*", $options: "i" } },
                    { serialNumber: { $regex: ".*" + search + ".*", $options: "i" } },
                    { hospitalName: { $regex: ".*" + search + ".*", $options: "i" } },
                ]}
            },
            {
               "$unset":[
                "__v",
                "deviceDetails.__v",
                "deviceDetails.createdAt",
                "deviceDetails.updatedAt",
                "deviceDetails.date_of_manufacturing",
                "deviceDetails.deviceId",
                "deviceDetails.serial_no",
                "deviceDetails.purpose", 
                "deviceDetails.marketing_lead",
                "poFilePdfData"
               ]
            },
            {$sort:{"updatedAt":-1}},
        ]
        // get data
        const resData = await productionModel.aggregate(pipline);

        // for pagination
        const paginateArray =  (resData, page, limit) => {
            const skip = resData.slice((page - 1) * limit, page * limit);
            return skip;
        };
        let allData = paginateArray(resData, page, limit)

        if (!!resData.length>0) {
            return res.status(200).json({
                statusCode: 200,
                statusValue:"SUCCESS",
                message:"Complete shipped data get successfully.",
                data: allData,
                totalDataCount: resData.length,
                totalPages: Math.ceil( (resData.length)/ limit),
                currentPage: page,
            })
        }
        return res.status(400).json({
            statusCode: 400,
            statusValue:"FAIL",
            message:"data not found."
        })
        
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            statusValue: "FAIL",
            message:"Internal server error",
            data:{
                name:"locationCotroller/getLocationByDeviceId",
                error:error
            }
        })
    }
}

/**
 * @desc get all accounts data submitted by a/c dept. 
 * api GET@/api/logger/
 */
const getAwaitingForShippedData = async (req, res) => {
    try {

        // Search
        var search = "";
        if (req.query.search && req.query.search !== "undefined") {
        search = req.query.search;
        }
        // for pagination
        let page = req.query.page
        let limit = req.query.limit
        if (!page || page === "undefined") {
        page = 1;
        }
        if (!limit || limit === "undefined" || parseInt(limit) === 0) {
        limit = 999999;
        }

        // aggregate logic
        var pipline = [
            // Match
           {"$match":{"shipmentMode":"awaiting_for_shipped"}},
           {
               "$lookup":{
                 "from":"s3_ewaybill_buckets",
                 "localField":"deviceId",
                 "foreignField":"deviceId",
                 "as":"ewayBillData"
               }
           },
           {
               "$lookup":{
                 "from":"s3_invoice_buckets",
                 "localField":"deviceId",
                 "foreignField":"deviceId",
                 "as":"invoiceBillData"
               }
           },
           {
              "$lookup":{
                "from":"accounts",
                "localField":"serialNumber",
                "foreignField":"serialNo",
                "as":"accountsData"
              }
           },
        //    // search operation
        //    {
        //     "$match":{"prodData.shipmentMode":"awaiting_for_shipped"},
        //    },
        //    For this data model, will always be 1 record in right-side
        //    of join, so take 1st joined array element
           {
               "$set": {
                 "ewayBillData": {"$first": "$ewayBillData"},
                 "invoiceBillData": {"$first": "$invoiceBillData"},
                 "accountsData": {"$first": "$accountsData"},
               }
           },
           // Extract the joined embeded fields into top level fields
           {
               "$set": {"ewayBillPdf": "$ewayBillData.location","invoiceBillPdf":"$invoiceBillData.location"},
           },
           // search operation
           {
                "$match": {
                    "$or":[
                        { deviceId: {$regex: ".*" + search + ".*", $options: "i"} },
                        { serialNumber: {$regex: ".*" + search + ".*", $options: "i"} },
                        { hospitalName: {$regex: ".*" + search + ".*", $options: "i"} },
                    ]
                }
           },
           {
               "$unset": [
                 "invoiceBillData",
                 "ewayBillData",
                //  "accountsData",
                 "__v",
                 // "createdAt",
                //  "updatedAt",
                 // "otp",
                 // "isVerified",
               ]
           },
        ]
        // get data
        const resData = await productionModel.aggregate(pipline)
        // console.log(resData)
        // for pagination
        const paginateArray =  (resData, page, limit) => {
            const skip = resData.slice((page - 1) * limit, page * limit);
            return skip;
        }
        let allData = paginateArray(resData, page, limit)

        if (!!resData.length>0) {
            return res.status(200).json({
                statusCode: 200,
                statusValue:"SUCCESS",
                message:"Awaiting for shipped data get successfully.",
                data: allData,
                totalDataCount: resData.length,
                totalPages: Math.ceil( (resData.length)/ limit),
                currentPage: page,
            })
        }
        return res.status(400).json({
            statusCode: 400,
            statusValue:"FAIL",
            message:"data not found."
        })
        
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            statusValue: "FAIL",
            message:"Internal server error",
            data:{
                name:"locationCotroller/getLocationByDeviceId",
                error:error
            }
        })
    }
}


/**
 * @desc get all accounts data submitted by a/c dept. 
 * api GET@/api/logger/
 */
const getSignleDispatchedData = async (req, res) => {
    try {

        // aggregate logic
        var pipline = [
            // Match
           {"$match":{"serialNumber":req.params.serialNo}},
           {
               "$lookup":{
                 "from":"s3_ewaybill_buckets",
                 "localField":"deviceId",
                 "foreignField":"deviceId",
                 "as":"ewayBillData"
               }
           },
           {
               "$lookup":{
                 "from":"s3_invoice_buckets",
                 "localField":"deviceId",
                 "foreignField":"deviceId",
                 "as":"invoiceBillData"
               }
           },
           {
              "$lookup":{
                "from":"accounts",
                "localField":"serialNumber",
                "foreignField":"serialNo",
                "as":"accountsData"
              }
           },
           {
            "$lookup":{
              "from":"mark_as_shippeds",
              "localField":"deviceId",
              "foreignField":"deviceId",
              "as":"markAsShippedData"
            }
         },
         {
            "$lookup":{
              "from":"s3_bucket_productions",
              "localField":"deviceId",
              "foreignField":"deviceId",
              "as":"prodData"
            }
        },
        {
            "$lookup":{
              "from":"s3_po_buckets",
              "localField":"deviceId",
              "foreignField":"deviceId",
              "as":"poFileData"
            }
        },
        {
            "$lookup":{
              "from":"s3_bucket_shippings",
              "localField":"serialNumber",
              "foreignField":"serialNo",
              "as":"shippingFileData"
            }
        },
        {
            "$lookup":{
              "from":"s3_return_po_buckets",
              "localField":"deviceId",
              "foreignField":"deviceId",
              "as":"returnPoFileData"
            }
        },
        //    // search operation
        //    {
        //     "$match":{"prodData.shipmentMode":"awaiting_for_shipped"},
        //    },
        //    For this data model, will always be 1 record in right-side
        //    of join, so take 1st joined array element
           {
               "$set": {
                 "ewayBillData": {"$first": "$ewayBillData"},
                 "invoiceBillData": {"$last": "$invoiceBillData"},
                 "accountsData": {"$first": "$accountsData"},
                 "prodData": {"$first": "$prodData"},
                 "poFileData": {"$first":"$poFileData"},
                 "shippingFileData": {"$first": "$shippingFileData"},
                //  "markAsShippedData": {"$first": "$markAsShippedData"},
                 "returnPoFileData": {"$first": "$returnPoFileData"},
               }
           },
           // Extract the joined embeded fields into top level fields
           {
               "$set": {
                "ewaybillNo": "$ewayBillData.ewaybillNo",
                "ewayBillPdf": "$ewayBillData.location",
                "invoiceNo":"$invoiceBillData.invoiceNo",
                "invoiceBillPdf":"$invoiceBillData.location",
                // "billedTo":"$accountsData.billedTo",
                // "billedDate":"$accountsData.updatedAt",
                "DhrPdf": "$prodData.location",
                "poPdf":"$poFileData.location",
                "shippingInvoicePdf": "$shippingFileData.location",
                "returnPoFilePdf": "$returnPoFileData.location",
                },
            },
        //    {
        //         "$match": {
        //             "prodData.shipmentMode": "awaiting_for_shipped"
        //         }
        //    },
           {
               "$unset": [
                 "invoiceBillData",
                 "ewayBillData",
                //  "accountsData",
                 "__v",
                 "markAsShippedData.__v",
                 "markAsShippedData._id",
                 "markAsShippedData.serialNo",
                 "markAsShippedData.deviceId",
                 "prodData",
                 "poFileData",
                 "shippingFileData",
                 "returnPoFileData",
                 // "otp",
                 // "isVerified",
               ]
           },
        ]
        // get data
        let resData = await productionModel.aggregate(pipline)
        // console.log(11,resData)
        const dispatchData = await aboutDeviceModel.findOne({serial_no:req.params.serialNo})
        // Complete obj data
        let finalObj = {
            ...resData[0], 
            hospitalName:!!dispatchData ? dispatchData.hospital_name : "",
            address:!!dispatchData ? dispatchData.address : "",
            returnPoFilePdf:!!(resData.returnPoFilePdf) ? resData.returnPoFilePdf : "NA"
        }
        if (resData.length>0) {
            return res.status(200).json({
                statusCode: 200,
                statusValue:"SUCCESS",
                message:"shipped data get successfully.",
                data: finalObj
            })
        }
        return res.status(400).json({
            statusCode: 400,
            statusValue:"FAIL",
            message:"data not found."
        })
        
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            statusValue: "FAIL",
            message:"Internal server error",
            data:{
                name:"locationCotroller/getLocationByDeviceId",
                error:error
            }
        })
    }
}


/**
 * @desc get all accounts data submitted by a/c dept. 
 * api GET@/api/logger/
 */
const getMArkAsShipped = async (req, res) => {
    try {
        // aggregate logic
        var pipline = [
            // Match
           {"$match":{"shipmentMode":"awaiting_for_shipped"}},
           {
               "$lookup":{
                 "from":"s3_bucket_shippings",
                 "localField":"serialNumber",
                 "foreignField":"serialNo",
                 "as":"shippingInvoiceData"
               }
           },
           {
               "$lookup":{
                 "from":"mark_as_shippeds",
                 "localField":"serialNumber",
                 "foreignField":"serialNo",
                 "as":"markAsShipped"
               }
           },

           //    For this data model, will always be 1 record in right-side
           //    of join, so take 1st joined array element
           {
               "$set": {
                 "shippingInvoiceData": {"$first": "$shippingInvoiceData"},
                 "markAsShipped": {"$first": "$markAsShipped"},
                //  "dispatchData": {"$first": "$dispatchData"},
               }
           },
           // Extract the joined embeded fields into top level fields
           {
               "$set": {"invoicePdf": "$shippingInvoiceData.location"},
           },
           {
               "$unset": [
                 "shippingInvoiceData",
                //  "markAsShipped",
                 "__v",
                 // "createdAt",
                 "updatedAt",
                 // "otp",
                 // "isVerified",
               ]
           },
        ]
        // get data
        const resData = await productionModel.aggregate(pipline);
        if (resData.length>0) {
            return res.status(200).json({
                statusCode: 200,
                statusValue:"SUCCESS",
                message:"Awaiting for shipped data get successfully.",
                data:resData
            })
        }
        return res.status(400).json({
            statusCode: 400,
            statusValue:"FAIL",
            message:"data not found."
        })
        
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            statusValue: "FAIL",
            message:"Internal server error",
            data:{
                name:"locationCotroller/getLocationByDeviceId",
                error:error
            }
        })
    }
}




/**
 * 
 * @desc get device info by serialNo
 * api GET@/api/logger/accounts/get-data/serilaNo
 */
const getAccountsDataBySerialNo = async (req, res) => {
    try {
        // aggregate logic
        var pipline = [
             // Match
            {
                "$match":{"shipmentMode":"inprocess","serialNumber":req.params.serialNo}
            },
            {
                "$lookup":{
                  "from":"about_devices",
                  "localField":"deviceId",
                  "foreignField":"deviceId",
                  "as":"dispatchData"
                }
            },

            // For this data model, will always be 1 record in right-side
            // of join, so take 1st joined array element
            {
                "$set": {
                  "dispatchData": {"$first": "$dispatchData"},
                }
            },
            // Extract the joined embeded fields into top level fields
            // {
            //     "$set": {"dispatchData": "$ewaybillData.location"},
            // },
            {
                "$unset": [
                  "__v",
                  // "createdAt",
                  "updatedAt",
                  // "otp",
                  // "isVerified",
                  "dispatchData.__v"
                ]
            },
        ]
        // get data
        const resData = await productionModel.aggregate(pipline);
        // console.log(resData)
        if (resData.length>0) {
            return res.status(200).json({
                statusCode: 200,
                statusValue:"SUCCESS",
                message:"data get successfully.",
                data:resData[0]
            })
        }
        return res.status(400).json({
            statusCode: 400,
            statusValue:"FAIL",
            message:"data not found.",
        })
        
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            statusValue: "FAIL",
            message:"Internal server error",
            data:{
                name:"locationCotroller/getLocationByDeviceId",
                error:error
            }
        })
    }
}




module.exports = {
    saveMarkasShippedData,
    // getAccountsData,
    getAccountsData,
    getDispatchReqData,
    getAccountsDataBySerialNo,
    // getMArkAsShipped,
    getMArkAsShipped,
    saveAwaitingForShippedData,
    getAwaitingForShippedData,
    getDispatchedDeviceList,
    getProductionListV2,
    getSignleDispatchedData,
    updateAccountDataById
}