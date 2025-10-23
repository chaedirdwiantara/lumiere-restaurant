import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const config = {
  app: {
    port: parseInt(process.env.PORT || '5000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    apiPrefix: process.env.API_PREFIX || '/api'
  },
  
  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  },
  
  jwt: {
    accessTokenSecret: process.env.JWT_ACCESS_SECRET || 'your-super-secret-access-token-key-change-in-production',
    refreshTokenSecret: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-token-key-change-in-production',
    accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d'
  },
  
  cors: {
    allowedOrigins: process.env.CORS_ORIGINS 
      ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
      : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: process.env.CORS_CREDENTIALS === 'true'
  },
  
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB default
    allowedFileTypes: process.env.ALLOWED_FILE_TYPES 
      ? process.env.ALLOWED_FILE_TYPES.split(',').map(type => type.trim())
      : ['image/jpeg', 'image/png', 'image/webp'],
    uploadPath: process.env.UPLOAD_PATH || 'uploads',
    imageQuality: parseInt(process.env.IMAGE_QUALITY || '85', 10),
    thumbnailSize: parseInt(process.env.THUMBNAIL_SIZE || '300', 10),
    mediumSize: parseInt(process.env.MEDIUM_SIZE || '800', 10),
    largeSize: parseInt(process.env.LARGE_SIZE || '1200', 10)
  },
  
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '900000', 10), // 15 minutes
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    authRateLimitWindow: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW || '900000', 10), // 15 minutes
    authRateLimitMax: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '5', 10)
  },
  
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined',
    directory: process.env.LOG_DIRECTORY || 'logs'
  },
  
  admin: {
    defaultEmail: process.env.DEFAULT_ADMIN_EMAIL || 'admin@luxuryrestaurant.com',
    defaultPassword: process.env.DEFAULT_ADMIN_PASSWORD || 'Admin123!@#'
  }
};

// Validate required environment variables
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

export default config;