import { NextApiRequest, NextApiResponse } from 'next';
import { homeController } from '../src/controllers/home.controller';
import { authenticateToken } from '../src/middleware/auth.middleware';
import { corsMiddleware } from '../src/middleware/vercel-cors.middleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Apply CORS
  await corsMiddleware(req, res);
  
  if (req.method === 'GET') {
    try {
      // Get all home content sections
      await homeController.getAllContent(req as any, res as any);
    } catch (error) {
      console.error('Home content GET API error:', error);
      
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

      // Create new home content section
      await homeController.createContent(req as any, res as any);
    } catch (error) {
      console.error('Home content POST API error:', error);
      
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

      // Update home content
      await homeController.updateContentBySection(req as any, res as any);
    } catch (error) {
      console.error('Home content PUT API error:', error);
      
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