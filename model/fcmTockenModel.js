const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const fcmTokenSchema = mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User" 
    },
    fcmToken: {
        type: String,
        required: true,
        default: ""
    },
    deviceIds:[String],
},
    { timestamps: true })

const fcmTokenModel = mongoose.model('fcm_token', fcmTokenSchema)
module.exports = fcmTokenModel
