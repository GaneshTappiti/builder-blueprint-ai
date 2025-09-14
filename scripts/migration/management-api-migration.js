#!/usr/bin/env node

/**
 * Management API Migration
 * Uses Supabase Management API to execute SQL directly
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

class ManagementAPIMigration {
  constructor() {
    this.supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    this.supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    this.accessToken = 'sbp_0033b91af6b2ce25879f84babb5c5a5dd67eb6f1';
    this.projectRef = 'isvjuagegfnkuaucpsvj';
    
    if (!this.supabaseUrl || !this.supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }
    
    this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
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

  async executeSQLViaManagementAPI(sql) {
    try {
      // Use the Management API to execute SQL
      const response = await fetch(`https://api.supabase.com/v1/projects/${this.projectRef}/sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`,
          'apikey': this.accessToken
        },
        body: JSON.stringify({
          query: sql
        })
      });

      if (response.ok) {
        const result = await response.json();
        return { success: true, data: result };
      } else {
        const errorText = await response.text();
        return { success: false, error: `HTTP ${response.status}: ${errorText}` };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async createMissingTables() {
    this.log('Creating missing tables via Management API...', 'step');
    
    const sql = `
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
`;

    const result = await this.executeSQLViaManagementAPI(sql);
    return result;
  }

  async createPolicies() {
    this.log('Creating RLS policies via Management API...', 'step');
    
    const sql = `
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
`;

    const result = await this.executeSQLViaManagementAPI(sql);
    return result;
  }

  async createIndexes() {
    this.log('Creating indexes via Management API...', 'step');
    
    const sql = `
-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_certifications_user_id ON user_certifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_languages_user_id ON user_languages(user_id);
`;

    const result = await this.executeSQLViaManagementAPI(sql);
    return result;
  }

  async checkTableExists(tableName) {
    try {
      const { data, error } = await this.supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      return !error;
    } catch (error) {
      return false;
    }
  }

  async verifyTables() {
    this.log('Verifying database tables...', 'step');
    
    const tables = ['user_profiles', 'user_skills', 'user_certifications', 'user_languages'];
    const results = {};
    
    for (const table of tables) {
      const exists = await this.checkTableExists(table);
      results[table] = exists;
      this.log(`Table ${table}: ${exists ? 'EXISTS' : 'MISSING'}`, exists ? 'success' : 'error');
    }
    
    return results;
  }

  async runCompleteMigration() {
    this.log('🚀 Starting Management API migration...', 'info');
    
    try {
      // Check current state
      this.log('Checking current table status...', 'step');
      const currentState = await this.verifyTables();
      
      // Create tables
      this.log('Creating missing tables...', 'step');
      const tableResult = await this.createMissingTables();
      if (tableResult.success) {
        this.log('✅ Tables created successfully', 'success');
      } else {
        this.log(`❌ Table creation failed: ${tableResult.error}`, 'error');
      }
      
      // Create policies
      this.log('Creating RLS policies...', 'step');
      const policyResult = await this.createPolicies();
      if (policyResult.success) {
        this.log('✅ Policies created successfully', 'success');
      } else {
        this.log(`❌ Policy creation failed: ${policyResult.error}`, 'error');
      }
      
      // Create indexes
      this.log('Creating indexes...', 'step');
      const indexResult = await this.createIndexes();
      if (indexResult.success) {
        this.log('✅ Indexes created successfully', 'success');
      } else {
        this.log(`❌ Index creation failed: ${indexResult.error}`, 'error');
      }
      
      // Verify final state
      this.log('Verifying final state...', 'step');
      const finalState = await this.verifyTables();
      
      const allTablesExist = Object.values(finalState).every(exists => exists);
      
      if (allTablesExist) {
        this.log('🎉 Migration completed successfully!', 'success');
        this.log('All tables exist and are ready for use.', 'success');
        return true;
      } else {
        this.log('⚠️ Migration completed with some issues', 'warning');
        return false;
      }
      
    } catch (error) {
      this.log(`❌ Migration failed: ${error.message}`, 'error');
      return false;
    }
  }
}

// CLI Interface
async function main() {
  const migration = new ManagementAPIMigration();
  const args = process.argv.slice(2);
  const command = args[0] || 'run';

  switch (command) {
    case 'run':
      await migration.runCompleteMigration();
      break;
    case 'tables':
      await migration.createMissingTables();
      break;
    case 'policies':
      await migration.createPolicies();
      break;
    case 'indexes':
      await migration.createIndexes();
      break;
    case 'verify':
      await migration.verifyTables();
      break;
    default:
      console.log(`
Usage: node management-api-migration.js [command]

Commands:
  run      - Run complete migration (default)
  tables   - Create tables only
  policies - Create policies only
  indexes  - Create indexes only
  verify   - Verify table existence

Examples:
  node management-api-migration.js run
  node management-api-migration.js verify
      `);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = ManagementAPIMigration;
