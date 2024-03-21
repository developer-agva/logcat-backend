const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const trendsVentoilatorSchemaV2 = mongoose.Schema({
    did: {
        type: String,
        default:""
    },
    time: {
        type: String,
        default:""
    },
    spo2: {
        type: String,
        default:""
    },
    pr: {
        type: String,
        default:""
    },
    hr: {
        type: String,
        default:""
    },
    ecgRR: {
        type: String,
        default:""
    },
    iBP_S: {
        type: String,
        default:""
    },
    iBP_D: {
        type: String,
        default:""
    },
    cgm: {
        type: String,
        default:""
    },
    etCo2: {
        type: String,
        default:""
    },
    rr: {
        type: String,
        default:""
    },
    nibp_S: {
        type: String,
        default:""
    },
    nibp_D: {
        type: String,
        default:""
    },
    temp1: {
        type: String,
        default:""
    },
    temp2: {
        type: String,
        default:""
    },
    iBP2_S: {
        type: String,
        default:""
    },
    iBP2_D: {
        type: String,
        default: ""
    },
    type: {
        type: String,
        default: ""
    },
},{timestamps: true})


const trends_ventilator_collectionV2_model = mongoose.model('trends_ventilator_collection_v2', trendsVentoilatorSchemaV2);
module.exports = trends_ventilator_collectionV2_model;