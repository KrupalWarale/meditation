/**
 * File: streak-functions.test.js
 *
 * Description: Tests for PostgreSQL streak calculation functions. Validates calculate_streak,
 * get_user_streaks, and get_habit_stats with scenarios including no data, consecutive days,
 * broken streaks, and independent habit types.
 *
 * Author: Navnit(Ninjacode911)
 */

/**
 * Streak Functions Tests
 * Tests the PostgreSQL functions for calculating habit streaks
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const serviceClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

describe('Streak Functions Tests', () => {
  
  let testUserId = '00000000-0000-0000-0000-000000000002';

  beforeAll(async () => {
    // Create test user
    await serviceClient
      .from('users')
      .upsert({
        id: testUserId,
        email: 'streak-test@example.com',
        full_name: 'Streak Test User'
      });

    // Clean any existing test data
    await serviceClient
      .from('habit_logs')
      .delete()
      .eq('user_id', testUserId);

    console.log('✅ Test setup completed');
  });

  test('calculate_streak function exists and works with no data', async () => {
    const { data, error } = await serviceClient
      .rpc('calculate_streak', {
        p_user_id: testUserId,
        p_habit_type: 'meditation'
      });

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.current_streak).toBe(0);
    expect(data.longest_streak).toBe(0);
    console.log('✅ calculate_streak function works with no data');
  });

  test('get_user_streaks function exists and works', async () => {
    const { data, error } = await serviceClient
      .rpc('get_user_streaks', {
        p_user_id: testUserId
      });

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.meditation_current_streak).toBe(0);
    expect(data.meditation_longest_streak).toBe(0);
    expect(data.cold_shower_current_streak).toBe(0);
    expect(data.exercise_current_streak).toBe(0);
    console.log('✅ get_user_streaks function works');
  });

  test('Streak calculation with single day', async () => {
    // Add habit log for today
    const today = new Date();
    await serviceClient
      .from('habit_logs')
      .insert({
        user_id: testUserId,
        habit_type: 'meditation',
        completed: true,
        logged_at: today.toISOString()
      });

    const { data, error } = await serviceClient
      .rpc('calculate_streak', {
        p_user_id: testUserId,
        p_habit_type: 'meditation'
      });

    expect(error).toBeNull();
    expect(data.current_streak).toBe(1);
    expect(data.longest_streak).toBe(1);
    console.log('✅ Single day streak calculated correctly');
  });

  test('Streak calculation with consecutive days', async () => {
    // Add habit logs for yesterday and day before
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const dayBefore = new Date();
    dayBefore.setDate(dayBefore.getDate() - 2);

    await serviceClient
      .from('habit_logs')
      .insert([
        {
          user_id: testUserId,
          habit_type: 'meditation',
          completed: true,
          logged_at: yesterday.toISOString()
        },
        {
          user_id: testUserId,
          habit_type: 'meditation',
          completed: true,
          logged_at: dayBefore.toISOString()
        }
      ]);

    const { data, error } = await serviceClient
      .rpc('calculate_streak', {
        p_user_id: testUserId,
        p_habit_type: 'meditation'
      });

    expect(error).toBeNull();
    expect(data.current_streak).toBe(3); // Today + yesterday + day before
    expect(data.longest_streak).toBe(3);
    console.log('✅ Consecutive days streak calculated correctly');
  });

  test('Streak calculation with gap (broken streak)', async () => {
    // Add a habit log 5 days ago (creates a gap)
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    await serviceClient
      .from('habit_logs')
      .insert({
        user_id: testUserId,
        habit_type: 'meditation',
        completed: true,
        logged_at: fiveDaysAgo.toISOString()
      });

    const { data, error } = await serviceClient
      .rpc('calculate_streak', {
        p_user_id: testUserId,
        p_habit_type: 'meditation'
      });

    expect(error).toBeNull();
    expect(data.current_streak).toBe(3); // Should still be 3 (today, yesterday, day before)
    expect(data.longest_streak).toBe(3); // Longest is still 3
    console.log('✅ Broken streak handled correctly');
  });

  test('Multiple habit types work independently', async () => {
    // Add cold shower habit for today
    await serviceClient
      .from('habit_logs')
      .insert({
        user_id: testUserId,
        habit_type: 'cold_shower',
        completed: true,
        logged_at: new Date().toISOString()
      });

    const { data, error } = await serviceClient
      .rpc('get_user_streaks', {
        p_user_id: testUserId
      });

    expect(error).toBeNull();
    expect(data.meditation_current_streak).toBe(3);
    expect(data.cold_shower_current_streak).toBe(1);
    expect(data.early_wakeup_current_streak).toBe(0);
    expect(data.exercise_current_streak).toBe(0);
    console.log('✅ Multiple habit types work independently');
  });

  test('get_habit_stats function works', async () => {
    const { data, error } = await serviceClient
      .rpc('get_habit_stats', {
        p_user_id: testUserId,
        p_habit_type: 'meditation',
        p_days_back: 30
      });

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.current_streak).toBeGreaterThan(0);
    expect(data.total_days).toBeGreaterThan(0);
    expect(data.completion_rate).toBeGreaterThan(0);
    console.log('✅ get_habit_stats function works');
  });

  // Cleanup
  afterAll(async () => {
    await serviceClient
      .from('users')
      .delete()
      .eq('id', testUserId);
    console.log('✅ Streak test data cleaned up');
  });

});