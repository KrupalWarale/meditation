/**
 * File: meditation.service.ts
 *
 * Description: Core service for meditation session management in the mobile app.
 * Handles fetching meditation content, starting and completing sessions, recording
 * session duration and statistics, and managing user meditation history.
 *
 * Author: Navnit(Ninjacode911)
 */

import { post } from './api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MeditationSession {
  id: string;
  user_id: string;
  lesson_id?: string;
  duration_minutes: number;
  session_type: 'guided' | 'unguided' | 'timer' | 'sleep';
  status: 'started' | 'completed' | 'abandoned';
  progress_percentage: number;
  mood_before?: number;
  mood_after?: number;
  notes?: string;
  started_at: string;
  completed_at?: string;
}

// ---------------------------------------------------------------------------
// Service Methods
// ---------------------------------------------------------------------------

/**
 * Log a meditation session and auto-log a meditation habit entry
 * POST /api/sessions
 */
export async function createSession(data: {
  duration_minutes: number;
  session_type?: 'guided' | 'unguided' | 'timer' | 'sleep';
  lesson_id?: string;
  mood_before?: number;
  mood_after?: number;
  notes?: string;
}): Promise<MeditationSession> {
  return post<MeditationSession>('/sessions', data);
}
