/**
 * File: supabase-auth.middleware.ts
 *
 * Description: Comprehensive Supabase authentication middleware providing three levels of access
 * control: authenticateUser (required auth), optionalAuth (pass-through if no token), and
 * requireAdmin (admin role check). Uses the Supabase anon key to respect RLS policies.
 *
 * Author: Navnit(Ninjacode911)
 */

import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

// Create Supabase client with ANON key for token verification
// This respects RLS policies and validates user tokens
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
        [key: string]: any;
      };
    }
  }
}

/**
 * Supabase Auth Middleware
 * 
 * Verifies Supabase-issued JWT tokens from Authorization header
 * Attaches authenticated user to request.user
 * 
 * Token Flow:
 * 1. Frontend authenticates with Supabase (OTP/email/social)
 * 2. Supabase returns JWT token to frontend
 * 3. Frontend sends token in Authorization: Bearer <token>
 * 4. This middleware verifies token with Supabase
 * 5. User data attached to request for use in routes
 */
export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Missing or invalid authorization header'
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
      return;
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      ...user.user_metadata
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

/**
 * Optional Auth Middleware
 * 
 * Same as authenticateUser but doesn't fail if no token provided
 * Useful for endpoints that work for both authenticated and anonymous users
 */
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without user
      next();
      return;
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (!error && user) {
      req.user = {
        id: user.id,
        email: user.email,
        ...user.user_metadata
      };
    }

    next();
  } catch (error) {
    // Don't fail on optional auth errors
    console.warn('Optional auth error:', error);
    next();
  }
};

/**
 * Admin Auth Middleware
 * 
 * Requires user to be authenticated AND have admin role
 * Checks user_metadata.role or a custom admin table
 */
export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // First authenticate the user
  await authenticateUser(req, res, () => {
    if (!req.user) {
      return; // authenticateUser already sent error response
    }

    // Check if user has admin role
    // You can customize this logic based on your admin setup
    const isAdmin = req.user.role === 'admin' || 
                   req.user.user_metadata?.role === 'admin';

    if (!isAdmin) {
      res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
      return;
    }

    next();
  });
};