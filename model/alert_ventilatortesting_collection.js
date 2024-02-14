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
        
        const alert_ventilatortesting_collectionSchema = new mongoose.Schema(
            {
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

        alert_ventilatortesting_collectionSchema.index({'type': 1})
                
        const alert_ventilatortesting_collection = mongoose.model('ventilator_collectiontesting', alert_ventilatortesting_collectionSchema)
        
        module.exports = alert_ventilatortesting_collection