const asyncHandler = require("express-async-handler");
const Device = require("../model/RegisterDevice");
const mongoose = require('mongoose');
const RegisterDevices = require("../model/RegisterDevice");
const { registerDevice } = require("./RegisterDevice");

//Here the get Device api is  nmntioned

const getDevice = asyncHandler(async (req,res) =>{
    const devices = await Device.find();
    res.status(201).json(devices);
});

const getDevicebyId = asyncHandler(async (req,res,next) =>{
   if(req.query.id){
    const id = req.query.id;

    Device.findById(id)
    .then(data =>{
        if(!data){
            res.status(404).send({ message : "Not found user with id "+ DeviceId})
        }else {
            res.send(data)
        }
    }).catch(err =>{
        res.status(500).send({ message: "Erro retrieving user with id " + DeviceId})
    })
   }else {
    Device.find()
    .then(user => {
        res.send(user)
    })
    .catch(err => {
        res.status(500).send({ message : err.message || "Error Occurred while retriving user information" })
    })
   }
   
    // const did = req.params.DeviceId;
    // Device.findById(req.params.Device.DeviceId).exec().then(doc =>{
    //     console.log(doc);
    //     res.status(200).json(doc);
    // }).catch(err => {
    //     console.log(err)
    //     res.status(500).json({error:err}); 
    // }
    // );
    // if(!device){
    //     res.status(400);
    //     throw new Error("Device not found");
    // }
    // res.status(200).json(device);
});

exports.find = (req, res)=>{

    if(req.query.DeviceId){
        const DeviceId = req.query.DeviceId;

        Device.findById(DeviceId)
            .then(data =>{
                if(!data){
                    res.status(404).send({ message : "Not found user with id "+ id})
                }else{
                    res.send(data)
                }
            })
            .catch(err =>{
                res.status(500).send({ message: "Erro retrieving user with id " + id})
            })

    }else{
        Device.find()
            .then(user => {
                res.send(user)
            })
            .catch(err => {
                res.status(500).send({ message : err.message || "Error Occurred while retriving user information" })
            })
    }

    
}





const createDevice = asyncHandler (async(req,res) =>{
    const {DeviceId, AliasName,IMEI_NO,Hospital_Name,Ward_No,Ventilator_Operator,Doctor_Name} = req.body;
    if(!DeviceId || !AliasName || !IMEI_NO || !Hospital_Name || !Ward_No ||!Ventilator_Operator || !Doctor_Name){
        res.status(400);
        throw new Error("All Fields are mandatory");
    }
    const deviceInfo = await Device.create({
        DeviceId,
        AliasName,
        IMEI_NO,
        Hospital_Name,
        Ward_No,
        Ventilator_Operator,
        Doctor_Name,
    })
        res.status(202).json(deviceInfo);
    
    
});

const updateDevice = asyncHandler(async(req,res) =>{
    const did = req.params.DeviceId;
    const device = await Device.findOne(Device.DeviceId,did);
    if(!device){
        res.status(400);
        throw new Error("Device not found");

    }
    const updateDevice = await Device.findByIdAndUpdate(
        req.params.DeviceId,
        req.body,
        {new : true}
    );
    res.status(200).json(updateDevice);
});


// const getDevicebyDeviceId=asyncHandler(
//     async(req,res)=>{
//         try {
//           const { did } = req.params;
//         const RegisterDeviceCollection=await Device.findOne({deviceId:did});//getRegisterDeviceById
//        // console.log('registerDeviceCollection',RegisterDeviceCollection)
//         if(!RegisterDeviceCollection){
//           return res.status(404).json({
//             status:0,
//             data:{
//               err:{
//                 generatedTime: new Date(),
//                 errMsg: 'RegisterDevice not found',
//                 msg: 'RegisterDevice not found',
//                 type: 'Internal Server Error',
//               },
//             },
//           })
//         }
//         const collectionName=require(`../model/${RegisterDeviceCollection.collection_name}.js`);
//         //console.log(collectionName,'collectionName')
//         const particularDeviceById=await collectionName.aggregate([
//           {
//             $match:{
//               deciceId:'did'
    
//             },
//             $lookup:{
//               from:'devices',
//               localField:'device',
//               forgenField:'_id',
//               as:'device'
//             }
//           }
//         ]);
//         return res.status(200).json({
//           status: 1,
//           data: {
//             particularDeviceById:particularDeviceById,
//             //modelNameParticularCount: modelNameParticularCount[0].count,
//           },
//           message: 'successfull',
//         });
//       }
//       catch(err){
//         return res.status(500).json({
//           status: -1,
//           data: {
//             err: {
//               generatedTime: new Date(),
//               errMsg: err.stack,
//               msg: err.message,
//               type: err.name,
//             },
//           },
//         });
      
//       }
//     }
// );

module.exports = {getDevice,createDevice,getDevicebyId,updateDevice};