const { required } = require('joi');
const mongoose = require('mongoose');

const mileStoneSchema = new mongoose.Schema({
    createdBy:{
        type: String,
        required: true,
    },
    startDate:{
        type: String,
        default: ""
    },
    endDate: {
        type: String,
        default: ""
    },
    targetDemo:{
        type: String,
        default: ""
    },
    targetSales:{
        type: String,
        default: ""
    },
    userId:{
        type: String,
        required: true,
    },
    isExpired: {
        type: Boolean,
        default:false,   
    },
    targetStatus:{
        type: String,
        default: "Pending"
    }
},{
    timestamps: true
})

const mileStoneModel = mongoose.model('mile_stone', mileStoneSchema);
module.exports = mileStoneModel;
