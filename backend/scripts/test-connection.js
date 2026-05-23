/**
 * Test Supabase Connection
 * Verifies that your Supabase credentials are working
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Testing Supabase Connection...\n');

// Check environment variables
console.log('📋 Environment Check:');
console.log(`SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`);
console.log(`SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✅ Set' : '❌ Missing'}`);
console.log(`SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? '✅ Set' : '❌ Missing'}\n`);

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  console.error('Please check your .env file');
  process.exit(1);
}

async function testConnection() {
  try {
    // Test with ANON key (frontend simulation)
    console.log('🔑 Testing ANON key connection...');
    const anonClient = createClient(supabaseUrl, supabaseAnonKey);
    
    const { data: anonData, error: anonError } = await anonClient
      .from('users')
      .select('count')
      .limit(1);
    
    if (anonError && anonError.code !== 'PGRST116') { // PGRST116 = table doesn't exist yet
      console.log('⚠️  ANON key test:', anonError.message);
    } else {
      console.log('✅ ANON key connection successful');
    }

    // Test with SERVICE ROLE key (backend)
    console.log('🔑 Testing SERVICE ROLE key connection...');
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: serviceData, error: serviceError } = await serviceClient
      .from('users')
      .select('count')
      .limit(1);
    
    if (serviceError && serviceError.code !== 'PGRST116') {
      console.log('⚠️  SERVICE ROLE key test:', serviceError.message);
    } else {
      console.log('✅ SERVICE ROLE key connection successful');
    }

    // Test database access
    console.log('\n📊 Testing database access...');
    const { data: dbData, error: dbError } = await serviceClient
      .rpc('version'); // PostgreSQL version function
    
    if (dbError) {
      console.log('⚠️  Database access test:', dbError.message);
    } else {
      console.log('✅ Database access successful');
      console.log(`📈 PostgreSQL version: ${dbData}`);
    }

    console.log('\n🎉 Connection tests completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Run: npm run setup:db (to create tables and functions)');
    console.log('2. Start your backend: npm run dev');

  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    process.exit(1);
  }
}

testConnection();