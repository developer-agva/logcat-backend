const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    deviceId: { type: String, required: true, default: "" },
    message: { type: String, required: true, default: "" },
    version: { type: String, required: true },
    file: { type: String, required: true, default: "" },
    date: { type: String, required: true }
},
    { timestamps: true }
);

const logModel = mongoose.model('crash_logs_ventilator_collections', logSchema);

module.exports = logModel;

