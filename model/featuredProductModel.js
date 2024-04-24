const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const productSchema = mongoose.Schema({
    product_name: { 
        type: String,
        default: ""
    },
    bg_color: { 
        type: String,
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
    type: {
        type:String,
        default: ""
    }
    
},
    { timestamps: true })


const featuredProductModel = mongoose.model('featured_product_collection', productSchema)
module.exports = featuredProductModel;
