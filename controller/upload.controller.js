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
const {sendOtp, sendEmailLink} = require('../helper/sendOtp');
const s3PatientFileModel = require('../model/s3PatientFileModel');
const patientModel = require('../model/patientModel');

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
  const saveDoc = new s3BucketProdModel(newObj);
  saveFile = saveDoc.save();
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
  

// Upload patient file for patient module
exports.uploadPatientFile = async (req, res) => {
    // req.file contains a file object
    res.json(req.file);
  //   console.log(req.file.fieldname, req.params.deviceId)  
  const newObj = {
        "deviceId":req.params.deviceId,
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
//         const deleteDoc = await s3BucketModel.findByIdAndDelete({_id:mongoose.Types.ObjectId(id)});
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




