const mongoose = require('mongoose');

const demoSalesSchema = new mongoose.Schema({
    userId:{
        type: String,
        default: "",
    },
    deviceId:{
        type: String,
        default: "",
    },
    contactNo:{
        type: String,
        default: "",
    },
    hospitalName:{
        type: String,
        default: "",
    },
    demoDuration:{
        type: String,
        default: "",
    },
    priority:{
        type: String,
        default: "",
    },
    status:{
        type: String,
        enum: ["Demo", "Sold"],
    },
    date:{
        type: String,
        default: "",
    },
    description:{
        type: String,
        default: "",
    },
    soldDate:{
        type: String,
        default: "", 
    },
    isExpired: {
        type: Boolean,
        default:false,   
    },
    amount:{
        type: String,
        default: ""
    },
    serialNo:{
        type: String,
        default: ""
    }
},{
    timestamps: true
})

const demoOrSalesModel = mongoose.model('demo_or_sales', demoSalesSchema);

module.exports = demoOrSalesModel;
