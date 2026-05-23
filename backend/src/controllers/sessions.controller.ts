/**
 * File: sessions.controller.ts
 *
 * Description: Handles meditation session logging. Creates session records and auto-logs a meditation habit entry for streak tracking.
 *
 * Author: Navnit(Ninjacode911)
 */

import { Request, Response } from 'express';
import { supabase } from '../services/supabase.service';
import { success, error } from '../utils/apiResponse';

/**
 * POST /api/sessions
 * Log a meditation session and auto-log a meditation habit entry
 */
export const createSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json(error('UNAUTHORIZED', 'Authentication required', 401));
      return;
    }

    const {
      duration_minutes,
      session_type = 'guided',
      lesson_id,
      mood_before,
      mood_after,
      notes,
      started_at: clientStartedAt,
      completed_at: clientCompletedAt,
    } = req.body;

    // Trust client-provided timestamps when present (the user actually
    // started/finished at those moments) but fall back to now for offline
    // logging. Both must be valid ISO 8601 — enforced by the Zod validator.
    const completedAt = clientCompletedAt ?? new Date().toISOString();
    const startedAt =
      clientStartedAt ??
      new Date(
        new Date(completedAt).getTime() - duration_minutes * 60_000,
      ).toISOString();

    // Create the meditation session
    const { data: session, error: sessionError } = await supabase
      .from('meditation_sessions')
      .insert({
        user_id: userId,
        lesson_id: lesson_id ?? null,
        duration_minutes,
        session_type,
        status: 'completed',
        progress_percentage: 100,
        mood_before: mood_before ?? null,
        mood_after: mood_after ?? null,
        notes: notes ?? null,
        started_at: startedAt,
        completed_at: completedAt,
      })
      .select()
      .single();

    if (sessionError) {
      res.status(500).json(error('SESSION_CREATE_FAILED', sessionError.message, 500));
      return;
    }

    // Auto-log a meditation habit entry for streak tracking
    // Use upsert to handle the unique constraint on (user_id, habit_type, DATE(logged_at))
    const today = new Date().toISOString().split('T')[0];
    await supabase
      .from('habit_logs')
      .upsert(
        {
          user_id: userId,
          habit_type: 'meditation',
          completed: true,
          duration_minutes,
          mood_rating: mood_after ?? null,
          notes: notes ?? null,
          logged_at: `${today}T00:00:00.000Z`,
        },
        { onConflict: 'user_id,habit_type,logged_at' }
      )
      .select();

    res.status(201).json(success(session));
  } catch (err) {
    console.error('createSession error:', err);
    res.status(500).json(error('INTERNAL_SERVER_ERROR', 'Failed to create session', 500));
  }
};
