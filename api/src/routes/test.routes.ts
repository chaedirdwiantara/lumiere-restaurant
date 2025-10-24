import { Router } from 'express';
import { supabaseService } from '../config/database';
import { logger } from '../utils/logger';

const router = Router();

/**
 * Test database connection and admin data
 */
router.get('/db', async (req, res) => {
  try {
    // Test basic connection
    const { data: admins, error } = await supabaseService
      .from('admins')
      .select('id, email, name, role, is_active, created_at')
      .limit(5);

    if (error) {
      logger.error('Database test error', error);
      return res.status(500).json({
        success: false,
        error: 'Database connection failed',
        details: error.message
      });
    }

    return res.json({
      success: true,
      message: 'Database connection successful',
      data: {
        admins_count: admins?.length || 0,
        admins: admins || []
      }
    });
  } catch (error) {
    logger.error('Database test error', error);
    return res.status(500).json({
      success: false,
      error: 'Database test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Test admin password hash
 */
router.get('/admin/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    const { data: admin, error } = await supabaseService
      .from('admins')
      .select('id, email, name, role, is_active, password_hash, created_at')
      .eq('email', email)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        error: 'Admin not found',
        details: error.message
      });
    }

    return res.json({
      success: true,
      data: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        is_active: admin.is_active,
        password_hash_length: admin.password_hash?.length || 0,
        password_hash_prefix: admin.password_hash?.substring(0, 10) || '',
        created_at: admin.created_at
      }
    });
  } catch (error) {
    logger.error('Admin test error', error);
    return res.status(500).json({
      success: false,
      error: 'Admin test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;