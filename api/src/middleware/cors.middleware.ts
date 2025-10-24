import cors from 'cors';
import { config } from '../config';
import { logger } from '../utils/logger';

/**
 * CORS configuration for the API
 */
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = config.cors.allowedOrigins;
    
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      logger.warn('CORS blocked request from origin', { origin });
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: config.cors.credentials,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma'
  ],
  exposedHeaders: [
    'X-Total-Count',
    'X-Page-Count',
    'X-Current-Page',
    'X-Per-Page'
  ],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
};

/**
 * CORS middleware with custom configuration
 */
export const corsMiddleware = cors(corsOptions);

/**
 * Development CORS middleware (more permissive)
 */
export const devCorsMiddleware = cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: '*',
  exposedHeaders: '*'
});

/**
 * Get appropriate CORS middleware based on environment
 */
export const getCorsMiddleware = () => {
  const nodeEnv = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';
  
  if (nodeEnv === 'development') {
    logger.info('Using development CORS configuration (permissive)');
    return devCorsMiddleware;
  }
  
  logger.info('Using production CORS configuration', {
    allowedOrigins: config.cors.allowedOrigins,
    credentials: config.cors.credentials
  });
  
  return corsMiddleware;
};