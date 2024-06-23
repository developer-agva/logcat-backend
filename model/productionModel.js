const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productionSchema = new mongoose.Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    dId: { type: Schema.Types.ObjectId, ref: "Device" },
    deviceId: { type: String, required: true, default: "" },
    purpose: { type: String, required: true, default: "" },
    simNumber: { type: String, required: true, default: "" },
    productType: { type: String, required: true, default: "" },
    batchNumber: { type: String, required: true, default: "" },
    iopr: { type: String, default: "" },
    serialNumber: { type: String, required: true, default: "" },
    manufacturingDate: {type: String, required: true, default: ""},
    dispatchDate: {type: String, required: true, default: ""},
    hospitalName: { type: String, default: "" },
    dateOfWarranty: { type: String, default: "" },
    address: { type: String, default: "" },
    hw_version: { type: String, default: "" },
    sw_version: { type: String, default: "" },
    displayNumber: { type: String, default: "" },
    turbineNumber: { type: String, default: "" },
    shipmentMode: {
        type: String,
        enum: ["req_doc","inprocess","awaiting_for_shipped","shipped"],
        default: ""
    },
    deviceflag: {
        type: String,
        default:""
    },
    qaDoneBy:{ type: String, default: "" },
    dataEnteredBy:{ type: String, default: "" },
    testingDoneBy:{ type: String, default: "" },
    partsIssuedBy:{ type: String, default: "" },
    return:{ type: Boolean, default:false },
    productCode:{
        type: String,
        default:""
    },

},
    { timestamps: true }
);

const productionModel = mongoose.model('production', productionSchema);

module.exports = productionModel;

