const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const deviceSchema = mongoose.Schema({
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
    status: { 
        type: String,
        default:"INACTIVE"
    },
},
    { timestamps: true })

const deviceIdModel = mongoose.model('deviceId_ventilator_collection', deviceSchema)
module.exports = deviceIdModel
