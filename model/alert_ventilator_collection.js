
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
        
        const alert_ventilator_collectionSchema = new mongoose.Schema(
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
            schemaOptions
        )

        alert_ventilator_collectionSchema.index({'type': 1})
                
        const alert_ventilator_collection = mongoose.model('alert_ventilator_collection', alert_ventilator_collectionSchema)
        
        module.exports = alert_ventilator_collection
        