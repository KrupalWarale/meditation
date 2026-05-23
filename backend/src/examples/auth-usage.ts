/**
 * File: auth-usage.ts
 *
 * Description: Reference examples demonstrating the correct Supabase-based authentication
 * flow for Express routes. Covers protected routes, optional auth, admin-only access,
 * and documents the frontend integration pattern with Supabase JWT tokens.
 *
 * Author: Navnit(Ninjacode911)
 */

/**
 * Supabase Auth Usage Examples
 *
 * This demonstrates the correct way to handle authentication
 * with Supabase (NO custom JWT needed)
 */

import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { authenticateUser, optionalAuth, requireAdmin } from '../middleware/supabase-auth.middleware';

const router = express.Router();

// =====================================================
// AUTHENTICATION FLOW EXPLANATION
// =====================================================

/**
 * WRONG WAY (Custom JWT):
 * 1. Backend generates JWT with JWT_SECRET ❌
 * 2. Backend signs tokens manually ❌
 * 3. Backend verifies with jsonwebtoken library ❌
 * 
 * RIGHT WAY (Supabase Auth):
 * 1. Frontend authenticates with Supabase (OTP/email/social) ✅
 * 2. Supabase returns JWT token to frontend ✅
 * 3. Frontend sends token in Authorization header ✅
 * 4. Backend verifies token with supabase.auth.getUser() ✅
 * 5. No JWT_SECRET needed - Supabase handles everything ✅
 */

// =====================================================
// ROUTE EXAMPLES
// =====================================================

/**
 * Protected route - requires authentication
 */
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    // req.user is automatically populated by middleware
    const userId = req.user!.id;
    
    // Your route logic here
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get profile'
    });
  }
});

/**
 * Alternative middleware (more explicit naming)
 */
router.get('/streaks', authenticateUser, async (req, res) => {
  try {
    const userId = req.user!.id;
    
    // Get user streaks using the functions we created
    // Implementation would go here
    
    res.json({
      success: true,
      data: { /* streak data */ }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get streaks'
    });
  }
});

/**
 * Optional auth - works for both authenticated and anonymous users
 */
router.get('/courses', optionalAuth, async (req, res) => {
  try {
    // req.user will be populated if token provided, undefined otherwise
    const userId = req.user?.id;
    
    if (userId) {
      // Return personalized course list
    } else {
      // Return public course list
    }
    
    res.json({
      success: true,
      data: { /* courses */ }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get courses'
    });
  }
});

/**
 * Admin-only route
 */
router.get('/admin/users', requireAdmin, async (req, res) => {
  try {
    // Only admins can access this
    res.json({
      success: true,
      data: { /* admin data */ }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get admin data'
    });
  }
});

// =====================================================
// FRONTEND INTEGRATION
// =====================================================

/**
 * Frontend Authentication Flow:
 * 
 * 1. User signs in with Supabase:
 *    const { data, error } = await supabase.auth.signInWithOtp({
 *      email: 'user@example.com'
 *    });
 * 
 * 2. Get session token:
 *    const { data: { session } } = await supabase.auth.getSession();
 *    const token = session?.access_token;
 * 
 * 3. Send to backend:
 *    fetch('/api/profile', {
 *      headers: {
 *        'Authorization': `Bearer ${token}`
 *      }
 *    });
 * 
 * 4. Backend middleware verifies token with Supabase
 * 5. User data attached to request
 */

// =====================================================
// KEY DIFFERENCES
// =====================================================

/**
 * JWT_SECRET vs Supabase JWT:
 * 
 * JWT_SECRET (Custom):
 * - You generate and manage secret keys
 * - You sign tokens manually
 * - You verify tokens manually
 * - More complex, error-prone
 * - Need to handle token refresh
 * 
 * Supabase JWT:
 * - Supabase generates tokens automatically
 * - Supabase handles signing with their keys
 * - You verify with supabase.auth.getUser()
 * - Simpler, more secure
 * - Automatic token refresh handled by Supabase
 * - Integrates with RLS policies
 */

export default router;