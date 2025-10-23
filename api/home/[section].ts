import { NextApiRequest, NextApiResponse } from 'next';
import { homeController } from '../src/controllers/home.controller';
import { authenticateToken } from '../src/middleware/auth.middleware';
import { corsMiddleware } from '../src/middleware/vercel-cors.middleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Apply CORS
  await corsMiddleware(req, res);
  
  const { section } = req.query;
  
  if (!section || typeof section !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Invalid section key',
      error: 'INVALID_SECTION_KEY'
    });
  }

  if (req.method === 'GET') {
    try {
      // Get home content by section key
      await homeController.getContentBySection(req as any, res as any);
    } catch (error) {
      console.error('Home content GET by section API error:', error);
      
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

      // Update home content section
      await homeController.updateContentBySection(req as any, res as any);
    } catch (error) {
      console.error('Home content PUT by section API error:', error);
      
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

      // Delete home content section
      await homeController.deleteContentBySection(req as any, res as any);
    } catch (error) {
      console.error('Home content DELETE by section API error:', error);
      
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