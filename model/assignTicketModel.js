const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const ticketSchema = mongoose.Schema({
    userId: {
        type: String,
        default: ""
    },
    deviceId:{
        type: String,
        default:""
    },
    ticket_number: { 
        type: String,
        default: ""
    },
    ticket_owner: { 
        type: String,
        default:""
    },
    status: {
        type: String,
        enum: ["Pending", "Not-Done", "Completed"],
        default: "Pending",
    },
    ticket_status: {
        type: String,
        enum: ["Open", "Re-Open", "Close"],
    },
    priority: {
        type: String,
        enum: ["Critical", "Medium"],
        default: "",
    },
    hospital_name: { 
        type: String,
        default:""
    },
    concerned_p_name: {                   // new added 25oct
        type: String,
        default:""
    },
    concerned_p_email: {                   // new added 25oct
        type: String,
        default:""
    },
    concerned_p_contact: { 
        type: String,
        default:""
    },
    details: {
        type: String,
        default:""
    },
    service_engineer: {
        type: String,
        default:""
    },
    issues: {
        type: String,
        default:""
    },
    address: {
        type: String,
        default: ""
    },
    // new requirements
    pincode: {                 // new added 25oct
        type: String,
        default: ""
    },
    dept_name: {                   // new added 25oct
        type: String,
        default: ""
    },
    waranty_status: {                // new added 25oct
        type: String,
        default: ""
    },
    serialNumber: {
        type: String,
        default: ""
    },
    tag: {                      // new added 26oct
        type: String,
        default: "",
        required: true,
    },
    isFeedback: {
        type: String,
        enum: ["Submitted","Not-Submitted","Submitted-Without-Feedback"],
        default: "Not-Submitted",
    },

},
    { timestamps: true })

const assignTicketModel = mongoose.model('assign_ticket', ticketSchema)
module.exports = assignTicketModel;
