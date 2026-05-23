/**
 * File: subscriptions.controller.ts
 *
 * Description: Manages subscription endpoints: fetching active subscription status with premium check, and cancelling subscriptions at period end.
 *
 * Author: Navnit(Ninjacode911)
 */

import { Request, Response } from 'express';
import { supabase } from '../services/supabase.service';
import { success, error } from '../utils/apiResponse';

/**
 * GET /api/subscriptions/status
 * Fetch the authenticated user's active subscription details
 */
export const getSubscriptionStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json(error('UNAUTHORIZED', 'Authentication required', 401));
      return;
    }

    const { data: subscription, error: queryError } = await supabase
      .from('subscriptions')
      .select('id, plan_type, status, amount_cents, currency, billing_cycle, current_period_start, current_period_end, trial_start, trial_end, cancel_at_period_end, cancelled_at, started_at, expires_at, created_at, updated_at')
      .eq('user_id', userId)
      .in('status', ['active', 'trialing'])
      .single();

    if (queryError && queryError.code !== 'PGRST116') {
      // PGRST116 = no rows found — that's acceptable (free user)
      res.status(500).json(error('QUERY_FAILED', queryError.message, 500));
      return;
    }

    const isPremium = !!subscription && (!subscription.expires_at || new Date(subscription.expires_at) > new Date());

    res.status(200).json(
      success({
        subscription: subscription ?? null,
        isPremium,
        plan: subscription?.plan_type ?? 'free',
      })
    );
  } catch (err) {
    console.error('getSubscriptionStatus error:', err);
    res.status(500).json(error('INTERNAL_SERVER_ERROR', 'Failed to fetch subscription status', 500));
  }
};

/**
 * POST /api/subscriptions/cancel
 * Cancel the authenticated user's active subscription at period end
 */
export const cancelSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json(error('UNAUTHORIZED', 'Authentication required', 401));
      return;
    }

    // Check for an active subscription
    const { data: existing, error: lookupError } = await supabase
      .from('subscriptions')
      .select('id, status')
      .eq('user_id', userId)
      .in('status', ['active', 'trialing'])
      .single();

    if (lookupError || !existing) {
      res.status(404).json(error('NO_ACTIVE_SUBSCRIPTION', 'No active subscription found to cancel', 404));
      return;
    }

    const now = new Date().toISOString();

    // Keep status=active so user retains access until period end.
    // A cron job should flip status to 'cancelled' after expires_at passes.
    const { data: updated, error: updateError } = await supabase
      .from('subscriptions')
      .update({
        cancel_at_period_end: true,
        cancelled_at: now,
        cancellation_reason: req.body?.reason ?? null,
        updated_at: now,
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (updateError) {
      res.status(500).json(error('UPDATE_FAILED', updateError.message, 500));
      return;
    }

    res.status(200).json(success(updated));
  } catch (err) {
    console.error('cancelSubscription error:', err);
    res.status(500).json(error('INTERNAL_SERVER_ERROR', 'Failed to cancel subscription', 500));
  }
};
