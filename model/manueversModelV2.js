const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const manueversSchema = mongoose.Schema({
    flag: { 
        type: String,
        required:true,
        default: ""
    },
    date_time: { 
        type: String,
        required:true,
        default: ""
    },
    status: {
        type: String,
        required:true,
        default: ""
    },
    value: {
        type: String,
        required:true,
        default: ""
    },
    type:{
        type: String,
        required: true,
        default: ""
    }
},
    { timestamps: true })


const manueversModelV2 = mongoose.model('manuevers_v2', manueversSchema)
module.exports = manueversModelV2