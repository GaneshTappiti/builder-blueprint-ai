#!/usr/bin/env node

/**
 * MCP Server Migration
 * Uses Supabase MCP Server to run migration
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');

const colors = {
  reset: '\x1b[0m',
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
    log('🤖 MCP Migration Starting...', colors.cyan);
    
    // Read SQL file
    const sqlContent = fs.readFileSync('scripts/create-missing-tables.sql', 'utf8');
    const statements = sqlContent.split(';').filter(s => s.trim().length > 0 && !s.trim().startsWith('--'));
    
    log(`📝 Executing ${statements.length} SQL statements...`, colors.blue);
    
    let success = 0;
    let failed = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i].trim();
      if (stmt.length < 10) continue;
      
      try {
        log(`Executing ${i + 1}/${statements.length}...`, colors.blue);
        
        const result = await mcp_supabase_execute_sql({
          query: stmt
        });
        
        if (result.error) {
          log(`  ❌ Error: ${result.error}`, colors.red);
          failed++;
        } else {
          log(`  ✅ Success`, colors.green);
          success++;
        }
      } catch (err) {
        log(`  ❌ Exception: ${err.message}`, colors.red);
        failed++;
      }
    }
    
    log(`\n📊 Results: ${success} success, ${failed} failed`, colors.cyan);
    
    // Verify tables
    log('\n🔍 Verifying tables...', colors.blue);
    
    const tables = ['builder_context', 'mvp_studio_projects', 'ideaforge_data', 'chat_notification_preferences', 'public_feedback_ideas', 'bmc_canvas_data', 'offline_queue'];
    
    for (const table of tables) {
      try {
        const result = await mcp_supabase_execute_sql({
          query: `SELECT COUNT(*) FROM ${table} LIMIT 1`
        });
        
        if (result.error) {
          log(`  ❌ ${table}: Missing`, colors.red);
        } else {
          log(`  ✅ ${table}: Exists`, colors.green);
        }
      } catch (err) {
        log(`  ❌ ${table}: Error`, colors.red);
      }
    }
    
    log('\n🎉 MCP Migration Complete!', colors.green);
    
  } catch (error) {
    log(`❌ Migration failed: ${error.message}`, colors.red);
  }
}

runMigration();
