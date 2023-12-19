
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
        
        const ventilatorfinal_collectionSchema = new mongoose.Schema(
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

        ventilatorfinal_collectionSchema.index({'type': 1})
                
        const ventilatorfinal_collection = mongoose.model('ventilatorfinal_collection', ventilatorfinal_collectionSchema)
        
        module.exports = ventilatorfinal_collection
        