const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const prodActivitySchema = mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User" 
    },
    email: { 
        type: String,
        default:""
    },
    action: { 
        type: String,
        default:""
    },
    deviceId:{ 
        type: String,
        default:""
    },
            simNumber: { 
                type: String,
                default:""
            },
            productType: { 
                type: String,
                default:""
            },
            batchNumber: { 
                type: String,
                default:""
            },
            iopr: { 
                type: String,
                default:""
            },
            serialNumber: { 
                type: String,
                default:""
            },
            manufacturingDate: { 
                type: String,
                default:""
            },
            dispatchDate : { 
                type: String,
                default:""
            },
            hospitalName: { 
                type: String,
                default:""
            },
            dateOfWarranty: { 
                type: String,
                default:""
            },
            address: { 
                type: String,
                default:""
            },
            hw_version: { 
                type: String,
                default:""
            },
            sw_version: { 
                type: String,
                default:""
            },
            displayNumber: { 
                type: String,
                default:""
            },
            turbineNumber: { 
                type: String,
                default:""
            },
            qaDoneBy:{ 
                type: String,
                default:""
            },
            dataEnteredBy:{ 
                type: String,
                default:""
            },
            testingDoneBy:{ 
                type: String,
                default:""
            },
            partsIssuedBy:{ 
                type: String,
                default:""
            },

},
    { timestamps: true })

const prodActivityLogModel = mongoose.model('production_activity_log', prodActivitySchema)
module.exports = prodActivityLogModel;
