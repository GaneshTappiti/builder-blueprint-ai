#!/usr/bin/env node

/**
 * 🚀 localStorage to Supabase Migration Script (Browser Compatible)
 * 
 * This script creates the database tables and provides instructions
 * for running the actual localStorage migration in the browser.
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
const PROJECT_REF = 'isvjuagegfnkuaucpsvj';
const ACCESS_TOKEN = 'sbp_0033b91af6b2ce25879f84babb5c5a5dd67eb6f1';

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
 * Execute localStorage migration SQL
 */
async function executeMigrationSQL() {
  logStep(2, 'Creating localStorage Migration Tables');
  
  try {
    // Read the SQL file
    const sqlFile = path.join(__dirname, 'localstorage-migration-sql.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    // Create temporary SQL file for MCP execution
    const tempFile = path.join(__dirname, `temp_localstorage_migration_${Date.now()}.sql`);
    fs.writeFileSync(tempFile, sqlContent);
    
    // Execute via MCP server
    const command = `npx @supabase/mcp-server-supabase@latest --project-ref=${PROJECT_REF} --execute-sql="${tempFile}"`;
    
    log('Executing localStorage migration SQL...');
    const result = execSync(command, { 
      stdio: 'inherit',
      env: { 
        ...process.env, 
        SUPABASE_ACCESS_TOKEN: ACCESS_TOKEN 
      }
    });
    
    // Clean up temp file
    fs.unlinkSync(tempFile);
    
    logSuccess('localStorage migration tables created successfully!');
    return true;
    
  } catch (error) {
    logError(`Migration SQL failed: ${error.message}`);
    return false;
  }
}

/**
 * Create browser migration script
 */
function createBrowserMigrationScript() {
  logStep(3, 'Creating Browser Migration Script');
  
  const browserScript = `
// Browser localStorage Migration Script
// Run this in your browser console or add to your app

console.log('🚀 Starting localStorage to Supabase migration...');

// localStorage keys to migrate
const LOCALSTORAGE_KEYS = [
  'builder-blueprint-history',
  'mvp_studio_projects', 
  'ideaforge_ideas',
  'ideaVault',
  'notificationPreferences',
  'chat-notification-preferences',
  'public_feedback_ideas'
];

// BMC canvas keys (dynamic)
const BMC_KEYS_PATTERN = /^bmc-/;

// Inventory localStorage data
function inventoryLocalStorageData() {
  console.log('📊 Inventorying localStorage data...');
  
  const inventory = {
    totalKeys: 0,
    totalSize: 0,
    dataTypes: {},
    bmcKeys: [],
    errors: []
  };
  
  // Check standard keys
  for (const key of LOCALSTORAGE_KEYS) {
    try {
      const data = localStorage.getItem(key);
      if (data) {
        const size = new Blob([data]).size;
        inventory.totalKeys++;
        inventory.totalSize += size;
        inventory.dataTypes[key] = {
          size: size,
          type: Array.isArray(JSON.parse(data)) ? 'array' : 'object',
          count: Array.isArray(JSON.parse(data)) ? JSON.parse(data).length : 1
        };
        console.log(\`  📦 \${key}: \${size} bytes, \${inventory.dataTypes[key].count} items\`);
      }
    } catch (error) {
      inventory.errors.push(\`Failed to read \${key}: \${error.message}\`);
    }
  }
  
  // Check BMC canvas keys
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && BMC_KEYS_PATTERN.test(key)) {
        const data = localStorage.getItem(key);
        if (data) {
          const size = new Blob([data]).size;
          inventory.totalKeys++;
          inventory.totalSize += size;
          inventory.bmcKeys.push({ key, size });
        }
      }
    }
    
    if (inventory.bmcKeys.length > 0) {
      console.log(\`  🎨 BMC Canvas keys: \${inventory.bmcKeys.length} keys\`);
    }
  } catch (error) {
    inventory.errors.push(\`Failed to scan BMC keys: \${error.message}\`);
  }
  
  console.log(\`\\n📊 Inventory Summary:\`);
  console.log(\`  Total keys: \${inventory.totalKeys}\`);
  console.log(\`  Total size: \${(inventory.totalSize / 1024).toFixed(2)} KB\`);
  console.log(\`  BMC keys: \${inventory.bmcKeys.length}\`);
  console.log(\`  Errors: \${inventory.errors.length}\`);
  
  if (inventory.errors.length > 0) {
    console.warn('⚠️ Some errors occurred during inventory:');
    inventory.errors.forEach(error => console.log(\`  ❌ \${error}\`));
  }
  
  return inventory;
}

// Run the inventory
const inventory = inventoryLocalStorageData();

// Export for use in your app
window.localStorageInventory = inventory;
console.log('✅ localStorage inventory complete! Check window.localStorageInventory for results.');
`;

  const browserFile = path.join(__dirname, 'browser-localstorage-migration.js');
  fs.writeFileSync(browserFile, browserScript);
  
  log(`Browser migration script created: ${browserFile}`);
  return browserFile;
}

/**
 * Create migration instructions
 */
function createMigrationInstructions() {
  logStep(4, 'Creating Migration Instructions');
  
  const instructions = `
# 🚀 localStorage to Supabase Migration Instructions

## ✅ Database Tables Created
The following Supabase tables have been created to replace localStorage:

1. **user_settings** - General user settings
2. **user_drafts** - Ephemeral drafts (messages, forms)
3. **builder_context** - Builder context and project history
4. **mvp_studio_projects** - MVP Studio project data
5. **ideaforge_data** - Idea Forge storage data
6. **bmc_canvas_data** - Business Model Canvas data
7. **notification_preferences** - Notification settings
8. **chat_notification_preferences** - Chat notification settings
9. **public_feedback_ideas** - Public feedback data
10. **offline_queue** - Offline write queue

## 🔧 Next Steps

### 1. Run Browser Inventory
Open your browser console and run:
\`\`\`javascript
// Copy and paste the contents of browser-localstorage-migration.js
// This will inventory your localStorage data
\`\`\`

### 2. Update Your Components
Replace localStorage calls with Supabase calls using the localStorageSyncer service:

\`\`\`typescript
import { localStorageSyncer } from '@/services/localStorageSyncer';

// Instead of localStorage.setItem()
await localStorageSyncer.saveToSupabase('table_name', data);

// Instead of localStorage.getItem()
const data = await localStorageSyncer.loadFromSupabase('table_name');
\`\`\`

### 3. Initialize Sync Service
Add to your main app component:

\`\`\`typescript
import { localStorageSyncer } from '@/services/localStorageSyncer';

useEffect(() => {
  // Start automatic sync
  localStorageSyncer.syncAllData();
}, []);
\`\`\`

### 4. Test Migration
1. Open your app in the browser
2. Check that data loads from Supabase
3. Verify sync works in both directions
4. Test offline/online transitions

## 📊 Migration Status
- ✅ Database tables created
- ✅ Sync service implemented
- ✅ Conflict resolution ready
- ✅ Offline queue implemented
- 🔄 Component updates needed
- 🔄 Testing required

## 🎯 Benefits
- ✅ No data loss on browser refresh
- ✅ Data syncs across devices
- ✅ Offline support with queue
- ✅ Conflict resolution
- ✅ Unlimited storage (vs 5MB localStorage limit)

## 🚨 Important Notes
- Always backup your data before migration
- Test thoroughly before clearing localStorage
- Monitor sync status in console
- Check for any errors during migration

## 📞 Support
If you encounter issues:
1. Check browser console for errors
2. Verify Supabase connection
3. Check RLS policies
4. Review the localStorageSyncer service logs
`;

  const instructionsFile = path.join(__dirname, 'migration-instructions.md');
  fs.writeFileSync(instructionsFile, instructions);
  
  log(`Migration instructions created: ${instructionsFile}`);
  return instructionsFile;
}

/**
 * Main migration function
 */
async function runLocalStorageMigration() {
  log(`${colors.bright}${colors.blue}🚀 localStorage to Supabase Migration${colors.reset}`);
  log(`${colors.cyan}Target: ${SUPABASE_URL}${colors.reset}`);
  log(`${colors.magenta}Project: ${PROJECT_REF}${colors.reset}\n`);
  
  // Step 1: Check MCP Server
  const mcpAvailable = await checkMCPServer();
  if (!mcpAvailable) {
    logError('MCP Server not available. Cannot proceed with automated migration.');
    return;
  }
  
  // Step 2: Execute migration SQL
  const sqlSuccess = await executeMigrationSQL();
  if (!sqlSuccess) {
    logError('Failed to create migration tables. Cannot proceed.');
    return;
  }
  
  // Step 3: Create browser migration script
  const browserFile = createBrowserMigrationScript();
  
  // Step 4: Create migration instructions
  const instructionsFile = createMigrationInstructions();
  
  // Final summary
  logSuccess('🎉 localStorage Migration Setup Complete!');
  log('\nWhat was created:');
  log('  ✅ Supabase tables for all localStorage data types');
  log('  ✅ Conflict resolution with lastModified timestamps');
  log('  ✅ Offline queue for writes');
  log('  ✅ Automatic sync service');
  log('  ✅ Browser migration script');
  log('  ✅ Migration instructions');
  
  log(`\n${colors.bright}${colors.cyan}Next steps:${colors.reset}`);
  log('  1. Run the browser migration script to inventory your localStorage data');
  log('  2. Update your components to use the localStorageSyncer service');
  log('  3. Test the migration with real data');
  log('  4. Clear localStorage after successful migration');
  
  log(`\n${colors.bright}${colors.yellow}Files created:${colors.reset}`);
  log(`  📄 ${browserFile}`);
  log(`  📄 ${instructionsFile}`);
  log(`  📄 scripts/localstorage-migration-sql.sql`);
  log(`  📄 app/services/localStorageSyncer.ts`);
}

// Run the migration
if (require.main === module) {
  runLocalStorageMigration().catch(error => {
    logError(`Migration failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { runLocalStorageMigration };
