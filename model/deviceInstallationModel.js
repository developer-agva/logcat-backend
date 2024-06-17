const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const installationSchema = mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    deviceId: {
        type: String,
        default: "",
    },
    concernedPName: {
        type: String,
        default: "",
    },
    dateOfWarranty: {
        type: String,
        default: "",
    },
    hospitalName: {
        type: String,
        default: "",
    },
    address: {
        type: String,
        default: "",
    },
    location: {
        type: String,
        default: "",
    },
    key: {
        type: String,
        default: ""
    },
},
{ timestamps: true });

const installationModel = mongoose.model('device_installation_report', installationSchema);
module.exports = installationModel;
