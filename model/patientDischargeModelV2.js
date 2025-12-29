const mongoose = require('mongoose')
// const Schema = mongoose.Schema;

const patientDischargeSchema = mongoose.Schema({
    patient_profile: {
        type: String,
        default: "",
    },
    weight: {
        type: String,
        default: "",
    },
    height: {
        type: String,
        default: "",
    },
    age: {
        type: String,
        default: "",
    },
    gender: {
        type: String,
        default: "",
    },
    UHID: {
        type: String,
        default: "",
    },
    deviceId: {
        type: String,
        default:""
    },
    projectCode:{
      type: String,
      default: ""
    },
},
    { timestamps: true })

const patientDischargeModelV2 = mongoose.model('patient_discharge_v2', patientDischargeSchema)
module.exports = patientDischargeModelV2
