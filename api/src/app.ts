import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './config';
import { swaggerOptions } from './config/swagger';
import { getCorsMiddleware } from './middleware/cors.middleware';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { logger } from './utils/logger';

// Import routes
import authRoutes from './routes/auth.routes';
import galleryRoutes from './routes/gallery.routes';
import homeRoutes from './routes/home.routes';
import testRoutes from './routes/test.routes';

const app = express();

// Trust proxy for rate limiting and IP detection
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));

// CORS middleware
app.use(getCorsMiddleware());

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ 
  limit: config.upload.maxFileSize,
  strict: true
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: config.upload.maxFileSize 
}));

// Global rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    success: false,
    error: {
      message: 'Too many requests from this IP, please try again later',
      code: 'RATE_LIMIT_EXCEEDED',
      timestamp: new Date().toISOString()
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('user-agent'),
      url: req.originalUrl,
      method: req.method
    });
    
    res.status(429).json({
      success: false,
      error: {
        message: 'Too many requests from this IP, please try again later',
        code: 'RATE_LIMIT_EXCEEDED',
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
        method: req.method
      }
    });
  }
});

app.use(globalLimiter);

// Swagger documentation setup
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Swagger UI endpoint
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Luxury Restaurant CMS API Documentation',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'none',
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    tryItOutEnabled: true
  }
}));

// Swagger JSON endpoint
app.get('/api/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: config.app.nodeEnv,
      uptime: process.uptime()
    }
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/home', homeRoutes);
app.use('/api/test', testRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    data: {
      name: 'Luxury Restaurant CMS API',
      version: '1.0.0',
      description: 'Backend API for managing restaurant content including gallery images and home page content',
      endpoints: {
        auth: {
          'POST /api/auth/login': 'Admin authentication',
          'POST /api/auth/refresh': 'Refresh access token',
          'GET /api/auth/profile': 'Get admin profile',
          'PUT /api/auth/password': 'Change password',
          'POST /api/auth/logout': 'Logout (client-side)',
          'POST /api/auth/verify': 'Verify token'
        },
        gallery: {
          'GET /api/gallery/images': 'Get all gallery images',
          'GET /api/gallery/images/featured': 'Get featured images',
          'GET /api/gallery/images/:id': 'Get single image',
          'POST /api/gallery/images': 'Upload new image (Admin)',
          'PUT /api/gallery/images/:id': 'Update image (Admin)',
          'DELETE /api/gallery/images/:id': 'Delete image (Admin)',
          'PATCH /api/gallery/images/reorder': 'Reorder images (Admin)'
        },
        home: {
          'GET /api/home/content': 'Get all home content',
          'GET /api/home/content/:section': 'Get content by section',
          'POST /api/home/content': 'Create content section (Admin)',
          'PUT /api/home/content/:section': 'Update content section (Admin)',
          'DELETE /api/home/content/:section': 'Delete content section (Admin)',
          'PATCH /api/home/content/:section/toggle': 'Toggle section status (Admin)',
          'GET /api/home/hero': 'Get hero section',
          'PUT /api/home/hero': 'Update hero section (Admin)'
        }
      },
      documentation: '/api/docs'
    }
  });
});

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;