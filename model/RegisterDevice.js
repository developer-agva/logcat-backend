const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const RegisterDeviceSchema = mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User" 
    },
    dId: {
        type: Schema.Types.ObjectId,
        ref: "Device"
    },
    DeviceId: {
        required: [true, "did is required"],
        type: String,
        // unique: true,
    },
    Alias_Name: {
        type: String,
        // required: true,
        default: ""
    },
    Department_Name: {
        required: [true, 'Department name is required'],
        type: String
    },
    IMEI_NO: {
        type: String,
        default:""
    },
    Hospital_Name: {
        required: [true, "Hospital Name is required"],
        type: String
    },
    Ward_No: {
        required: [true, "Ward Number is required"],
        type: String
    },
    Bio_Med: {
        required: [true, "Bio-Med is required"],
        type: String
    },
    Doctor_Name: {
        required: [true, "Doctor Name is required"],
        type: String
    },
    Status: {
        type: String,
        default:"INACTIVE"
    },
    isAssigned: {
        type: Boolean,
        required:true,
        default: false,
    },
    addTofocus:{
        type: Boolean,
        required:true,
        default: false,
    }
},
    { timestamps: true })

const RegisterDevice = mongoose.model('RegisterDevice', RegisterDeviceSchema)
module.exports = RegisterDevice




















































































































