// machineDeliveryController.js
const Log = require('../model/logs');
const Joi = require('joi');
const mongoose = require('mongoose');
const User = require('../model/users');
const { validationResult } = require('express-validator');
let redisClient = require("../config/redisInit");
const JWTR = require("jwt-redis").default;
const jwtr = new JWTR(redisClient);
require("dotenv").config({ path: "../.env" });
const machineDeliveryModel = require('../model/machineDeliveryModel.js');


// Function to add machine delivery data
const addMachineDelivery = async (req, res) => {
    try {
        const { productionDepartment = [], accountDepartment = [], dispatchDepartment = [], serviceDepartment = [] } = req.body;
        // Ensure all department arrays exist
        const finalData = {
            userId: req.body.userId || null,

            productionDepartment: productionDepartment.map(item => ({
                serialNumber: item.serialNumber?.trim() || "",
                ipMacAddress: item.ipMacAddress?.trim() || "",
                androidMacAddress: item.androidMacAddress?.trim() || "",
                deviceId: item.deviceId?.trim() || "",

                type: item.type || "",
                model: item.model || "",
                screenSize: item.screenSize || "",
                softwareVersion: item.softwareVersion || "",
                exhaleValveType: item.exhaleValveType || "",
                neoSensorType: item.neoSensorType || "",
                description: item.description || "",

                dhrFile: item.dhrFile || "",
            })),

            accountDepartment: accountDepartment.map(item => ({
                billedTo: item.billedTo || "",
                shippedTo: item.shippedTo || "",
                invoiceNumber: item.invoiceNumber || "",
                amount: item.amount || "",
                deliveryNote: item.deliveryNote || "",

                deliveryBill: item.deliveryBill || "",
                ewayBill: item.ewayBill || "",
            })),

            dispatchDepartment: dispatchDepartment.map(item => ({
                hospitalName: item.hospitalName || "",
                address: item.address || "",
                city: item.city || "",
                state: item.state || "",
            })),

            serviceDepartment: serviceDepartment.map(item => ({
                serviceEngineerName: item.serviceEngineerName || "",
                installationDate: item.installationDate || "",
                dispatchDate: item.dispatchDate || "",
                installationOrFeedbackReport: item.installationOrFeedbackReport || "",
            })),
        };

        const newMachineDelivery = new machineDeliveryModel(finalData);
        await newMachineDelivery.save();

        return res.status(201).json({
            statusCode: 201,
            statusValue: "SUCCESS",
            message: "Machine delivery data added successfully",
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            statusValue: "FAIL",
            message: "Internal server error",
            error: error.message,
        });
    }
};

// Function to update machine delivery data by _id
const updateMachineDeliveryById = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            productionDepartment = [],
            accountDepartment = [],
            dispatchDepartment = [],
            serviceDepartment = [],
        } = req.body;

        // Prepare updated data
        const updatedData = {
            userId: req.body.userId || null,

            productionDepartment: productionDepartment.map(item => ({
                serialNumber: item.serialNumber?.trim() || "",
                ipMacAddress: item.ipMacAddress?.trim() || "",
                androidMacAddress: item.androidMacAddress?.trim() || "",
                deviceId: item.deviceId?.trim() || "",

                type: item.type || "",
                model: item.model || "",
                screenSize: item.screenSize || "",
                softwareVersion: item.softwareVersion || "",
                exhaleValveType: item.exhaleValveType || "",
                neoSensorType: item.neoSensorType || "",
                description: item.description || "",

                dhrFile: item.dhrFile || "",
            })),

            accountDepartment: accountDepartment.map(item => ({
                billedTo: item.billedTo || "",
                shippedTo: item.shippedTo || "",
                invoiceNumber: item.invoiceNumber || "",
                amount: item.amount || "",
                deliveryNote: item.deliveryNote || "",

                deliveryBill: item.deliveryBill || "",
                ewayBill: item.ewayBill || "",
            })),

            dispatchDepartment: dispatchDepartment.map(item => ({
                hospitalName: item.hospitalName || "",
                address: item.address || "",
                city: item.city || "",
                state: item.state || "",
            })),

            serviceDepartment: serviceDepartment.map(item => ({
                serviceEngineerName: item.serviceEngineerName || "",
                installationDate: item.installationDate || "",
                dispatchDate: item.dispatchDate || "",
                installationOrFeedbackReport: item.installationOrFeedbackReport || "",
            })),
        };

        const updatedMachine = await machineDeliveryModel.findByIdAndUpdate(
            id,
            updatedData,
            { new: true } // returns the updated document
        );
        
        if (!updatedMachine) {
            return res.status(404).json({
                statusCode: 404,
                statusValue: "FAIL",
                message: "Machine delivery data not found",
            });
        }
        
        return res.status(200).json({
            statusCode: 200,
            statusValue: "SUCCESS",
            message: "Machine delivery data updated successfully",
            // data: updatedMachine,
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            statusValue: "FAIL",
            message: "Internal server error",
            error: error.message,
        });
    }
};



const getAllMachineDeliveries = async (req, res) => {
    try {
        const allDeliveries = await machineDeliveryModel.find({}, {__v:0, updatedAt:0}).sort({ createdAt: -1 });
        if (allDeliveries.length === 0) {
            return res.status(200).json({
                statusCode: 200,
                statusValue: "SUCCESS",
                message: "No deliveries found.",
                data: [],
            });
        }
        return res.status(200).json({
            statusCode: 200,
            statusValue: "SUCCESS",
            message: "Data retrieved successfully.",
            data: allDeliveries,
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            statusValue: "FAIL",
            message: "Internal server error",
            error: error.message,
        });
    }
};

const getMachineDeliveryById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                statusCode: 400,
                statusValue: "FAIL",
                message: "Invalid ID format.",
            });
        }

        const delivery = await machineDeliveryModel.findById(id, { __v: 0, updatedAt: 0 });
        if (!delivery) {
            return res.status(404).json({
                statusCode: 404,
                statusValue: "FAIL",
                message: "Delivery not found.",
            });
        }

        return res.status(200).json({
            statusCode: 200,
            statusValue: "SUCCESS",
            message: "Data retrieved successfully.",
            data: delivery,
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            statusValue: "FAIL",
            message: "Internal server error",
            error: error.message,
        });
    }
};


module.exports = {
    addMachineDelivery,
    getAllMachineDeliveries,
    getMachineDeliveryById,
    updateMachineDeliveryById
}