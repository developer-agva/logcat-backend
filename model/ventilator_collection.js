
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
        
        const ventilator_collectionSchema = new mongoose.Schema(
            {
                did:{
                    type:String,
                    required:[true,'Device id is required.']

                },
                date:{
                    type:String,
                    required:[true,'Date is required']
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
                device:{ type:String, 
                  ref: 'did' },
                log:logs,
                // state:{
                //   type:String,
                //   required:[true,"state is required"]
                // },
                
            },
         
            schemaOptions
        )

        ventilator_collectionSchema.index({'type': 1})
                
        const ventilator_collection = mongoose.model('ventilator_collection', ventilator_collectionSchema)
        
        module.exports = ventilator_collection
        