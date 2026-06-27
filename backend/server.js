const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const config = require('./config');
const logger = require('./utils/logger');

// Import routes
const shapesRoutes = require('./routes/shapes');
const categoriesRoutes = require('./routes/categories');

// Initialize Express app
const app = express();

// Middleware
app.use(helmet({
  contentSecurityPolicy: false // Allow plugin to load resources
}));

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or Figma plugins)
    if (!origin) return callback(null, true);

    // Check if origin is allowed
    const allowed = config.security.allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin.includes('*')) {
        const pattern = allowedOrigin.replace(/\*/g, '.*');
        return new RegExp(pattern).test(origin);
      }
      return allowedOrigin === origin;
    });

    if (allowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Request logging
app.use(logger.requestLogger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/shapes', shapesRoutes);
app.use('/api/categories', categoriesRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Server error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });

  res.status(err.status || 500).json({
    success: false,
    error: config.server.env === 'development' ? err.message : 'Internal server error'
  });
});

// Start server
const server = app.listen(config.server.port, config.server.host, () => {
  logger.info(`🚀 SVG Studio backend running`);
  logger.info(`📍 Server: http://${config.server.host}:${config.server.port}`);
  logger.info(`🗄️  Database: ${config.database.path}`);
  logger.info(`🌍 Environment: ${config.server.env}`);
  console.log('');
  console.log('Available endpoints:');
  console.log(`  GET    http://${config.server.host}:${config.server.port}/health`);
  console.log(`  GET    http://${config.server.host}:${config.server.port}/api/categories`);
  console.log(`  GET    http://${config.server.host}:${config.server.port}/api/shapes`);
  console.log(`  GET    http://${config.server.host}:${config.server.port}/api/shapes/:id`);
  console.log(`  POST   http://${config.server.host}:${config.server.port}/api/shapes`);
  console.log(`  PUT    http://${config.server.host}:${config.server.port}/api/shapes/:id`);
  console.log(`  DELETE http://${config.server.host}:${config.server.port}/api/shapes/:id`);
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(async () => {
    logger.info('Server closed');
    const prisma = require('./prisma');
    await prisma.$disconnect();
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(async () => {
    logger.info('Server closed');
    const prisma = require('./prisma');
    await prisma.$disconnect();
    process.exit(0);
  });
});

module.exports = app;
