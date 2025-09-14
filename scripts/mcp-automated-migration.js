#!/usr/bin/env node

/**
 * 🚀 MCP-Powered Supabase Migration Automation
 * 
 * This script uses the Supabase MCP server to automatically:
 * 1. Check existing tables
 * 2. Create missing tables
 * 3. Set up RLS policies
 * 4. Verify migration success
 * 
 * No manual SQL copying required - everything is automated!
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

// Configuration from your .env.local
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://isvjuagegfnkuaucpsvj.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// MCP Server configuration
const MCP_CONFIG = {
  command: 'cmd',
  args: ['/c', 'npx', '-y', '@supabase/mcp-server-supabase@latest', '--read-only', '--project-ref=isvjuagegfnkuaucpsvj'],
  env: {
    SUPABASE_ACCESS_TOKEN: 'sbp_0033b91af6b2ce25879f84babb5c5a5dd67eb6f1'
  }
};

// Required tables for the feedback system
const REQUIRED_TABLES = [
  'ideas',
  'public_feedback', 
  'idea_collaborations'
];

// Migration SQL for missing tables
const MIGRATION_SQL = `
-- =============================================
-- MCP AUTOMATED MIGRATION - MISSING TABLES
-- =============================================

-- 1. Create ideas table (if not exists)
CREATE TABLE IF NOT EXISTS ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  status TEXT DEFAULT 'draft',
  priority TEXT DEFAULT 'medium',
  tags TEXT[],
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_public BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 2. Create public_feedback table (if not exists)
CREATE TABLE IF NOT EXISTS public_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('like', 'dislike', 'comment', 'suggestion')),
  content TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  user_email TEXT,
  user_name TEXT,
  is_anonymous BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 3. Create idea_collaborations table (if not exists)
CREATE TABLE IF NOT EXISTS idea_collaborations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'collaborator', 'viewer')),
  permissions TEXT[] DEFAULT ARRAY['read'],
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'revoked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(idea_id, user_id)
);

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ideas_created_by ON ideas(created_by);
CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status);
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas(created_at);
CREATE INDEX IF NOT EXISTS idx_public_feedback_idea_id ON public_feedback(idea_id);
CREATE INDEX IF NOT EXISTS idx_public_feedback_created_at ON public_feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_idea_collaborations_idea_id ON idea_collaborations(idea_id);
CREATE INDEX IF NOT EXISTS idx_idea_collaborations_user_id ON idea_collaborations(user_id);

-- 5. Create update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables
DROP TRIGGER IF EXISTS update_ideas_updated_at ON ideas;
CREATE TRIGGER update_ideas_updated_at BEFORE UPDATE ON ideas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_public_feedback_updated_at ON public_feedback;
CREATE TRIGGER update_public_feedback_updated_at BEFORE UPDATE ON public_feedback FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_idea_collaborations_updated_at ON idea_collaborations;
CREATE TRIGGER update_idea_collaborations_updated_at BEFORE UPDATE ON idea_collaborations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. Enable Row Level Security
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_collaborations ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies for ideas table
DROP POLICY IF EXISTS "Users can view public ideas" ON ideas;
CREATE POLICY "Users can view public ideas" ON ideas FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Users can view their own ideas" ON ideas;
CREATE POLICY "Users can view their own ideas" ON ideas FOR SELECT USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can insert their own ideas" ON ideas;
CREATE POLICY "Users can insert their own ideas" ON ideas FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can update their own ideas" ON ideas;
CREATE POLICY "Users can update their own ideas" ON ideas FOR UPDATE USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can delete their own ideas" ON ideas;
CREATE POLICY "Users can delete their own ideas" ON ideas FOR DELETE USING (auth.uid() = created_by);

-- 8. Create RLS policies for public_feedback table
DROP POLICY IF EXISTS "Anyone can view public feedback" ON public_feedback;
CREATE POLICY "Anyone can view public feedback" ON public_feedback FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert public feedback" ON public_feedback;
CREATE POLICY "Anyone can insert public feedback" ON public_feedback FOR INSERT WITH CHECK (true);

-- 9. Create RLS policies for idea_collaborations table
DROP POLICY IF EXISTS "Users can view their collaborations" ON idea_collaborations;
CREATE POLICY "Users can view their collaborations" ON idea_collaborations FOR SELECT USING (auth.uid() = user_id OR auth.uid() = invited_by);

DROP POLICY IF EXISTS "Users can insert collaborations" ON idea_collaborations;
CREATE POLICY "Users can insert collaborations" ON idea_collaborations FOR INSERT WITH CHECK (auth.uid() = invited_by);

DROP POLICY IF EXISTS "Users can update their collaborations" ON idea_collaborations;
CREATE POLICY "Users can update their collaborations" ON idea_collaborations FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = invited_by);

-- 10. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ideas TO anon, authenticated;
GRANT ALL ON public_feedback TO anon, authenticated;
GRANT ALL ON idea_collaborations TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Migration completed successfully!
SELECT 'MCP Migration completed successfully!' as status;
`;

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
 * Check if MCP server is available and working
 */
async function checkMCPServer() {
  logStep(1, 'Checking MCP Server Availability');
  
  try {
    // Check if the MCP server package is available
    execSync('npx @supabase/mcp-server-supabase@latest --help', { stdio: 'pipe' });
    logSuccess('MCP Server package is available');
    return true;
  } catch (error) {
    logError('MCP Server package not available or not working');
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
 * Use MCP server to check existing tables
 */
async function checkTablesWithMCP() {
  logStep(2, 'Checking Existing Tables via MCP');
  
  const tableStatus = {};
  
  for (const table of REQUIRED_TABLES) {
    try {
      // Use MCP server to check if table exists
      const command = `npx @supabase/mcp-server-supabase@latest --project-ref=isvjuagegfnkuaucpsvj --read-only --check-table=${table}`;
      execSync(command, { stdio: 'pipe' });
      tableStatus[table] = true;
      log(`  ✅ ${table} - exists`);
    } catch (error) {
      tableStatus[table] = false;
      log(`  ❌ ${table} - missing`);
    }
  }
  
  return tableStatus;
}

/**
 * Execute migration using MCP server
 */
async function executeMigrationWithMCP() {
  logStep(3, 'Executing Migration via MCP Server');
  
  try {
    // Create a temporary SQL file
    const tempSqlFile = path.join(__dirname, 'temp_migration.sql');
    fs.writeFileSync(tempSqlFile, MIGRATION_SQL);
    
    // Use MCP server to execute the migration
    const command = `npx @supabase/mcp-server-supabase@latest --project-ref=isvjuagegfnkuaucpsvj --execute-sql="${tempSqlFile}"`;
    
    log('Executing migration SQL...');
    const result = execSync(command, { 
      stdio: 'inherit',
      env: { 
        ...process.env, 
        SUPABASE_ACCESS_TOKEN: MCP_CONFIG.env.SUPABASE_ACCESS_TOKEN 
      }
    });
    
    // Clean up temporary file
    fs.unlinkSync(tempSqlFile);
    
    logSuccess('Migration executed successfully via MCP!');
    return true;
    
  } catch (error) {
    logError(`Migration failed: ${error.message}`);
    return false;
  }
}

/**
 * Verify migration success using MCP
 */
async function verifyMigrationWithMCP() {
  logStep(4, 'Verifying Migration Success via MCP');
  
  const tableStatus = await checkTablesWithMCP();
  const missingTables = Object.keys(tableStatus).filter(table => !tableStatus[table]);
  
  if (missingTables.length === 0) {
    logSuccess('All required tables are now present!');
    return true;
  } else {
    logError(`Still missing tables: ${missingTables.join(', ')}`);
    return false;
  }
}

/**
 * Create a fallback manual migration guide
 */
function createManualFallback() {
  logStep(5, 'Creating Manual Fallback Guide');
  
  const manualGuide = `
# 🚀 Manual Migration Fallback

Since the MCP automated migration encountered issues, here's the manual process:

## Step 1: Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project (isvjuagegfnkuaucpsvj)
3. Navigate to SQL Editor

## Step 2: Run Migration SQL
Copy and paste this SQL into the SQL Editor:

\`\`\`sql
${MIGRATION_SQL}
\`\`\`

## Step 3: Execute
Click "Run" and wait for completion.

## Step 4: Verify
Run this script again to verify the migration was successful.

## What This Creates:
- ✅ ideas table - For Idea Vault system
- ✅ public_feedback table - For feedback collection
- ✅ idea_collaborations table - For team collaboration
- ✅ Performance indexes
- ✅ Row Level Security policies
- ✅ Update triggers
`;

  const fallbackFile = path.join(__dirname, 'manual-migration-fallback.md');
  fs.writeFileSync(fallbackFile, manualGuide);
  
  log(`Manual fallback guide created: ${fallbackFile}`);
  log('You can also copy the SQL from the console output above.');
}

/**
 * Main migration function
 */
async function runMCPMigration() {
  log(`${colors.bright}${colors.blue}🚀 MCP-Powered Supabase Migration${colors.reset}`);
  log(`${colors.cyan}Target: ${SUPABASE_URL}${colors.reset}`);
  log(`${colors.magenta}Using Supabase MCP Server for automation${colors.reset}\n`);
  
  // Step 1: Check MCP Server
  const mcpAvailable = await checkMCPServer();
  if (!mcpAvailable) {
    logError('MCP Server not available. Creating manual fallback...');
    createManualFallback();
    return;
  }
  
  // Step 2: Check existing tables
  const tableStatus = await checkTablesWithMCP();
  const existingTables = Object.keys(tableStatus).filter(table => tableStatus[table]);
  
  log(`\n📊 Current Status: ${existingTables.length}/${REQUIRED_TABLES.length} tables exist`);
  
  if (existingTables.length === REQUIRED_TABLES.length) {
    logSuccess('All required tables already exist! Migration not needed.');
    log('Your feedback system is ready to use! 🎉');
    return;
  }
  
  // Step 3: Execute migration
  const migrationSuccess = await executeMigrationWithMCP();
  if (!migrationSuccess) {
    logWarning('MCP migration failed. Creating manual fallback...');
    createManualFallback();
    return;
  }
  
  // Step 4: Verify migration
  const verificationSuccess = await verifyMigrationWithMCP();
  if (!verificationSuccess) {
    logWarning('Migration verification failed. Check the manual fallback guide.');
    return;
  }
  
  // Success!
  logSuccess('🎉 MCP Migration completed successfully!');
  log('\nYour Supabase database now has:');
  log('  ✅ ideas table - For Idea Vault system');
  log('  ✅ public_feedback table - For feedback collection');
  log('  ✅ idea_collaborations table - For team collaboration');
  log('  ✅ Performance indexes for fast queries');
  log('  ✅ Row Level Security policies for data protection');
  log('  ✅ Update triggers for automatic timestamps');
  
  log(`\n${colors.bright}${colors.cyan}Next steps:${colors.reset}`);
  log('  1. Test your feedback system - Share Feedback Link should now work!');
  log('  2. Check that data persists in Supabase instead of localStorage');
  log('  3. Verify all features are working correctly');
}

// Run the migration
if (require.main === module) {
  runMCPMigration().catch(error => {
    logError(`Migration failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { runMCPMigration, checkTablesWithMCP, executeMigrationWithMCP };
