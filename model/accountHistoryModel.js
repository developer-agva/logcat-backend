const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const accountsHistorySchema = mongoose.Schema({
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
    batchNo: { 
        type: String,
        default:""
    },
    manufacturingDate: {
        type: String,
        default: ""
    },
    invoiceNo: {
        type: String,
        default: ""
    },
    ewaybillNo: {
        type: String,
        default: ""
    },
    invoicePdf:{
        type: String,
        default:""
    },
    ewaybillPdf:{
        type: String,
        default: ""
    },
    billedTo: {
        type: String,
        default: ""
    },
    consinee: {
        type: String,
        default: ""
    },
    consigneeAddress: {
        type: String,
        default: ""
    },
    document_ref_no: {
        type: String,
        default: ""
    },
    irn:{
        type: String,
        default: ""
    },
    ackNo:{
        type: String,
        default:""
    },
    ackDate:{
        type: String,
        default:""
    }

},
    { timestamps: true })

const accountsHistoryModel = mongoose.model('account_history', accountsHistorySchema)
module.exports = accountsHistoryModel;
