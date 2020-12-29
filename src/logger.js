const { createLogger, transports, format} = require("winston");
require("winston-mongodb");

const logger = createLogger({
    transports: [
        new transports.File({
            filename: "info.log",
            format: format.combine(format.timestamp(), format.json())
        }),
        new transports.MongoDB({
            db: process.env.MONGODB_URL,
            collection: "logs",
            options: { useUnifiedTopology: true },
            format: format.combine(format.timestamp(), format.json())
        })
    ]
})

module.exports = logger;