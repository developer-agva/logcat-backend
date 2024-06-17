const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    userId:{
        type: String,
        default: "",
    },
    amount:{
        type: String,
        default: ""
    },
    date: {
        type: String,
        required: true,
    },
    description:{
        type: String,
        default: ""
    },
    time:{
        type: String,
        default: ""
    },
    isAvlBill:{
        type: String,
        default: ""
    }
},{
    timestamps: true
})

const expenseModel = mongoose.model('expense',expenseSchema);

module.exports = expenseModel;
