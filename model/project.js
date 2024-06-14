const mongoose = require('mongoose')

const projectSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Project name is required.']
    },
    code: {
        type: String,
        required: [true, 'Project code is required.']
    },
    description: {
        type: String
    },
    device_types: {
        type: [Object],
        required: [true, 'At least one device type is required.']
    },
    collection_name: {
        type: String,
        unique:true,
        required: [true, 'Collection name is required.']
    },
    alert_collection_name:{
        type:String,
        unique:true,
        required:[true,'Alert collection name require']
    },
    event_collection_name:{
        type:String,
        unique:true,
        required:[true,'event collection name is require']
    },
    trends_collection_name:{
        type:String,
        unique:true,
        required:[true,'trends collection name is require']
    },
    reportEmail: {
        type: [Object],
        // unique:true,
        // required: [true, 'Collection name is required.']
    },
    address:{
        type: String, required:true, 
        default: ""
    },
    status: {
        type: Boolean,
        default: true
    }
}, {timestamps:true})

const project = mongoose.model('Project',projectSchema)

module.exports = project;