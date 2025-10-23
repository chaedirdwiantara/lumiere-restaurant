import { NextApiRequest, NextApiResponse } from 'next';
import { galleryController } from '../src/controllers/gallery.controller';
import { authenticateToken } from '../src/middleware/auth.middleware';
import { uploadSingle, handleUploadError } from '../src/middleware/upload.middleware';
import { corsMiddleware } from '../src/middleware/vercel-cors.middleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Apply CORS
  await corsMiddleware(req, res);
  
  const { id } = req.query;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Invalid gallery image ID',
      error: 'INVALID_ID'
    });
  }

  if (req.method === 'GET') {
    try {
      // Get single gallery image by ID
      await galleryController.getImageById(req as any, res as any);
    } catch (error) {
      console.error('Gallery GET by ID API error:', error);
      
      if (!res.headersSent) {
        return res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: 'INTERNAL_SERVER_ERROR'
        });
      }
    }
  } else if (req.method === 'PUT') {
    try {
      // Apply authentication middleware
      await new Promise<void>((resolve, reject) => {
        authenticateToken(req as any, res as any, (err: any) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Check if it's a file upload or regular update
      const contentType = req.headers['content-type'] || '';
      
      if (contentType.includes('multipart/form-data')) {
        // Apply upload middleware for file updates
        await new Promise<void>((resolve, reject) => {
          uploadSingle(req as any, res as any, (err: any) => {
            if (err) {
              handleUploadError(err, req as any, res as any, reject);
            } else {
              resolve();
            }
          });
        });
      }

      // Update gallery image
      await galleryController.updateImage(req as any, res as any);
    } catch (error) {
      console.error('Gallery PUT API error:', error);
      
      if (!res.headersSent) {
        return res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: 'INTERNAL_SERVER_ERROR'
        });
      }
    }
  } else if (req.method === 'DELETE') {
    try {
      // Apply authentication middleware
      await new Promise<void>((resolve, reject) => {
        authenticateToken(req as any, res as any, (err: any) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Delete gallery image
      await galleryController.deleteImage(req as any, res as any);
    } catch (error) {
      console.error('Gallery DELETE API error:', error);
      
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