const path = require('path');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf, colorize } = format;

// Define a custom log format
const myFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
});

// Create a logger instance
const logger = createLogger({
    level: 'info', // Set the default log level
    format: combine(
        label({ label: 'dashweb' }), // Add a label to all logs
        timestamp(), // Add timestamps to logs
        myFormat // Use the custom format
    ),
    transports: [
        new transports.Console({ format: combine(colorize(), myFormat) }), // Log to console with colors
        new transports.File({ filename: path.join(__dirname, '..', 'logs', 'app.log') }) // Log to a file
    ]
});

// Export the logger for use in other parts of the app
module.exports = logger;