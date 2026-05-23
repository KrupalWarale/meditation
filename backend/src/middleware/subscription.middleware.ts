/**
 * File: subscription.middleware.ts
 *
 * Description: Express middleware that gates routes behind a premium subscription. Checks the
 * database for an active or trialing subscription with a valid expiration date before allowing
 * the request to proceed.
 *
 * Author: Navnit(Ninjacode911)
 */

import { Request, Response, NextFunction } from 'express';
import { supabase } from '../services/supabase.service';
import { error } from '../utils/apiResponse';

/**
 * Middleware to gate routes behind a premium subscription
 * Checks for an active or trialing subscription that has not expired
 */
export const requirePremium = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json(error('UNAUTHORIZED', 'Authentication required', 401));
      return;
    }

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('status, expires_at')
      .eq('user_id', userId)
      .in('status', ['active', 'trialing'])
      .single();

    if (!subscription) {
      res.status(403).json(error('PREMIUM_REQUIRED', 'Premium subscription required to access this content', 403));
      return;
    }

    // Check expiry — require a valid, non-expired expires_at
    if (!subscription.expires_at || new Date(subscription.expires_at) < new Date()) {
      res.status(403).json(error('SUBSCRIPTION_EXPIRED', 'Your subscription has expired', 403));
      return;
    }

    next();
  } catch (err) {
    console.error('requirePremium error:', err);
    res.status(500).json(error('INTERNAL_SERVER_ERROR', 'Failed to verify subscription', 500));
  }
};
