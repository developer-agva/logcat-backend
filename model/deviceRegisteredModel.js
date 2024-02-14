const mongoose = require('mongoose')

const RegisterDeviceSchema = mongoose.Schema({
    DeviceId:{
        required:[true, "did is required"],
        type: String
    },
    AliasName:{
        required:[true,'AliasName is required'],
        type:String

    },
    IMEI_NO:{
        required:[true,"IMEI_NO is required"],
        type:String
    },
    Hospital_Name:{
        required:[true,"Hospital Name is required"],
        type:String

    },
    Ward_No:{
        required:[true,"Ward Number is required"],
        type:String

    },
    Ventilator_Operator:{
        required:[true,"Ventilator Operator name is required"],
        type:String
    },
    
    Doctor_Name:{
        required:[true,"Doctor Name is required"],
        type:String
    },

}, {timestamps: true})

const RegisterDevice = mongoose.model('RegisterDevice',RegisterDeviceSchema)


module.exports = RegisterDevice
