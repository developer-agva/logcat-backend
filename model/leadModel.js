const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const leadSchema = mongoose.Schema({
    leadId: { 
        type: String,
        default:""
    },
    hospitalName: { 
        type: String,
        default:""
    },
    email: {
        type: String,
        default: "" 
    },
    contact: { 
        type: String,
        default:""
    },
    leadSource: { 
        type: String,
        default:""
    },
    dealerName: { 
        type: String,
        default:""
    },
    address: { 
        type: String,
        default:""
    },
    state: { 
        type: String,
        default:""
    },
    city: { 
        type: String,
        default:""
    },
    pincode: { 
        type: String,
        default:""
    },
    deviceId: { 
        type: String,
        default:""
    },
    type: { 
        type: String,
        default:""
    },
    visitingCardImageUrl:{
        type: String,
        default: ""
    },
    concernPersonName:{
        type: String,
        default: ""
    },
    concernPersonContact:{
        type: String,
        default: ""
    },
    leadAddedDate:{
        type: String,
        default: ""
    },
    leadStage:{
        type: String,
        default: "Initial"
    },
    scheduledDemo:[{
        deviceType: { type: String, default:"" },
        contactPerson: { type: String, default: "" }, 
        demoDate: { type: String, default: "" },
    }],
    dispatchDemo:[{
       dispatchedFrom:{ type: String, default: "" },
       serialNumbers: [{ type: String, default: "" }],
       deviceIds: [{ type: String, default: "" }],
       docketNo: { type: String, default: "" },
       deliveryNoteImageUrl: { type: String, default: "" },
       expectedDeliveryDate: { type: String, default: "" },
       deliveringVia: { type: String, default: "" },
    }],
    completedDemo:[{ 
        feedBack: { type: String, default: "" },
        feedBackReportImageUrl: { type: String, default: "" },
        expectedSalesDate: { type: String, default: "" },
        amountQuoted: { type: String, default: "" },
        expectedClosingAmount: { type: String, default: "" },
    }],
    leadType:{
        type: String,
        enum: ["HOT LEADS", "WARM LEADS", "COLD LEADS"],
        default: "COLD LEADS"
    },
    leadStatus: {
        type: String,
        default: "Active"
    },
    sales: [
        {
            poImageUrl: { type: String, default: "" },
            totalAmount: { type: String, default: "" },
            expectedDeliveryDate: { type: String, default: "" },
            accessories: { type: String, default: "" },
            paymentTerms: { type: String, default: "" },
            remark: { type: String, default: "" },
            warrantyDuration: { type: String, default: "" },
            paymentType: { type: String, default: "" },
            salesStatus: { type: String, default: "Pending" },
            advanceAmount: { type: String, default: "" },
            paymentProof: { type: String, default: "" },
            commitedDeliveryDate: { type: String, default: "" },
            scheduleOfPayment: { type: String, default: "" },
            remainingAmount: { type: String, default: "" },
            addedDate: { type: String, default: "" }
        }
    ],
    dispatchSalesDevice:[{
        serialNumbers: [{ type: String, default: "" }],
        deviceIds: [{ type: String, default: "" }],
        deliveringVia: { type: String, default: "" },
        docketNo: { type: String, default: "" },
        deliveryNoteImageUrl: { type: String, default: "" },
        expectedDeliveryDate: { type: String, default: "" },
        invoiceNumber: { type: String, default: "" },
        addedDate: { type: String, default: "" }
    }],
    paymentUpdates:[{
        serialNumbers: [{ type: String, default: "" }],
        deviceIds: [{ type: String, default: "" }],
        totalAmount: { type: String, default: "" },
        advanceAmount: { type: String, default: "" },
        remainingAmount: { type: String, default: "" },
        paymentReceived: { type: String, default: "0" },
        paymentTerms: { type: String, default: "" },
        paymentMode: { type: String, default: "" },
        paymentImageUrl: { type: String, default: "" },
        nextExpectedPaymentDate: { type: String, default: "" },
        addedDate: { type: String, default: "" }
    }],

},
    { timestamps: true })

const leadModel = mongoose.model('track_lead', leadSchema)
module.exports = leadModel;

