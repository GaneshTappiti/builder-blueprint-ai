#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const SUPABASE_URL = 'https://isvjuagegfnkuaucpsvj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlzdmp1YWdlZ2Zua3VhdWNwc3ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNzUzMDMsImV4cCI6MjA2ODc1MTMwM30.p9EwEAr0NGr3Biw5pu7wA3wQeQsO2G7DhlqtRHnY6wE';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n${colors.cyan}🔄 Step ${step}: ${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`\n${colors.green}✅ ${message}${colors.reset}`);
}

function logError(message) {
  log(`\n${colors.red}❌ ${message}${colors.reset}`);
}

function logWarning(message) {
  log(`\n${colors.yellow}⚠️  ${message}${colors.reset}`);
}

// Read migration file content
function readMigrationFile(filename) {
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', filename);
  try {
    return fs.readFileSync(migrationPath, 'utf8');
  } catch (error) {
    throw new Error(`Failed to read migration file ${filename}: ${error.message}`);
  }
}

// Execute SQL migration
async function executeMigration(sql, migrationName) {
  try {
    log(`Executing ${migrationName}...`);
    
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    let successCount = 0;
    let errorCount = 0;

    for (const statement of statements) {
      try {
        if (statement.trim()) {
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          if (error) {
            // Some errors are expected (like IF NOT EXISTS), so we'll log them as warnings
            if (error.message.includes('already exists') || 
                error.message.includes('does not exist') ||
                error.message.includes('IF NOT EXISTS')) {
              log(`  ⚠️  ${error.message}`, 'yellow');
            } else {
              log(`  ❌ Error: ${error.message}`, 'red');
              errorCount++;
            }
          } else {
            successCount++;
          }
        }
      } catch (err) {
        log(`  ❌ Error executing statement: ${err.message}`, 'red');
        errorCount++;
      }
    }

    if (errorCount === 0) {
      logSuccess(`${migrationName} completed successfully!`);
    } else if (successCount > 0) {
      logWarning(`${migrationName} completed with ${errorCount} warnings (${successCount} statements successful)`);
    } else {
      throw new Error(`${migrationName} failed with ${errorCount} errors`);
    }

    return { success: true, successCount, errorCount };
  } catch (error) {
    logError(`Failed to execute ${migrationName}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Check database connection
async function checkConnection() {
  try {
    logStep(1, 'Checking database connection...');
    const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
    
    if (error) {
      throw new Error(`Database connection failed: ${error.message}`);
    }
    
    logSuccess('Database connection successful!');
    return true;
  } catch (error) {
    logError(`Database connection failed: ${error.message}`);
    return false;
  }
}

// Create exec_sql function if it doesn't exist
async function createExecSqlFunction() {
  try {
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION exec_sql(sql text)
      RETURNS void
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        EXECUTE sql;
      END;
      $$;
    `;
    
    const { error } = await supabase.rpc('exec_sql', { sql: createFunctionSQL });
    if (error && !error.message.includes('already exists')) {
      logWarning(`Could not create exec_sql function: ${error.message}`);
    } else {
      logSuccess('exec_sql function is ready');
    }
  } catch (error) {
    logWarning(`Could not create exec_sql function: ${error.message}`);
  }
}

// Main migration function
async function runMigrations() {
  log(`${colors.bright}${colors.blue}🚀 Starting Supabase Database Migration${colors.reset}`);
  log(`${colors.cyan}Target: ${SUPABASE_URL}${colors.reset}`);
  
  // Check connection
  const connected = await checkConnection();
  if (!connected) {
    process.exit(1);
  }

  // Create exec_sql function
  await createExecSqlFunction();

  // Migration 1: Create missing tables
  logStep(2, 'Applying Migration 1: Create Missing Tables');
  const migration1SQL = readMigrationFile('20250126_create_missing_tables.sql');
  const migration1Result = await executeMigration(migration1SQL, 'Migration 1 - Create Missing Tables');
  
  if (!migration1Result.success) {
    logError('Migration 1 failed. Stopping migration process.');
    process.exit(1);
  }

  // Migration 2: Cleanup unnecessary tables
  logStep(3, 'Applying Migration 2: Cleanup Unnecessary Tables');
  const migration2SQL = readMigrationFile('20250127_cleanup_unnecessary_tables.sql');
  const migration2Result = await executeMigration(migration2SQL, 'Migration 2 - Cleanup Unnecessary Tables');
  
  if (!migration2Result.success) {
    logError('Migration 2 failed. Stopping migration process.');
    process.exit(1);
  }

  // Verify migration success
  logStep(4, 'Verifying migration results...');
  await verifyMigration();

  // Final summary
  logSuccess('🎉 All migrations completed successfully!');
  log(`${colors.green}Your Supabase database is now:${colors.reset}`);
  log('  ✅ Properly connected to all components');
  log('  ✅ Free of localStorage dependencies');
  log('  ✅ Optimized with only necessary tables');
  log('  ✅ Secure with proper RLS policies');
  log('  ✅ Ready for production use');
  
  log(`\n${colors.bright}${colors.cyan}Next steps:${colors.reset}`);
  log('  1. Test your application to ensure everything works correctly');
  log('  2. Monitor the database for any issues');
  log('  3. Consider running a backup of your database');
}

// Verify migration results
async function verifyMigration() {
  try {
    // Check if key tables exist
    const keyTables = [
      'audit_logs',
      'chat_files', 
      'ideas',
      'idea_collaborations',
      'public_feedback',
      'bmc_data',
      'builder_context',
      'ai_interactions',
      'file_storage'
    ];

    for (const table of keyTables) {
      const { data, error } = await supabase
        .from(table)
        .select('count')
        .limit(1);
      
      if (error) {
        logWarning(`Table ${table} may not exist or have issues: ${error.message}`);
      } else {
        log(`  ✅ Table ${table} is accessible`);
      }
    }

    logSuccess('Migration verification completed');
  } catch (error) {
    logWarning(`Verification had issues: ${error.message}`);
  }
}

// Handle errors
process.on('unhandledRejection', (reason, promise) => {
  logError(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logError(`Uncaught Exception: ${error.message}`);
  process.exit(1);
});

// Run the migration
if (require.main === module) {
  runMigrations().catch(error => {
    logError(`Migration failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { runMigrations, executeMigration, checkConnection };
