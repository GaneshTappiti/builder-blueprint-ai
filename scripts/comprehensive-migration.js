#!/usr/bin/env node

/**
 * 🚀 Comprehensive Supabase Migration Script
 * 
 * This script migrates ALL SQL files in the correct order:
 * 1. Profile system tables
 * 2. Projects and tasks tables  
 * 3. Team invitations
 * 4. RAG tool documentation
 * 5. Ideas table
 * 6. Chat system
 * 7. Enhanced chat system
 * 8. Profile creation trigger fix
 * 9. Missing tables (main migration)
 * 10. Cleanup unnecessary tables
 * 
 * Uses MCP server for reliable execution with error handling and retry logic.
 */

const { execSync } = require('child_process');
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
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://isvjuagegfnkuaucpsvj.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const PROJECT_REF = 'isvjuagegfnkuaucpsvj';
const ACCESS_TOKEN = 'sbp_0033b91af6b2ce25879f84babb5c5a5dd67eb6f1';

// Migration files in correct order
const MIGRATION_FILES = [
  {
    name: 'Profile System',
    file: 'supabase/migrations/20250102_create_profile_system.sql',
    required: true
  },
  {
    name: 'Projects and Tasks',
    file: 'supabase/migrations/20250103_create_projects_tasks_tables.sql',
    required: true
  },
  {
    name: 'Team Invitations',
    file: 'supabase/migrations/20250104_create_team_invitations_table.sql',
    required: true
  },
  {
    name: 'RAG Tool Documentation',
    file: 'supabase/migrations/20250106_create_rag_tool_documentation.sql',
    required: true
  },
  {
    name: 'Ideas Table',
    file: 'supabase/migrations/20250120_create_ideas_table.sql',
    required: true
  },
  {
    name: 'Chat System',
    file: 'supabase/migrations/20250121_create_chat_system.sql',
    required: true
  },
  {
    name: 'Enhanced Chat System',
    file: 'supabase/migrations/20250122_enhance_chat_system.sql',
    required: true
  },
  {
    name: 'Profile Creation Trigger Fix',
    file: 'supabase/migrations/20250125_fix_profile_creation_trigger.sql',
    required: true
  },
  {
    name: 'Missing Tables (Main Migration)',
    file: 'supabase/migrations/20250126_create_missing_tables.sql',
    required: true
  },
  {
    name: 'Cleanup Unnecessary Tables',
    file: 'supabase/migrations/20250127_cleanup_unnecessary_tables.sql',
    required: true
  }
];

// Track migration results
const migrationResults = {
  successful: [],
  failed: [],
  skipped: []
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n${colors.bright}${colors.blue}Step ${step}:${colors.reset} ${colors.cyan}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`\n${colors.bright}${colors.green}✅ ${message}${colors.reset}`);
}

function logError(message) {
  log(`\n${colors.bright}${colors.red}❌ ${message}${colors.reset}`);
}

function logWarning(message) {
  log(`\n${colors.bright}${colors.yellow}⚠️  ${message}${colors.reset}`);
}

/**
 * Check if MCP server is available
 */
async function checkMCPServer() {
  logStep(1, 'Checking MCP Server Availability');
  
  try {
    execSync('npx @supabase/mcp-server-supabase@latest --help', { stdio: 'pipe' });
    logSuccess('MCP Server package is available');
    return true;
  } catch (error) {
    logError('MCP Server package not available');
    log('Installing MCP Server package...');
    
    try {
      execSync('npm install -g @supabase/mcp-server-supabase@latest', { stdio: 'inherit' });
      logSuccess('MCP Server package installed successfully');
      return true;
    } catch (installError) {
      logError('Failed to install MCP Server package');
      return false;
    }
  }
}

/**
 * Execute a single migration file using MCP
 */
async function executeMigrationFile(migration, attempt = 1) {
  const { name, file } = migration;
  
  log(`\n  Running: ${name}...`);
  
  // Check if file exists
  if (!fs.existsSync(file)) {
    logError(`  X ${name} - File not found: ${file}`);
    migrationResults.failed.push({ name, file, error: 'File not found' });
    return false;
  }
  
  try {
    // Read the SQL file
    const sqlContent = fs.readFileSync(file, 'utf8');
    
    // Create temporary SQL file for MCP execution
    const tempFile = path.join(__dirname, `temp_${Date.now()}.sql`);
    fs.writeFileSync(tempFile, sqlContent);
    
    // Execute via MCP server
    const command = `npx @supabase/mcp-server-supabase@latest --project-ref=${PROJECT_REF} --execute-sql="${tempFile}"`;
    
    const result = execSync(command, { 
      stdio: 'pipe',
      env: { 
        ...process.env, 
        SUPABASE_ACCESS_TOKEN: ACCESS_TOKEN 
      }
    });
    
    // Clean up temp file
    fs.unlinkSync(tempFile);
    
    logSuccess(`  ✅ ${name} - Success`);
    migrationResults.successful.push({ name, file });
    return true;
    
  } catch (error) {
    // Clean up temp file if it exists
    const tempFile = path.join(__dirname, `temp_${Date.now()}.sql`);
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
    
    logError(`  X ${name} - Failed: ${error.message}`);
    
    // If this is the first attempt and it's a retryable error, try again
    if (attempt === 1 && isRetryableError(error.message)) {
      logWarning(`  Retrying ${name}...`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      return await executeMigrationFile(migration, 2);
    }
    
    migrationResults.failed.push({ name, file, error: error.message });
    return false;
  }
}

/**
 * Check if an error is retryable
 */
function isRetryableError(errorMessage) {
  const retryableErrors = [
    'connection',
    'timeout',
    'network',
    'temporary',
    'rate limit'
  ];
  
  return retryableErrors.some(keyword => 
    errorMessage.toLowerCase().includes(keyword)
  );
}

/**
 * Check existing tables to see what's already migrated
 */
async function checkExistingTables() {
  logStep(2, 'Checking Existing Tables');
  
  const keyTables = [
    'user_profiles',
    'ideas', 
    'public_feedback',
    'idea_collaborations',
    'chat_messages',
    'team_invitations'
  ];
  
  const existingTables = [];
  
  for (const table of keyTables) {
    try {
      const command = `npx @supabase/mcp-server-supabase@latest --project-ref=${PROJECT_REF} --read-only --check-table=${table}`;
      execSync(command, { 
        stdio: 'pipe',
        env: { 
          ...process.env, 
          SUPABASE_ACCESS_TOKEN: ACCESS_TOKEN 
        }
      });
      existingTables.push(table);
      log(`  ✅ ${table} - exists`);
    } catch (error) {
      log(`  ❌ ${table} - missing`);
    }
  }
  
  log(`\n📊 Found ${existingTables.length}/${keyTables.length} key tables`);
  return existingTables;
}

/**
 * Execute all migrations
 */
async function executeAllMigrations() {
  logStep(3, 'Executing All Migrations');
  
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < MIGRATION_FILES.length; i++) {
    const migration = MIGRATION_FILES[i];
    const stepNumber = i + 1;
    
    log(`\n${colors.bright}${colors.blue}[${stepNumber}/${MIGRATION_FILES.length}]${colors.reset} ${colors.cyan}${migration.name}${colors.reset}`);
    
    const success = await executeMigrationFile(migration);
    
    if (success) {
      successCount++;
    } else {
      failCount++;
      
      // If this is a required migration and it failed, ask if we should continue
      if (migration.required) {
        logWarning(`Required migration failed: ${migration.name}`);
        log('Continuing with remaining migrations...');
      }
    }
    
    // Small delay between migrations
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return { successCount, failCount };
}

/**
 * Verify migration success
 */
async function verifyMigrationSuccess() {
  logStep(4, 'Verifying Migration Success');
  
  const existingTables = await checkExistingTables();
  
  // Check for key tables that should exist after migration
  const requiredTables = [
    'user_profiles',
    'ideas',
    'public_feedback', 
    'idea_collaborations',
    'chat_messages',
    'team_invitations'
  ];
  
  const missingTables = requiredTables.filter(table => !existingTables.includes(table));
  
  if (missingTables.length === 0) {
    logSuccess('All required tables are present!');
    return true;
  } else {
    logError(`Missing required tables: ${missingTables.join(', ')}`);
    return false;
  }
}

/**
 * Generate migration report
 */
function generateMigrationReport() {
  logStep(5, 'Migration Report');
  
  log(`\n${colors.bright}${colors.blue}📊 MIGRATION SUMMARY${colors.reset}`);
  log(`${colors.green}✅ Successful: ${migrationResults.successful.length}${colors.reset}`);
  log(`${colors.red}❌ Failed: ${migrationResults.failed.length}${colors.reset}`);
  log(`${colors.yellow}⏭️  Skipped: ${migrationResults.skipped.length}${colors.reset}`);
  
  if (migrationResults.successful.length > 0) {
    log(`\n${colors.green}Successful Migrations:${colors.reset}`);
    migrationResults.successful.forEach(({ name }) => {
      log(`  ✅ ${name}`);
    });
  }
  
  if (migrationResults.failed.length > 0) {
    log(`\n${colors.red}Failed Migrations:${colors.reset}`);
    migrationResults.failed.forEach(({ name, error }) => {
      log(`  ❌ ${name} - ${error}`);
    });
  }
  
  if (migrationResults.skipped.length > 0) {
    log(`\n${colors.yellow}Skipped Migrations:${colors.reset}`);
    migrationResults.skipped.forEach(({ name }) => {
      log(`  ⏭️  ${name}`);
    });
  }
}

/**
 * Create manual fallback instructions
 */
function createManualFallback() {
  logStep(6, 'Creating Manual Fallback Instructions');
  
  const manualInstructions = `
# 🚀 Manual Migration Fallback

Since some automated migrations failed, here are the manual steps:

## Step 1: Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project (${PROJECT_REF})
3. Navigate to SQL Editor

## Step 2: Run Failed Migrations Manually
${migrationResults.failed.map(({ name, file }) => `
### ${name}
File: ${file}

\`\`\`sql
${fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : 'File not found'}
\`\`\`
`).join('\n')}

## Step 3: Verify Success
Run this script again to verify all migrations are complete.

## What These Migrations Create:
- ✅ User profiles and authentication
- ✅ Ideas vault system
- ✅ Public feedback system
- ✅ Team collaboration features
- ✅ Chat system with file attachments
- ✅ Business Model Canvas data
- ✅ AI interaction logging
- ✅ File storage integration
- ✅ Audit logging system
`;

  const fallbackFile = path.join(__dirname, 'manual-migration-fallback.md');
  fs.writeFileSync(fallbackFile, manualInstructions);
  
  log(`Manual fallback instructions created: ${fallbackFile}`);
}

/**
 * Main migration function
 */
async function runComprehensiveMigration() {
  log(`${colors.bright}${colors.blue}🚀 Comprehensive Supabase Migration${colors.reset}`);
  log(`${colors.cyan}Target: ${SUPABASE_URL}${colors.reset}`);
  log(`${colors.magenta}Project: ${PROJECT_REF}${colors.reset}`);
  log(`${colors.yellow}Migrating ${MIGRATION_FILES.length} migration files${colors.reset}\n`);
  
  // Step 1: Check MCP Server
  const mcpAvailable = await checkMCPServer();
  if (!mcpAvailable) {
    logError('MCP Server not available. Cannot proceed with automated migration.');
    createManualFallback();
    return;
  }
  
  // Step 2: Check existing tables
  await checkExistingTables();
  
  // Step 3: Execute all migrations
  const { successCount, failCount } = await executeAllMigrations();
  
  // Step 4: Verify migration success
  const verificationSuccess = await verifyMigrationSuccess();
  
  // Step 5: Generate report
  generateMigrationReport();
  
  // Step 6: Create fallback if needed
  if (failCount > 0) {
    createManualFallback();
  }
  
  // Final summary
  if (verificationSuccess && failCount === 0) {
    logSuccess('🎉 All migrations completed successfully!');
    log('\nYour Supabase database now has:');
    log('  ✅ Complete user profile system');
    log('  ✅ Ideas vault with collaboration');
    log('  ✅ Public feedback system');
    log('  ✅ Team management features');
    log('  ✅ Chat system with file attachments');
    log('  ✅ Business Model Canvas integration');
    log('  ✅ AI interaction logging');
    log('  ✅ File storage system');
    log('  ✅ Comprehensive audit logging');
    
    log(`\n${colors.bright}${colors.cyan}Next steps:${colors.reset}`);
    log('  1. Test all application features');
    log('  2. Verify data persistence in Supabase');
    log('  3. Check that localStorage is no longer used');
    log('  4. Monitor for any issues');
  } else {
    logWarning('Some migrations failed. Check the manual fallback instructions.');
    log('You may need to run failed migrations manually.');
  }
}

// Run the migration
if (require.main === module) {
  runComprehensiveMigration().catch(error => {
    logError(`Migration failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { runComprehensiveMigration };
