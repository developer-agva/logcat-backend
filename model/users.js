const { array } = require('joi')
const mongoose = require('mongoose')


const userSchema = mongoose.Schema({
    firstName:{
        required:[true, "First name is required"],
        type: String
    },
    lastName:{
        required:[true, "Last name is required"],
        type: String
    },
    email:{
        type:String,
        unique: true,
        required:[true,'Email address is required'],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    hospitalName:{
        type: String,
        default: "",
    },
    designation:{
        type: String,
        default: "",
    },
    contactNumber: {
        type: String,
        default: "",
    },
    department:{
        type:String,
        default:"",
    },
    passwordHash:{
        required: true,
        type:String
    },
    image:{
        type:String,
        default:null
    },
    userType:{
        type: String,
        required:true,
        enum:["User", "Admin", "Super-Admin", "Dispatch", "Production", "Support", "Service-Engineer","Nurse","Hospital-Admin"],
    },
    isSuperAdmin:{
        type:Boolean,
        default: false
    },
    accountStatus:{
        type: String,
        enum: ["Active", "Inactive", "Initial"],
        required:true,
        default:"Initial"
    },
    otp:{
        type: String,
        default:""
    },
    countryName:{
        type: String,
        default:"",
    },
    stateName:{
        type: String,
        default:"",
    },
    userStatus:{
        type: String,
        enum: ["Active", "Inactive", "On-leave"],
        required:true,
        default:"Active"
    },
    lastLogin:{
        type: String,
        default: "",
    },
    requestedOn:{
        type: String,
        default:"",
    },
    speciality:{
        type: String,
        default:"",
    },
    profile:[{
        userId:{type:mongoose.Types.ObjectId, ref:"User"},
        associationName:{type:String, default:""},
        workAddress:{type:String, default:""},
        startDate:{type:String, default:""},
        endDate:{type:String, default:""},
        workEmail:{type:String, default:""},
        workPhoneNo:{type:String, default:""},
        designation:{type:String, default:""},
        department:{type:String, default:""},
        workType:{type:String, default:""},
        skills:{type:String, default:""},
    }],
    employeeId: {
        type : String,
        default: "",
    },
}, {timestamps: true})

const User = mongoose.model('User',userSchema)


module.exports = User
