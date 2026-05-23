/**
 * File: admin.middleware.ts
 *
 * Description: Express middleware that enforces admin-level authorization. Verifies the
 * authenticated user has an 'admin' or 'super_admin' role in the database before allowing
 * access to protected admin routes.
 *
 * Author: Navnit(Ninjacode911)
 */

import { Request, Response, NextFunction } from 'express';
import { supabase } from '../services/supabase.service';

export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        data: null,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        meta: null,
      });
      return;
    }

    // Look up the user's role in the database
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', req.user.id)
      .single();

    if (error || !data) {
      res.status(403).json({
        success: false,
        data: null,
        error: { code: 'FORBIDDEN', message: 'User not found' },
        meta: null,
      });
      return;
    }

    if (!['admin', 'super_admin'].includes(data.role)) {
      res.status(403).json({
        success: false,
        data: null,
        error: { code: 'FORBIDDEN', message: 'Admin access required' },
        meta: null,
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({
      success: false,
      data: null,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Authorization check failed' },
      meta: null,
    });
  }
};
