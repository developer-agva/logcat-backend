const upload = require('../helper/upload.helper');
const util = require('util');
const s3BucketModel = require('../model/s3BucketModel');
const { default: mongoose } = require('mongoose');
// const dotenv = require('dotenv');
require("dotenv").config({ path: "../.env" });
// const s3 = require('../utils/s3.util');
const AWS = require('aws-sdk');  
const s3BucketProdModel = require('../model/s3BucketProductionModel');
const s3BucketInsModel = require('../model/s3BucketInstallationModel');
const s33 = new AWS.S3();
const {sendOtp, sendEmailLink, sendPrintFileLink} = require('../helper/sendOtp');
const s3PatientFileModel = require('../model/s3PatientFileModel');
const patientModel = require('../model/patientModel');
const s3invoiceBucketModel = require('../model/s3invoiceBucketModel');
const s3ewayBillBucketModel = require('../model/s3ewayBillBucketModel');
const s3shippingBucketModel = require('../model/s3bucketShippingModel');
const productionModel = require('../model/productionModel');
const s3poBucketModel = require('../model/s3BucketPoPdfModel');
const s3ReturnPoBucketModel = require('../model/s3BucketReturnPoPdfModel');
const s3sendPrintFileModel = require('../model/s3sendPrintFileModel');
const projectModel = require('../model/projectModel');
const featuredProductModel = require('../model/featuredProductModel');

let redisClient = require("../config/redisInit");
const expenseModel = require('../model/expenseModel');
const User = require('../model/users');
const exp = require('constants');
const assignTicketModel = require('../model/assignTicketModel');
const servicesModel = require('../model/servicesModel');
const appHistorytModel = require('../model/androidAppHistoryModel');  
const leadModel = require('../model/leadModel');
const JWTR = require("jwt-redis").default;
const jwtr = new JWTR(redisClient);


exports.uploadSingle = async (req, res) => {
    // req.file contains a file object  
    res.json(req.file);
    // console.log(req.file.fieldname, req.params.deviceId)
        
    const newObj = {
        "deviceId":req.params.deviceId,
        "serialNo":req.params.serialNo,
        "faultReason":req.params.faultReason,
        ...req.file,
    }
    const saveDoc = new s3BucketModel(newObj);
    // console.log(11,newObj)
    saveFile = saveDoc.save();
    // send email  
    let link = `<a href="http://3.26.129.121/service_feedback" target="_blank">Submit Feedback</a>`
    await sendEmailLink(req.params.email, link) 
    await s3BucketModel.deleteMany({location: ""});
}


exports.addProjectWithImage = async (req, res) => {
    // req.file contains a file object
    res.json(req.file);
    // console.log(req.file.fieldname, req.params.deviceId)
    await projectModel.findOneAndUpdate({project_code:req.query.project_code},
        {
            project_name:req.query.project_name,
            project_description:req.query.project_description,
            image_url:req.file.location,
            project_code:req.query.project_code,
            type:"banner",
        },
        {upsert:true});
    // console.log(11,newObj)
}

exports.uploadAndroidApp = async (req, res) => {
    // req.file contains a file object
    res.json(req.file);
    // console.log(req.file.fieldname, req.params.deviceId)
    const bodyDoc = new appHistorytModel({
        project_code:req.body.project_code,
        app_url:req.file.location,
        dateTime:req.body.dateTime,
        version:req.body.version
    })
    const saveDoc = await bodyDoc.save();
}


exports.uploadVisitingCard = async (req, res) => {
    try {
        // Validate if file exists
        if (!req.file || !req.file.location) {
            return res.status(400).json({
                statusCode: 400,
                statusValue: "FAIL",
                message: "No file uploaded or invalid file data.",
            });
        }
        res.json(req.file);
    } catch (error) {
        console.error("Error uploading visiting card:", error);
        return res.status(500).json({
            statusCode: 500,
            statusValue: "ERROR",
            message: "Internal server error. Please try again later.",
        });
    }
};


exports.uploadDeliveryNote = async (req, res) => {
    try {
        const { leadId } = req.params;

        // Validate if file exists
        if (!req.file || !req.file.location) {
            return res.status(400).json({
                statusCode: 400,
                statusValue: "FAIL",
                message: "No file uploaded or invalid file data.",
            });
        }

        // Find the lead in the database
        const leadData = await leadModel.findOne({ leadId });
        if (!leadData) {
            return res.status(400).json({
                statusCode: 400,
                statusValue: "FAIL",
                message: "Error! Wrong leadId",
            });
        }

        // Update lead with visiting card image URL
        const updatedLead = await leadModel.findOneAndUpdate(
            { leadId },
            { $set: { visitingCardImageUrl: req.file.location } },
            { new: true }
        );

        return res.status(200).json({
            statusCode: 200,
            statusValue: "SUCCESS",
            message: "Visiting card uploaded successfully.",
            data: {
                leadId: updatedLead.leadId,
                visitingCardImageUrl: updatedLead.visitingCardImageUrl,
            },
        });
    } catch (error) {
        console.error("Error uploading visiting card:", error);
        return res.status(500).json({
            statusCode: 500,
            statusValue: "ERROR",
            message: "Internal server error. Please try again later.",
        });
    }
};


exports.getAppHistory = async (req, res) => {
    try {
        const project_code = req.params.project_code;
        if (!project_code) {
            return res.status(401).json({
                statusCode: 401,
                statusValue: "FAIL",
                message: "Error! provide project code",
            });
        }
        // check project
        const checkData = await appHistorytModel.find({project_code:project_code}).sort({_id:-1});
        if (checkData.length<1) {
            return res.status(404).json({
                statusCode: 404,
                statusValue: "SUCCESS",
                message: "Data not found.",
                data:[]
            }); 
        }
        return res.status(200).json({
            statusCode: 200,
            statusValue: "SUCCESS",
            message: "Data get successfully.",
            data:checkData
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
}

exports.uploadServiceDocument = async (req, res) => {
    // req.file contains a file object
    res.json(req.file);
    await servicesModel.findOneAndUpdate(
        {ticket_number:req.params.ticket_number},
        {
            serviceDoc: !!req.file.location ? req.file.location : "",
            // remark:!!req.body.remark ? req.body.remark : ""
        }
    )
}

exports.addFeaturedProdWithImage = async (req, res) => {
    // req.file contains a file object
    res.json(req.file);
    // console.log(req.file.fieldname, req.params.deviceId)
    // await featuredProductModel.findOneAndUpdate({product_name:req.query.product_name},
    //     {
    //         product_name:req.query.product_name,
    //         bg_color:req.query.bg_color,
    //         project_code:req.query.project_code,
    //         image_url:req.file.location,
    //         type:"featured",
    //     },
    //     {upsert:true});
}


exports.uploadPrintFileAndSendEmail = async (req, res) => {
    // req.file contains a file object
    
    res.json(req.files);
    let uploadData = req.files;
    // console.log(11,uploadData)
    uploadData.map(async (obj) => {
        const newObj = {
            "deviceId":req.params.deviceId,
            "email":req.params.email,
            ...obj,
        }
        await s3sendPrintFileModel.findOneAndUpdate({deviceId:"4gsr43fdvby45"},newObj,{upsert:true});
    })    

    // send email 
     
    if (!!uploadData && uploadData.length == 1) {
        link = `<a href="${uploadData[0].location}" >Download File 1</a>`
    }
    if (!!uploadData && uploadData.length == 2) {
        link = `<a href="${uploadData[0].location}" >Download File 1</a> <a href="${uploadData[1].location}" >Download File 2</a>`
    }
    if (!!uploadData && uploadData.length == 3) {
        link = `<a href="${uploadData[0].location}" >Download File 1</a> <a href="${uploadData[1].location}" >Download File 2</a> <a href="${uploadData[1].location}" >Download File 3</a>`
    }

    await sendPrintFileLink(req.params.email, link) 
    // await s3BucketModel.deleteMany({location: ""});
}


exports.uploadQltyFile = async (req, res) => {
    // req.file contains a file object
    console.log(11,req.file)
    res.json(req.file);
    const saveDoc = new s3sendPrintFileModel(req.file);
    // console.log(11,newObj)
    saveFile = saveDoc.save(); 
    // await s3BucketModel.deleteMany({location: ""});
}

// upload quality report for production modules
exports.uploadQualityReport = async (req, res) => {
  // req.file contains a file object
  res.json(req.file);
//   console.log(req.file.fieldname, req.params.deviceId)
  const newObj = {
      "deviceId":req.params.deviceId,
      "flag":req.params.flag,
      ...req.file,
  }
  // update file data
  await s3BucketProdModel.findOneAndUpdate({"deviceId":req.params.deviceId,
  "flag":req.params.flag}, newObj, {upsert:true})
//   const saveDoc = new s3BucketProdModel(newObj);
//   saveFile = saveDoc.save();
//   await s3BucketProdModel.deleteMany({location: ""});
}

// upload quality report for production modules
exports.uploadTicketAttachmentFile = async (req, res) => {
    res.json(req.file);
    console.log(req.file)
}

// upload quality report for production modules
exports.updateTicketAttachmentFile = async (req, res) => {
    res.json(req.file);
    console.log(req.file)
    const getData = await servicesModel.findOne({ticket_number:req.params.ticket_number})
    await assignTicketModel.findOneAndUpdate(
        { ticket_number:getData.ticket_number },
        { 
            ticket_number:getData.ticket_number,
            deviceId:!!(getData.deviceId) ? getData.deviceId : "",
            service_engineer:!!(getData.email) ? getData.email : "",
            location:req.file.location
        },
        { upsert: true }
    )
}

// upload invoice pdf for accounts modules
exports.uploadInvoicePdf = async (req, res) => {
    // req.file contains a file object
    const prodData = await productionModel.findOne({serialNumber:req.params.serialNo})
    res.json(req.file);
  //   console.log(req.file.fieldname, req.params.serialNo)
    const newObj = {
        "deviceId":!!(prodData.deviceId) ? prodData.deviceId : "",
        "serialNo":req.params.serialNo,
        "invoiceNo":req.params.invoiceNo,
        "flag":"invoice_docs",
        ...req.file,
    }
    const saveDoc = new s3invoiceBucketModel(newObj);
    saveFile = saveDoc.save();
  //   await s3BucketProdModel.deleteMany({location: ""});
}

// upload shipping pdf
exports.uploadShippingInvoicePdf = async (req, res) => {
    // req.file contains a file object
    res.json(req.file);
  //   console.log(req.file.fieldname, req.params.serialNo)
    const newObj = {
        "serialNo":req.params.serialNo,
        "flag":"shipping_invoice_docs",
        ...req.file,
    }
    const saveDoc = new s3shippingBucketModel(newObj);
    saveFile = saveDoc.save();
  //   await s3BucketProdModel.deleteMany({location: ""});
}


// upload ewaybill pdf for accounts modules
exports.uploadewayBillPdf = async (req, res) => {
    const prodData = await productionModel.findOne({serialNumber:req.params.serialNo})
    // req.file contains a file object
    res.json(req.file);
  //   console.log(req.file.fieldname, req.params.serialNo)
    const newObj = {
        "deviceId":!!(prodData.deviceId) ? prodData.deviceId : "",
        "serialNo":req.params.serialNo,
        "ewaybillNo":req.params.ewaybillNo,
        "flag":"ewaybill_docs",
        ...req.file,
    }
    const saveDoc = new s3ewayBillBucketModel(newObj);
    saveFile = saveDoc.save();
  //   await s3BucketProdModel.deleteMany({location: ""});
}


exports.uploadExpenseBill = async (req, res) => {
    if (!(req.file)) {
        return res.status(400).json({
            statusCode: 400,
            statusValue: "FAIL",
            message: "Exp document is required."
        })
    }
    // for expense userId
    const token = req.headers["authorization"].split(" ")[1];
    const verified = await jwtr.verify(token, process.env.JWT_SECRET);
    const loggedInUser = await User.findById({ _id: verified.user });
    // console.log(loggedInUser)
    // console.log(req.params)
    const expData = await expenseModel.findOne({_id:req.params._id})
    const uploadedData = req.file;
    
    if (!expData) {
        return res.status(400).json({
            statusCode: 400,
            statusValue: "FAIL",
            message: "Invalid expense Id"
        })
    } 
    const updateDoc = await expenseModel.findOneAndUpdate({_id:req.params._id},{key:uploadedData.key,location:uploadedData.location},{upsert:true})
    if (!!updateDoc) {
        res.json(req.file);
    }
    
}


exports.uploadreturnPoPdf = async (req, res) => {
    if (!(req.file)) {
        return res.status(400).json({
            statusCode: 400,
            statusValue: "FAIL",
            message: "PO document is required."
        })
    }
    const prodData = await productionModel.findOne({serialNumber:req.params.serialNo})
    // req.file contains a file object
    res.json(req.file);
  //   console.log(req.file.fieldname, req.params.serialNo)
    const newObj = {
        "deviceId":!!(prodData.deviceId) ? prodData.deviceId : "",
        "serialNo":req.params.serialNo,
        "flag":"return_po_docs",
        ...req.file,
    }
    // await s3poBuc.findOneAndUpdate({serialNo:req.params.serialNo},newObj,{upsert:true})
    const saveDoc = new s3ReturnPoBucketModel(newObj);
    saveFile = saveDoc.save();
  //   await s3BucketProdModel.deleteMany({location: ""});
}


// upload purchase order (po) pdf for dispatch dept
exports.uploadpoPdf = async (req, res) => {
    if (!(req.file)) {
        return res.status(400).json({
            statusCode: 400,
            statusValue: "FAIL",
            message: "PO document is required."
        })
    }
    const prodData = await productionModel.findOne({serialNumber:req.params.serialNo})
    // req.file contains a file object
    res.json(req.file);
  //   console.log(req.file.fieldname, req.params.serialNo)
    const newObj = {
        "deviceId":!!(prodData.deviceId) ? prodData.deviceId : "",
        "serialNo":req.params.serialNo,
        "flag":"po_docs",
        ...req.file,
    }
    await s3poBucketModel.findOneAndUpdate({serialNo:req.params.serialNo},newObj,{upsert:true})
    // const saveDoc = new s3poBucketModel(newObj);
    // saveFile = saveDoc.save();
  //   await s3BucketProdModel.deleteMany({location: ""});
}

// Upload installation report for service module
exports.uploadInstallationReport = async (req, res) => {
    // req.file contains a file object
    res.json(req.file);
  //   console.log(req.file.fieldname, req.params.deviceId)
    const newObj = {
        "deviceId":req.params.deviceId,
        "flag":req.params.flag,
        ...req.file,
    }
    const saveDoc = new s3BucketInsModel(newObj);
    saveFile = saveDoc.save();
  //   await s3BucketProdModel.deleteMany({location: ""});
}


// // Upload installation report for service module
// exports.send = async (req, res) => {
//     // req.file contains a file object
//     res.json(req.file);
//   //   console.log(req.file.fieldname, req.params.deviceId)
//     const newObj = {
//         "deviceId":req.params.deviceId,
//         "flag":req.params.flag,
//         ...req.file,
//     }
//     const saveDoc = new s3BucketInsModel(newObj);
//     saveFile = saveDoc.save();
//   //   await s3BucketProdModel.deleteMany({location: ""});
// }
  

// Upload patient file for patient module
exports.uploadPatientFile = async (req, res) => {
    // req.file contains a file object
    res.json(req.file);
  //   console.log(req.file.fieldname, req.params.deviceId)  
  const newObj = {
        // "deviceId":req.params.deviceId,
        "UHID":req.params.UHID,
        ...req.file,
    }
    
    const saveDoc = new s3PatientFileModel(newObj);
    saveFile = saveDoc.save();
    const dd = await patientModel.findOneAndUpdate({UHID:req.params.UHID},{
        location:req.file.location,
        key:req.file.key,
    });
}


exports.getUploadedS3file = async (req, res) => {
    try {
        const getDoc = await s3BucketModel.find({},
            {__v:0, createdAt:0, updatedAt:0,versionId:0,etag:0,metadata:0,serverSideEncryption:0,storageClass:0,contentEncoding:0}
        );

        if (!getDoc) {
            return res.status(400).json({
                statusCode: 400,
                statusValue: "FAIL",
                message: "Data not found."
            });
        }
        return res.status(200).json({
            statusCode: 200,
            statusValue: "SUCCESS",
            message: "Data get successfully..",
            data:getDoc,
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


// Upload multiple files
exports.uploadMultiple = (req, res) => {
    // req.files contains an array of file object
    res.json(req.files);
    console.log(11,req.files)
}

exports.uploadSingleV2 = async (req, res) => {
    const uploadFile = util.promisify(upload.single('file'));
    try {
        await uploadFile(req, res); 
        res.json(req.file);
    } catch (error) { 
        res.status(500).json({ message: error.message });
    } 
}


// for delete obj from s3 bucket
exports.deleteS3File = async (req, res) => {
    const key = req.params.key;
    AWS.config.update({
        // accessKeyId: 'AKIAUFKMQ2DN5UYCHZ2L',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION // Replace with your desired AWS region
    });

    const paramsObj = {
        Bucket: process.env.AWS_BUCKET,
        Key: key, // Replace with the actual object key
    };
    await s3BucketModel.findOneAndDelete({key:req.params.key})
    
    s33.deleteObject(paramsObj, (err, data) => {
        if (err) {
            return res.status(400).json({
                statusCode: 400,
                statusValue:"FAIL",
                message:`Error in deleting object.`,
            }) 
        }
        return res.status(200).json({
            statusCode: 200,
            statusValue:"SUCCESS",
            message:`Object deleted successfully`,
            data:data,
        });     
    });
}

// for delete obj from s3 bucket
exports.deleteInstallationRecord = async (req, res) => {
    const key = req.params.key;
    AWS.config.update({
        // accessKeyId: 'AKIAUFKMQ2DN5UYCHZ2L',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION // Replace with your desired AWS region
    });

    const paramsObj = {
        Bucket: process.env.AWS_BUCKET,
        Key: key, // Replace with the actual object key
    };
    await s3BucketInsModel.findOneAndDelete({key:req.params.key})
    
    s33.deleteObject(paramsObj, (err, data) => {
        if (err) {
            return res.status(400).json({
                statusCode: 400,
                statusValue:"FAIL",
                message:`Error in deleting object.`,
            }) 
        }
        return res.status(200).json({
            statusCode: 200,
            statusValue:"SUCCESS",
            message:`Object deleted successfully`,
            data:data,
        });     
    });
}


exports.deleteProductionFile = async (req, res) => {
    const key = req.params.key;
    AWS.config.update({
        // accessKeyId: 'AKIAUFKMQ2DN5UYCHZ2L',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION // Replace with your desired AWS region
    });

    const paramsObj = {
        Bucket: process.env.AWS_BUCKET,
        Key: key, // Replace with the actual object key
    };
    await s3BucketProdModel.findOneAndDelete({key:req.params.key})
    
    s33.deleteObject(paramsObj, (err, data) => {
        if (err) {
            return res.status(400).json({
                statusCode: 400,
                statusValue:"FAIL",
                message:`Error in deleting object.`,
            }) 
        }
        return res.status(200).json({
            statusCode: 200,
            statusValue:"SUCCESS",
            message:`Object deleted successfully`,
            data:data,
        });     
    });
}


exports.getProductionFile = async (req, res) => {
    try {
        
        const getDoc = await s3BucketProdModel.findOne({$and:[{deviceId:req.params.deviceId},{flag:req.params.flag}]},
            {__v:0, createdAt:0, updatedAt:0,versionId:0,etag:0,metadata:0,serverSideEncryption:0,storageClass:0,contentEncoding:0}
        );

        if (!getDoc) {
            return res.status(400).json({
                statusCode: 400,
                statusValue: "FAIL",
                message: "Data not found."
            });
        }
        return res.status(200).json({
            statusCode: 200,
            statusValue: "SUCCESS",
            message: "Data get successfully..",
            data:getDoc,
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


exports.deletePatientFile = async (req, res) => {
    const key = req.params.key;
    AWS.config.update({
        // accessKeyId: 'AKIAUFKMQ2DN5UYCHZ2L',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION // Replace with your desired AWS region
    });
    const paramsObj = {
        Bucket: process.env.AWS_BUCKET,
        Key: key, // Replace with the actual object key
    };
    await patientModel.findOneAndUpdate({key:req.params.key},{location:"",key:""});
    await s3PatientFileModel.findOneAndDelete({key:req.params.key});
    s33.deleteObject(paramsObj, (err, data) => {
        if (err) {
            return res.status(400).json({
                statusCode: 400,
                statusValue:"FAIL",
                message:`Error in deleting object.`,
            }) 
        }
        return res.status(200).json({
            statusCode: 200,
            statusValue:"SUCCESS",
            message:`Object deleted successfully`,
            data:data,
        });     
    });
}


// exports.deleteFile = async (req, res) => {
//     try {
//         const id = req.params.id;
//         const deleteDoc = await s3BucketModel.findByIdAndDelete({_id:id});
//         if (!!deleteDoc) {
//             return res.status(200).json({
//                 statusCode: 200,
//                 statusValue: "SUCCESS",
//                 message: "File deleted successfully.",
//             })
//         }
//         return res.status(400).json({
//             statusCode: 400,
//             statusValue: "FAIL",
//             message: "Data not deleted.",
//         })
//     } catch (err) {
//         return res.status(500).json({
//             statusCode: 500,
//             statusValue: "FAIL",
//             message: "Internal server error",
//             data: {
//                 generatedTime: new Date(),
//                 errMsg: err.stack,
//             }
//         });
//     }
// }


// get file by deviceId
exports.getFileByDeviceId = async (req, res) => {
    try {
        const deviceId = req.params.deviceId;
        const getDocs = await s3BucketModel.find({deviceId:deviceId},
            {__v:0, createdAt:0, updatedAt:0,versionId:0,etag:0,metadata:0,
                serverSideEncryption:0,storageClass:0,contentEncoding:0,encoding:0,
                encoding:0,contentType:0,
            });
        if (!!getDocs) {
            return res.status(200).json({
                statusCode: 200,
                statusValue: "SUCCESS",
                message: "Files get successfully.",
                data: getDocs
            });
        }
        return res.status(400).json({
            statusCode: 400,
            statusValue: "FAIL",
            message: "Data not deleted.",
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
        });
    }
}


exports.uploadDeliveryFile = async (req, res) => {
  try {
    // 1. Check if file exists
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
        statusCode: 400,
        statusValue: "error"
      });
    }
    
    const file = req.file;
    const maxSize = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxSize) {
      return res.status(400).json({
        message: "File too large. Maximum size is 10MB",
        statusCode: 400,
        statusValue: "error"
      });
    }

    // 4. Success response
    return res.status(200).json({
      message: "File uploaded successfully",
      statusCode: 200,
      statusValue: "success",
      file: {
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: file.location
      }
    });

  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong while uploading file",
      statusCode: 500,
      statusValue: "error",
      error: error.message
    });
  }
};



