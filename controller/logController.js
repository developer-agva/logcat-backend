const express = require('express');
const mongoose = require('mongoose');
const logModel = require('../model/logModel.js');
const { validationResult } = require('express-validator');
const Projects = require('../model/project.js');
const Joi = require('joi');
const logModelV2 = require('../model/logModelV2.js');

const createNewLog = async (req, res) => {
    try {
        const { project_code } = req.params;
        // Check project exist or not
        const findProjectWithCode = await Projects.findOne({ code: project_code });
        if (!findProjectWithCode) {
            return res.status(404).json({
                status: 404,
                data: {
                    err: {
                        generatedTime: new Date(),
                        errMsg: 'Project not found',
                        msg: 'Project not found',
                        type: 'Validation Error',
                    },
                },
            });
        }
        const { deviceId, message, version, file, date } = req.body;
        const logData = new logModel(req.body);
        const saveDoc = await logData.save();
        if (!saveDoc) {
            return res.status(404).json({
                status: 404,
                msg: "Log data not saved."
            });
        }
        return res.status(201).json({
            status: 201,
            message: 'Log data has been saved successfully.',
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
};

// for new products route
const createNewLogV2 = async (req, res) => {
    try {
        const { productCode } = req.params.productCode
        // Check project exist or not
        if (req.params.productCode !== "003") {
            return res.status(404).json({
                status: 404,
                data: {
                    err: {
                        generatedTime: new Date(),
                        errMsg: 'Product not found',
                        msg: 'Product not found',
                        type: 'Validation Error',
                    },
                },
            });
        }
        // const { deviceId, message, version, file, date } = req.body;

        const logData = new logModelV2({
            deviceId:req.body.deviceId,
            message:req.body.message,
            version:req.body.version,
            file:req.body.file,
            date:req.body.file,
            productCode:req.params.productCode
        })
        const saveDoc = await logData.save();
        if (!saveDoc) {
            return res.status(404).json({
                status: 404,
                msg: "Log data not saved."
            });
        }
        return res.status(201).json({
            status: 201,
            message: 'Log data has been saved successfully.',
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
};











module.exports = {
    createNewLog,
    createNewLogV2
}