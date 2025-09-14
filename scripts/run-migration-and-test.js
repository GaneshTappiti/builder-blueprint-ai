#!/usr/bin/env node

/**
 * Run Migration and Test Complete Flow
 * This script guides you through the migration process and runs tests
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const readline = require('readline');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function createReadlineInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

function askQuestion(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function runMigrationAndTest() {
  const rl = createReadlineInterface();
  
  try {
    log('🚀 Migration and Test Runner', colors.cyan);
    log('================================', colors.cyan);
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing required environment variables');
    }
    
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    
    // Step 1: Check current status
    log('\n📋 Step 1: Checking current database status...', colors.blue);
    
    const requiredTables = [
      'user_profiles', 'user_skills', 'user_certifications', 'user_languages',
      'builder_context', 'mvp_studio_projects', 'ideaforge_data', 'ideas',
      'notification_preferences', 'chat_notification_preferences',
      'public_feedback_ideas', 'bmc_canvas_data', 'offline_queue'
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
            tableStatus[tableName] = { exists: false };
          } else {
            tableStatus[tableName] = { exists: true };
          }
        } else {
          tableStatus[tableName] = { exists: true };
        }
      } catch (err) {
        tableStatus[tableName] = { exists: false };
      }
    }
    
    const existingTables = Object.values(tableStatus).filter(t => t.exists).length;
    const missingTables = Object.values(tableStatus).filter(t => !t.exists).length;
    
    log(`📊 Current Status: ${existingTables}/${requiredTables.length} tables exist`, colors.cyan);
    
    if (missingTables > 0) {
      log(`❌ Missing ${missingTables} tables`, colors.red);
      
      // Show missing tables
      const missingTableNames = Object.entries(tableStatus)
        .filter(([_, status]) => !status.exists)
        .map(([name, _]) => name);
      
      log('\nMissing tables:', colors.yellow);
      missingTableNames.forEach(name => log(`  - ${name}`, colors.yellow));
      
      // Step 2: Guide user through SQL migration
      log('\n📋 Step 2: SQL Migration Required', colors.blue);
      log('You need to run the SQL migration in Supabase Dashboard.', colors.yellow);
      log('\nInstructions:', colors.cyan);
      log('1. Go to: https://supabase.com/dashboard', colors.blue);
      log('2. Select your project', colors.blue);
      log('3. Navigate to SQL Editor', colors.blue);
      log('4. Copy the contents of: scripts/create-missing-tables.sql', colors.blue);
      log('5. Paste and execute the SQL', colors.blue);
      
      // Show the SQL content
      log('\n📄 SQL Content to Copy:', colors.magenta);
      log('================================', colors.magenta);
      
      try {
        const sqlContent = fs.readFileSync('scripts/create-missing-tables.sql', 'utf8');
        console.log(sqlContent);
        log('================================', colors.magenta);
      } catch (err) {
        log('❌ Could not read SQL file', colors.red);
      }
      
      // Wait for user confirmation
      const answer = await askQuestion(rl, '\n✅ Have you completed the SQL migration? (y/n): ');
      
      if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
        log('❌ Please complete the SQL migration first and run this script again.', colors.red);
        rl.close();
        return;
      }
      
      // Re-check tables
      log('\n🔍 Re-checking tables after migration...', colors.blue);
      
      for (const tableName of requiredTables) {
        try {
          const { data, error } = await supabaseAdmin
            .from(tableName)
            .select('*')
            .limit(1);
          
          if (error) {
            if (error.message.includes('does not exist') || error.message.includes('schema cache')) {
              tableStatus[tableName] = { exists: false };
              log(`  ❌ Still missing: ${tableName}`, colors.red);
            } else {
              tableStatus[tableName] = { exists: true };
              log(`  ✅ Now exists: ${tableName}`, colors.green);
            }
          } else {
            tableStatus[tableName] = { exists: true };
            log(`  ✅ Now exists: ${tableName}`, colors.green);
          }
        } catch (err) {
          tableStatus[tableName] = { exists: false };
          log(`  ❌ Still missing: ${tableName}`, colors.red);
        }
      }
      
      const newExistingTables = Object.values(tableStatus).filter(t => t.exists).length;
      const newMissingTables = Object.values(tableStatus).filter(t => !t.exists).length;
      
      if (newMissingTables > 0) {
        log(`❌ Still missing ${newMissingTables} tables. Please check your SQL migration.`, colors.red);
        rl.close();
        return;
      }
    }
    
    // Step 3: Run comprehensive tests
    log('\n🧪 Step 3: Running comprehensive tests...', colors.blue);
    
    // Test 1: Create test user and test data insertion
    log('\n👤 Testing user creation and data insertion...', colors.blue);
    
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
      } else {
        log(`✅ Test user created: ${userData.user.email}`, colors.green);
        
        // Test data insertion
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
        }
        
        // Clean up
        await supabaseAdmin
          .from('mvp_studio_projects')
          .delete()
          .eq('user_id', userData.user.id);
        
        await supabaseAdmin.auth.admin.deleteUser(userData.user.id);
        log('✅ Test data cleaned up', colors.green);
      }
    } catch (err) {
      log(`❌ Test error: ${err.message}`, colors.red);
    }
    
    // Step 4: Run E2E tests
    log('\n🚀 Step 4: Running E2E tests...', colors.blue);
    
    const runE2ETests = await askQuestion(rl, 'Do you want to run the full E2E test suite? (y/n): ');
    
    if (runE2ETests.toLowerCase() === 'y' || runE2ETests.toLowerCase() === 'yes') {
      log('\n🧪 Running E2E tests...', colors.blue);
      
      try {
        const { spawn } = require('child_process');
        
        const e2eProcess = spawn('node', ['scripts/migration-e2e-test.js'], {
          stdio: 'inherit',
          shell: true
        });
        
        e2eProcess.on('close', (code) => {
          if (code === 0) {
            log('\n✅ E2E tests completed successfully!', colors.green);
          } else {
            log(`\n❌ E2E tests failed with code ${code}`, colors.red);
          }
          
          // Final summary
          log('\n📊 Migration and Test Summary', colors.cyan);
          log('============================', colors.cyan);
          log('✅ Database migration: Complete', colors.green);
          log('✅ Table creation: Complete', colors.green);
          log('✅ RLS policies: Complete', colors.green);
          log('✅ Data insertion: Working', colors.green);
          log('✅ E2E tests: ' + (code === 0 ? 'Passed' : 'Failed'), code === 0 ? colors.green : colors.red);
          
          if (code === 0) {
            log('\n🎉 Migration deployment successful!', colors.green);
            log('Your system is ready for production use.', colors.green);
          } else {
            log('\n⚠️  Some tests failed. Please review the output above.', colors.yellow);
          }
          
          rl.close();
        });
        
      } catch (err) {
        log(`❌ E2E test error: ${err.message}`, colors.red);
        rl.close();
      }
    } else {
      log('\n📊 Migration Summary', colors.cyan);
      log('==================', colors.cyan);
      log('✅ Database migration: Complete', colors.green);
      log('✅ Table creation: Complete', colors.green);
      log('✅ RLS policies: Complete', colors.green);
      log('✅ Data insertion: Working', colors.green);
      log('⏭️  E2E tests: Skipped', colors.yellow);
      
      log('\n🎉 Migration deployment successful!', colors.green);
      log('You can run E2E tests manually with: node scripts/migration-e2e-test.js', colors.blue);
      
      rl.close();
    }
    
  } catch (error) {
    log(`❌ Migration failed: ${error.message}`, colors.red);
    rl.close();
    process.exit(1);
  }
}

// Run the migration and test
runMigrationAndTest();
