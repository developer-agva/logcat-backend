const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const assignDeviceSchema = mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    Assigned_Devices :[
        {
            DeviceId: {
                type: String,
                default:""
            },
            Department_Name: {
                type: String,
                default: ""
            },
            IMEI_NO: {
                type: String,
                default: ""
            },
            Hospital_Name: {
                type: String,
                default: ""
            },
            Ward_No: {
                type: String,
                default: ""
            },
            Bio_Med: {
                type: String,
                default: ""
            },
            Doctor_Name: {
                type: String,
                default:""
            },
            Status: {
                type: String,
                default: "INACTIVE"
            },
        },
    ],
    default:""

}, { timestamps: true })

const assignDeviceTouserModel = mongoose.model('assigned_devices_tousers', assignDeviceSchema);


module.exports = assignDeviceTouserModel
