const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const statusSchema = mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User" 
    },
    dId: {
        type: Schema.Types.ObjectId,
        ref: "RegisterDevice"
    },
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
    addTofocus:{
        type: Boolean,
        required:true,
        default: false,
    },
    type: {
        type: String,
        enum: ["003","004"],
        required: [true, "product code is required."]
    },
},
    { timestamps: true })

const statusModelV2 = mongoose.model('device_status_v2', statusSchema)
module.exports = statusModelV2
