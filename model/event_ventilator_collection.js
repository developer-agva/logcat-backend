
    const mongoose = require('mongoose');
    
        const schemaOptions = {
            timestamps: true,
            toJSON: {
                virtuals: false
            },
            toObject: {
                virtuals: false
            }
        }
        
        const event_ventilator_collectionSchema = new mongoose.Schema(
            {
              did:  {
                type: String,
                required: [true, "Device id is required."],
                
              },
              type: {
                type: String,
                enum: ["001","002"],
                required: [true, "Atleast one model required."]
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
            schemaOptions
        )

        event_ventilator_collectionSchema.index({'type': 1})
                
        const event_ventilator_collection = mongoose.model('event_ventilator_collection', event_ventilator_collectionSchema)
        
        module.exports = event_ventilator_collection
        