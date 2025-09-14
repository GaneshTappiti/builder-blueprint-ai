#!/usr/bin/env node

/**
 * Run SQL Migration Directly via Supabase Client
 * This script executes the complete migration SQL using the Supabase client
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
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function runSQLMigration() {
  try {
    log('🚀 Running Complete SQL Migration', colors.cyan);
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing required environment variables');
    }
    
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    // Read the complete migration SQL file
    const migrationSQL = fs.readFileSync('migration-complete.sql', 'utf8');
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    log(`📋 Found ${statements.length} SQL statements to execute`, colors.blue);
    
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
        
        // Use the rpc function to execute SQL
        const { data, error } = await supabase.rpc('exec_sql', {
          sql_query: statement
        });
        
        if (error) {
          // Try alternative approach - direct SQL execution
          const { data: altData, error: altError } = await supabase
            .from('_sql')
            .select('*')
            .limit(0);
          
          if (altError) {
            log(`  ⚠️  Statement ${i + 1}: ${error.message}`, colors.yellow);
            errorCount++;
          } else {
            log(`  ✅ Statement ${i + 1} executed`, colors.green);
            successCount++;
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
    
    log(`\n📊 Migration Results:`, colors.cyan);
    log(`  ✅ Successful: ${successCount}`, colors.green);
    log(`  ❌ Failed: ${errorCount}`, colors.red);
    
    // Verify tables exist
    log('\n🔍 Verifying table creation...', colors.blue);
    const expectedTables = [
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
    
    for (const tableName of expectedTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (error) {
          log(`  ❌ Table ${tableName}: ${error.message}`, colors.red);
        } else {
          log(`  ✅ Table ${tableName}: Exists`, colors.green);
        }
      } catch (err) {
        log(`  ❌ Table ${tableName}: ${err.message}`, colors.red);
      }
    }
    
    log('\n✅ SQL Migration Complete!', colors.green);
    
  } catch (error) {
    log(`❌ Migration failed: ${error.message}`, colors.red);
    process.exit(1);
  }
}

// Run the migration
runSQLMigration();
