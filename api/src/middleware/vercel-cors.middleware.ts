import { NextApiRequest, NextApiResponse } from 'next';

/**
 * Simple CORS middleware for Vercel API routes
 */
export async function corsMiddleware(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma');
  res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count, X-Page-Count, X-Current-Page, X-Per-Page');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
}