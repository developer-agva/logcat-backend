const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const hospitalSchema = mongoose.Schema({
    Hospital_Name: { 
        type: String,
        required: true 
    },
    Hospital_Address: { 
        type: String,
        required:true,
    },
    Country: { 
        type: String,
        required:true,
    },
    State: { 
        type: String,
        required:true,
    },
    City: {
        type: String,
        required: true,
    },
    District: {
        type: String,
        required: true,
    },
    Pincode: {
        type: String,
        required: true,
    },
    
},
    { timestamps: true })

const registeredHospitalModel = mongoose.model('registered_hospital', hospitalSchema)
module.exports = registeredHospitalModel
