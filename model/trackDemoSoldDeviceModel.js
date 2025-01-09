const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const trackSoldDemoDeviceSchema = mongoose.Schema({
    userId: {
        type: String,
        default: "" 
    },
    deviceId: { 
        type: String,
        default:""
    },
    type: { 
        type: String,
        default:""
    },
    state: { 
        type: String,
        default:""
    },
    city: { 
        type: String,
        default:""
    },
    ASM_RSM: { 
        type: String,
        default:""
    },
    hospitalName: { 
        type: String,
        default:""
    },
    purpose:{
        type: String,
        default:""
    },
    serialNumber:{
        type: String,
        default:""
    },
    startDate:{
        type: String,
        default:""
    },
    endDate:{
        type: String,
        default:""
    },
    remarks:{
        type: String,
        default:""
    }

},
    { timestamps: true })

const trackSoldDemoDeviceModel = mongoose.model('track_sales_device', trackSoldDemoDeviceSchema)
module.exports = trackSoldDemoDeviceModel;

