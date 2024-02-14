const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const tempModelSchema = mongoose.Schema({
    
},
    { timestamps: true })

const tempNotificationModel = mongoose.model('temp_notification', tempModelSchema)
module.exports = tempNotificationModel;
