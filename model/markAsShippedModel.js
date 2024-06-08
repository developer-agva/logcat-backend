const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const markAsShippedSchema = mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User" 
    },
    serialNo: { 
        type: String,
        default:""
    },
    deviceId: { 
        type: String,
        default:""
    },
    shippedThrough: { 
        type: String,
        default:""
    },
    trackingNo: {
        type: String,
        default: ""
    },
    vehicleNo: {
        type: String,
        default: ""
    },
    shipperName:{
        type: String,
        default:""
    },
    shipperContact:{
        type: String,
        default: ""
    },
    comments: {
        type: String,
        default: ""
    }

},
    { timestamps: true })

const markAsShippedModel = mongoose.model('mark_as_shipped', markAsShippedSchema)
module.exports = markAsShippedModel;
