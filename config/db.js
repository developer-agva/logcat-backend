const mongoose = require('mongoose');

const connectDB = async () => { 
    try {
        await mongoose.connect(process.env.MONGO_URI); // Removed unused options
        console.log("MongoDB connection SUCCESS!");
    } catch (error) {
        console.error("MongoDB connection FAILED!", error);
        process.exit(1); // Exit with error code
    }
};

module.exports = connectDB;
