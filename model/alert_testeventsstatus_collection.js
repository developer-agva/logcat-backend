
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
        
        const alert_testeventsstatus_collectionSchema = new mongoose.Schema(
            {
              did:  {
                type: String,
                required: [true, "Device id is required."],
                // validate: {
                //     validator: function (v) {
                //     return /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})|([0-9a-fA-F]{4}\.[0-9a-fA-F]{4}\.[0-9a-fA-F]{4})$/.test(
                //         v
                //     );
                //     },
                //     message: "{VALUE} is not a valid device id.",
                // },
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
                      type: Date,
                      required: [true, 'Date time is required']
                    }
                },
                priority:{
                  type:String,
                  required:[true,'priority is required']
                },
                date:{
                  type:Date,
                  required:[true,'Date time is required']
                },
                state:{
                  type:String,
                  required:[true,'state is required']
                }


            },
            schemaOptions
        )

        alert_testeventsstatus_collectionSchema.index({'type': 1})
                
        const alert_testeventsstatus_collection = mongoose.model('alert_testeventsstatus_collection', alert_testeventsstatus_collectionSchema)
        
        module.exports = alert_testeventsstatus_collection
        