const mongoose = require('mongoose');
// define schema options

const alert_ventilator_schemaV2 = new mongoose.Schema({
    did: { 
        type: String, 
        required: true, 
        default: "" 
    },
    type: {
        type: String,
        enum: ["003","004","005", "006", "007"],
        required: [true, "type is required."]
    },
    ack:{
        msg: String,
        code: {
          type: String,
          required: [true, 'Code is required']
        },
        date: {
          type: String,
          required: [true, 'Date time is required']
        },
    },
    priority:{
        type:String,
        default: "",
    },
   
},
    { timestamps: true }
);

alert_ventilator_schemaV2.index({'type': 1})

const alert_ventilator_collectionV2 = mongoose.model('alert_ventilator_collection_v2', alert_ventilator_schemaV2);

module.exports = alert_ventilator_collectionV2;

