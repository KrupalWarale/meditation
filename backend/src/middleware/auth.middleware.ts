/**
 * File: auth.middleware.ts
 *
 * Description: TypeScript authentication middleware that verifies Supabase-issued JWT tokens.
 * Extracts the Bearer token from the Authorization header, validates it against Supabase,
 * and attaches the authenticated user to the Express request object.
 *
 * Author: Navnit(Ninjacode911)
 */

import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

// Create Supabase client for token verification
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
 * Supabase Authentication Middleware
 * 
 * Verifies Supabase-issued JWT tokens (NOT custom JWT)
 * Token comes from frontend after Supabase authentication
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Access token required'
      });
      return;
    }

    const token = authHeader.substring(7);

    // Verify token with Supabase (NOT custom JWT verification)
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