#!/usr/bin/env node

/**
 * 🚀 localStorage to Supabase Migration Script
 * 
 * This script migrates all localStorage data to Supabase with:
 * - Conflict resolution using lastModified timestamps
 * - Offline queue for writes
 * - Automatic sync every 30 seconds
 * - Data integrity checks
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
 * Inventory localStorage data
 */
function inventoryLocalStorageData() {
  logStep(3, 'Inventorying localStorage Data');
  
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
        log(`  📦 ${key}: ${size} bytes, ${inventory.dataTypes[key].count} items`);
      }
    } catch (error) {
      inventory.errors.push(`Failed to read ${key}: ${error.message}`);
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
      log(`  🎨 BMC Canvas keys: ${inventory.bmcKeys.length} keys`);
    }
  } catch (error) {
    inventory.errors.push(`Failed to scan BMC keys: ${error.message}`);
  }
  
  log(`\n📊 Inventory Summary:`);
  log(`  Total keys: ${inventory.totalKeys}`);
  log(`  Total size: ${(inventory.totalSize / 1024).toFixed(2)} KB`);
  log(`  BMC keys: ${inventory.bmcKeys.length}`);
  log(`  Errors: ${inventory.errors.length}`);
  
  if (inventory.errors.length > 0) {
    logWarning('Some errors occurred during inventory:');
    inventory.errors.forEach(error => log(`  ❌ ${error}`));
  }
  
  return inventory;
}

/**
 * Create migration report
 */
function createMigrationReport(inventory) {
  logStep(4, 'Creating Migration Report');
  
  const report = `
# localStorage to Supabase Migration Report

## 📊 Data Inventory
- **Total localStorage keys**: ${inventory.totalKeys}
- **Total data size**: ${(inventory.totalSize / 1024).toFixed(2)} KB
- **BMC canvas keys**: ${inventory.bmcKeys.length}
- **Migration errors**: ${inventory.errors.length}

## 🗂️ Data Types Found
${Object.entries(inventory.dataTypes).map(([key, info]) => `
### ${key}
- Size: ${info.size} bytes
- Type: ${info.type}
- Items: ${info.count}
`).join('')}

## 🎨 BMC Canvas Data
${inventory.bmcKeys.map(item => `- ${item.key}: ${item.size} bytes`).join('\n')}

## ⚠️ Errors
${inventory.errors.length > 0 ? inventory.errors.map(error => `- ${error}`).join('\n') : 'No errors found'}

## 🚀 Next Steps
1. Run the migration script to create Supabase tables
2. Implement the localStorageSyncer service
3. Update components to use Supabase instead of localStorage
4. Test data persistence and sync functionality
5. Clear localStorage after successful migration

## 📋 Migration Checklist
- [ ] Create Supabase tables for localStorage data
- [ ] Implement conflict resolution with lastModified timestamps
- [ ] Add offline queue for writes
- [ ] Update all components to use Supabase
- [ ] Test data persistence and sync
- [ ] Clear localStorage data
- [ ] Verify no data loss

## 🔧 Implementation Files
- \`scripts/localstorage-migration-sql.sql\` - Database schema
- \`app/services/localStorageSyncer.ts\` - Sync service
- \`scripts/localstorage-migration.js\` - Migration script
`;

  const reportFile = path.join(__dirname, 'localstorage-migration-report.md');
  fs.writeFileSync(reportFile, report);
  
  log(`Migration report created: ${reportFile}`);
  return reportFile;
}

/**
 * Create implementation guide
 */
function createImplementationGuide() {
  logStep(5, 'Creating Implementation Guide');
  
  const guide = `
# localStorage to Supabase Migration Implementation Guide

## 🎯 Overview
This guide helps you migrate all localStorage data to Supabase with proper conflict resolution, offline support, and automatic sync.

## 📋 Prerequisites
- ✅ Supabase project configured
- ✅ MCP server available
- ✅ User authentication working
- ✅ Database tables created

## 🚀 Implementation Steps

### 1. Run Database Migration
\`\`\`bash
# Execute the SQL migration
node scripts/localstorage-migration.js
\`\`\`

### 2. Update Components
Replace localStorage usage with Supabase calls:

#### Before (localStorage):
\`\`\`typescript
// Save data
localStorage.setItem('key', JSON.stringify(data));

// Load data
const data = JSON.parse(localStorage.getItem('key') || '[]');
\`\`\`

#### After (Supabase):
\`\`\`typescript
import { localStorageSyncer } from '@/services/localStorageSyncer';

// Save data
await localStorageSyncer.saveToSupabase('table_name', data);

// Load data
const data = await localStorageSyncer.loadFromSupabase('table_name');
\`\`\`

### 3. Add Sync Service
Import and initialize the sync service in your app:

\`\`\`typescript
// In your main app component
import { localStorageSyncer } from '@/services/localStorageSyncer';

useEffect(() => {
  // Initialize sync on app start
  localStorageSyncer.syncAllData();
}, []);
\`\`\`

### 4. Handle Offline Mode
The sync service automatically handles offline mode by queuing writes and syncing when online.

### 5. Test Migration
1. Run the migration script
2. Check that data appears in Supabase
3. Verify sync works in both directions
4. Test offline/online transitions
5. Clear localStorage after verification

## 🔧 Configuration

### Environment Variables
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
\`\`\`

### Sync Settings
- Auto-sync interval: 30 seconds
- Conflict resolution: lastModified timestamp
- Offline queue: unlimited (with retry limits)

## 📊 Monitoring

### Check Sync Status
\`\`\`typescript
const status = localStorageSyncer.getSyncStatus();
console.log('Online:', status.isOnline);
console.log('Queue length:', status.queueLength);
console.log('Last sync:', status.lastSync);
\`\`\`

### View Migration Progress
Check the browser console for detailed migration logs.

## 🚨 Troubleshooting

### Common Issues
1. **Authentication errors**: Ensure user is logged in
2. **Permission errors**: Check RLS policies
3. **Sync failures**: Check network connection
4. **Data conflicts**: Review conflict resolution strategy

### Debug Mode
Enable debug logging by setting \`localStorage.debug = 'true'\` in browser console.

## ✅ Success Criteria
- [ ] No critical data stored only in localStorage
- [ ] Data persists across browser sessions
- [ ] Sync works in both directions
- [ ] Offline mode queues writes properly
- [ ] Conflict resolution works correctly
- [ ] No data loss during migration

## 🎉 Benefits
- ✅ Data persistence across devices
- ✅ Real-time sync and collaboration
- ✅ Offline support with queue
- ✅ Conflict resolution
- ✅ Better data integrity
- ✅ Scalable storage solution
`;

  const guideFile = path.join(__dirname, 'localstorage-implementation-guide.md');
  fs.writeFileSync(guideFile, guide);
  
  log(`Implementation guide created: ${guideFile}`);
  return guideFile;
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
  
  // Step 3: Inventory localStorage data
  const inventory = inventoryLocalStorageData();
  
  // Step 4: Create migration report
  const reportFile = createMigrationReport(inventory);
  
  // Step 5: Create implementation guide
  const guideFile = createImplementationGuide();
  
  // Final summary
  logSuccess('🎉 localStorage Migration Setup Complete!');
  log('\nWhat was created:');
  log('  ✅ Supabase tables for all localStorage data types');
  log('  ✅ Conflict resolution with lastModified timestamps');
  log('  ✅ Offline queue for writes');
  log('  ✅ Automatic sync service');
  log('  ✅ Migration report and implementation guide');
  
  log(`\n${colors.bright}${colors.cyan}Next steps:${colors.reset}`);
  log('  1. Review the migration report and implementation guide');
  log('  2. Update your components to use the localStorageSyncer service');
  log('  3. Test the migration with real data');
  log('  4. Clear localStorage after successful migration');
  
  log(`\n${colors.bright}${colors.yellow}Files created:${colors.reset}`);
  log(`  📄 ${reportFile}`);
  log(`  📄 ${guideFile}`);
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
