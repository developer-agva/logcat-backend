const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const deviceOverviewSchema = mongoose.Schema({
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
    runningStatus: { 
        type: String,
        required:true,
        default:""
    },
    hours: { 
        type: String,
        required:true,
        default:"01:54:14"
    },
    totalHours: { 
        type: String,
        required:true,
        default:"06:52:14"
    },
    health: { 
        type: String,
        required:true,
        default:"Good"
    },
    address: { 
        type: String,
        required:true,
        default:"A-1 Sector 81, Noida 201301 (UP)"
    },
},
    { timestamps: true })

const deviceOverviewModel = mongoose.model('device_overview', deviceOverviewSchema)
module.exports = deviceOverviewModel
