#!/usr/bin/env node

/**
 * Execute Migration Step by Step
 * This script creates tables one by one using Supabase client
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function createTablesStepByStep() {
  try {
    log('🚀 Creating Migration Tables Step by Step', colors.cyan);
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing required environment variables');
    }
    
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    // Test connection first
    log('🔌 Testing Supabase connection...', colors.blue);
    const { data: testData, error: testError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);
    
    if (testError && !testError.message.includes('relation "user_profiles" does not exist')) {
      log(`❌ Connection test failed: ${testError.message}`, colors.red);
      throw new Error('Failed to connect to Supabase');
    }
    
    log('✅ Supabase connection successful', colors.green);
    
    // Since we can't execute raw SQL directly, let's check what tables exist
    log('\n📋 Checking existing tables...', colors.blue);
    
    const tablesToCheck = [
      'user_profiles',
      'user_skills',
      'user_certifications', 
      'user_languages',
      'builder_context',
      'mvp_studio_projects',
      'ideaforge_data',
      'ideas',
      'notification_preferences',
      'chat_notification_preferences',
      'public_feedback_ideas',
      'bmc_canvas_data',
      'offline_queue'
    ];
    
    const existingTables = [];
    const missingTables = [];
    
    for (const tableName of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (error) {
          if (error.message.includes('does not exist') || error.message.includes('schema cache')) {
            missingTables.push(tableName);
            log(`  ❌ Missing: ${tableName}`, colors.red);
          } else {
            existingTables.push(tableName);
            log(`  ✅ Exists: ${tableName}`, colors.green);
          }
        } else {
          existingTables.push(tableName);
          log(`  ✅ Exists: ${tableName}`, colors.green);
        }
      } catch (err) {
        missingTables.push(tableName);
        log(`  ❌ Missing: ${tableName}`, colors.red);
      }
    }
    
    log(`\n📊 Table Status:`, colors.cyan);
    log(`  ✅ Existing: ${existingTables.length}`, colors.green);
    log(`  ❌ Missing: ${missingTables.length}`, colors.red);
    
    if (missingTables.length > 0) {
      log('\n⚠️  Missing tables detected. You need to run the SQL migration manually:', colors.yellow);
      log('1. Go to your Supabase dashboard', colors.yellow);
      log('2. Navigate to SQL Editor', colors.yellow);
      log('3. Copy and paste the contents of migration-complete.sql', colors.yellow);
      log('4. Execute the SQL', colors.yellow);
      log('\nMissing tables:', colors.yellow);
      missingTables.forEach(table => log(`  - ${table}`, colors.yellow));
    } else {
      log('\n✅ All required tables exist!', colors.green);
    }
    
    // Test authentication
    log('\n🔐 Testing authentication...', colors.blue);
    
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    
    try {
      // Try to sign up
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      });
      
      if (authError) {
        log(`❌ Sign up failed: ${authError.message}`, colors.red);
        
        // Try to sign in with existing user
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: testEmail,
          password: testPassword,
        });
        
        if (signInError) {
          log(`❌ Sign in failed: ${signInError.message}`, colors.red);
          log('⚠️  Authentication setup needs to be fixed', colors.yellow);
        } else {
          log('✅ Sign in successful', colors.green);
        }
      } else {
        log('✅ Sign up successful', colors.green);
      }
    } catch (err) {
      log(`❌ Authentication test failed: ${err.message}`, colors.red);
    }
    
    log('\n📋 Next Steps:', colors.cyan);
    log('1. Run the SQL migration in Supabase dashboard', colors.blue);
    log('2. Fix authentication issues if any', colors.blue);
    log('3. Re-run the E2E tests', colors.blue);
    
  } catch (error) {
    log(`❌ Setup failed: ${error.message}`, colors.red);
    process.exit(1);
  }
}

// Run the setup
createTablesStepByStep();
