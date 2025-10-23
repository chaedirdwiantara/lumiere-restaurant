import { NextApiRequest, NextApiResponse } from 'next';
import { authController } from '../src/controllers/auth.controller';
import { authRateLimit } from '../src/middleware/auth.middleware';
import { corsMiddleware } from '../src/middleware/vercel-cors.middleware';

// Rate limiting for login - temporarily relaxed for testing
const loginRateLimit = authRateLimit(100, 15 * 60 * 1000); // 100 attempts per 15 minutes

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Apply CORS
  await corsMiddleware(req, res);
  
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
      error: 'METHOD_NOT_ALLOWED'
    });
  }

  try {
    // Apply rate limiting
    await new Promise<void>((resolve, reject) => {
      loginRateLimit(req as any, res as any, (err: any) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Call the auth controller
    await authController.login(req as any, res as any);
  } catch (error) {
    console.error('Login API error:', error);
    
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }
}