/**
 * File: notifications.controller.ts
 *
 * Description: Handles notification endpoints: listing user notifications with unread count, ordered by most recent.
 *
 * Author: Navnit(Ninjacode911)
 */

import { Request, Response } from 'express';
import { supabase } from '../services/supabase.service';
import { success, error } from '../utils/apiResponse';

/**
 * GET /api/notifications
 * List user's notifications ordered by created_at descending, limit 50
 */
export const listNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json(error('UNAUTHORIZED', 'Authentication required', 401));
      return;
    }

    const { data: notifications, error: queryError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (queryError) {
      res.status(500).json(error('QUERY_FAILED', queryError.message, 500));
      return;
    }

    // Count unread notifications
    const unreadCount = (notifications ?? []).filter(
      (n) => n.read_at === null
    ).length;

    res.status(200).json(
      success({
        results: notifications ?? [],
        meta: {
          unread_count: unreadCount,
          total: (notifications ?? []).length,
        }
      })
    );
  } catch (err) {
    console.error('listNotifications error:', err);
    res.status(500).json(error('INTERNAL_SERVER_ERROR', 'Failed to fetch notifications', 500));
  }
};
