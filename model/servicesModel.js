const { required } = require('joi');
const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const ServiceSchema = mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User" 
    },
    deviceId: { 
        type: String,
        required: true 
    },
    message: { 
        type: String,
        default : "" 
    },
    date: { 
        type: String,
        default: "" 
    },
    serialNo: {
        type: String,
        default: ""
    },
    name: {
        type: String,
        requirted: true,
        default:"",
    },
    contactNo: {
        type: String,
        required: true,
        default: "",
    },
    hospitalName: {
        type: String,
        default:"",
    },
    wardNo: {
        type: String,
        default:"",
    },
    email: {
        type: String,
        default:"",
    },
    department: {
        type: String,
        default:"",
    },
    serviceEngName:{
        type: String,
        default:"",
    },
    UID:{
        type: String,
        default: "",
    },
    otp:{
        type: String,
        default: "",
    },
    isVerified:{
        type: Boolean,
        default: false,
    },
    ticketStatus:{
        type:String,
        enum:["Open", "Closed", "Hold", "Re-Open"],
        default:"Open",
    },
    isAssigned:{
        type: String,
        enum:["Assigned","Unassigned"],
        default:"Unassigned",
    },
    remark:{
        type: String,
        default: "",
    },
    issues:[
        {
            tag1:{ type:String, default:"" },
            tag2:{ type:String, default:"" },
            tag3:{ type:String, default:"" },
            tag4:{ type:String, default:"" },
            tag5:{ type:String, default:"" },
            tag6:{ type:String, default:"" },
            tag7:{ type:String, default:"" },
        },
    ],
    priority:{
        type: String,
        enum:["High","Medium"],
        required:true,
        default:"Medium",
    },
    state:{
        type: String,
        default:""
    },
    city:{
        type: String,
        default:""
    },
    country:{
        type: String,
        default:""
    },
    concernedPersonContact:{
        type: String,
        default:"",
    },
    productCode: {
        type: String,
        default:""
    },
    serviceRaisedFrom: {
        type: String,
        default: ""
    },
    ticket_number: {
        type: String,
        required: true,
        default: "NA"
    },
    toolsProvided: {
        type: String,
        default: ""
    }
    // attachment: [
    //     {
    //         location:{ type: String, default: "NA" },
    //         bucket: { type: String, default: "NA" },
    //         key: { type: String, default: "NA" },
    //     }
    // ],
    
    
},
    { timestamps: true })

const servicesModel = mongoose.model('services', ServiceSchema)
module.exports = servicesModel
