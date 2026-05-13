const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const RegisterDevice = require('../model/RegisterDevice');

const devicesToRegister = [
  {
    "DeviceId": "27e911209878de8d",
    "AliasName": "Agva ATP",
    "IMEI_NO": "12345678901234455",
    "Hospital_Name": "AgVa Healthcare",
    "Ward_No": "Ward 1",
    "Ventilator_Operator": "Deepak",
    "Doctor_Name": "NA"
  },
  {
    "DeviceId": "a80dc880ce9b3e47",
    "AliasName": "Agva ATP",
    "IMEI_NO": "123456738901234455",
    "Hospital_Name": "AgVa Healthcare",
    "Ward_No": "Ward 1",
    "Ventilator_Operator": "Deepak",
    "Doctor_Name": "NA"
  }
];

const register = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        for (const data of devicesToRegister) {
            console.log(`Registering device: ${data.DeviceId}`);
            
            // Check if already exists
            const existing = await RegisterDevice.findOne({ DeviceId: data.DeviceId });
            if (existing) {
                console.log(`Device ${data.DeviceId} already exists. Updating...`);
                Object.assign(existing, data);
                await existing.save();
                console.log(`Device ${data.DeviceId} updated successfully.`);
            } else {
                const device = new RegisterDevice(data);
                await device.save();
                console.log(`Device ${data.DeviceId} registered successfully.`);
            }
        }
        process.exit(0);
    } catch (error) {
        console.error("Error during registration:", error);
        process.exit(1);
    }
};

register();
