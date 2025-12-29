
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

const alert_ventilator_collection_backupSchema = new mongoose.Schema(
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

alert_ventilator_collection_backupSchema.index({'type': 1})
        
const alert_ventilator_collection_backup = mongoose.model('alert_ventilator_collection_backup', alert_ventilator_collection_backupSchema)

module.exports = alert_ventilator_collection_backup
