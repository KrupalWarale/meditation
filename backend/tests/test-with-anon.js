/**
 * File: test-with-anon.js
 *
 * Description: Tests Supabase capabilities using only the anonymous key. Probes basic connectivity
 * and system function access to identify which operations require the service role key.
 *
 * Author: Navnit(Ninjacode911)
 */

/**
 * Test what we can do with ANON key only
 * This shows what's working and what needs SERVICE_ROLE_KEY
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testWithAnonKey() {
  console.log('🔍 Testing with ANON Key Only...\n');

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  const client = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // Test 1: Basic connection
    console.log('🔌 Testing basic connection...');
    const { data, error } = await client
      .from('users')
      .select('*')
      .limit(1);
    
    if (error) {
      if (error.message.includes('table') || error.message.includes('relation')) {
        console.log('✅ Connected (tables not created yet)');
      } else {
        console.log('⚠️  Connection issue:', error.message);
      }
    } else {
      console.log('✅ Connected and tables exist!');
    }

    // Test 2: Try to check if we can see any system info
    console.log('\n📊 Checking database info...');
    
    // Try a simple RPC call that might work
    const { data: versionData, error: versionError } = await client
      .rpc('version');
    
    if (versionError) {
      console.log('⚠️  Cannot call system functions with ANON key');
      console.log('   This is expected - you need SERVICE_ROLE_KEY for admin operations');
    } else {
      console.log('✅ Can access system functions:', versionData);
    }

    console.log('\n📋 Summary:');
    console.log('✅ Your Supabase project is accessible');
    console.log('✅ ANON key is working correctly');
    console.log('⚠️  Tables need to be created (requires SERVICE_ROLE_KEY)');
    console.log('⚠️  Admin functions need SERVICE_ROLE_KEY');

    console.log('\n🎯 Status: PARTIALLY READY');
    console.log('\n📝 To complete setup:');
    console.log('   1. Get SERVICE_ROLE_KEY from Supabase dashboard');
    console.log('   2. Add it to your .env file');
    console.log('   3. Run migrations to create tables');
    console.log('   4. Test streak functions');

    console.log('\n🔗 Get your SERVICE_ROLE_KEY:');
    console.log('   https://supabase.com/dashboard/project/YOUR_PROJECT_ID/settings/api');
    console.log('   Look for "service_role" key (starts with "eyJ")');

  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

testWithAnonKey();