/**
 * File: habits.service.ts
 *
 * Description: Manages daily meditation habit tracking for mobile users. Provides
 * methods to create habits, log completions, retrieve streak data, and generate
 * habit analytics to encourage consistent meditation practice.
 *
 * Author: Navnit(Ninjacode911)
 */

import { get, post, del } from './api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Streak {
  current_streak: number;
  longest_streak: number;
}

export interface HabitLog {
  id: string;
  habit_type: string;
  completed: boolean;
  duration_minutes?: number;
  mood_rating?: number;
  energy_level?: number;
  notes?: string;
  logged_at: string;
}

export interface HabitStats {
  total_completions: number;
  completion_rate: number;
  total_duration: number;
}

export interface VisionBoardItem {
  id: string;
  user_id: string;
  image_url: string;
  caption?: string;
  sort_order: number;
}

export interface DayJourneyItem {
  id: string;
  time_slot: string; // e.g., 'Morning', 'Afternoon'
  title: string;
  description?: string;
  icon_name?: string;
  sort_order: number;
  is_active: boolean;
}

export interface PerformanceRating {
  id: string;
  user_id: string;
  productivity_rating: number;
  rated_date: string;
  notes?: string;
}

// ---------------------------------------------------------------------------
// Service Methods
// ---------------------------------------------------------------------------

/**
 * Get all habit streaks and recent heatmap data (last 30 days)
 * GET /api/habits/all
 */
export async function getAllHabits(): Promise<{
  streaks: Record<string, Streak>;
  heatmap: Record<string, Array<{ date: string; completed: boolean; duration_minutes: number | null }>>;
}> {
  return get('/habits/all');
}

/**
 * Log a habit completion for today
 * POST /api/habits/log
 */
export async function logHabit(data: {
  habit_type: string;
  completed?: boolean;
  duration_minutes?: number;
  mood_rating?: number;
  energy_level?: number;
  notes?: string;
}): Promise<HabitLog> {
  return post<HabitLog>('/habits/log', data);
}

/**
 * Get streak and stats for a specific habit type
 * GET /api/habits/streak?habit_type=X
 */
export async function getStreak(habitType: string = 'meditation'): Promise<{
  habit_type: string;
  streak: Streak;
  stats: HabitStats | null;
}> {
  return get('/habits/streak', { params: { habit_type: habitType } });
}

/**
 * Manual daily check-in with mood and notes
 * POST /api/habits/checkin
 */
export async function checkin(data: {
  mood_rating?: number;
  energy_level?: number;
  notes?: string;
}): Promise<HabitLog> {
  return post<HabitLog>('/habits/checkin', data);
}

// ---------------------------------------------------------------------------
// Vision Board
// ---------------------------------------------------------------------------

/**
 * Get user's vision board images
 * GET /api/habits/vision-board
 */
export async function getVisionBoard(): Promise<VisionBoardItem[]> {
  return get<VisionBoardItem[]>('/habits/vision-board');
}

/**
 * Add an image to the user's vision board
 * POST /api/habits/vision-board
 */
export async function addVisionBoardItem(data: {
  image_url: string;
  caption?: string;
  sort_order?: number;
}): Promise<VisionBoardItem> {
  return post<VisionBoardItem>('/habits/vision-board', data);
}

/**
 * Remove an image from the user's vision board
 * DELETE /api/habits/vision-board/:id
 */
export async function removeVisionBoardItem(id: string): Promise<{ message: string }> {
  return del<{ message: string }>(`/habits/vision-board/${id}`);
}

// ---------------------------------------------------------------------------
// Day Journey & Performance
// ---------------------------------------------------------------------------

/**
 * Get active day journey time-slot entries
 * GET /api/habits/day-journey
 */
export async function getDayJourney(): Promise<DayJourneyItem[]> {
  return get<DayJourneyItem[]>('/habits/day-journey');
}

/**
 * Upsert today's productivity rating
 * POST /api/habits/performance/rate
 */
export async function ratePerformance(data: {
  productivity_rating: number;
  notes?: string;
}): Promise<PerformanceRating> {
  return post<PerformanceRating>('/habits/performance/rate', data);
}

/**
 * Get the last 7 days of productivity ratings
 * GET /api/habits/performance/weekly
 */
export async function getWeeklyPerformance(): Promise<{
  ratings: PerformanceRating[];
  weekly_average: number;
  days_rated: number;
}> {
  return get('/habits/performance/weekly');
}
