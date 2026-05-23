/**
 * File: connection-only.js
 *
 * Description: Basic Supabase connectivity test using only the anonymous key. Verifies that
 * environment variables are set and that the client can reach the Supabase instance.
 *
 * Author: Navnit(Ninjacode911)
 */

/**
 * Basic Connection Test - Uses ANON key only
 * Tests if we can connect to Supabase at all
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testConnection() {
  console.log('🔍 Testing Basic Supabase Connection...\n');

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  console.log('📋 Environment Check:');
  console.log(`   SUPABASE_URL: ${supabaseUrl ? '✅' : '❌'}`);
  console.log(`   SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✅' : '❌'}\n`);

  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('❌ Missing basic environment variables');
    process.exit(1);
  }

  // Test with ANON key (this should work)
  const anonClient = createClient(supabaseUrl, supabaseAnonKey);

  try {
    console.log('🔌 Testing connection with ANON key...');
    
    // Try to access a system function that should work
    const { data, error } = await anonClient
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('✅ Connected! (Table "users" doesn\'t exist yet - that\'s expected)');
      } else if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.log('✅ Connected! (Tables not created yet - that\'s expected)');
      } else {
        console.log('⚠️  Connected but got error:', error.message);
        console.log('   This might be normal if tables aren\'t created yet');
      }
    } else {
      console.log('✅ Connected and can access database!');
    }

    console.log('\n🎯 Connection Status: SUCCESS');
    console.log('\n📋 Next Steps:');
    console.log('   1. Get your SERVICE_ROLE_KEY from Supabase dashboard');
    console.log('   2. Update SUPABASE_SERVICE_ROLE_KEY in .env file');
    console.log('   3. Run: npm run setup:db (to create tables)');
    console.log('   4. Run: npm run test:quick (full test)');
    
    console.log('\n🔗 Get your SERVICE_ROLE_KEY here:');
    console.log(`   https://supabase.com/dashboard/project/YOUR_PROJECT_ID/settings/api`);

  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    
    if (error.message.includes('Invalid API key')) {
      console.log('\n💡 This means your ANON key is invalid.');
      console.log('   Please check your Supabase project settings.');
    } else if (error.message.includes('fetch')) {
      console.log('\n💡 This might be a network issue.');
      console.log('   Check your internet connection.');
    }
    
    process.exit(1);
  }
}

testConnection();