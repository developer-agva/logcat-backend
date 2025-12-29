const { duration } = require("moment");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const dataSchema = mongoose.Schema({
    today: [{
        duration: { type: String, required: true },
        count: { type: Number, default: 0 }
    }],
    monthly: [{
        duration: { type: String, required: true },
        count: { type: Number, default: 0 }
    }],
    weekly: [{
        duration: { type: String, required: true },
        count: { type: Number, default: 0 }
    }],
    yearly: [{
        duration: { type: String, required: true },
        count: { type: Number, default: 0 }
    }]
},{ timestamps: true })