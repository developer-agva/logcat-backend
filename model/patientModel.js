const mongoose = require('mongoose')
// const Schema = mongoose.Schema;

const patientSchema = mongoose.Schema({
    deviceId: {
        type: String,
        required: true,
    },
    UHID: {
        type: String,
        required: true,
    },
    age: {
        type: String,
        required: true,
    },
    weight: {
        type: String,
        required: true,
    },
    height: {
        type: String,
        required: true,
    },
    patientName : {
        type: String,
        required: true,
        default:""
    },
    hospitalName:{
        type: String,
        default: ""
    },
    dosageProvided: {
        type: String,
        default: "",
    },
    ward_no: {
        type: String,
        default: "",
    },
    doctor_name: {
        type: String,
        default: "",
    },
    alias_name: {
        type: String,
        default: "",
    },
    medicalDiagnosis: [
        {
            medicine: { type: String, default: "" },
            procedure: { type: String, default: "" },
            others: { type: String, default: "" },
            date: { type: Date, default: Date.now }
        },
    ],
    location:{
        type: String,
        default: "",
    },
    key:{
        type: String,
        default: "",
    },
    patientProfile: {
        type: String,
        default: ""
    },
    bed_no: {
        type: String,
        default: ""
    },
},
    { timestamps: true })

const patientModel = mongoose.model('patient_ventilator_collection', patientSchema)
module.exports = patientModel
