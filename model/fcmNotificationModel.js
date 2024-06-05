const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const fcmNotificationSchema = new Schema({
    notification:{
        title:{
            type: String,
            required: true,
        },
        body:{
            type: String,
            required: true,
        },
    },
    data:{
        screen:{
            type: String,
            default: "",
        }
    },
    token:{
        type: String,
        required: true,
    }
},{timestamps: true});

const fcmNotificationModel = mongoose.model('fcm_notification_collection', fcmNotificationSchema);
module.exports = fcmNotificationModel;