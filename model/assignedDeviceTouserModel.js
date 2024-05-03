const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const assignDeviceSchema = mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    assignedBy:{
        type: String,
        default:"",
    },
    deviceId: {
        type: String,
        default:""
    },
    status:{
        type: Boolean,
        required: true,
        default: false,
    },
    isAssigned: {
        type: String,
        required: true,
        default:""
    },
    hospitalName: {
        type: String,
        required: true,
        default: "",
    },
    assistantId: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    securityCode: {
        type:String,
        default:""
    },
    
}, { timestamps: true })

const assignDeviceTouserModel = mongoose.model('assigned_devices_tousers', assignDeviceSchema);


module.exports = assignDeviceTouserModel
