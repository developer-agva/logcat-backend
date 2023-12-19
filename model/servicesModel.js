const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const ServiceSchema = mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User" 
    },
    deviceId: { 
        type: String,
        required: true 
    },
    message: { 
        type: String,
        default : "" 
    },
    date: { 
        type: String,
        default: "" 
    },
    serialNo: {
        type: String,
        default: ""
    },
    name: {
        type: String,
        requirted: true,
        default:"",
    },
    contactNo: {
        type: String,
        required: true,
        default: "",
    },
    hospitalName: {
        type: String,
        default:"",
    },
    wardNo: {
        type: String,
        default:"",
    },
    email: {
        type: String,
        default:"",
    },
    department: {
        type: String,
        default:"",
    },
    otp:{
        type: String,
        default: "",
    },
    isVerified:{
        type: Boolean,
        default: false,
    },

},
    { timestamps: true })

const servicesModel = mongoose.model('services', ServiceSchema)
module.exports = servicesModel
