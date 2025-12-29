/**
 * Logger Configuration
 * Winston logger setup for the framework
 */

const winston = require('winston');
const path = require('path');
const fs = require('fs-extra');

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom format for console logging
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message }) => {
    return `${timestamp} ${level}: ${message}`;
  })
);

// Custom format for file logging
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message }) => {
    return `${timestamp} [${level.toUpperCase()}] ${message}`;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  transports: [
    // Console transport
    new winston.transports.Console({
      format: consoleFormat
    }),
    // File transport - All logs
    new winston.transports.File({
      filename: path.join(logsDir, 'test-execution.log'),
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // File transport - Error logs only
    new winston.transports.File({
      filename: path.join(logsDir, 'errors.log'),
      level: 'error',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

/**
 * Log test start
 * @param {string} testName - Name of the test
 */
logger.testStart = function(testName) {
  this.info('═══════════════════════════════════════════════════════════');
  this.info(`🧪 TEST START: ${testName}`);
  this.info('═══════════════════════════════════════════════════════════');
};

/**
 * Log test end
 * @param {string} testName - Name of the test
 * @param {string} status - Test status (PASSED/FAILED)
 */
logger.testEnd = function(testName, status) {
  const emoji = status === 'PASSED' ? '✅' : '❌';
  this.info('───────────────────────────────────────────────────────────');
  this.info(`${emoji} TEST ${status}: ${testName}`);
  this.info('═══════════════════════════════════════════════════════════');
  this.info('');
};

/**
 * Log step
 * @param {string} step - Step description
 */
logger.step = function(step) {
  this.info(`   ▶ ${step}`);
};

/**
 * Log action
 * @param {string} action - Action description
 */
logger.action = function(action) {
  this.info(`   ➤ ${action}`);
};

/**
 * Log verification
 * @param {string} verification - Verification description
 */
logger.verify = function(verification) {
  this.info(`   ✓ ${verification}`);
};

/**
 * Log separator
 */
logger.separator = function() {
  this.info('═══════════════════════════════════════════════════════════');
};

/**
 * Log sub-separator
 */
logger.subSeparator = function() {
  this.info('───────────────────────────────────────────────────────────');
};

module.exports = logger;
