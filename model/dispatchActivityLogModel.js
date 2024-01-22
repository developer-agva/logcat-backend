const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const dispatchActivitySchema = mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User" 
    },
    email: { 
        type: String,
        default:""
    },
    deviceId:{ 
        type: String,
        default:""
    },
        serial_no:{
            type: String,
            default:""
        },
        purpose:{ 
            type: String,
            default:""
        },
        concerned_person:{ 
            type: String,
            default:""
        },
        batch_no:{ 
            type: String,
            default:""
        },
        address:{ 
            type: String,
            default:""
        },
        date_of_dispatch:{ 
            type: String,
            default:""
        },
        hospital_name:{ 
            type: String,
            default:""
        },
        phone_number:{ 
            type: String,
            default:""
        },
        sim_no:{ 
            type: String,
            default:""
        },
        pincode:{ 
            type: String,
            default:""
        },
        distributor_name:{ 
            type: String,
            default:""
        },
        distributor_contact:{ 
            type: String,
            default:""
        },
        state:{ 
            type: String,
            default:""
        },
        city:{ 
            type: String,
            default:""
        },
        district:{ 
            type: String,
            default:""
        },
        date_of_warranty:{ 
            type: String,
            default:""
        },
        document_no:{ 
            type: String,
            default:""
        },
        concerned_person_email:{ 
            type: String,
            default:""
        },
        gst_number:{ 
            type: String,
            default:""
        },
        marketing_lead:{ 
            type: String,
            default:""
        },
        consinee:{ 
            type: String,
            default:""
        },
        consigneeAddress:{ 
            type: String,
            default:""
        },
        distributor_gst:{ 
            type: String,
            default:""
        },
},
    { timestamps: true })

const dispatchActivityLogModel = mongoose.model('dispatch_activity_log', dispatchActivitySchema)
module.exports = dispatchActivityLogModel;
