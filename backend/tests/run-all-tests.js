/**
 * File: run-all-tests.js
 *
 * Description: Sequential test runner that executes all database test suites (connection, streaks,
 * RLS, auth middleware) and produces an aggregated pass/fail summary report.
 *
 * Author: Navnit(Ninjacode911)
 */

/**
 * Test Runner - Runs all database tests in sequence
 * Use this to test your complete database setup
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Starting Complete Database Test Suite...\n');

const tests = [
  {
    name: 'Database Connection & Tables',
    file: 'database.test.js',
    description: 'Tests basic database connectivity and table existence'
  },
  {
    name: 'Streak Functions',
    file: 'streak-functions.test.js', 
    description: 'Tests habit streak calculation functions'
  },
  {
    name: 'RLS Policies',
    file: 'rls-policies.test.js',
    description: 'Tests Row Level Security policies'
  },
  {
    name: 'Auth Middleware',
    file: 'auth-middleware.test.js',
    description: 'Tests Supabase JWT authentication middleware'
  }
];

async function runTests() {
  let passedTests = 0;
  let failedTests = 0;

  for (const test of tests) {
    console.log(`\n📋 Running: ${test.name}`);
    console.log(`📝 ${test.description}\n`);

    try {
      // Run the test file
      execSync(`npx jest ${test.file} --verbose`, {
        cwd: path.join(__dirname, '..'),
        stdio: 'inherit'
      });
      
      console.log(`✅ ${test.name} - PASSED\n`);
      passedTests++;
    } catch (error) {
      console.log(`❌ ${test.name} - FAILED\n`);
      failedTests++;
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`📈 Total: ${passedTests + failedTests}`);

  if (failedTests === 0) {
    console.log('\n🎉 All tests passed! Your database is working perfectly.');
    console.log('\n📋 What this means:');
    console.log('   ✅ Supabase connection is working');
    console.log('   ✅ All tables are created correctly');
    console.log('   ✅ Streak functions are working');
    console.log('   ✅ RLS policies are protecting user data');
    console.log('   ✅ Authentication middleware is secure');
    console.log('\n🚀 Your meditation app backend is ready for production!');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
    console.log('\n🔧 Common issues:');
    console.log('   - Missing SUPABASE_SERVICE_ROLE_KEY in .env');
    console.log('   - Database migrations not run yet');
    console.log('   - Network connectivity issues');
    console.log('\n💡 Try running: npm run setup:db');
  }

  process.exit(failedTests > 0 ? 1 : 0);
}

runTests().catch(console.error);