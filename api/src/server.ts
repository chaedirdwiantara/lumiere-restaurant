import app from './app';
import { config } from './config';
import { logger } from './utils/logger';
import { supabase } from './config/supabase';
import { initializeStorageBuckets } from './config/database';

/**
 * Test database connection
 */
async function testDatabaseConnection(): Promise<void> {
  try {
    const { data, error } = await supabase
      .from('admins')
      .select('count')
      .limit(1);
    
    if (error) {
      throw error;
    }
    
    logger.info('Database connection successful');
  } catch (error) {
    logger.error('Database connection failed', { error });
    throw error;
  }
}

/**
 * Start the server
 */
async function startServer(): Promise<void> {
  try {
    // Test database connection
    await testDatabaseConnection();
    
    // Initialize storage buckets
    await initializeStorageBuckets();
    
    // Start the server
    const server = app.listen(config.app.port, () => {
      logger.info('Server started successfully', {
        port: config.app.port,
        environment: config.app.nodeEnv,
        cors: config.cors.allowedOrigins,
        timestamp: new Date().toISOString()
      });
      
      console.log(`
🚀 Luxury Restaurant CMS API Server Running!

📍 Server URL: http://localhost:${config.app.port}
🌍 Environment: ${config.app.nodeEnv}
📚 API Documentation: http://localhost:${config.app.port}/api
🏥 Health Check: http://localhost:${config.app.port}/health

🔐 Authentication Endpoints:
   POST /api/auth/login
   POST /api/auth/refresh
   GET  /api/auth/profile

🖼️  Gallery Endpoints:
   GET  /api/gallery/images
   POST /api/gallery/images (Admin)
   PUT  /api/gallery/images/:id (Admin)

🏠 Home Content Endpoints:
   GET  /api/home/content
   PUT  /api/home/content/:section (Admin)
   GET  /api/home/hero

🔧 CORS Origins: ${config.cors.allowedOrigins.join(', ')}
      `);
    });

    // Graceful shutdown
    const gracefulShutdown = (signal: string) => {
      logger.info(`Received ${signal}, shutting down gracefully`);
      
      server.close(() => {
        logger.info('Server closed successfully');
        process.exit(0);
      });
      
      // Force close after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception', { 
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      });
      process.exit(1);
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection', { 
        reason: reason instanceof Error ? {
          name: reason.name,
          message: reason.message,
          stack: reason.stack
        } : reason,
        promise: promise.toString()
      });
      process.exit(1);
    });
    
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

// Start the server
startServer();