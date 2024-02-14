const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const feedbackSchema = mongoose.Schema({
    name: {
        type: String,
        default:"" 
    },
    email: { 
        type: String,
        default:""
    },
    ratings: { 
        type: String,
        default:""
    },
    message: { 
        type: String,
        default:""
    },
    ticket_number: {
        type: String,
        default: ""
    },
    concerned_p_contact: {
        type: String,
        default: "",
    },

},
    { timestamps: true })

const feedbackModel = mongoose.model('feedback', feedbackSchema)
module.exports = feedbackModel;
