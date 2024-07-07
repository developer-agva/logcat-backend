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
        unique:true
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
            dateTime: { type: String, default: "" },
            medication: { type: String, default: "" },
            report: { type: String, default: "" },
            stats: [{
                statsData:{type:String, default:""},
                statsValue:{type:String, default:""}
            }],
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
    hypertension: {
        type: Boolean,
        default: false,
    },
    diabetes: {
        type: Boolean,
        default: false,
    },
    serial_no:{
        type: String,
        default: ""
    },
    bmi:{
        type: String,
        default: ""
    },
    discharge:{
        startDateTime:{ type: String, default: "" },
        endDateTime:{ type: String, default: "" },
        status:{type: Boolean, default: false}
    }
},
    { timestamps: true })

const patientModel = mongoose.model('patient_ventilator_collection', patientSchema)
module.exports = patientModel
