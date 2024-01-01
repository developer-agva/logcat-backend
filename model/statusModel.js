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
    }
},
    { timestamps: true })

const statusModel = mongoose.model('device_status', statusSchema)
module.exports = statusModel
