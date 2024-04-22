const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const projectSchema = mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User" 
    },
    project_name: { 
        type: String,
        required:true,
        default: ""
    },
    project_description: { 
        type: String,
        required:true,
        default: ""
    },
    provide_device_type: {
        type: String,
        required: true,
        default: ""
    },
    project_code: {
        type: String,
        default: ""
    },
    image_url: {
        type: String,
        default: ""
    },
    
},
    { timestamps: true })


const projectModel = mongoose.model('project_colletion', projectSchema)
module.exports = projectModel
