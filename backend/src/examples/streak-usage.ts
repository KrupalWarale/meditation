/**
 * File: streak-usage.ts
 *
 * Description: Reference examples demonstrating usage of the Supabase service for streak
 * calculations, habit logging, meditation session creation, and user profile operations.
 * Includes an example Express route handler for integrating streaks into API endpoints.
 *
 * Author: Navnit(Ninjacode911)
 */

/**
 * Example usage of Supabase service and streak functions
 * This file demonstrates how to use the implemented features
 */

import { supabaseService } from '../services/supabase.service';

// =====================================================
// STREAK CALCULATION EXAMPLES
// =====================================================

/**
 * Calculate streak for a specific habit
 */
export async function getUserMeditationStreak(userId: string) {
  try {
    const result = await supabaseService.executeRPC('calculate_streak', {
      p_user_id: userId,
      p_habit_type: 'meditation'
    });
    
    console.log('Meditation streak:', result);
    return result;
  } catch (error) {
    console.error('Error calculating meditation streak:', error);
    throw error;
  }
}

/**
 * Get all streaks for a user
 */
export async function getAllUserStreaks(userId: string) {
  try {
    const result = await supabaseService.executeRPC('get_user_streaks', {
      p_user_id: userId
    });
    
    console.log('All user streaks:', result);
    return result;
  } catch (error) {
    console.error('Error getting user streaks:', error);
    throw error;
  }
}

/**
 * Get comprehensive habit statistics
 */
export async function getHabitStatistics(userId: string, habitType: string, daysBack: number = 30) {
  try {
    const result = await supabaseService.executeRPC('get_habit_stats', {
      p_user_id: userId,
      p_habit_type: habitType,
      p_days_back: daysBack
    });
    
    console.log(`${habitType} statistics:`, result);
    return result;
  } catch (error) {
    console.error('Error getting habit statistics:', error);
    throw error;
  }
}

// =====================================================
// HABIT LOGGING EXAMPLES
// =====================================================

/**
 * Log a completed habit
 */
export async function logHabitCompletion(userId: string, habitType: string, durationMinutes?: number) {
  try {
    const result = await supabaseService.executeQuery(async (client) => {
      return await client
        .from('habit_logs')
        .insert({
          user_id: userId,
          habit_type: habitType,
          completed: true,
          duration_minutes: durationMinutes,
          logged_at: new Date().toISOString()
        })
        .select()
        .single();
    });
    
    console.log('Habit logged:', result);
    return result;
  } catch (error) {
    console.error('Error logging habit:', error);
    throw error;
  }
}

/**
 * Get recent habit logs for a user
 */
export async function getRecentHabitLogs(userId: string, limit: number = 10) {
  try {
    const result = await supabaseService.executeQuery(async (client) => {
      return await client
        .from('habit_logs')
        .select('*')
        .eq('user_id', userId)
        .order('logged_at', { ascending: false })
        .limit(limit);
    });
    
    console.log('Recent habit logs:', result);
    return result;
  } catch (error) {
    console.error('Error getting habit logs:', error);
    throw error;
  }
}

// =====================================================
// MEDITATION SESSION EXAMPLES
// =====================================================

/**
 * Create a meditation session
 */
export async function createMeditationSession(
  userId: string, 
  durationMinutes: number, 
  sessionType: string = 'guided'
) {
  try {
    const result = await supabaseService.executeQuery(async (client) => {
      return await client
        .from('meditation_sessions')
        .insert({
          user_id: userId,
          duration_minutes: durationMinutes,
          session_type: sessionType,
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .select()
        .single();
    });
    
    console.log('Meditation session created:', result);
    return result;
  } catch (error) {
    console.error('Error creating meditation session:', error);
    throw error;
  }
}

// =====================================================
// USER PROFILE EXAMPLES
// =====================================================

/**
 * Get user profile with RLS protection
 */
export async function getUserProfile(userId: string) {
  try {
    const result = await supabaseService.executeQuery(async (client) => {
      return await client
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
    });
    
    console.log('User profile:', result);
    return result;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(userId: string, preferences: any) {
  try {
    const result = await supabaseService.executeQuery(async (client) => {
      return await client
        .from('users')
        .update({
          notification_preferences: preferences,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();
    });
    
    console.log('User preferences updated:', result);
    return result;
  } catch (error) {
    console.error('Error updating user preferences:', error);
    throw error;
  }
}

// =====================================================
// USAGE IN EXPRESS ROUTES
// =====================================================

/**
 * Example Express route handler
 */
export async function handleGetUserStreaks(req: any, res: any) {
  try {
    const userId = req.user.id; // From auth middleware
    
    const streaks = await getAllUserStreaks(userId);
    
    res.json({
      success: true,
      data: streaks
    });
  } catch (error) {
    console.error('Route error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user streaks'
    });
  }
}