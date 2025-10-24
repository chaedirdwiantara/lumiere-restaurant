import { NextApiRequest, NextApiResponse } from 'next';
import { galleryController } from '../src/controllers/gallery.controller';
import { authenticateToken } from '../src/middleware/auth.middleware';
import { uploadSingle, handleUploadError } from '../src/middleware/upload.middleware';
import { corsMiddleware } from '../src/middleware/vercel-cors.middleware';

// Disable body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Apply CORS
  await corsMiddleware(req, res);
  
  if (req.method === 'GET') {
    try {
      // Get all gallery images
      await galleryController.getImages(req as any, res as any);
    } catch (error) {
      console.error('Gallery GET API error:', error);
      
      if (!res.headersSent) {
        return res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: 'INTERNAL_SERVER_ERROR'
        });
      }
    }
  } else if (req.method === 'POST') {
    try {
      // Apply authentication middleware
      await new Promise<void>((resolve, reject) => {
        authenticateToken(req as any, res as any, (err: any) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Apply upload middleware with proper error handling for Vercel
      await new Promise<void>((resolve, reject) => {
        uploadSingle(req as any, res as any, (err: any) => {
          if (err) {
            console.error('Upload middleware error:', err);
            handleUploadError(err, req as any, res as any, reject);
          } else {
            resolve();
          }
        });
      });

      // Create new gallery image
      await galleryController.uploadImage(req as any, res as any);
    } catch (error) {
      console.error('Gallery POST API error:', error);
      
      if (!res.headersSent) {
        return res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: 'INTERNAL_SERVER_ERROR'
        });
      }
    }
  } else {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
      error: 'METHOD_NOT_ALLOWED'
    });
  }
}