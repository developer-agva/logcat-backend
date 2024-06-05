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
    }
},
    { timestamps: true })

// Create Indexes for search optimization or fetch records
statusSchema.index({ message: 1 });
statusSchema.index({ deviceId: 1 });

const statusModel = mongoose.model('device_status', statusSchema)
module.exports = statusModel
