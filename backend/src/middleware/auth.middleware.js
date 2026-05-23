/**
 * File: auth.middleware.js
 *
 * Description: JavaScript (CommonJS) version of the Supabase authentication middleware.
 * Verifies Supabase-issued JWT tokens from the Authorization header and attaches the
 * authenticated user object to the request.
 *
 * Author: Navnit(Ninjacode911)
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Create Supabase client for token verification
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Supabase Authentication Middleware
 * 
 * Verifies Supabase-issued JWT tokens (NOT custom JWT)
 * Token comes from frontend after Supabase authentication
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    const token = authHeader.substring(7);

    // Verify token with Supabase (NOT custom JWT verification)
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
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

module.exports = { authenticateToken };