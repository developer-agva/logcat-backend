const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const verificationSchema = mongoose.Schema({
    email: {                   // new added 25oct
        type: String,
        default: ""
    },
    otp: {                // new added 25oct
        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: ["Verified", "Notverified"],
        default: "",
    },
},
    { timestamps: true })

const emailVerificationModel = mongoose.model('email_verification', verificationSchema)
module.exports = emailVerificationModel;
