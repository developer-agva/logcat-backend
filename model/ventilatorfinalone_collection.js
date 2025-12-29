
    const mongoose = require('mongoose');
    const device = require('./device')
    const logs = require('./logs')
    
        const schemaOptions = {
            timestamps: true,
            toJSON: {
                virtuals: false
            },
            toObject: {
                virtuals: false
            }
        }
        
        const ventilatorfinalone_collectionSchema = new mongoose.Schema(
            {
                did:{
                  type:String,
                  required:[true,'deviceId is required.']
                },
                version: {
                    type: String,
                    required: [true, 'Log version is required.']
                },
                type: {
                  type: String,
                  enum: ["001","002"],
                  required: [true, "Atleast one model required."]
                },
                device:{ type: mongoose.Schema.Types.ObjectId, ref: 'Device' },
                log:logs
            },
            schemaOptions
        )

        ventilatorfinalone_collectionSchema.index({'type': 1})
                
        const ventilatorfinalone_collection = mongoose.model('ventilatorfinalone_collection', ventilatorfinalone_collectionSchema)
        
        module.exports = ventilatorfinalone_collection
        