const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const statusSchema = mongoose.Schema({
    deviceId: { 
        type: String,
        required: true 
    },
    message: { 
        type: String,
        default : "" 
    },
    health: {
        type: String,
        default:"",
    },
    last_hours: {
        type: String,
        default:"",
    },
    total_hours: {
        type: String,
        default:"",
    },
    address: {
        type: String,
        default:"",
    },
    type: {
        type: String,
        enum: ["003","004","005", "006", "007", "008", "009"],
        required: [true, "product code is required."]
    },
    lastActive:{
        type: String,
        default:"--"
    },
    activeDate:{
        type: String,
        default:""
    },
    purpose:{
        type: String,
        default: ""
    },
},
    { timestamps: true })

// Create Indexes for search optimization or fetch records
statusSchema.index({ message: 1 });
statusSchema.index({ deviceId: 1 });    

const statusModelV2History = mongoose.model('device_status_v2_history', statusSchema)
module.exports = statusModelV2History
