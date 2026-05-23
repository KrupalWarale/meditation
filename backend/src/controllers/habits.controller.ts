/**
 * File: habits.controller.ts
 *
 * Description: Handles habit tracking endpoints: logging completions, streak calculations, vision board CRUD, day journey entries, and performance ratings.
 *
 * Author: Navnit(Ninjacode911)
 */

import { Request, Response } from 'express';
import { supabase } from '../services/supabase.service';
import { success, error } from '../utils/apiResponse';
import { streakService } from '../services/streak.service';

/**
 * GET /api/habits/all
 * Get all habit streaks and recent heatmap data (last 30 days per habit type)
 */
export const getAllHabits = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json(error('UNAUTHORIZED', 'Authentication required', 401));
      return;
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Fetch streaks and recent habit logs in parallel
    const [streaks, logsResult] = await Promise.all([
      streakService.getUserStreaks(userId),
      supabase
        .from('habit_logs')
        .select('id, habit_type, completed, duration_minutes, mood_rating, energy_level, logged_at')
        .eq('user_id', userId)
        .gte('logged_at', thirtyDaysAgo.toISOString())
        .order('logged_at', { ascending: false }),
    ]);

    if (logsResult.error) {
      res.status(500).json(error('QUERY_FAILED', logsResult.error.message, 500));
      return;
    }

    // Group logs by habit_type for heatmap rendering
    const heatmap: Record<string, Array<{ date: string; completed: boolean; duration_minutes: number | null }>> = {};
    for (const log of logsResult.data ?? []) {
      const type = log.habit_type as string;
      if (!heatmap[type]) {
        heatmap[type] = [];
      }
      heatmap[type].push({
        date: log.logged_at,
        completed: log.completed,
        duration_minutes: log.duration_minutes,
      });
    }

    res.status(200).json(
      success({
        streaks: streaks ?? null,
        heatmap,
      })
    );
  } catch (err) {
    console.error('getAllHabits error:', err);
    res.status(500).json(error('INTERNAL_SERVER_ERROR', 'Failed to fetch habits data', 500));
  }
};

/**
 * POST /api/habits/log
 * Log a habit completion for today (upsert on unique constraint)
 */
export const logHabit = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json(error('UNAUTHORIZED', 'Authentication required', 401));
      return;
    }

    const {
      habit_type,
      completed = true,
      duration_minutes,
      mood_rating,
      energy_level,
      notes,
    } = req.body;

    const today = new Date().toISOString().split('T')[0];

    // Upsert habit log for today
    const { data: habitLog, error: insertError } = await supabase
      .from('habit_logs')
      .upsert(
        {
          user_id: userId,
          habit_type,
          completed,
          duration_minutes: duration_minutes ?? null,
          mood_rating: mood_rating ?? null,
          energy_level: energy_level ?? null,
          notes: notes ?? null,
          logged_at: `${today}T00:00:00.000Z`,
        },
        { onConflict: 'user_id,habit_type,logged_at' }
      )
      .select()
      .single();

    if (insertError) {
      res.status(500).json(error('LOG_FAILED', insertError.message, 500));
      return;
    }

    res.status(201).json(success(habitLog));
  } catch (err) {
    console.error('logHabit error:', err);
    res.status(500).json(error('INTERNAL_SERVER_ERROR', 'Failed to log habit', 500));
  }
};

/**
 * GET /api/habits/streak
 * Get streak and stats for a specific habit type
 */
export const getStreak = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json(error('UNAUTHORIZED', 'Authentication required', 401));
      return;
    }

    const habitType = (req.query.habit_type as string) ?? 'meditation';

    const [streak, stats] = await Promise.all([
      streakService.calculateStreak(userId, habitType),
      streakService.getHabitStats(userId, habitType, 30),
    ]);

    res.status(200).json(
      success({
        habit_type: habitType,
        streak: streak ?? { current_streak: 0, longest_streak: 0 },
        stats: stats ?? null,
      })
    );
  } catch (err) {
    console.error('getStreak error:', err);
    res.status(500).json(error('INTERNAL_SERVER_ERROR', 'Failed to fetch streak data', 500));
  }
};

/**
 * POST /api/habits/checkin
 * Manual daily check-in with mood and notes
 */
export const checkin = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json(error('UNAUTHORIZED', 'Authentication required', 401));
      return;
    }

    const { mood_rating, energy_level, notes } = req.body;

    const today = new Date().toISOString().split('T')[0];

    // Log as a meditation check-in by default
    const { data: checkinLog, error: insertError } = await supabase
      .from('habit_logs')
      .upsert(
        {
          user_id: userId,
          habit_type: 'meditation',
          completed: true,
          mood_rating: mood_rating ?? null,
          energy_level: energy_level ?? null,
          notes: notes ?? null,
          logged_at: `${today}T00:00:00.000Z`,
        },
        { onConflict: 'user_id,habit_type,logged_at' }
      )
      .select()
      .single();

    if (insertError) {
      res.status(500).json(error('CHECKIN_FAILED', insertError.message, 500));
      return;
    }

    res.status(201).json(success(checkinLog));
  } catch (err) {
    console.error('checkin error:', err);
    res.status(500).json(error('INTERNAL_SERVER_ERROR', 'Failed to check in', 500));
  }
};

/**
 * GET /api/habits/vision-board
 * Get user's vision board images ordered by sort_order
 */
export const getVisionBoard = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json(error('UNAUTHORIZED', 'Authentication required', 401));
      return;
    }

    const { data: items, error: queryError } = await supabase
      .from('vision_board')
      .select('*')
      .eq('user_id', userId)
      .order('sort_order', { ascending: true });

    if (queryError) {
      res.status(500).json(error('QUERY_FAILED', queryError.message, 500));
      return;
    }

    res.status(200).json(success(items ?? []));
  } catch (err) {
    console.error('getVisionBoard error:', err);
    res.status(500).json(error('INTERNAL_SERVER_ERROR', 'Failed to fetch vision board', 500));
  }
};

/**
 * POST /api/habits/vision-board
 * Add an image to the user's vision board
 */
export const addVisionBoard = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json(error('UNAUTHORIZED', 'Authentication required', 401));
      return;
    }

    const { image_url, caption, sort_order } = req.body;

    if (!image_url) {
      res.status(400).json(error('VALIDATION_ERROR', 'image_url is required', 400));
      return;
    }

    const { data: item, error: insertError } = await supabase
      .from('vision_board')
      .insert({
        user_id: userId,
        image_url,
        caption: caption ?? null,
        sort_order: sort_order ?? 0,
      })
      .select()
      .single();

    if (insertError) {
      res.status(500).json(error('INSERT_FAILED', insertError.message, 500));
      return;
    }

    res.status(201).json(success(item));
  } catch (err) {
    console.error('addVisionBoard error:', err);
    res.status(500).json(error('INTERNAL_SERVER_ERROR', 'Failed to add vision board item', 500));
  }
};

/**
 * DELETE /api/habits/vision-board/:id
 * Remove an image from the user's vision board
 */
export const removeVisionBoard = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json(error('UNAUTHORIZED', 'Authentication required', 401));
      return;
    }

    const { id } = req.params;

    // Verify ownership before deleting
    const { data: existing, error: fetchError } = await supabase
      .from('vision_board')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      res.status(404).json(error('NOT_FOUND', 'Vision board item not found', 404));
      return;
    }

    if (existing.user_id !== userId) {
      res.status(403).json(error('FORBIDDEN', 'You can only delete your own items', 403));
      return;
    }

    const { error: deleteError } = await supabase
      .from('vision_board')
      .delete()
      .eq('id', id);

    if (deleteError) {
      res.status(500).json(error('DELETE_FAILED', deleteError.message, 500));
      return;
    }

    res.status(200).json(success({ message: 'Vision board item removed' }));
  } catch (err) {
    console.error('removeVisionBoard error:', err);
    res.status(500).json(error('INTERNAL_SERVER_ERROR', 'Failed to remove vision board item', 500));
  }
};

/**
 * GET /api/habits/day-journey
 * Get active day journey time-slot entries
 */
export const getDayJourney = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json(error('UNAUTHORIZED', 'Authentication required', 401));
      return;
    }

    const { data: entries, error: queryError } = await supabase
      .from('day_journey')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (queryError) {
      res.status(500).json(error('QUERY_FAILED', queryError.message, 500));
      return;
    }

    res.status(200).json(success(entries ?? []));
  } catch (err) {
    console.error('getDayJourney error:', err);
    res.status(500).json(error('INTERNAL_SERVER_ERROR', 'Failed to fetch day journey', 500));
  }
};

/**
 * POST /api/habits/performance/rate
 * Upsert today's productivity rating
 */
export const ratePerformance = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json(error('UNAUTHORIZED', 'Authentication required', 401));
      return;
    }

    const { productivity_rating, notes } = req.body;
    const today = new Date().toISOString().split('T')[0];

    const { data: rating, error: upsertError } = await supabase
      .from('performance_ratings')
      .upsert(
        {
          user_id: userId,
          productivity_rating,
          rated_date: today,
          notes: notes ?? null,
        },
        { onConflict: 'user_id,rated_date', ignoreDuplicates: false }
      )
      .select()
      .single();

    if (upsertError) {
      res.status(500).json(error('RATING_FAILED', upsertError.message, 500));
      return;
    }

    res.status(201).json(success(rating));
  } catch (err) {
    console.error('ratePerformance error:', err);
    res.status(500).json(error('INTERNAL_SERVER_ERROR', 'Failed to save performance rating', 500));
  }
};

/**
 * GET /api/habits/performance/weekly
 * Get the last 7 days of productivity ratings
 */
export const getWeeklyPerformance = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json(error('UNAUTHORIZED', 'Authentication required', 401));
      return;
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const startDate = sevenDaysAgo.toISOString().split('T')[0];

    const { data: ratings, error: queryError } = await supabase
      .from('performance_ratings')
      .select('*')
      .eq('user_id', userId)
      .gte('rated_date', startDate)
      .order('rated_date', { ascending: true });

    if (queryError) {
      res.status(500).json(error('QUERY_FAILED', queryError.message, 500));
      return;
    }

    // Calculate weekly average
    const ratingValues = (ratings ?? []).map((r) => r.productivity_rating as number);
    const weeklyAverage =
      ratingValues.length > 0
        ? Math.round((ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length) * 10) / 10
        : 0;

    res.status(200).json(
      success({
        ratings: ratings ?? [],
        weekly_average: weeklyAverage,
        days_rated: ratingValues.length,
      })
    );
  } catch (err) {
    console.error('getWeeklyPerformance error:', err);
    res.status(500).json(error('INTERNAL_SERVER_ERROR', 'Failed to fetch weekly performance', 500));
  }
};
