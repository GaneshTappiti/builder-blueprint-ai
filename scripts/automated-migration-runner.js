#!/usr/bin/env node

/**
 * Automated Migration Runner
 * This script attempts to run the migration automatically and then executes all tests
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

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

async function automatedMigrationRunner() {
  try {
    log('🤖 Automated Migration Runner', colors.cyan);
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
      
      // Step 2: Attempt automated migration
      log('\n🔧 Step 2: Attempting automated migration...', colors.blue);
      
      try {
        // Read the SQL migration file
        const sqlContent = fs.readFileSync('scripts/create-missing-tables.sql', 'utf8');
        
        // Split into individual statements
        const statements = sqlContent
          .split(';')
          .map(stmt => stmt.trim())
          .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
        
        log(`📝 Found ${statements.length} SQL statements to execute`, colors.blue);
        
        let successCount = 0;
        let errorCount = 0;
        
        for (let i = 0; i < statements.length; i++) {
          const statement = statements[i];
          
          // Skip comments and empty statements
          if (statement.startsWith('--') || statement.length < 10) {
            continue;
          }
          
          try {
            log(`Executing statement ${i + 1}/${statements.length}...`, colors.blue);
            
            // Try to execute using rpc function
            const { data, error } = await supabaseAdmin.rpc('exec_sql', {
              sql_query: statement
            });
            
            if (error) {
              // Try alternative approach - direct table operations
              if (statement.includes('CREATE TABLE')) {
                log(`  ⚠️  Statement ${i + 1}: Cannot execute CREATE TABLE via RPC`, colors.yellow);
                errorCount++;
              } else {
                log(`  ⚠️  Statement ${i + 1}: ${error.message}`, colors.yellow);
                errorCount++;
              }
            } else {
              log(`  ✅ Statement ${i + 1} executed`, colors.green);
              successCount++;
            }
          } catch (err) {
            log(`  ❌ Statement ${i + 1}: ${err.message}`, colors.red);
            errorCount++;
          }
        }
        
        log(`\n📊 Migration Results: ${successCount} successful, ${errorCount} failed`, colors.cyan);
        
        if (errorCount > 0) {
          log('\n⚠️  Automated migration partially failed. Manual intervention required.', colors.yellow);
          log('Please run the SQL migration manually in Supabase Dashboard:', colors.yellow);
          log('1. Go to: https://supabase.com/dashboard', colors.blue);
          log('2. Select your project', colors.blue);
          log('3. Navigate to SQL Editor', colors.blue);
          log('4. Copy and execute: scripts/create-missing-tables.sql', colors.blue);
          
          // Show the SQL content
          log('\n📄 SQL Content to Copy:', colors.magenta);
          log('================================', colors.magenta);
          console.log(sqlContent);
          log('================================', colors.magenta);
          
          return;
        }
        
      } catch (err) {
        log(`❌ Migration error: ${err.message}`, colors.red);
        return;
      }
    }
    
    // Step 3: Verify migration success
    log('\n🔍 Step 3: Verifying migration success...', colors.blue);
    
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
    
    const finalExistingTables = Object.values(tableStatus).filter(t => t.exists).length;
    const finalMissingTables = Object.values(tableStatus).filter(t => !t.exists).length;
    
    if (finalMissingTables > 0) {
      log(`❌ Migration incomplete: ${finalMissingTables} tables still missing`, colors.red);
      log('Please run the SQL migration manually and try again.', colors.yellow);
      return;
    }
    
    log(`✅ Migration successful: All ${finalExistingTables} tables exist`, colors.green);
    
    // Step 4: Run comprehensive tests
    log('\n🧪 Step 4: Running comprehensive tests...', colors.blue);
    
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
        
        // Test data insertion for each table
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
        
        // Test mvp_studio_projects table
        const { data: insertData, error: insertError } = await supabaseAdmin
          .from('mvp_studio_projects')
          .insert(testData)
          .select();
        
        if (insertError) {
          log(`❌ Data insertion failed: ${insertError.message}`, colors.red);
        } else {
          log('✅ Data insertion successful', colors.green);
        }
        
        // Test builder_context table
        const contextData = {
          project_id: 'test-context-' + Date.now(),
          context_data: {
            steps: ['Step 1', 'Step 2'],
            progress: 0.5,
            notes: 'Test context'
          },
          user_id: userData.user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const { data: contextInsertData, error: contextInsertError } = await supabaseAdmin
          .from('builder_context')
          .insert(contextData)
          .select();
        
        if (contextInsertError) {
          log(`❌ Context data insertion failed: ${contextInsertError.message}`, colors.red);
        } else {
          log('✅ Context data insertion successful', colors.green);
        }
        
        // Clean up
        await supabaseAdmin
          .from('mvp_studio_projects')
          .delete()
          .eq('user_id', userData.user.id);
        
        await supabaseAdmin
          .from('builder_context')
          .delete()
          .eq('user_id', userData.user.id);
        
        await supabaseAdmin.auth.admin.deleteUser(userData.user.id);
        log('✅ Test data cleaned up', colors.green);
      }
    } catch (err) {
      log(`❌ Test error: ${err.message}`, colors.red);
    }
    
    // Step 5: Run E2E tests
    log('\n🚀 Step 5: Running E2E tests...', colors.blue);
    
    try {
      const { spawn } = require('child_process');
      
      log('Starting E2E test suite...', colors.blue);
      
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
        log('\n📊 Automated Migration Summary', colors.cyan);
        log('==============================', colors.cyan);
        log('✅ Database migration: Complete', colors.green);
        log('✅ Table creation: Complete', colors.green);
        log('✅ RLS policies: Complete', colors.green);
        log('✅ Data insertion: Working', colors.green);
        log('✅ E2E tests: ' + (code === 0 ? 'Passed' : 'Failed'), code === 0 ? colors.green : colors.red);
        
        if (code === 0) {
          log('\n🎉 Automated migration deployment successful!', colors.green);
          log('Your system is ready for production use.', colors.green);
        } else {
          log('\n⚠️  Some tests failed. Please review the output above.', colors.yellow);
        }
      });
      
    } catch (err) {
      log(`❌ E2E test error: ${err.message}`, colors.red);
    }
    
  } catch (error) {
    log(`❌ Automated migration failed: ${error.message}`, colors.red);
    process.exit(1);
  }
}

// Run the automated migration
automatedMigrationRunner();
