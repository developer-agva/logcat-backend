const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const RegisterDevice = require('../model/RegisterDevice');

const checkDevices = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");
        const devices = await RegisterDevice.find().limit(5);
        console.log(JSON.stringify(devices, null, 2));
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkDevices();
