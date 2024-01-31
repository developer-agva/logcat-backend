const express = require('express');
const mongoose = require('mongoose');
const Joi = require('joi');
const registeredHospitalModel = require('../model/registeredHospitalModel');
const assignTicketModel = require('../model/assignTicketModel');

// for redis client
let redisClient = require("../config/redisInit");
const activityModel = require('../model/activityModel');
const User = require('../model/users');
const installationModel = require('../model/deviceInstallationModel');
const aboutDeviceModel = require('../model/aboutDeviceModel');
const Device = require('../model/RegisterDevice');
const feedbackModel = require('../model/feedbackModel');
const JWTR = require("jwt-redis").default;
const jwtr = new JWTR(redisClient);
const {sendOtp, sendEmailLink} = require('../helper/sendOtp');


/**
* api      POST @/support/create-ticket
* desc     @saveTicket for logger access only
*/
const saveTicket = async (req, res) => {
    try {
        const schema = Joi.object({
            deviceId: Joi.string().required(),
            service_engineer: Joi.string().required(),
            issues: Joi.string().required(),
            pincode: Joi.string().allow("").required(),
            dept_name: Joi.string().required(),
            concerned_p_name: Joi.string().required(),
            concerned_p_email: Joi.string().required(),
            concerned_p_contact: Joi.string().required(),
            priority: Joi.string().valid('Critical', 'Medium'),
            details: Joi.string().required(),
            waranty_status: Joi.string().required(),
            serialNumber: Joi.string().allow("").optional(),
            tag: Joi.string().optional(),
            address: Joi.string().optional(),
        })
        let result = schema.validate(req.body);
        if (result.error) {
            return res.status(200).json({
                status: 0,
                statusCode: 400,
                message: result.error.details[0].message,
            })
        }
        const ticketStr = "AgVaPro";
        const ranNum = Math.floor(1000 + Math.random() * 9000); 
        // for ticket owner
        const token = req.headers["authorization"].split(' ')[1];
        const verified = await jwtr.verify(token, process.env.JWT_SECRET);
        const loggedInUser = await User.findById({_id:verified.user});
        
        // getAddress, Hospital
        const getHospital = await Device.findOne({DeviceId:req.body.deviceId})
        // console.log(11,getHospital)
        const getAddress = await aboutDeviceModel.findOne({deviceId:req.body.deviceId})

        const ticketData = new assignTicketModel({
            deviceId:req.body.deviceId,
            ticket_number:`${ticketStr}-${ranNum}`,
            ticket_owner:loggedInUser.email,
            // ticket_owner:"admin@gmail.com",
            status:"Pending",
            ticket_status: "Open",
            service_engineer:req.body.service_engineer,
            issues:req.body.issues,
            pincode:req.body.pincode,
            dept_name:req.body.dept_name,
            concerned_p_name:req.body.concerned_p_name,
            concerned_p_email:req.body.concerned_p_email,
            concerned_p_contact:req.body.concerned_p_contact,
            priority:req.body.priority,
            details:req.body.details,
            waranty_status:req.body.waranty_status,
            serialNumber:!!(req.body.serialNumber) ? req.body.serialNumber : "NA",
            tag:req.body.tag,
            address:!!(req.body.address) ? req.body.address : getAddress.address,
            hospital_name:!!getHospital? getHospital.Hospital_Name : "NA",
        });
        // console.log(11, ticketData)
        const saveDoc = await ticketData.save();
        if (!saveDoc) {
            return res.status(400).json({
                statusCode: 400,
                statusValue: "FAIL",
                message: "Ticket not assigned.",
            });
        }
        return res.status(201).json({
            statusCode: 201,
            statusValue: "SUCCESS",
            message: "Ticket assigned successfully!",
            data:saveDoc
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
        })
    }
}


/**
* api      GET @/support/tickets
* desc     @getAllTickets for logger access only
*/
const getAllTickets = async (req, res) => {
    try {
        // for search
        var filter = "";
        if (req.query.filter && req.query.filter !== "undefined") {
            filter = req.query.filter;
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
        
        // for userType access data
        const token = req.headers["authorization"].split(' ')[1];
        const verified = await jwtr.verify(token, process.env.JWT_SECRET);
        const loggedInUser = await User.findById({_id:verified.user});
        // console.log(`userType ${loggedInUser.userType}`)
        let filterObj = {};
        if (loggedInUser.userType === "Service-Engineer" && loggedInUser.userType !== undefined) {
            filterObj = { service_engineer:loggedInUser.email }
        } else if (loggedInUser.userType === "Support" && loggedInUser.userType !== undefined) {
            filterObj = { ticket_owner:loggedInUser.email }
        }

        const data = await assignTicketModel.find({
            $and:[
                filterObj,
                { status:{ $regex: ".*" + filter + ".*", $options: "i" } },
            ]
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

        // count
        const count = await assignTicketModel.find({
            filterObj,
            $or:[
                { status:{ $regex: ".*" + filter + ".*", $options: "i" } },
            ]
        })
        .sort({ createdAt: -1 })
        .countDocuments();
        if (data.length>0) {
            return res.status(200).json({
                statusCode: 200,
                statusValue: "SUCCESS",
                message: "Data get successfully.",
                data: data,
                totalDataCount: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page
            })
        }
        return res.status(400).json({
            statusCode: 400,
            statusValue: "FAIL",
            message: "Data not found."
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
        })
    }
}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         


/**
* api      DELETE @/support/delete-ticket/:id
* desc     @deleteTicket for logger access only
*/
const deleteTicket = async (req, res) => {
    try {
        // for loggedIn user
        const token = req.headers["authorization"].split(' ')[1];
        const verified = await jwtr.verify(token, process.env.JWT_SECRET);
        const loggedInUser = await User.findById({_id:verified.user});
        if (loggedInUser.userType == "Support") {
            const id = req.params.id;
            const checkTicket = await assignTicketModel.findOne({ _id: req.params.id });
            if (!checkTicket) {
                return res.status(400).json({
                    statusCode: 400,
                    statusValue: "FAIL",
                    message:!!id ? "Incorrect ticket id" : "Data not found.",
                })
            }
            const removeDoc = await assignTicketModel.findByIdAndDelete(
                { _id:req.params.id },
                { new: true }
            );
            if (!removeDoc) {
                return res.status(400).json({
                    statusCode: 400,
                    statusValue: "FAIL",
                    message: "Data not deleted!",
                });
            }
            return res.status(200).json({
                statusCode: 200,
                statusValue: "SUCCESS",
                message: "Data deleted successfully.",
                data: removeDoc,
            });
        }
        return res.status(400).json({
            statusCode: 400,
            statusValue: "FAIL",
            message: "You don't have permission for this action!.",
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
        })
    }
}


/**
* api      PUT @/support/update-ticket
* desc     @updateTicket for logger access only
*/
const updateTicket = async (req, res) => {
    try {
        const schema = Joi.object({
            id: Joi.string().required(),
            priority: Joi.string().valid("Critical", "Medium").optional(),
            status: Joi.string().valid("Pending", "Not-Done", "Completed").optional(),
            service_engineer: Joi.string().optional(),
            ticket_status: Joi.string().valid("Re-Open", "Close").optional(),
            isFeedback: Joi.string().valid("Submitted","Not-Submitted","Submitted-Without-Feedback").optional(),
        })
        let result = schema.validate(req.body);
        if (result.error) {
            return res.status(200).json({
                status: 0,
                statusCode: 400,
                message: result.error.details[0].message,
            })
        }
        const getEmail = await assignTicketModel.findById({_id:req.body.id});
        const feedbackUrl = `<a style='text-decoration:none;color:white'' href="http://3.26.129.121:3000/service_feedback" target="_blank">Submit Feedback!</a>`
        if(req.body.ticket_status == "Close") {
            const updateDoc = await assignTicketModel.findByIdAndUpdate(
                {_id:req.body.id},
                {status:"Completed",ticket_status:"Close"},
                { new: true }
            );
            await sendEmailLink(getEmail.concerned_p_email, feedbackUrl)
            return res.status(200).json({
                statusCode: 200,
                statusValue: "SUCCESS",
                message: "Data updated successfully.",
                data: updateDoc,
            });
        } else if (req.body.ticket_status == "Re-Open") {
            const updateDoc = await assignTicketModel.findByIdAndUpdate(
                {_id:req.body.id},
                {status:"Pending",ticket_status:"Re-Open"},
                { new: true }
            );
            return res.status(200).json({
                statusCode: 200,
                statusValue: "SUCCESS",
                message: "Data updated successfully.",
                data: updateDoc,
            });
        }
        const updateDoc = await assignTicketModel.findByIdAndUpdate({_id:req.body.id}, req.body, { new: true });
        if (!!updateDoc) {
            return res.status(200).json({
                statusCode: 200,
                statusValue: "SUCCESS",
                message: "Data updated successfully.",
                data: updateDoc,
            });
        }
        return res.status(400).json({
            statusCode: 400,
            statusValue: "FAIL",
            message: "Data not updated.",
            data: updateDoc
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
        })
    }
}


/**
* api      PUT @/support/update-ticket
* desc     @updateTicket for logger access only
*/
// const reAssignTicket = async (req, res) => {
//     try {
//         const schema = Joi.object({
//             id: Joi.string().required(),
//             service_engineer: Joi.string().required(),
//         })
//         let result = schema.validate(req.body);
//         if (result.error) {
//             return res.status(200).json({
//                 status: 0,
//                 statusCode: 400,
//                 message: result.error.details[0].message,
//             })
//         }
//         const checkTicket = await assignTicketModel.findById({_id:req.body.id});
//         if (checkTicket.ticket_status == "Close") {
//             return res.status(400).json({
//                     statusCode: 400,
//                     statusValue: "FAIL",
//                     message: "Error! You can't re-assigned closed tickets."
//                 })
//             }
//         }
//         const updateDoc = await assignTicketModel.findByIdAndUpdate(
//             {_id:req.body.id}, 
//             {service_engineer:req.body.service_engineer}, 
//             { new: true });
//         if (!!updateDoc) {
//             return res.status(200).json({
//                 statusCode: 200,
//                 statusValue: "SUCCESS",
//                 message: "Ticket re-assigned successfully.",
//                 data: updateDoc,
//             });
//         }
//         return res.status(400).json({
//             statusCode: 400,
//             statusValue: "FAIL",
//             message: "Data not updated.",
//             data: updateDoc
//         });
//     } catch(err) {
//         return res.status(500).json({
//             statusCode: 500,
//             statusValue: "FAIL",
//             message: "Internal server error",
//             data: {
//                 generatedTime: new Date(),
//                 errMsg: err.stack,
//             }
//         })
//     }
// }


/**
* api      PUT @/support/re-assign-ticket
* desc     @reAssignTicket for logger access only
*/
const reAssignTicket = async (req, res) => {
    try {
        const schema = Joi.object({
            id: Joi.string().required(),
            service_engineer: Joi.string().required(),
        })
        let result = schema.validate(req.body);
        if (result.error) {
            return res.status(400).json({
                status: 0,
                statusCode: 400,
                message: result.error.details[0].message,
            })
        }
        // console.log(req.body)
        const checkTicket = await assignTicketModel.findById({_id:req.body.id});
        if (checkTicket.ticket_status == "Close") {
            return res.status(400).json({
                statusCode: 400,
                statusValue: "FAIL",
                message: "Error! You can't re-assign closed tickets.",
            })
        }
        const updateDoc = await assignTicketModel.findByIdAndUpdate(
            {_id:req.body.id}, 
            {service_engineer:req.body.service_engineer}, 
            { new: true }
        );
        if (!!updateDoc) {
            return res.status(200).json({
                statusCode: 200,
                statusValue: "SUCCESS",
                message: "Ticket re-assigned successfully.",
                data: updateDoc,
            });
        }
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
* api      GET @/support/get-ticket/:id
* desc     @getTicketDetails for logger access only
*/
const getTicketDetails = async (req, res) => {
    try {
        const id = req.params.id;
        const data = await assignTicketModel.findById({_id:req.params.id});
        if (!data) {
            return res.status(404).json({
                statusCode: 404,
                statusValue: "FAIL",
                message: "Data not found."
            });
        }
        return res.status(200).json({
            statusCode: 200,
            statusValue: "SUCCESS",
            message: "Data get successfully.",
            data: data
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
* api      GET @/support/get-ticket/:id
* desc     @getTicketDetails for logger access only
*/
const getTicketByTicketNumber = async (req, res) => {
    try {
        const ticket_number = req.params.ticket_number;
        const data = await assignTicketModel.findOne({ticket_number:req.params.ticket_number},{__v:0});
        const feedbackData = await feedbackModel.findOne({ticket_number:req.params.ticket_number},{__v:0,});
        if (!data) {
            return res.status(404).json({
                statusCode: 404,
                statusValue: "FAIL",
                message: "Data not found."
            });
        }
        return res.status(200).json({
            statusCode: 200,
            statusValue: "SUCCESS",
            message: "Data get successfully.",
            data: data,
            feedback:feedbackData
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
* api      POST @/support/add-installation-record
* desc     @addInstallationRecord for logger access only
*/
const addInstallationRecord = async (req, res) => {
    try {
        const token = req.headers["authorization"].split(' ')[1];
        const verified = await jwtr.verify(token, process.env.JWT_SECRET);
        const loggedInUser = await User.findById({_id:verified.user});

        const newObj = {
            "userId":verified.user,
            "deviceId":req.body.deviceId,
            "concernedPName":req.body.concernedPName,
            "dateOfWarranty":req.body.dateOfWarranty,
            "hospitalName":req.body.hospitalName,
            "address":req.body.address,
        }
        const saveDoc = new installationModel(newObj);
        const saveFile = await saveDoc.save();
        if (!saveFile) {
            return res.status(400).json({
                statusCode: 400,
                statusValue: "FAIL",
                message: "Data not added."
            })
        }
        return res.status(200).json({
            statusCode: 200,
            statusValue: "SUCCESS",
            message: "Data added successfully.",
            data: saveFile
        })
        //   await s3BucketProdModel.deleteMany({location: ""});
    }
    catch (err) {
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
 * api      GET @/support/get-concerned-person/:concered_person_contact
 * desc     @getConcernedPerson for logger access only
 */
const getConcernedPerson = async (req, res) => {
    try {
        const concerned_p_contact = req.params.concerned_p_contact;
        const getData = await assignTicketModel.findOne({concerned_p_contact:concerned_p_contact})
        .select({
            concerned_p_name:1,concerned_p_email:1,concerned_p_contact:1,
            dept_name:1,hospital_name:1,details:1,
        })
        // console.log(getData)
        if (getData) {
            return res.status(200).json({
                statusCode: 200,
                statusValue: "SUCCESS",
                message: "Data get successfully.",
                data: getData
            })
        }
        return res.status(400).json({
            statusCode: 400,
            statusValue: "FAIL",
            message: "Data not found.",
            data: {}
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
        })
    }
}


/**
 * api      GET @/support/get-concerned-person/:concered_person_contact
 * desc     @getConcernedPerson for logger access only
 */
const getIndividualTicket = async (req, res) => {
    try {
        const getData = await assignTicketModel.find({
            $and:[
                {concerned_p_email:req.params.email},
                {ticket_status:"Close"},
                {isFeedback:"Not-Submitted"}
            ]
        })
        .select({ticket_number:1,concerned_p_email:1,ticket_status:1
        })
        // console.log(getData)
        if (getData) {
            return res.status(200).json({
                statusCode: 200,
                statusValue: "SUCCESS",
                message: "Data get successfully.",
                data: getData
            })
        }
        return res.status(400).json({
            statusCode: 400,
            statusValue: "FAIL",
            message: "Data not found.",
            data: []
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
        })
    }
}


/**
* api      POST @/support/submit-feedback
* desc     @submitFeedback 
*/
const submitFeedback = async (req, res) => {
    try {
        const schema = Joi.object({
            name : Joi.string().required(),
            email : Joi.string().required(),
            ratings : Joi.string().required(),
            message : Joi.string().required(),
            ticket_number: Joi.string().required(),
            concerned_p_contact: Joi.string().required(),
        })
        let result = schema.validate(req.body);
        if (result.error) {
            return res.status(200).json({
                statusCode: 0,
                statusValue: "FAIL",
                message: result.error.details[0].message,
            })
        }
        const checkfeedback = await feedbackModel.findOne({ticket_number:req.body.ticket_number});

        if (!!checkfeedback) {
            return res.status(400).json({
                statusCode: 400,
                statusValue: "FAIL",
                message: "You have already submitted feedback."
            })
        }
        const feedbackData = new feedbackModel({
            name:req.body.name,
            email:req.body.email,
            ratings:req.body.ratings,
            message:req.body.message,
            ticket_number:req.body.ticket_number,
            concerned_p_contact:req.body.concerned_p_contact,
        });
        // update isFeedback
        
        const saveDoc = await feedbackData.save();
        if (!saveDoc) {
            return res.status(400).json({
                statusCode: 400,
                statusValue: "FAIL",
                message: "Feedback data not submitted.",
            });
        }
        await assignTicketModel.findOneAndUpdate(
            {ticket_number:req.body.ticket_number},
            {isFeedback:"Submitted",status:"Completed"},
            {upsert:true});
        return res.status(201).json({
            statusCode: 201,
            statusValue: "SUCCESS",
            message: "Feedback data added successfully!",
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
        })
    }
}



module.exports = {
    saveTicket,
    getAllTickets,
    deleteTicket,
    updateTicket,
    getTicketDetails,
    addInstallationRecord,
    getConcernedPerson,
    submitFeedback,
    getIndividualTicket,
    getTicketByTicketNumber,
    reAssignTicket
}