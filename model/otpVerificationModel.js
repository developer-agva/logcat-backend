const mongoose = require('mongoose')
// const Schema = mongoose.Schema;

const otpSchema = mongoose.Schema({
    contactNumber: {
        type: String,
        required: true,
        default: "",
    },
    otp: {
        type: String,
        required: true,
        default: "",
    },
    isVerified: {
        type: Boolean,
        required:true,
        default:false,
    },

},
    { timestamps: true })

const otpVerificationModel = mongoose.model('otp_verification', otpSchema)
module.exports = otpVerificationModel
