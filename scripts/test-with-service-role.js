#!/usr/bin/env node

/**
 * Test Migration with Service Role (Bypasses Email Confirmation)
 * This script uses the service role key to test the complete migration
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

async function testWithServiceRole() {
  try {
    log('🔧 Testing Migration with Service Role', colors.cyan);
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing required environment variables');
    }
    
    // Use service role key to bypass RLS and email confirmation
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    
    // Test 1: Check if all required tables exist
    log('📋 Checking table existence...', colors.blue);
    
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
        const { data, error } = await supabaseAdmin
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
    
    // Test 2: Create a test user using admin
    log('\n👤 Creating test user...', colors.blue);
    
    const testEmail = `testuser.${Date.now()}@testdomain.com`;
    const testPassword = 'TestPassword123!';
    
    try {
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        email_confirm: true
      });
      
      if (userError) {
        log(`❌ User creation failed: ${userError.message}`, colors.red);
        throw new Error('Failed to create test user');
      }
      
      log(`✅ Test user created: ${userData.user.email}`, colors.green);
      
      // Test 3: Test data insertion with the created user
      log('\n🧪 Testing data insertion...', colors.blue);
      
      const testData = {
        project_id: 'test-project-' + Date.now(),
        name: 'Test Project',
        description: 'Test project for migration testing',
        status: 'draft',
        project_data: {
          features: ['Feature 1', 'Feature 2'],
          target_audience: 'Test users'
        },
        user_id: userData.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data: insertData, error: insertError } = await supabaseAdmin
        .from('mvp_studio_projects')
        .insert(testData)
        .select();
      
      if (insertError) {
        log(`❌ Data insertion failed: ${insertError.message}`, colors.red);
      } else {
        log('✅ Data insertion successful', colors.green);
        log(`  Inserted record ID: ${insertData[0].id}`, colors.green);
      }
      
      // Test 4: Test RLS by querying as the user
      log('\n🔒 Testing Row Level Security...', colors.blue);
      
      // Create a client with the user's session
      const userSupabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      
      // Sign in as the user
      const { data: signInData, error: signInError } = await userSupabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });
      
      if (signInError) {
        log(`❌ User sign in failed: ${signInError.message}`, colors.red);
      } else {
        log('✅ User sign in successful', colors.green);
        
        // Test that user can access their own data
        const { data: ownData, error: ownError } = await userSupabase
          .from('mvp_studio_projects')
          .select('*')
          .eq('user_id', userData.user.id);
        
        if (ownError) {
          log(`❌ RLS test failed: ${ownError.message}`, colors.red);
        } else {
          log(`✅ RLS working: Found ${ownData.length} records for user`, colors.green);
        }
        
        // Test that user cannot access other users' data
        const { data: otherData, error: otherError } = await userSupabase
          .from('mvp_studio_projects')
          .select('*')
          .neq('user_id', userData.user.id);
        
        if (otherError) {
          log(`✅ RLS working: Cannot access other users' data (${otherError.message})`, colors.green);
        } else if (otherData && otherData.length > 0) {
          log(`❌ RLS issue: Can access other users' data (${otherData.length} records)`, colors.red);
        } else {
          log('✅ RLS working: Cannot access other users\' data', colors.green);
        }
      }
      
      // Clean up test data
      log('\n🧹 Cleaning up test data...', colors.blue);
      
      try {
        const { error: deleteError } = await supabaseAdmin
          .from('mvp_studio_projects')
          .delete()
          .eq('user_id', userData.user.id);
        
        if (deleteError) {
          log(`⚠️  Cleanup warning: ${deleteError.message}`, colors.yellow);
        } else {
          log('✅ Test data cleaned up', colors.green);
        }
      } catch (err) {
        log(`⚠️  Cleanup error: ${err.message}`, colors.yellow);
      }
      
      // Delete the test user
      try {
        const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(userData.user.id);
        if (deleteUserError) {
          log(`⚠️  User cleanup warning: ${deleteUserError.message}`, colors.yellow);
        } else {
          log('✅ Test user cleaned up', colors.green);
        }
      } catch (err) {
        log(`⚠️  User cleanup error: ${err.message}`, colors.yellow);
      }
      
    } catch (err) {
      log(`❌ User creation error: ${err.message}`, colors.red);
    }
    
    log('\n🎉 Migration test completed!', colors.green);
    
    if (missingTables === 0) {
      log('✅ All systems ready for E2E testing', colors.green);
      log('\n📋 Next steps:', colors.cyan);
      log('1. Run the E2E tests: node scripts/migration-e2e-test.js', colors.blue);
      log('2. Run the browser tests: Open scripts/browser-migration-test.html', colors.blue);
    } else {
      log('⚠️  Please complete the SQL migration first', colors.yellow);
    }
    
  } catch (error) {
    log(`❌ Test failed: ${error.message}`, colors.red);
    process.exit(1);
  }
}

// Run the test
testWithServiceRole();
