#!/usr/bin/env node

/**
 * Execute Migration using Supabase Client
 * This script will execute the migration SQL directly through the Supabase client
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

class MCPMigration {
  constructor() {
    this.supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    this.supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
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

  async executeSQL(sql) {
    try {
      // Try to execute using the REST API directly
      const response = await fetch(`${this.supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.supabaseKey}`,
          'apikey': this.supabaseKey
        },
        body: JSON.stringify({ sql_query: sql })
      });

      if (response.ok) {
        const result = await response.json();
        return { success: true, data: result };
      } else {
        // If exec_sql doesn't work, try alternative approach
        return await this.executeViaQuery(sql);
      }
    } catch (error) {
      this.log(`RPC execution failed: ${error.message}`, 'warning');
      return await this.executeViaQuery(sql);
    }
  }

  async executeViaQuery(sql) {
    try {
      // Split SQL into individual statements
      const statements = sql
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

      let successCount = 0;
      let errorCount = 0;
      const errors = [];

      for (const statement of statements) {
        try {
          // Try to execute each statement using the REST API
          const response = await fetch(`${this.supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.supabaseKey}`,
              'apikey': this.supabaseKey
            },
            body: JSON.stringify({ sql_query: statement })
          });

          if (response.ok) {
            successCount++;
            this.log(`✅ Executed: ${statement.substring(0, 50)}...`, 'success');
          } else {
            const errorText = await response.text();
            errorCount++;
            errors.push(`${statement.substring(0, 50)}... - ${errorText}`);
            this.log(`❌ Failed: ${statement.substring(0, 50)}...`, 'error');
          }
        } catch (error) {
          errorCount++;
          errors.push(`${statement.substring(0, 50)}... - ${error.message}`);
          this.log(`❌ Error: ${error.message}`, 'error');
        }
      }

      return { 
        success: errorCount === 0, 
        successCount, 
        errorCount,
        errors,
        message: `Executed ${successCount} statements successfully, ${errorCount} failed`
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async createTables() {
    this.log('Creating database tables...', 'step');
    
    const sql = `
-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  role VARCHAR(50) DEFAULT 'user',
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  display_name VARCHAR(100),
  bio TEXT,
  phone VARCHAR(20),
  location VARCHAR(255),
  timezone VARCHAR(50) DEFAULT 'UTC',
  website TEXT,
  linkedin TEXT,
  twitter TEXT,
  github TEXT,
  job_title VARCHAR(255),
  department VARCHAR(100),
  work_location VARCHAR(20) DEFAULT 'remote' CHECK (work_location IN ('remote', 'hybrid', 'office')),
  interests TEXT[] DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'busy', 'away')),
  availability JSONB DEFAULT '{"isAvailable": true, "workingDays": [1,2,3,4,5], "timezone": "UTC", "vacationMode": false}',
  working_hours JSONB DEFAULT '{"start": "09:00", "end": "17:00", "days": [1,2,3,4,5], "timezone": "UTC"}',
  preferences JSONB DEFAULT '{}',
  privacy JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  profile_completion INTEGER DEFAULT 0 CHECK (profile_completion >= 0 AND profile_completion <= 100),
  onboarding_completed BOOLEAN DEFAULT false,
  last_login TIMESTAMP WITH TIME ZONE,
  profile_creation_status VARCHAR(20) DEFAULT 'completed' CHECK (profile_creation_status IN ('pending', 'completed', 'failed')),
  profile_creation_error TEXT,
  last_profile_sync TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

    const result = await this.executeSQL(sql);
    return result;
  }

  async createPolicies() {
    this.log('Creating RLS policies...', 'step');
    
    const sql = `
-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_languages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

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
`;

    const result = await this.executeSQL(sql);
    return result;
  }

  async createIndexes() {
    this.log('Creating indexes...', 'step');
    
    const sql = `
-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_completion ON user_profiles(profile_completion);
CREATE INDEX IF NOT EXISTS idx_user_profiles_creation_status ON user_profiles(profile_creation_status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_last_sync ON user_profiles(last_profile_sync);
CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_certifications_user_id ON user_certifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_languages_user_id ON user_languages(user_id);
`;

    const result = await this.executeSQL(sql);
    return result;
  }

  async createTrigger() {
    this.log('Creating profile creation trigger...', 'step');
    
    const sql = `
-- Create function to handle new user profile creation
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
`;

    const result = await this.executeSQL(sql);
    return result;
  }

  async checkTableExists(tableName) {
    try {
      const { data, error } = await this.supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', tableName)
        .single();
      
      return !error && data;
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
    this.log('🚀 Starting complete database migration...', 'info');
    
    try {
      // Check current state
      this.log('Checking current state...', 'info');
      const currentState = await this.verifyTables();
      
      // Create tables
      this.log('Creating tables...', 'info');
      const tableResult = await this.createTables();
      this.log(`Table creation: ${tableResult.message}`, tableResult.success ? 'success' : 'warning');
      
      // Create policies
      this.log('Creating policies...', 'info');
      const policyResult = await this.createPolicies();
      this.log(`Policy creation: ${policyResult.message}`, policyResult.success ? 'success' : 'warning');
      
      // Create indexes
      this.log('Creating indexes...', 'info');
      const indexResult = await this.createIndexes();
      this.log(`Index creation: ${indexResult.message}`, indexResult.success ? 'success' : 'warning');
      
      // Create trigger
      this.log('Creating trigger...', 'info');
      const triggerResult = await this.createTrigger();
      this.log(`Trigger creation: ${triggerResult.message}`, triggerResult.success ? 'success' : 'warning');
      
      // Verify final state
      this.log('Verifying final state...', 'info');
      const finalState = await this.verifyTables();
      
      const allTablesExist = Object.values(finalState).every(exists => exists);
      
      if (allTablesExist) {
        this.log('🎉 Migration completed successfully! All tables exist.', 'success');
        return true;
      } else {
        this.log('⚠️ Migration completed with some issues. Some tables may be missing.', 'warning');
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
  const migration = new MCPMigration();
  const args = process.argv.slice(2);
  const command = args[0] || 'run';

  switch (command) {
    case 'run':
      await migration.runCompleteMigration();
      break;
    case 'verify':
      await migration.verifyTables();
      break;
    case 'tables':
      await migration.createTables();
      break;
    case 'policies':
      await migration.createPolicies();
      break;
    case 'indexes':
      await migration.createIndexes();
      break;
    case 'trigger':
      await migration.createTrigger();
      break;
    default:
      console.log(`
Usage: node execute-migration-mcp.js [command]

Commands:
  run      - Run complete migration (default)
  verify   - Verify table existence
  tables   - Create tables only
  policies - Create policies only
  indexes  - Create indexes only
  trigger  - Create trigger only

Examples:
  node execute-migration-mcp.js run
  node execute-migration-mcp.js verify
      `);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = MCPMigration;
