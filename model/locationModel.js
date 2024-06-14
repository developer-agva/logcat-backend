const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const locationSchema = new mongoose.Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    dId: { type: Schema.Types.ObjectId, ref: "Device" },
    deviceId: { type: String, required: true, default: "" },
    country: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true},
    street: { type: String, required: true },
    pincode: { type: String, required:true },
    productCode: { type: String, default:"" },
},
    { timestamps: true }
);

const locationModel = mongoose.model('location_ventilator_collections', locationSchema);

module.exports = locationModel;

