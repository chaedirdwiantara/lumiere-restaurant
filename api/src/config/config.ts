import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Server configuration
export const config = {
  app: {
    port: 5000,
    nodeEnv: process.env.NODE_ENV ? process.env.NODE_ENV : 'development',
    apiPrefix: process.env.API_PREFIX ? process.env.API_PREFIX : '/api'
  },
  
  supabase: {
    url: process.env.SUPABASE_URL ? process.env.SUPABASE_URL : '',
    anonKey: process.env.SUPABASE_ANON_KEY ? process.env.SUPABASE_ANON_KEY : '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? process.env.SUPABASE_SERVICE_ROLE_KEY : ''
  },
  
  jwt: {
    accessTokenSecret: process.env.JWT_ACCESS_SECRET ? process.env.JWT_ACCESS_SECRET : 'your-super-secret-access-token-key-change-in-production',
    refreshTokenSecret: process.env.JWT_REFRESH_SECRET ? process.env.JWT_REFRESH_SECRET : 'your-super-secret-refresh-token-key-change-in-production',
    accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY ? process.env.JWT_ACCESS_EXPIRY : '15m',
    refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY ? process.env.JWT_REFRESH_EXPIRY : '7d'
  },
  
  cors: {
    allowedOrigins: process.env.CORS_ORIGINS 
      ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
      : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: process.env.CORS_CREDENTIALS === 'true'
  },
  
  // Upload
  upload: {
    maxFileSize: 10485760, // 10MB
    allowedFileTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    uploadPath: 'uploads',
    imageQuality: 85,
    thumbnailSize: 300,
    mediumSize: 800,
    largeSize: 1200
  },
  
  security: {
    bcryptRounds: 12,
    rateLimitWindow: 900000, // 15 minutes
    rateLimitMax: 100,
    authRateLimitWindow: 900000, // 15 minutes
    authRateLimitMax: 5
  },
  
  logging: {
    level: process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 'info',
    format: process.env.LOG_FORMAT ? process.env.LOG_FORMAT : 'combined',
    directory: process.env.LOG_DIRECTORY ? process.env.LOG_DIRECTORY : 'logs'
  },
  
  admin: {
    defaultEmail: process.env.DEFAULT_ADMIN_EMAIL ? process.env.DEFAULT_ADMIN_EMAIL : 'admin@luxuryrestaurant.com',
    defaultPassword: process.env.DEFAULT_ADMIN_PASSWORD ? process.env.DEFAULT_ADMIN_PASSWORD : 'Admin123!@#'
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