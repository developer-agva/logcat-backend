const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const appHistorySchema = mongoose.Schema({
    project_code: {
        type: String,
        default: ""
    },
    app_url: {
        type: String,
        default: ""
    },
    version: {
        type: String,
        default:""
    },
    dateTime: {
        type: String,
        default:""
    },
    
},
    { timestamps: true })


const appHistorytModel = mongoose.model('app_history', appHistorySchema)
module.exports = appHistorytModel
