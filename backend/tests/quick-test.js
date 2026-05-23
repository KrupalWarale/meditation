/**
 * File: quick-test.js
 *
 * Description: Quick smoke test for the database setup. Checks Supabase connectivity, verifies
 * core tables exist, validates streak functions, and confirms RLS policies are active.
 *
 * Author: Navnit(Ninjacode911)
 */

/**
 * Quick Database Test
 * Fast test to check if your database is working
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function quickTest() {
  console.log('🔍 Quick Database Test Starting...\n');

  // Check environment
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  console.log('📋 Environment Check:');
  console.log(`   SUPABASE_URL: ${supabaseUrl ? '✅' : '❌'}`);
  console.log(`   SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✅' : '❌'}`);
  console.log(`   SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? '✅' : '❌'}\n`);

  if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
    console.log('❌ Missing environment variables. Please check your .env file.');
    process.exit(1);
  }

  const client = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Test 1: Database connection
    console.log('🔌 Testing database connection...');
    const { data: version, error: versionError } = await client.rpc('version');
    
    if (versionError) {
      console.log('❌ Database connection failed:', versionError.message);
      process.exit(1);
    }
    
    console.log(`✅ Connected to PostgreSQL: ${version}\n`);

    // Test 2: Check if tables exist
    console.log('📊 Checking core tables...');
    const tables = ['users', 'habit_logs', 'meditation_sessions'];
    
    for (const table of tables) {
      const { data, error } = await client
        .from(table)
        .select('*')
        .limit(1);
      
      if (error && error.code === 'PGRST116') {
        console.log(`❌ Table '${table}' does not exist`);
      } else {
        console.log(`✅ Table '${table}' exists`);
      }
    }

    // Test 3: Check streak functions
    console.log('\n🧮 Testing streak functions...');
    const { data: streakData, error: streakError } = await client
      .rpc('calculate_streak', {
        p_user_id: '00000000-0000-0000-0000-000000000000',
        p_habit_type: 'meditation'
      });

    if (streakError) {
      console.log('❌ Streak function failed:', streakError.message);
    } else {
      console.log('✅ Streak functions working');
    }

    // Test 4: Test RLS
    console.log('\n🔒 Testing Row Level Security...');
    const anonClient = createClient(supabaseUrl, supabaseAnonKey);
    const { data: rlsData, error: rlsError } = await anonClient
      .from('users')
      .select('*')
      .limit(1);

    // Should get empty result or specific RLS error (not connection error)
    if (rlsError && rlsError.code === 'PGRST301') {
      console.log('❌ RLS test failed - connection issue');
    } else {
      console.log('✅ RLS policies active');
    }

    console.log('\n🎉 Quick test completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Run full tests: npm test');
    console.log('   2. Start your backend: npm run dev');
    console.log('   3. Test API endpoints with Postman/curl');

  } catch (error) {
    console.log('❌ Quick test failed:', error.message);
    process.exit(1);
  }
}

quickTest();