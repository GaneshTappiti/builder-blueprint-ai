#!/usr/bin/env node

/**
 * CLI-based Migration using Supabase CLI
 * Uses the Supabase CLI to execute migrations directly
 */

const { exec } = require('child_process');
const util = require('util');
const fs = require('fs');
const path = require('path');

const execAsync = util.promisify(exec);

class CLIMigration {
  constructor() {
    this.projectRef = 'isvjuagegfnkuaucpsvj';
    this.accessToken = 'sbp_0033b91af6b2ce25879f84babb5c5a5dd67eb6f1';
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

  async executeCommand(command) {
    try {
      this.log(`Executing: ${command}`, 'info');
      const { stdout, stderr } = await execAsync(command);
      
      if (stderr) {
        this.log(`Command stderr: ${stderr}`, 'warning');
      }
      
      return { success: true, stdout, stderr };
    } catch (error) {
      this.log(`Command failed: ${error.message}`, 'error');
      return { success: false, error: error.message, stdout: error.stdout, stderr: error.stderr };
    }
  }

  async createMigrationFile() {
    this.log('Creating migration file...', 'step');
    
    const migrationSQL = `-- Create missing tables for profile system
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

CREATE TABLE IF NOT EXISTS user_languages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  language VARCHAR(100) NOT NULL,
  proficiency VARCHAR(20) DEFAULT 'elementary' CHECK (proficiency IN ('elementary', 'limited', 'professional', 'full', 'native')),
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_languages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own skills" ON user_skills FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own skills" ON user_skills FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own certifications" ON user_certifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own certifications" ON user_certifications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own languages" ON user_languages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own languages" ON user_languages FOR ALL USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_certifications_user_id ON user_certifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_languages_user_id ON user_languages(user_id);
`;

    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', `${Date.now()}_create_missing_tables.sql`);
    
    try {
      fs.writeFileSync(migrationPath, migrationSQL);
      this.log(`Migration file created: ${migrationPath}`, 'success');
      return migrationPath;
    } catch (error) {
      this.log(`Failed to create migration file: ${error.message}`, 'error');
      return null;
    }
  }

  async linkProject() {
    this.log('Linking Supabase project...', 'step');
    
    const command = `supabase link --project-ref ${this.projectRef}`;
    const result = await this.executeCommand(command);
    
    if (result.success) {
      this.log('✅ Project linked successfully', 'success');
      return true;
    } else {
      this.log(`❌ Failed to link project: ${result.error}`, 'error');
      return false;
    }
  }

  async pushMigration() {
    this.log('Pushing migration to Supabase...', 'step');
    
    const command = 'supabase db push';
    const result = await this.executeCommand(command);
    
    if (result.success) {
      this.log('✅ Migration pushed successfully', 'success');
      return true;
    } else {
      this.log(`❌ Failed to push migration: ${result.error}`, 'error');
      return false;
    }
  }

  async runMigration() {
    this.log('🚀 Starting CLI-based migration...', 'info');
    
    try {
      // Create migration file
      const migrationPath = await this.createMigrationFile();
      if (!migrationPath) {
        this.log('❌ Failed to create migration file', 'error');
        return false;
      }
      
      // Link project
      const linked = await this.linkProject();
      if (!linked) {
        this.log('⚠️ Project linking failed, but continuing...', 'warning');
      }
      
      // Push migration
      const pushed = await this.pushMigration();
      if (!pushed) {
        this.log('❌ Migration push failed', 'error');
        return false;
      }
      
      this.log('🎉 Migration completed successfully!', 'success');
      return true;
      
    } catch (error) {
      this.log(`❌ Migration failed: ${error.message}`, 'error');
      return false;
    }
  }

  async verifyMigration() {
    this.log('Verifying migration...', 'step');
    
    try {
      const { exec } = require('child_process');
      const util = require('util');
      const execAsync = util.promisify(exec);
      
      const { stdout } = await execAsync('node scripts/test-profile-creation.js tables');
      console.log(stdout);
      
      return stdout.includes('EXISTS');
    } catch (error) {
      this.log(`Verification failed: ${error.message}`, 'error');
      return false;
    }
  }
}

// CLI Interface
async function main() {
  const migration = new CLIMigration();
  const args = process.argv.slice(2);
  const command = args[0] || 'run';

  switch (command) {
    case 'run':
      await migration.runMigration();
      break;
    case 'verify':
      await migration.verifyMigration();
      break;
    case 'link':
      await migration.linkProject();
      break;
    case 'push':
      await migration.pushMigration();
      break;
    default:
      console.log(`
Usage: node cli-migration.js [command]

Commands:
  run     - Run complete migration (default)
  verify  - Verify migration success
  link    - Link Supabase project only
  push    - Push migration only

Examples:
  node cli-migration.js run
  node cli-migration.js verify
      `);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = CLIMigration;
