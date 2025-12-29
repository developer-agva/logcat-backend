const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const activitySchema = mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User" 
    },
    email: { 
        type: String,
        default:""
    },
    action: { 
        type: String,
        default:""
    },
    msg: { 
        type: String,
        default:""
    },

},
    { timestamps: true })

const activityModel = mongoose.model('user_activity', activitySchema)
module.exports = activityModel;
