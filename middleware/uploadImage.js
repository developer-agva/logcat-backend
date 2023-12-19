const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client } = require("@aws-sdk/client-s3");

// Create s3 instance using S3Client
// (this is how we create s3 instance in v3)

const s3 = new S3Client({
    credentials: {
        accessKeyId: "YOUR_ACCESS_KEY_ID_HERE", 
        secretAccessKey: "YOUR_SECRET_KEY_HERE"
    },
    region: "ap-south-1"
});

const s3Storage = multerS3({
    s3: s3, // s3 instance
    bucket: "my-images",
    acl: "public-read", // storage access type
    metadata: (req, file, cb) => {
        cb(null, {fieldname: file.fieldname})
    },
    key: (req, file, cb) => {
        const fileName = Date.now() + "_" + file.fieldname + "_" + file.originalname;
        cb(null, fileName);
    }
});

// Sanitize file while uploading image
function sanitizeFile(file, cb) {
    // Define the allowed extension
    const fileExts = [".png", ".jpg", ".jpeg", ".gif"];

    // Check allowed extensions
    const isAllowedExt = fileExts.includes(
        path.extname(file.originalname.toLowerCase())
    );

    const isAllowedMimeType = file.mimetype.startsWith("image/");

    if (isAllowedExt && isAllowedMimeType) {
        return cb(null, true); // no errors
    } else {
        // pass error msg to callback, which can be displaye in frontend
        cb("Error: File type not allowed!");
    }
}

// Our middleware function

const uploadImage = multer({
    storage: s3Storage,
    fileFilter: (req, file, callback) => {
        sanitizeFile(file, callback)
    },
    limits: {
        fileSize: 1024 * 1024 * 2 // 2mb
    }
})


module.exports = uploadImage









