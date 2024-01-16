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
            // console.log(req.body);
            return res.status(200).json({
                status: 0,
                statusCode: 400,
                message: result.error.details[0].message,
            })
        }
        // get device details by serialNo
        
        const accountsDoc = new markAsShippedModel({
            serialNo:req.body.seriallNo,
            // deviceId:!!(deviceData.deviceId) ? deviceData.deviceId : "NA",
            shippedThrough:req.body.shippedThrough,
            trackingNo:req.body.trackingNo,
            vehicleNo:req.body.vehicleNo,

            shipperName:req.body.shipperName,
            shipperContact:req.body.shipperContact,
            comments:req.body.comments, 
            // document_ref_no:req.body.document_ref_no
        })
        const saveDoc = accountsDoc.save();
        await productionModel.findOneAndUpdate({serialNumber:req.body.serialNo},{shipmentMode:"shipped"})
        if (!!saveDoc) {
            return res.status(200).json({
                statusCode: 200,
                statusValue: "SUCCESS",
                message: "data added successfully.",
            }) 
        }
        return res.status(400).json({
            statusCode: 400,
            statusValue: "FAIL",
            message: "Error !! data not added.",
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
            invoiceNo: Joi.string().required(),
            ewaybillNo: Joi.string().required(),
            billedTo: Joi.string().required(),
            consinee: Joi.string().required(),
            document_ref_no: Joi.string().required(),
        })
        let result = schema.validate(req.body);
        if (result.error) {
            // console.log(req.body);
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
        const accountsDoc = new accountsModel({
            serialNo:req.body.seriallNo,
            deviceId:!!(deviceData.deviceId) ? deviceData.deviceId : "NA",
            batchNo:!!(deviceData.batch_no) ? deviceData.batch_no : "NA",
            manufacturingDate:!!(deviceData.date_of_manufacture) ? deviceData.date_of_manufacture : "NA",
            ewaybillNo:req.body.ewaybillNo,
            invoiceNo:req.body.invoiceNo,
            billedTo:req.body.billedTo,
            consinee:req.body.consinee, 
            document_ref_no:req.body.document_ref_no
        })
        const saveDoc = accountsDoc.save();
        await productionModel.findOneAndUpdate({serialNumber:req.body.serialNo},
            {
                serialNumber:req.body.serialNo,
                shipmentMode:"awaiting_for_shipped"}
            );
        if (!!saveDoc) {
            return res.status(200).json({
                statusCode: 200,
                statusValue: "SUCCESS",
                message: "data added successfully.",
            }) 
        }
        return res.status(400).json({
            statusCode: 400,
            statusValue: "FAIL",
            message: "Error !! data not added.",
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
        if (!!resData.length>0) {
            return res.status(200).json({
                statusCode: 200,
                statusValue:"SUCCESS",
                message:"Accounts data get successfully.",
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
 * @desc get all accounts data submitted by a/c dept. 
 * api GET@/api/logger/
 */
const getAccountsData = async (req, res) => {
    try {
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
            {
                "$unset": [
                  "invoiceData",
                  "ewaybillData",
                  "__v",
                  // "createdAt",
                  "updatedAt",
                  // "otp",
                  // "isVerified",
                ]
            },
        ]
        // get data
        const resData = await accountsModel.aggregate(pipline);
        if (!!resData.length>0) {
            return res.status(200).json({
                statusCode: 200,
                statusValue:"SUCCESS",
                message:"Accounts data get successfully.",
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
 * @desc get all accounts data submitted by a/c dept. 
 * api GET@/api/logger/
 */
const getAwaitingForShippedData = async (req, res) => {
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
        if (!!resData.length>0) {
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
        if (!!resData.length>0) {
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
    getAwaitingForShippedData
}