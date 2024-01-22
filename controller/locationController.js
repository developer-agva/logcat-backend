const express = require('express');
const mongoose = require('mongoose');
const locationModel = require('../model/locationModel.js');
const { validationResult } = require('express-validator');
const Projects = require('../model/project.js');
const Joi = require('joi');
const NodeGeocoder = require('node-geocoder');

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * api POST@/api/logger/logs/location/:project_code
 * desc create location for logger access only
 */
const saveNewLocation = async (req, res) => {
    try {
        const schema = Joi.object({
            deviceId: Joi.string().required(),
            country: Joi.string().required(),
            state: Joi.string().required(),
            city: Joi.string().required(),
            street: Joi.string().required(),
            pincode: Joi.string().required(),
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

        const project_code = req.params.project_code;
        const locationData = new locationModel(req.body);
        const saveDoc = await locationData.save();
        if (!saveDoc) {
            return res.status(404).json({
                status: 0,
                msg: "Location not saved."
            });
        }
        return res.status(201).json({
            status: 201,
            msg: "Location has been saved successfully.",
            data: saveDoc
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

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * api GET@/api/logger/logs/location/:deviceId/:project_code
 */
const getLocationByDeviceId = async (req, res) => {
    try {
        const { deviceId, project_code } = req.params;
        if (!deviceId) {
            return res.status(400).json({
                statusCode: 400,
                statusValue: "Validation error",
                message: "Device Id is required!"
            })
        }
        const data = await locationModel.find({ deviceId: deviceId }, { "createdAt": 0, "updatedAt": 0, "__v": 0 });
        if (!data.length) {
            return res.status(404).json({
                statusCode: 404,
                statusValue: "FAIL",
                message: "Data not found."
            })
        }
        return res.status(200).json({
            statusCode: 200,
            statusValue:"SUCCESS",
            message:"Location data get successfully.",
            data:data
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
    saveNewLocation,
    getLocationByDeviceId
}