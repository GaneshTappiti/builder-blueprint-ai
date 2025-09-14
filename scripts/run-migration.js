#!/usr/bin/env node

/**
 * Run localStorage Migration Tables
 * This script applies the localStorage migration tables to Supabase
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

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

async function runMigration() {
  try {
    log('🚀 Starting localStorage Migration Tables Setup', colors.cyan);
    
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    }
    
    log(`📡 Connecting to Supabase: ${supabaseUrl}`, colors.blue);
    
    // Create Supabase client with service role
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    // Read migration files
    const migrationFiles = [
      'supabase/migrations/20250128_create_localstorage_migration_tables.sql',
      'supabase/migrations/20250128_create_rls_policies.sql'
    ];
    
    for (const filePath of migrationFiles) {
      if (fs.existsSync(filePath)) {
        log(`📄 Reading migration file: ${filePath}`, colors.blue);
        const sql = fs.readFileSync(filePath, 'utf8');
        
        // Split SQL into individual statements
        const statements = sql
          .split(';')
          .map(stmt => stmt.trim())
          .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
        
        log(`🔧 Executing ${statements.length} SQL statements...`, colors.yellow);
        
        for (let i = 0; i < statements.length; i++) {
          const statement = statements[i];
          if (statement.trim()) {
            try {
              log(`  ${i + 1}. Executing statement...`, colors.blue);
              const { data, error } = await supabase.rpc('exec_sql', { sql: statement });
              
              if (error) {
                log(`    ❌ Error: ${error.message}`, colors.red);
                // Continue with next statement
              } else {
                log(`    ✅ Success`, colors.green);
              }
            } catch (err) {
              log(`    ❌ Exception: ${err.message}`, colors.red);
              // Continue with next statement
            }
          }
        }
      } else {
        log(`⚠️  Migration file not found: ${filePath}`, colors.yellow);
      }
    }
    
    // Verify tables were created
    log('🔍 Verifying table creation...', colors.blue);
    
    const expectedTables = [
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
    
    log('✅ Migration setup complete!', colors.green);
    
  } catch (error) {
    log(`❌ Migration failed: ${error.message}`, colors.red);
    process.exit(1);
  }
}

// Run the migration
runMigration();
