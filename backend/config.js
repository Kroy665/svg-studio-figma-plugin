require('dotenv').config();
const path = require('path');

module.exports = {
  // Server configuration
  server: {
    port: process.env.PORT || 3456,
    host: process.env.HOST || 'localhost',
    env: process.env.NODE_ENV || 'development'
  },

  // Database configuration
  database: {
    path: path.resolve(__dirname, '..', process.env.DB_PATH || './storage/database/svg_studio.db'),
    options: {
      verbose: process.env.NODE_ENV === 'development' ? console.log : null,
      fileMustExist: false
    }
  },

  // Storage configuration
  storage: {
    maxSvgSize: parseInt(process.env.MAX_SVG_SIZE) || 524288, // 512KB
    maxUploadCount: parseInt(process.env.MAX_UPLOAD_COUNT) || 10
  },

  // Security configuration
  security: {
    allowedOrigins: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
      : ['http://localhost:*', 'https://www.figma.com']
  },

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    logPath: path.resolve(__dirname, '../storage/logs/app.log')
  },

  // Backup configuration
  backup: {
    enabled: process.env.BACKUP_ENABLED === 'true',
    retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS) || 7,
    backupDir: path.resolve(__dirname, '../storage/database/backups')
  }
};
