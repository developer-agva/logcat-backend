const { 
    createLogger, 
    transports, 
    format 
} = require("winston");
require("winston-mongodb");
require("dotenv").config({ path: "./.env" });


const logger = createLogger({
    transports: [
        new transports.File({
            filename: 'info.log',
            level: 'info',
            format: format.combine(format.timestamp(), format.json())
        }),
        new transports.MongoDB({
            level: 'error',
            db: process.env.MONGO_URI,
            options: { useUnifiedTopology: true },
            collection: 'logger_collection',
            format: format.combine(format.timestamp(), format.json())
        })
    ]
});

module.exports = logger;