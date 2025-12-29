const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const s3BucketInsSchema = mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User" 
    },
    deviceId: { 
        type: String,
        default:""
    },
    flag: {
        type: String,
        default: ""
    },
    fieldname: { 
        type: String,
        default:""
    },
    originalname: { 
        type: String,
        default:""
    },
    encoding: { 
        type: String,
        default:""
    },
    mimetype: { 
        type: String,
        default:""
    },
    size: { 
        type: String,
        default:""
    },
    bucket: { 
        type: String,
        default:""
    },
    key: { 
        type: String,
        default:""
    },
    acl: { 
        type: String,
        default:""
    },
    contentType: { 
        type: String,
        default:""
    },
    contentDisposition: { 
        type: String,
        default:""
    },
    contentEncoding: { 
        type: String,
        default:""
    },
    storageClass: { 
        type: String,
        default:""
    },
    serverSideEncryption: { 
        type: String,
        default:""
    },
    metadata: { 
        type: String,
        default:""
    },
    location: { 
        type: String,
        default:""
    },
    etag: { 
        type: String,
        default:""
    },
    versionId: { 
        type: String,
        default:""
    },

},
    { timestamps: true })

const s3BucketInsModel = mongoose.model('s3_bucket_installation', s3BucketInsSchema)
module.exports = s3BucketInsModel;
