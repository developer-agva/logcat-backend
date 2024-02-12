
const mongoose = require('mongoose');

const event_ventilator_collectionSchema = new mongoose.Schema(
    {
        did:  {
            type: String,
            required: [true, "Device id is required."],
        },
        type: {
          type: String,
           enum: ["003","004"],
          required: [true, "product code is required."]
        },
        message:{
          type:String,
          required:[true,"message is required"]
        },
        date:{
          type:String,
          required:[true,"Date time is required"]
        }
    },
    { timestamps: true }
)
        
const event_ventilator_collection_v2 = mongoose.model('event_ventilator_collection_v2', event_ventilator_collectionSchema)

module.exports = event_ventilator_collection_v2
