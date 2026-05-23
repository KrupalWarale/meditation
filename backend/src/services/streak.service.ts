/**
 * File: streak.service.ts
 *
 * Description: Calculates and retrieves habit streak data by invoking Supabase RPC functions.
 * Supports per-habit streak calculation, aggregated user streaks across all habit types,
 * and comprehensive habit statistics including completion rates and weekly/monthly totals.
 *
 * Author: Navnit(Ninjacode911)
 */

import { supabase } from './supabase.service';

interface StreakResult {
  current_streak: number;
  longest_streak: number;
}

interface UserStreaksResult {
  meditation_current_streak: number;
  meditation_longest_streak: number;
  cold_shower_current_streak: number;
  cold_shower_longest_streak: number;
  early_wakeup_current_streak: number;
  early_wakeup_longest_streak: number;
  exercise_current_streak: number;
  exercise_longest_streak: number;
}

interface HabitStatsResult {
  current_streak: number;
  longest_streak: number;
  total_days: number;
  completion_rate: number;
  days_this_week: number;
  days_this_month: number;
}

export const streakService = {
  /**
   * Calculate current and longest streak for a specific habit type
   */
  async calculateStreak(userId: string, habitType: string): Promise<StreakResult | null> {
    const { data, error } = await supabase.rpc('calculate_streak', {
      p_user_id: userId,
      p_habit_type: habitType,
    });

    if (error) {
      console.error('calculateStreak RPC error:', error);
      throw new Error(`Failed to calculate streak: ${error.message}`);
    }

    // RPC returns an array of rows; take the first
    const result = Array.isArray(data) ? data[0] : data;
    return result as StreakResult | null;
  },

  /**
   * Get all habit streaks for a user in one call
   */
  async getUserStreaks(userId: string): Promise<UserStreaksResult | null> {
    const { data, error } = await supabase.rpc('get_user_streaks', {
      p_user_id: userId,
    });

    if (error) {
      console.error('getUserStreaks RPC error:', error);
      throw new Error(`Failed to get user streaks: ${error.message}`);
    }

    const result = Array.isArray(data) ? data[0] : data;
    return result as UserStreaksResult | null;
  },

  /**
   * Get comprehensive habit statistics for a user
   */
  async getHabitStats(
    userId: string,
    habitType: string,
    daysBack: number = 30
  ): Promise<HabitStatsResult | null> {
    const { data, error } = await supabase.rpc('get_habit_stats', {
      p_user_id: userId,
      p_habit_type: habitType,
      p_days_back: daysBack,
    });

    if (error) {
      console.error('getHabitStats RPC error:', error);
      throw new Error(`Failed to get habit stats: ${error.message}`);
    }

    const result = Array.isArray(data) ? data[0] : data;
    return result as HabitStatsResult | null;
  },
};
