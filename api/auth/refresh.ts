import { NextApiRequest, NextApiResponse } from 'next';
import { authController } from '../src/controllers/auth.controller';
import { corsMiddleware } from '../src/middleware/vercel-cors.middleware';

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
    // Call the auth controller
    await authController.refreshToken(req as any, res as any);
  } catch (error) {
    console.error('Refresh token API error:', error);
    
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }
}