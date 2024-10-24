const express = require('express');
const mongoose = require('mongoose');
const Joi = require('joi');
const registeredHospitalModel = require('../model/registeredHospitalModel');
const { Country, State, City } = require('country-state-city');
let redisClient = require("../config/redisInit");
const User = require('../model/users');
const assignDeviceTouserModel = require('../model/assignedDeviceTouserModel');
const JWTR = require("jwt-redis").default;
const jwtr = new JWTR(redisClient);
/*
 * @param {*} req 
 * @param {*} res 
 * api POST@/api/logger/logs/save-hospital
 * desc create location for logger access only
 */
const saveHospital = async (req, res) => {
    try {
        const schema = Joi.object({
            Hospital_Name: Joi.string().required(),
            Hospital_Address: Joi.string().required(),
            Country: Joi.string().required(),
            State: Joi.string().required(),
            City: Joi.string().required(),
            District: Joi.string().required(),
            Pincode: Joi.string().required(),
            
        })
        let result = schema.validate(req.body);
        if (result.error) {
            return res.status(200).json({
                status: 0,
                statusCode: 400,
                message: result.error.details[0].message,
            })
        }
        const checkHospital = await registeredHospitalModel.findOne({
            $and:[
                {Hospital_Name: req.body.Hospital_Name},
                {Pincode:req.body.Pincode},
            ]
        });
        if (checkHospital) {
            return res.status(400).json({
                statusCode: 400,
                statusValue: "FAIL",
                message: "Hospital already registered."
            })
        }
        const hospitalData = new registeredHospitalModel(req.body);
        const saveDoc = await hospitalData.save();
        if (!saveDoc) {
            return res.status(404).json({
                status: 0,
                msg: "Hospital not saved."
            });
        }
        return res.status(201).json({
            status: 1,
            msg: "Hospital has been registered successfully.",
            data: saveDoc
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


const updateHospital = async (req, res) => {
    try {
        const schema = Joi.object({
            id: Joi.string().required(),
            Hospital_Name: Joi.string().required(),
            Hospital_Address: Joi.string().required(),
            Country: Joi.string().required(),
            State: Joi.string().required(),
            City: Joi.string().required(),
            District: Joi.string().required(),
            Pincode: Joi.string().required(),
        })
        let result = schema.validate(req.body);
        if (result.error) {
            return res.status(400).json({
                statusCode: 400,
                statusValue: "FAIL",
                message: result.error.details[0].message,
            })
        }
        
        const updateDoc = await registeredHospitalModel.findByIdAndUpdate(
            { _id:req.body.id },
            { 
                Hospital_Name:req.body.Hospital_Name,
                Hospital_Address:req.body.Hospital_Address,
                Country:req.body.Country,
                State:req.body.State,
                City:req.body.City,
                District:req.body.District,
                Pincode:req.body.Pincode,
            },
            { new: true }
        );
        if (!updateDoc) {
            return res.status(404).json({
                statusCode: 400,
                statusValue: "FAIL",
                message: "Hospital not saved."
            });
        }
        return res.status(200).json({
            statusCode: 200,
            statusValue: "SUCCESS",
            message: "Hospital has been updated successfully.",
            data: updateDoc,
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

const deleteHospital = async (req, res) => {
    try {
        const id = req.params.id;
        const checkHospital = await registeredHospitalModel.findOne({ _id: req.params.id });
        if (!checkHospital) {
            return res.status(400).json({
                statusCode: 400,
                statusValue: "FAIL",
                message: "Incorrect hospital id!!",
            })
        }
        const removeDoc = await registeredHospitalModel.findByIdAndDelete(
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
            msg: "Hospital deleted successfully.",
            data: removeDoc,
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
 * api      GET @/hospital/get-byid/:id
 * desc     @getSingleHospital for logger access only
*/
const getHospitalList = async (req, res) => {
    try {
        console.log(true)
        if (!req.params.State) {
            const data = await registeredHospitalModel.find({}, { __v: 0, createdAt: 0, updatedAt: 0 });
            if (data.length == "") {
                return res.status(404).json({
                    statusCode: 404,
                    statusValue: "FAIL",
                    message: "Data not found."
                })
            } 
            return res.status(200).json({
                statusCode: 200,
                statusValue: "SUCCESS",
                message: "Hospital data get successfully.",
                data: data
            })
        }
        const data = await registeredHospitalModel.find({State:req.params.State}, { __v: 0, createdAt: 0, updatedAt: 0 });
        if (data.length == "") {
            return res.status(404).json({
                statusCode: 404,
                statusValue: "FAIL",
                message: "Data not found."
            })
        }
        return res.status(200).json({
            statusCode: 200,
            statusValue: "SUCCESS",
            message: "Hospital data get successfully.",
            data: data
        })
    } catch (error) {
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
 * api      GET @/hospital/get-byid/:id
 * desc     @getSingleHospital for logger access only
*/
const getAccesshospitals = async (req, res) => {
    try {
        // get loggedin user details
        const token = req.headers["authorization"].split(' ')[1];
        const verified = await jwtr.verify(token, process.env.JWT_SECRET);
        const loggedInUser = await User.findById({_id:verified.user});

        const data1 = loggedInUser.accessHospital
        console.log(11, data1)
        const data2 = await assignDeviceTouserModel.find({$or:[{userId:loggedInUser._id},{assignedBy:loggedInUser.email}]});
        // console.log(12, data2)

        // Extract hospital names from data2
        const data2HospitalNames = data2.map(item => item.hospitalName)
        // console.log(11,data2HospitalNames)
        const commonHospitalNames = data1.filter(hospitalName => data2HospitalNames.includes(hospitalName))
        // console.log(22,commonHospitalNames)

        // final hospital list
        // const dataList = await registeredHospitalModel.find({Hospital_Name:{$in:commonHospitalNames}},{__v:0});
        const dataList = await registeredHospitalModel.find({Hospital_Name:{$in:data1}},{__v:0});
        if (dataList.length<1) {
            return res.status(404).json({
                statusCode: 404,
                statusValue: "FAIL",
                message: "Data not found."
            })
        } 
        return res.status(200).json({
            statusCode: 200,
            statusValue: "SUCCESS",
            message: "Hospital data get successfully.",
            data: dataList
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



const getHospitals = async (req, res) => {
    try {
        let Pincode = req.params.Pincode.trim();
        if (req.params === undefined || "" || null) {
            res.status(404).json({
                statusCode: 404,
                statusValue: "FAIL",
                message: "Hospital name is required !!"
            }) 
        }

        const data = await registeredHospitalModel.find({$or:[{Pincode:Pincode}]}, { __v: 0, createdAt: 0, updatedAt: 0 });
        if (data.length<1) {
            return res.status(404).json({
                statusCode: 404,
                statusValue: "FAIL",
                message: "Data not found."
            })
        }
        return res.status(200).json({
            statusCode: 200,
            statusValue: "SUCCESS",
            message: "Hospital data get successfully.",
            data: data
        })
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            statusValue: "FAIL",
            message: "Internal server error",
            data: {
                generatedTime: new Date(),
                errMsg: error.stack,
            }
        })
    }
}


const getHospitalsByName = async (req, res) => {
    try {
        let Hospital_Name = req.params.Hospital_Name.trim();
        if (req.params === undefined || "" || null) {
            res.status(404).json({
                statusCode: 404,
                statusValue: "FAIL",
                message: "Hospital name is required !!"
            }) 
        }

        const data = await registeredHospitalModel.find({$or:[{Hospital_Name:Hospital_Name}]}, { __v: 0, createdAt: 0, updatedAt: 0 });
        if (data.length<1) {
            return res.status(404).json({
                statusCode: 404,
                statusValue: "FAIL",
                message: "Data not found."
            })
        }
        return res.status(200).json({
            statusCode: 200,
            statusValue: "SUCCESS",
            message: "Hospital data get successfully.",
            data: data
        })
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            statusValue: "FAIL",
            message: "Internal server error",
            data: {
                generatedTime: new Date(),
                errMsg: error.stack,
            }
        })
    }
}

/** 
 * api      GET @/hospital/get-byid/:id
 * desc     @getSingleHospital for logger access only
*/
const getSingleHospital = async (req, res) => {
    try {
        const data = await registeredHospitalModel.findById(
            {
                _id:req.params.id
            }, 
            { 
                __v: 0, createdAt: 0, updatedAt: 0 
            }
        );
        if (!!data) {
            return res.status(200).json({
                statusCode: 200,
                statusValue: "SUCCESS",
                message: "Hospital data get successfully.",
                data: data
            })
        }
        return res.status(400).json({
            statusCode: 400,
            statusValue: "FAIL",
            message: "Data not found.",
            data: {}
        })
    } catch (error) {
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


const getCountryList = async (req, res) => {
    try {
        const countryData = await Country.getAllCountries();
        // const getData = https://api.postalpincode.in/pincode/110001
        if (!countryData) {
            return res.status(400).json({
                statusCode: 400,
                statusValue: "FAIL",
                message: "Data not found.",
                data: [],
            });
        }
        return res.status(200).json({
            statusCode: 200,
            statusValue: "SUCCESS",
            message: "Country list get successfully.",
            data: countryData,
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


const getStateListByCountryName = async (req, res) => {
    try {
        const countryData = await Country.getAllCountries();
        const getName = countryData.filter((item) => {
            return item.name == req.params.name
        });
        const countryCode = getName[0].isoCode;
        const stateData = await State.getStatesOfCountry(countryCode);
        if (!stateData) { 
            return res.status(400).json({ 
                statusCode: 400, 
                statusValue: "FAIL",
                message: "Data not found.", 
                data: [], 
            });
        } 
        return res.status(200).json({ 
            statusCode: 200, 
            statusValue: "SUCCESS", 
            message: "State list get successfully.", 
            data: stateData, 
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





module.exports = {
    saveHospital,
    getHospitalList,
    getCountryList,
    getStateListByCountryName,
    getSingleHospital,
    updateHospital,
    deleteHospital,
    getHospitals,
    getAccesshospitals,
    getHospitalsByName
}