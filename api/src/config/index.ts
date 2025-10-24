import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Server configuration
export const config = {
  app: {
    port: 5000,
    nodeEnv: process.env.NODE_ENV ? process.env.NODE_ENV : 'development',
    apiPrefix: process.env.API_PREFIX ? process.env.API_PREFIX : '/api'
  },
  
  cors: {
    allowedOrigins: process.env.CORS_ORIGINS 
      ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
      : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: process.env.CORS_CREDENTIALS === 'true'
  },
  
  jwt: {
    secret: process.env.JWT_SECRET ? process.env.JWT_SECRET : 'your-super-secret-jwt-key-here',
    refreshSecret: process.env.JWT_REFRESH_SECRET ? process.env.JWT_REFRESH_SECRET : 'your-super-secret-refresh-jwt-key-here',
    expiresIn: process.env.JWT_EXPIRES_IN ? process.env.JWT_EXPIRES_IN : '1h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ? process.env.JWT_REFRESH_EXPIRES_IN : '7d',
    accessTokenSecret: process.env.JWT_ACCESS_SECRET ? process.env.JWT_ACCESS_SECRET : 'your-super-secret-access-token-key-change-in-production',
    refreshTokenSecret: process.env.JWT_REFRESH_SECRET ? process.env.JWT_REFRESH_SECRET : 'your-super-secret-refresh-token-key-change-in-production',
    accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY ? process.env.JWT_ACCESS_EXPIRY : '15m',
    refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY ? process.env.JWT_REFRESH_EXPIRY : '7d'
  },
  
  // Supabase
  supabase: {
    url: process.env.SUPABASE_URL ? process.env.SUPABASE_URL : '',
    anonKey: process.env.SUPABASE_ANON_KEY ? process.env.SUPABASE_ANON_KEY : '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? process.env.SUPABASE_SERVICE_ROLE_KEY : '',
  },
  
  // Upload
  upload: {
    maxFileSize: 10485760, // 10MB
    allowedFileTypes: (process.env.ALLOWED_FILE_TYPES ? process.env.ALLOWED_FILE_TYPES : 'image/jpeg,image/png,image/webp,image/gif').split(','),
  },
  
  // Redis (Optional)
  redis: {
    url: process.env.REDIS_URL ? process.env.REDIS_URL : 'redis://localhost:6379',
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
    defaultEmail: process.env.DEFAULT_ADMIN_EMAIL ? process.env.DEFAULT_ADMIN_EMAIL : 'admin@restaurant.com',
    defaultPassword: process.env.DEFAULT_ADMIN_PASSWORD ? process.env.DEFAULT_ADMIN_PASSWORD : 'SecurePassword123!',
    name: process.env.DEFAULT_ADMIN_NAME ? process.env.DEFAULT_ADMIN_NAME : 'System Administrator',
  },
} as const;

// Validate required environment variables
export const validateConfig = (): void => {
  const requiredVars = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'JWT_SECRET',
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  // Validate JWT secret length
  if (config.jwt.secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }

  if (config.jwt.refreshSecret.length < 32) {
    throw new Error('JWT_REFRESH_SECRET must be at least 32 characters long');
  }

  console.log('✅ Configuration validation passed');
};

export default config;