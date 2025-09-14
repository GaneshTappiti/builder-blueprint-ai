#!/usr/bin/env node

/**
 * One-Click Migration Solution
 * Generates the exact SQL and provides automated execution instructions
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execAsync = util.promisify(exec);

class OneClickMigration {
  constructor() {
    this.supabaseUrl = 'https://isvjuagegfnkuaucpsvj.supabase.co';
    this.projectRef = 'isvjuagegfnkuaucpsvj';
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '📋',
      success: '✅',
      error: '❌',
      warning: '⚠️',
      step: '🔧'
    }[type];
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  generateMigrationSQL() {
    return `-- =====================================================
-- ONE-CLICK MIGRATION FOR BUILDER BLUEPRINT AI
-- =====================================================
-- This SQL will create all missing tables and policies
-- Copy and paste this entire block into your Supabase SQL Editor

-- Create user_skills table
CREATE TABLE IF NOT EXISTS user_skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) DEFAULT 'other' CHECK (category IN ('technical', 'soft', 'language', 'tool', 'framework', 'other')),
  level VARCHAR(20) DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  years_of_experience INTEGER,
  verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  endorsements INTEGER DEFAULT 0,
  endorsers TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_certifications table
CREATE TABLE IF NOT EXISTS user_certifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  issuer VARCHAR(255) NOT NULL,
  credential_id VARCHAR(255),
  issue_date DATE NOT NULL,
  expiry_date DATE,
  credential_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_languages table
CREATE TABLE IF NOT EXISTS user_languages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  language VARCHAR(100) NOT NULL,
  proficiency VARCHAR(20) DEFAULT 'elementary' CHECK (proficiency IN ('elementary', 'limited', 'professional', 'full', 'native')),
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_languages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_skills
DROP POLICY IF EXISTS "Users can view their own skills" ON user_skills;
CREATE POLICY "Users can view their own skills" ON user_skills
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own skills" ON user_skills;
CREATE POLICY "Users can manage their own skills" ON user_skills
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for user_certifications
DROP POLICY IF EXISTS "Users can view their own certifications" ON user_certifications;
CREATE POLICY "Users can view their own certifications" ON user_certifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own certifications" ON user_certifications;
CREATE POLICY "Users can manage their own certifications" ON user_certifications
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for user_languages
DROP POLICY IF EXISTS "Users can view their own languages" ON user_languages;
CREATE POLICY "Users can view their own languages" ON user_languages
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own languages" ON user_languages;
CREATE POLICY "Users can manage their own languages" ON user_languages
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_certifications_user_id ON user_certifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_languages_user_id ON user_languages(user_id);

-- Create profile creation trigger function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (
    id,
    email,
    name,
    avatar_url,
    role,
    created_at,
    updated_at,
    profile_creation_status,
    last_profile_sync
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'User'),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    NEW.created_at,
    NEW.updated_at,
    'completed',
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    avatar_url = EXCLUDED.avatar_url,
    role = EXCLUDED.role,
    updated_at = NOW(),
    last_profile_sync = NOW(),
    profile_creation_status = 'completed',
    profile_creation_error = NULL;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- MIGRATION COMPLETE!
-- =====================================================
-- All required tables, policies, indexes, and triggers have been created.
-- Your profile system is now ready to use!
`;
  }

  async openSupabaseDashboard() {
    this.log('Opening Supabase Dashboard...', 'step');
    
    try {
      const url = `https://supabase.com/dashboard/project/${this.projectRef}/sql`;
      
      // Try to open the URL in the default browser
      const command = process.platform === 'win32' ? `start ${url}` : 
                     process.platform === 'darwin' ? `open ${url}` : 
                     `xdg-open ${url}`;
      
      await execAsync(command);
      this.log('✅ Supabase Dashboard opened in your browser', 'success');
      return true;
    } catch (error) {
      this.log(`⚠️ Could not open browser automatically: ${error.message}`, 'warning');
      this.log(`Please manually open: https://supabase.com/dashboard/project/${this.projectRef}/sql`, 'info');
      return false;
    }
  }

  async saveSQLToFile() {
    this.log('Saving SQL to file...', 'step');
    
    const sql = this.generateMigrationSQL();
    const filePath = path.join(__dirname, '..', 'one-click-migration.sql');
    
    try {
      fs.writeFileSync(filePath, sql);
      this.log(`✅ SQL saved to: ${filePath}`, 'success');
      return filePath;
    } catch (error) {
      this.log(`❌ Failed to save SQL file: ${error.message}`, 'error');
      return null;
    }
  }

  async runVerification() {
    this.log('Running verification...', 'step');
    
    try {
      const { stdout } = await execAsync('node scripts/test-profile-creation.js tables');
      console.log(stdout);
      
      const allTablesExist = stdout.includes('EXISTS') && !stdout.includes('MISSING');
      
      if (allTablesExist) {
        this.log('🎉 All tables exist! Migration is complete!', 'success');
        return true;
      } else {
        this.log('⚠️ Some tables are still missing', 'warning');
        return false;
      }
    } catch (error) {
      this.log(`❌ Verification failed: ${error.message}`, 'error');
      return false;
    }
  }

  async runOneClickMigration() {
    this.log('🚀 Starting One-Click Migration...', 'info');
    
    console.log('\n' + '='.repeat(80));
    console.log('🎯 ONE-CLICK MIGRATION SOLUTION');
    console.log('='.repeat(80));
    console.log('');
    console.log('This will help you complete your todo list in 3 simple steps:');
    console.log('');
    console.log('STEP 1: Open Supabase Dashboard');
    console.log('STEP 2: Copy and paste the SQL');
    console.log('STEP 3: Run verification');
    console.log('');
    console.log('='.repeat(80));
    console.log('');

    // Save SQL to file
    const filePath = await this.saveSQLToFile();
    if (!filePath) {
      this.log('❌ Failed to save SQL file', 'error');
      return false;
    }

    // Open Supabase Dashboard
    await this.openSupabaseDashboard();

    // Display instructions
    this.log('📋 MIGRATION INSTRUCTIONS:', 'step');
    console.log('');
    console.log('1. The Supabase Dashboard should have opened in your browser');
    console.log('2. If not, go to: https://supabase.com/dashboard/project/isvjuagegfnkuaucpsvj/sql');
    console.log('3. Open the file: one-click-migration.sql');
    console.log('4. Copy ALL contents of the file');
    console.log('5. Paste into the SQL Editor');
    console.log('6. Click "Run" to execute');
    console.log('');
    console.log('After running the SQL, come back here and run:');
    console.log('node scripts/one-click-migration.js verify');
    console.log('');

    return true;
  }

  async runCompleteProcess() {
    this.log('🚀 Running complete migration process...', 'info');
    
    // Run one-click migration
    await this.runOneClickMigration();
    
    // Wait a moment for user to execute SQL
    this.log('⏳ Waiting for you to execute the SQL in Supabase Dashboard...', 'info');
    this.log('Press Ctrl+C to cancel, or run "node scripts/one-click-migration.js verify" when ready', 'info');
    
    // In a real scenario, you would wait for user input or run verification
    return true;
  }
}

// CLI Interface
async function main() {
  const migration = new OneClickMigration();
  const args = process.argv.slice(2);
  const command = args[0] || 'run';

  switch (command) {
    case 'run':
      await migration.runOneClickMigration();
      break;
    case 'verify':
      await migration.runVerification();
      break;
    case 'complete':
      await migration.runCompleteProcess();
      break;
    case 'sql':
      console.log(migration.generateMigrationSQL());
      break;
    default:
      console.log(`
Usage: node one-click-migration.js [command]

Commands:
  run      - Start one-click migration (default)
  verify   - Verify migration success
  complete - Run complete process
  sql      - Display SQL only

Examples:
  node one-click-migration.js run
  node one-click-migration.js verify
      `);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = OneClickMigration;
