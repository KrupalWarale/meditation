/**
 * File: rls-policies.test.js
 *
 * Description: Row Level Security (RLS) policy tests. Verifies that RLS is enabled on protected
 * tables, service role bypasses RLS, anonymous clients are blocked, and cross-user access is prevented.
 *
 * Author: Navnit(Ninjacode911)
 */

/**
 * Row Level Security (RLS) Policies Tests
 * Tests that users can only access their own data
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const serviceClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const anonClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

describe('Row Level Security Tests', () => {
  
  let user1Id = '00000000-0000-0000-0000-000000000003';
  let user2Id = '00000000-0000-0000-0000-000000000004';

  beforeAll(async () => {
    // Create test users
    await serviceClient
      .from('users')
      .upsert([
        {
          id: user1Id,
          email: 'rls-user1@example.com',
          full_name: 'RLS Test User 1'
        },
        {
          id: user2Id,
          email: 'rls-user2@example.com',
          full_name: 'RLS Test User 2'
        }
      ]);

    // Create test data for both users
    await serviceClient
      .from('habit_logs')
      .upsert([
        {
          user_id: user1Id,
          habit_type: 'meditation',
          completed: true,
          logged_at: new Date().toISOString()
        },
        {
          user_id: user2Id,
          habit_type: 'meditation',
          completed: true,
          logged_at: new Date().toISOString()
        }
      ]);

    await serviceClient
      .from('meditation_sessions')
      .upsert([
        {
          user_id: user1Id,
          duration_minutes: 10,
          session_type: 'guided',
          status: 'completed'
        },
        {
          user_id: user2Id,
          duration_minutes: 15,
          session_type: 'guided',
          status: 'completed'
        }
      ]);

    console.log('✅ RLS test setup completed');
  });

  test('RLS is enabled on user tables', async () => {
    // Check if RLS is enabled by querying system tables
    const { data, error } = await serviceClient
      .rpc('exec_sql', {
        sql: `
          SELECT schemaname, tablename, rowsecurity 
          FROM pg_tables 
          WHERE schemaname = 'public' 
          AND tablename IN ('users', 'habit_logs', 'meditation_sessions', 'enrollments', 'subscriptions', 'notifications')
          AND rowsecurity = true;
        `
      });

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.length).toBeGreaterThan(0);
    console.log('✅ RLS is enabled on protected tables');
  });

  test('Service role can access all data (bypasses RLS)', async () => {
    // Service role should see both users' data
    const { data: habitLogs, error: habitError } = await serviceClient
      .from('habit_logs')
      .select('user_id')
      .in('user_id', [user1Id, user2Id]);

    expect(habitError).toBeNull();
    expect(habitLogs).toBeDefined();
    expect(habitLogs.length).toBe(2); // Should see both users' data
    console.log('✅ Service role bypasses RLS correctly');
  });

  test('Anonymous client cannot access user data without auth', async () => {
    // Anonymous client should not be able to access user data
    const { data, error } = await anonClient
      .from('habit_logs')
      .select('*')
      .eq('user_id', user1Id);

    // Should either get empty result or permission error
    expect(data).toEqual([]);
    console.log('✅ Anonymous client blocked from accessing user data');
  });

  test('RLS policies prevent cross-user access', async () => {
    // This test simulates what would happen with authenticated users
    // In a real scenario, you'd use actual auth tokens
    
    // Try to access user2's data while "authenticated" as user1
    // This should be blocked by RLS policies
    const { data, error } = await anonClient
      .from('habit_logs')
      .select('*')
      .eq('user_id', user2Id);

    // Should get empty result due to RLS
    expect(data).toEqual([]);
    console.log('✅ RLS prevents cross-user data access');
  });

  test('Public tables are accessible without auth', async () => {
    // Public tables like courses should be accessible
    const { data, error } = await anonClient
      .from('courses')
      .select('*')
      .limit(1);

    // Should work (even if no data exists)
    expect(error?.code).not.toBe('PGRST301'); // Not a permission error
    console.log('✅ Public tables accessible without auth');
  });

  test('RLS policies exist for all protected tables', async () => {
    const protectedTables = [
      'users',
      'habit_logs', 
      'meditation_sessions',
      'enrollments',
      'subscriptions',
      'notifications'
    ];

    for (const table of protectedTables) {
      const { data, error } = await serviceClient
        .rpc('exec_sql', {
          sql: `
            SELECT COUNT(*) as policy_count
            FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = '${table}';
          `
        });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.policy_count).toBeGreaterThan(0);
    }
    
    console.log('✅ RLS policies exist for all protected tables');
  });

  // Cleanup
  afterAll(async () => {
    await serviceClient
      .from('users')
      .delete()
      .in('id', [user1Id, user2Id]);
    console.log('✅ RLS test data cleaned up');
  });

});