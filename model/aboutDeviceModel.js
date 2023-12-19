const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const aboutSchema = mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User" 
    },
    dId: {
        type: Schema.Types.ObjectId,
        ref: "RegisterDevice"
    },
    deviceId: { 
        type: String,
        required: true 
    },
    product_type: { 
        type: String,
        required:true,
        default:""
    },
    serial_no: { 
        type: String,
        required:true,
        default:""
    },
    purpose: { 
        type: String,
        required:true,
        default:""
    },
    concerned_person: { 
        type: String,
        required:true,
        default:""
    },
    batch_no: { 
        type: String,
        required:true,
        default:""
    },
    date_of_manufacturing: { 
        type: String,
        required:true,
        default:""
    },
    address: { 
        type: String,
        required:true,
        default:""
    },
    date_of_dispatch: { 
        type: String,
        required:true,
        default:""
    },
    date_of_warranty: {
        type: String,
        default: "",
    },
    hospital_name: { 
        type: String,
        required:true,
        default:""
    },
    phone_number: { 
        type: String,
        required:true,
        default:""
    },
    sim_no: { 
        type: String,
        required:true,
        default:""
    },
    pincode: { 
        type: String,
        required:true,
        default:""
    },
    distributor_name: { 
        type: String,
        default:""
    },
    distributor_contact: { 
        type: String,
        default:""
    },
    state:{
        type: String,
        default: "",
    },
    city: {
        type: String,
        default: "",
    },
    district: {
       type: String,
       default: "",
    },
    document_no: {
        type: String,
        default: "",
    },

},
    { timestamps: true })

const aboutDeviceModel = mongoose.model('about_device', aboutSchema)
module.exports = aboutDeviceModel
