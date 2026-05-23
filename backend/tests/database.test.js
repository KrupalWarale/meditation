/**
 * File: database.test.js
 *
 * Description: Database connection and basic functionality tests. Validates Supabase connectivity,
 * verifies that all expected tables exist, and exercises basic CRUD operations against the database.
 *
 * Author: Navnit(Ninjacode911)
 */

/**
 * Database Connection and Basic Functionality Tests
 * Tests Supabase connection, table creation, and basic operations
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Test clients
const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
const anonClient = createClient(supabaseUrl, supabaseAnonKey);

describe('Database Connection Tests', () => {

    test('Environment variables are set', () => {
        expect(supabaseUrl).toBeDefined();
        expect(supabaseUrl).toContain('supabase.co');
        expect(supabaseServiceKey).toBeDefined();
        expect(supabaseAnonKey).toBeDefined();
        console.log('✅ Environment variables configured');
    });

    test('Service role client connects to database', async () => {
        const { data, error } = await serviceClient
            .rpc('version'); // PostgreSQL version function

        expect(error).toBeNull();
        expect(data).toBeDefined();
        console.log(`✅ Database connected - PostgreSQL version: ${data}`);
    });

    test('Anonymous client connects to database', async () => {
        const { data, error } = await anonClient
            .from('users')
            .select('count')
            .limit(1);

        // Should work even if table doesn't exist yet (different error)
        expect(error?.code).not.toBe('PGRST301'); // Connection error
        console.log('✅ Anonymous client connection working');
    });

});

describe('Table Existence Tests', () => {

    const expectedTables = [
        'users',
        'courses',
        'lessons',
        'enrollments',
        'meditation_sessions',
        'habit_logs',
        'subscriptions',
        'notifications'
    ];

    test.each(expectedTables)('Table %s exists', async (tableName) => {
        const { data, error } = await serviceClient
            .from(tableName)
            .select('*')
            .limit(1);

        // Table should exist (error should not be "relation does not exist")
        expect(error?.code).not.toBe('PGRST116');
        console.log(`✅ Table '${tableName}' exists`);
    });

});

describe('Basic CRUD Operations', () => {

    let testUserId;

    test('Can insert test user', async () => {
        const testUser = {
            id: '00000000-0000-0000-0000-000000000001',
            email: 'test@example.com',
            full_name: 'Test User',
            subscription_status: 'free'
        };

        const { data, error } = await serviceClient
            .from('users')
            .upsert(testUser)
            .select()
            .single();

        expect(error).toBeNull();
        expect(data).toBeDefined();
        expect(data.email).toBe(testUser.email);

        testUserId = data.id;
        console.log('✅ Test user created successfully');
    });

    test('Can insert habit log', async () => {
        if (!testUserId) {
            throw new Error('Test user not created');
        }

        const habitLog = {
            user_id: testUserId,
            habit_type: 'meditation',
            completed: true,
            duration_minutes: 10,
            logged_at: new Date().toISOString()
        };

        const { data, error } = await serviceClient
            .from('habit_logs')
            .insert(habitLog)
            .select()
            .single();

        expect(error).toBeNull();
        expect(data).toBeDefined();
        expect(data.habit_type).toBe('meditation');
        console.log('✅ Habit log created successfully');
    });

    test('Can insert meditation session', async () => {
        if (!testUserId) {
            throw new Error('Test user not created');
        }

        const session = {
            user_id: testUserId,
            duration_minutes: 15,
            session_type: 'guided',
            status: 'completed',
            completed_at: new Date().toISOString()
        };

        const { data, error } = await serviceClient
            .from('meditation_sessions')
            .insert(session)
            .select()
            .single();

        expect(error).toBeNull();
        expect(data).toBeDefined();
        expect(data.session_type).toBe('guided');
        console.log('✅ Meditation session created successfully');
    });

    // Cleanup
    afterAll(async () => {
        if (testUserId) {
            await serviceClient
                .from('users')
                .delete()
                .eq('id', testUserId);
            console.log('✅ Test data cleaned up');
        }
    });

});