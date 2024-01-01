const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const sendDeviceReqSchema = mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    requestedBy:{
        type: String,
        default:"",
    },
    hospitalName:{
        type: String,
        default:"",
    },
    deviceId: {
        type: String,
        default:""
    },
    serialNumber:{
        type: String,
        default:"",
    },
    deviceType:{
        type: String,
        default:"",
    },
    status:{
        type: Boolean,
        required: true,
        default: false,
    },
    
}, { timestamps: true })

const sendDeviceReqModel = mongoose.model('device_request', sendDeviceReqSchema);


module.exports = sendDeviceReqModel
