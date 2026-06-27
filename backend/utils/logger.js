const fs = require('fs');
const path = require('path');
const config = require('../config');

// Ensure log directory exists
const logDir = path.dirname(config.logging.logPath);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Log levels
const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

const currentLevel = LOG_LEVELS[config.logging.level] || LOG_LEVELS.info;

/**
 * Format log message
 */
function formatMessage(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}\n`;
}

/**
 * Write to log file
 */
function writeToFile(message) {
  try {
    fs.appendFileSync(config.logging.logPath, message, 'utf8');
  } catch (error) {
    console.error('Failed to write to log file:', error);
  }
}

/**
 * Log functions
 */
function error(message, meta = {}) {
  if (currentLevel >= LOG_LEVELS.error) {
    const formatted = formatMessage('error', message, meta);
    console.error(formatted.trim());
    writeToFile(formatted);
  }
}

function warn(message, meta = {}) {
  if (currentLevel >= LOG_LEVELS.warn) {
    const formatted = formatMessage('warn', message, meta);
    console.warn(formatted.trim());
    writeToFile(formatted);
  }
}

function info(message, meta = {}) {
  if (currentLevel >= LOG_LEVELS.info) {
    const formatted = formatMessage('info', message, meta);
    console.log(formatted.trim());
    writeToFile(formatted);
  }
}

function debug(message, meta = {}) {
  if (currentLevel >= LOG_LEVELS.debug) {
    const formatted = formatMessage('debug', message, meta);
    console.log(formatted.trim());
    writeToFile(formatted);
  }
}

/**
 * Express middleware for request logging
 */
function requestLogger(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const message = `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`;

    if (res.statusCode >= 500) {
      error(message);
    } else if (res.statusCode >= 400) {
      warn(message);
    } else {
      info(message);
    }
  });

  next();
}

module.exports = {
  error,
  warn,
  info,
  debug,
  requestLogger
};
