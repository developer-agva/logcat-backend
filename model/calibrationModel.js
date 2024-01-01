const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const calibrationSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    dId: { type: Schema.Types.ObjectId, ref: "Device" },
    deviceId: { type: String, required: true },
    message: { type: String, required: true },
    date: { type: String, required: true },
    name: { type:String, required: true }
},
    { timestamps: true }
);

const calibrationModel = mongoose.model('calibration_ventilator_collections', calibrationSchema);

module.exports = calibrationModel;
