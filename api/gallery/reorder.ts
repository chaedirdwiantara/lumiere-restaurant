import { NextApiRequest, NextApiResponse } from 'next';
import { galleryController } from '../src/controllers/gallery.controller';
import { authenticateToken } from '../src/middleware/auth.middleware';
import { corsMiddleware } from '../src/middleware/vercel-cors.middleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Apply CORS
  await corsMiddleware(req, res);
  
  if (req.method !== 'PUT') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
      error: 'METHOD_NOT_ALLOWED'
    });
  }

  try {
    // Apply authentication middleware
    await new Promise<void>((resolve, reject) => {
      authenticateToken(req as any, res as any, (err: any) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Reorder gallery images
    await galleryController.reorderImages(req as any, res as any);
  } catch (error) {
    console.error('Gallery reorder API error:', error);
    
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }
}