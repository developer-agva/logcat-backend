const mongoose = require('mongoose')
const Schema = mongoose.Schema;


const appUpdateSchema = Schema({
    update_url: {
        type: String,
        default: ""
    },
    deviceId: {
        type: String,
        default: ""
    },
    update_status: {
        type: String,
        default: ""
    },
    update_version: {
        type: String,
        default: ""
    },
},
    { timestamps: true }
)

const appUpdateModel = mongoose.model('app_update', appUpdateSchema);
module.exports = appUpdateModel;


// 12584