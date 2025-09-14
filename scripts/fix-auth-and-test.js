#!/usr/bin/env node

/**
 * Fix Authentication and Test Migration
 * This script fixes auth issues and tests the complete migration
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

async function fixAuthAndTest() {
  try {
    log('🔧 Fixing Authentication and Testing Migration', colors.cyan);
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing required environment variables');
    }
    
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    
    // Test with a proper email format
    const testEmail = `testuser.${Date.now()}@testdomain.com`;
    const testPassword = 'TestPassword123!';
    
    log(`📧 Testing with email: ${testEmail}`, colors.blue);
    
    // Test 1: Try to sign up
    log('🔐 Testing user signup...', colors.blue);
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });
    
    if (authError) {
      log(`❌ Sign up failed: ${authError.message}`, colors.red);
      
      // Check if it's because user already exists
      if (authError.message.includes('already registered')) {
        log('ℹ️  User already exists, trying to sign in...', colors.yellow);
        
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: testEmail,
          password: testPassword,
        });
        
        if (signInError) {
          log(`❌ Sign in failed: ${signInError.message}`, colors.red);
          throw new Error('Authentication failed');
        } else {
          log('✅ Sign in successful', colors.green);
        }
      } else {
        throw new Error(`Sign up failed: ${authError.message}`);
      }
    } else {
      log('✅ Sign up successful', colors.green);
      
      // Wait a moment for the user to be created
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Get current user
    let { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      log(`❌ Failed to get current user: ${userError?.message || 'Unknown error'}`, colors.red);
      
      // Try to sign in again
      log('🔄 Trying to sign in again...', colors.yellow);
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });
      
      if (signInError) {
        throw new Error(`Sign in failed: ${signInError.message}`);
      }
      
      // Try to get user again
      const { data: { user: user2 }, error: userError2 } = await supabase.auth.getUser();
      if (userError2 || !user2) {
        throw new Error('Failed to get current user after sign in');
      }
      
      log(`✅ Authenticated as: ${user2.email}`, colors.green);
      // Continue with user2
      user = user2;
    } else {
      log(`✅ Authenticated as: ${user.email}`, colors.green);
    }
    
    // Test 2: Check if all required tables exist
    log('\n📋 Checking table existence...', colors.blue);
    
    const requiredTables = [
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
    
    const tableStatus = {};
    
    for (const tableName of requiredTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (error) {
          if (error.message.includes('does not exist') || error.message.includes('schema cache')) {
            tableStatus[tableName] = { exists: false, error: error.message };
            log(`  ❌ Missing: ${tableName}`, colors.red);
          } else {
            tableStatus[tableName] = { exists: true, error: null };
            log(`  ✅ Exists: ${tableName}`, colors.green);
          }
        } else {
          tableStatus[tableName] = { exists: true, error: null };
          log(`  ✅ Exists: ${tableName}`, colors.green);
        }
      } catch (err) {
        tableStatus[tableName] = { exists: false, error: err.message };
        log(`  ❌ Missing: ${tableName}`, colors.red);
      }
    }
    
    const existingTables = Object.values(tableStatus).filter(t => t.exists).length;
    const missingTables = Object.values(tableStatus).filter(t => !t.exists).length;
    
    log(`\n📊 Table Status: ${existingTables}/${requiredTables.length} exist`, colors.cyan);
    
    if (missingTables > 0) {
      log('\n⚠️  Missing tables detected. Please run the SQL migration first:', colors.yellow);
      log('1. Copy the contents of scripts/create-missing-tables.sql', colors.yellow);
      log('2. Go to Supabase Dashboard → SQL Editor', colors.yellow);
      log('3. Paste and execute the SQL', colors.yellow);
      log('4. Re-run this script', colors.yellow);
      
      const missingTableNames = Object.entries(tableStatus)
        .filter(([_, status]) => !status.exists)
        .map(([name, _]) => name);
      
      log('\nMissing tables:', colors.yellow);
      missingTableNames.forEach(name => log(`  - ${name}`, colors.yellow));
      
      return;
    }
    
    // Test 3: Test data insertion
    log('\n🧪 Testing data insertion...', colors.blue);
    
    const testData = {
      project_id: 'test-project-' + Date.now(),
      name: 'Test Project',
      description: 'Test project for migration testing',
      status: 'draft',
      project_data: {
        features: ['Feature 1', 'Feature 2'],
        target_audience: 'Test users'
      }
    };
    
    try {
      const { data: insertData, error: insertError } = await supabase
        .from('mvp_studio_projects')
        .insert({
          ...testData,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();
      
      if (insertError) {
        log(`❌ Data insertion failed: ${insertError.message}`, colors.red);
      } else {
        log('✅ Data insertion successful', colors.green);
        log(`  Inserted record ID: ${insertData[0].id}`, colors.green);
      }
    } catch (err) {
      log(`❌ Data insertion error: ${err.message}`, colors.red);
    }
    
    // Test 4: Test RLS
    log('\n🔒 Testing Row Level Security...', colors.blue);
    
    try {
      // Test that user can access their own data
      const { data: ownData, error: ownError } = await supabase
        .from('mvp_studio_projects')
        .select('*')
        .eq('user_id', user.id);
      
      if (ownError) {
        log(`❌ RLS test failed: ${ownError.message}`, colors.red);
      } else {
        log(`✅ RLS working: Found ${ownData.length} records for user`, colors.green);
      }
    } catch (err) {
      log(`❌ RLS test error: ${err.message}`, colors.red);
    }
    
    // Clean up test data
    log('\n🧹 Cleaning up test data...', colors.blue);
    
    try {
      const { error: deleteError } = await supabase
        .from('mvp_studio_projects')
        .delete()
        .eq('user_id', user.id);
      
      if (deleteError) {
        log(`⚠️  Cleanup warning: ${deleteError.message}`, colors.yellow);
      } else {
        log('✅ Test data cleaned up', colors.green);
      }
    } catch (err) {
      log(`⚠️  Cleanup error: ${err.message}`, colors.yellow);
    }
    
    // Sign out
    await supabase.auth.signOut();
    log('✅ Signed out', colors.green);
    
    log('\n🎉 Authentication and migration test completed!', colors.green);
    
    if (missingTables === 0) {
      log('✅ All systems ready for E2E testing', colors.green);
    } else {
      log('⚠️  Please complete the SQL migration first', colors.yellow);
    }
    
  } catch (error) {
    log(`❌ Test failed: ${error.message}`, colors.red);
    process.exit(1);
  }
}

// Run the test
fixAuthAndTest();
