#!/usr/bin/env node

/**
 * Database Migration Script for Builder Blueprint AI
 * Applies all necessary database migrations to fix profile creation issues
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

class DatabaseMigration {
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
      warning: '⚠️'
    }[type];
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async executeSQL(sql) {
    try {
      const { data, error } = await this.supabase.rpc('exec_sql', { sql_query: sql });
      if (error) {
        throw error;
      }
      return { success: true, data };
    } catch (error) {
      // If exec_sql function doesn't exist, try direct query
      try {
        const { data, error } = await this.supabase
          .from('information_schema.tables')
          .select('table_name')
          .limit(1);
        
        if (error) {
          throw new Error('Cannot execute SQL directly. Please run migrations manually in Supabase dashboard.');
        }
        
        // For now, we'll return the SQL to be executed manually
        return { success: false, sql, error: 'Manual execution required' };
      } catch (directError) {
        return { success: false, sql, error: directError.message };
      }
    }
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

  async createUserProfilesTable() {
    this.log('Creating user_profiles table...', 'info');
    
    const sql = `
-- Create user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  
  -- Basic Information
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  role VARCHAR(50) DEFAULT 'user',
  
  -- Personal Information
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
  
  -- Professional Information
  job_title VARCHAR(255),
  department VARCHAR(100),
  work_location VARCHAR(20) DEFAULT 'remote' CHECK (work_location IN ('remote', 'hybrid', 'office')),
  
  -- Interests and Tags
  interests TEXT[] DEFAULT '{}',
  
  -- Status and Availability
  status VARCHAR(20) DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'busy', 'away')),
  availability JSONB DEFAULT '{"isAvailable": true, "workingDays": [1,2,3,4,5], "timezone": "UTC", "vacationMode": false}',
  working_hours JSONB DEFAULT '{"start": "09:00", "end": "17:00", "days": [1,2,3,4,5], "timezone": "UTC"}',
  
  -- Preferences and Settings
  preferences JSONB DEFAULT '{}',
  privacy JSONB DEFAULT '{}',
  
  -- System Fields
  is_active BOOLEAN DEFAULT true,
  profile_completion INTEGER DEFAULT 0 CHECK (profile_completion >= 0 AND profile_completion <= 100),
  onboarding_completed BOOLEAN DEFAULT false,
  last_login TIMESTAMP WITH TIME ZONE,
  
  -- Profile Creation Tracking
  profile_creation_status VARCHAR(20) DEFAULT 'completed' CHECK (profile_creation_status IN ('pending', 'completed', 'failed')),
  profile_creation_error TEXT,
  last_profile_sync TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Timestamps
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
    if (result.success) {
      this.log('User profiles tables created successfully', 'success');
      return true;
    } else {
      this.log('Failed to create tables via RPC, manual execution required', 'warning');
      this.log('Please run the following SQL in your Supabase dashboard:', 'info');
      console.log('\n' + '='.repeat(80));
      console.log(sql);
      console.log('='.repeat(80) + '\n');
      return false;
    }
  }

  async createProfileTrigger() {
    this.log('Creating profile creation trigger...', 'info');
    
    const sql = `
-- Create function to handle new user profile creation with proper error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert profile with proper error handling and conflict resolution
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
    -- Log error but don't fail the auth user creation
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
    if (result.success) {
      this.log('Profile creation trigger created successfully', 'success');
      return true;
    } else {
      this.log('Failed to create trigger via RPC, manual execution required', 'warning');
      this.log('Please run the following SQL in your Supabase dashboard:', 'info');
      console.log('\n' + '='.repeat(80));
      console.log(sql);
      console.log('='.repeat(80) + '\n');
      return false;
    }
  }

  async verifyTables() {
    this.log('Verifying database tables...', 'info');
    
    const tables = ['user_profiles', 'user_skills', 'user_certifications', 'user_languages'];
    const results = {};
    
    for (const table of tables) {
      const exists = await this.checkTableExists(table);
      results[table] = exists;
      this.log(`Table ${table}: ${exists ? 'EXISTS' : 'MISSING'}`, exists ? 'success' : 'error');
    }
    
    return results;
  }

  async runMigration() {
    this.log('Starting database migration...', 'info');
    
    try {
      // Check current state
      const currentState = await this.verifyTables();
      
      // Create tables if they don't exist
      if (!currentState.user_profiles) {
        await this.createUserProfilesTable();
      } else {
        this.log('User profiles table already exists', 'success');
      }
      
      // Create trigger
      await this.createProfileTrigger();
      
      // Verify final state
      const finalState = await this.verifyTables();
      
      const allTablesExist = Object.values(finalState).every(exists => exists);
      
      if (allTablesExist) {
        this.log('Database migration completed successfully!', 'success');
        return true;
      } else {
        this.log('Database migration completed with some issues', 'warning');
        return false;
      }
      
    } catch (error) {
      this.log(`Migration failed: ${error.message}`, 'error');
      return false;
    }
  }
}

// CLI Interface
async function main() {
  const migration = new DatabaseMigration();
  const args = process.argv.slice(2);
  const command = args[0] || 'run';

  switch (command) {
    case 'run':
      await migration.runMigration();
      break;
    case 'verify':
      await migration.verifyTables();
      break;
    case 'tables':
      await migration.createUserProfilesTable();
      break;
    case 'trigger':
      await migration.createProfileTrigger();
      break;
    default:
      console.log(`
Usage: node apply-database-migration.js [command]

Commands:
  run      - Run complete migration (default)
  verify   - Verify table existence
  tables   - Create tables only
  trigger  - Create trigger only

Examples:
  node apply-database-migration.js run
  node apply-database-migration.js verify
      `);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = DatabaseMigration;
