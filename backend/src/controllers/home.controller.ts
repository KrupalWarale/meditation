/**
 * File: home.controller.ts
 *
 * Description: Builds the home screen feed by aggregating daily quote, trending courses, upcoming events, user greeting, and meditation streak data.
 *
 * Author: Navnit(Ninjacode911)
 */

import { Request, Response } from 'express';
import { supabase } from '../services/supabase.service';
import { success, error } from '../utils/apiResponse';

/**
 * GET /api/home/feed
 * Returns the home screen feed data for the authenticated user
 */
export const getHomeFeed = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json(error('UNAUTHORIZED', 'Authentication required', 401));
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const nowIso = new Date().toISOString();

    // All 5 queries run in parallel. Selects are trimmed to the columns the
    // mobile client actually renders, which cuts roundtrip payload ~30-50%.
    // Daily quote: fetch today-or-earlier, newest first, so a single query
    // covers the "today missing, use latest" fallback without a second trip.
    const [quoteResult, coursesResult, eventsResult, userResult, streakResult] = await Promise.all([
      supabase
        .from('daily_quotes')
        .select('quote_text, author, quote_date, category')
        .lte('quote_date', today)
        .order('quote_date', { ascending: false })
        .limit(1)
        .maybeSingle(),

      supabase
        .from('courses')
        .select(
          'id, title, instructor_name, thumbnail_url, estimated_duration_minutes, difficulty_level, is_premium, category',
        )
        .eq('status', 'published')
        .order('enrollment_count', { ascending: false })
        .limit(5),

      supabase
        .from('events')
        .select(
          'id, title, event_date, instructor_name, thumbnail_url, is_live, category',
        )
        .gt('event_date', nowIso)
        .order('event_date', { ascending: true })
        .limit(3),

      supabase
        .from('users')
        .select('full_name')
        .eq('id', userId)
        .single(),

      supabase.rpc('calculate_streak', {
        p_user_id: userId,
        p_habit_type: 'meditation',
      }),
    ]);

    const feed = {
      daily_quote: quoteResult.data ?? null,
      trending_courses: coursesResult.data ?? [],
      upcoming_events: eventsResult.data ?? [],
      user_greeting: userResult.data?.full_name ?? null,
      streak: streakResult.data ?? 0,
    };

    res.status(200).json(success(feed));
  } catch (err) {
    console.error('getHomeFeed error:', err);
    res.status(500).json(error('INTERNAL_SERVER_ERROR', 'Failed to fetch home feed', 500));
  }
};
