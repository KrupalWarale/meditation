/**
 * Database Setup Script
 * Runs all migrations in order to set up the Supabase database
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Make sure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const migrations = [
  '001_create_users.sql',
  '002_create_courses.sql',
  '003_create_lessons.sql',
  '004_create_enrollments.sql',
  '005_create_meditation_sessions.sql',
  '006_create_habit_logs.sql',
  '007_create_events.sql',
  '008_create_event_registrations.sql',
  '009_create_subscriptions.sql',
  '010_create_payments.sql',
  '011_create_notifications.sql',
  '012_create_daily_quotes.sql',
  '013_create_content_directory.sql',
  '014_create_rls_policies.sql',
  '015_create_indexes.sql',
  '016_create_functions.sql',
  '017_add_onboarding_fields.sql',
  '018_create_course_reviews.sql',
  '019_create_phase2_tables.sql',
  '020_add_missing_columns.sql',
  '021_fix_phase3_issues.sql'
];

async function runMigrations() {
  console.log('🚀 Starting database setup...\n');

  for (const migration of migrations) {
    const migrationPath = path.join(__dirname, '../supabase/migrations', migration);
    
    if (!fs.existsSync(migrationPath)) {
      console.log(`⚠️  Skipping ${migration} (file not found)`);
      continue;
    }

    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    if (!sql.trim()) {
      console.log(`⚠️  Skipping ${migration} (empty file)`);
      continue;
    }

    try {
      console.log(`📝 Running ${migration}...`);
      
      const { error } = await supabase.rpc('exec_sql', { sql });
      
      if (error) {
        console.error(`❌ Error in ${migration}:`, error.message);
        process.exit(1);
      }
      
      console.log(`✅ ${migration} completed`);
    } catch (err) {
      console.error(`❌ Failed to run ${migration}:`, err.message);
      process.exit(1);
    }
  }

  console.log('\n🎉 Database setup completed successfully!');
  console.log('\n📊 Testing streak functions...');
  
  // Test the streak functions
  await testStreakFunctions();
}

async function testStreakFunctions() {
  try {
    // Test calculate_streak function
    const { data: streakData, error: streakError } = await supabase
      .rpc('calculate_streak', {
        p_user_id: '00000000-0000-0000-0000-000000000000',
        p_habit_type: 'meditation'
      });

    if (streakError) {
      console.error('❌ Streak function test failed:', streakError.message);
    } else {
      console.log('✅ Streak functions are working');
    }

    // Test get_user_streaks function
    const { data: allStreaksData, error: allStreaksError } = await supabase
      .rpc('get_user_streaks', {
        p_user_id: '00000000-0000-0000-0000-000000000000'
      });

    if (allStreaksError) {
      console.error('❌ User streaks function test failed:', allStreaksError.message);
    } else {
      console.log('✅ User streaks functions are working');
    }

  } catch (err) {
    console.error('❌ Function test error:', err.message);
  }
}

// Run the setup
runMigrations().catch(console.error);