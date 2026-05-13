const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const RegisterDevice = require('../model/RegisterDevice');

const verifyDevices = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");
        
        const deviceIds = ["27e911209878de8d", "a80dc880ce9b3e47"];
        const devices = await RegisterDevice.find({ DeviceId: { $in: deviceIds } });
        
        console.log("Verification results:");
        console.log(JSON.stringify(devices, null, 2));
        
        if (devices.length === 2) {
            console.log("SUCCESS: Both devices found.");
        } else {
            console.log(`WARNING: Found ${devices.length} devices instead of 2.`);
        }
        
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

verifyDevices();
