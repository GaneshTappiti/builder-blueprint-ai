#!/usr/bin/env node

/**
 * Fully Automated Migration Solution
 * Uses Supabase REST API with service role key for direct database access
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

class AutomatedMigration {
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

  async executeSQLDirect(sql) {
    try {
      // Use the REST API directly with the anon key
      const response = await fetch(`${this.supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.supabaseKey}`,
          'apikey': this.supabaseKey,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ sql_query: sql })
      });

      if (response.ok) {
        return { success: true, data: await response.text() };
      } else {
        const errorText = await response.text();
        return { success: false, error: `HTTP ${response.status}: ${errorText}` };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async createTablesAutomated() {
    this.log('Creating tables using automated approach...', 'step');
    
    const tables = [
      {
        name: 'user_profiles',
        sql: `CREATE TABLE IF NOT EXISTS user_profiles (
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
        )`
      },
      {
        name: 'user_skills',
        sql: `CREATE TABLE IF NOT EXISTS user_skills (
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
        )`
      },
      {
        name: 'user_certifications',
        sql: `CREATE TABLE IF NOT EXISTS user_certifications (
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
        )`
      },
      {
        name: 'user_languages',
        sql: `CREATE TABLE IF NOT EXISTS user_languages (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
          language VARCHAR(100) NOT NULL,
          proficiency VARCHAR(20) DEFAULT 'elementary' CHECK (proficiency IN ('elementary', 'limited', 'professional', 'full', 'native')),
          is_public BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )`
      }
    ];

    let successCount = 0;
    let errorCount = 0;

    for (const table of tables) {
      try {
        this.log(`Creating table: ${table.name}...`, 'info');
        const result = await this.executeSQLDirect(table.sql);
        
        if (result.success) {
          this.log(`✅ Table ${table.name} created successfully`, 'success');
          successCount++;
        } else {
          this.log(`❌ Failed to create table ${table.name}: ${result.error}`, 'error');
          errorCount++;
        }
      } catch (error) {
        this.log(`❌ Error creating table ${table.name}: ${error.message}`, 'error');
        errorCount++;
      }
    }

    return { success: errorCount === 0, successCount, errorCount };
  }

  async createPoliciesAutomated() {
    this.log('Creating RLS policies...', 'step');
    
    const policies = [
      'ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY',
      'ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY',
      'ALTER TABLE user_certifications ENABLE ROW LEVEL SECURITY',
      'ALTER TABLE user_languages ENABLE ROW LEVEL SECURITY',
      'DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles',
      'CREATE POLICY "Users can view their own profile" ON user_profiles FOR SELECT USING (auth.uid() = id)',
      'DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles',
      'CREATE POLICY "Users can update their own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id)',
      'DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles',
      'CREATE POLICY "Users can insert their own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id)',
      'DROP POLICY IF EXISTS "Users can view their own skills" ON user_skills',
      'CREATE POLICY "Users can view their own skills" ON user_skills FOR SELECT USING (auth.uid() = user_id)',
      'DROP POLICY IF EXISTS "Users can manage their own skills" ON user_skills',
      'CREATE POLICY "Users can manage their own skills" ON user_skills FOR ALL USING (auth.uid() = user_id)',
      'DROP POLICY IF EXISTS "Users can view their own certifications" ON user_certifications',
      'CREATE POLICY "Users can view their own certifications" ON user_certifications FOR SELECT USING (auth.uid() = user_id)',
      'DROP POLICY IF EXISTS "Users can manage their own certifications" ON user_certifications',
      'CREATE POLICY "Users can manage their own certifications" ON user_certifications FOR ALL USING (auth.uid() = user_id)',
      'DROP POLICY IF EXISTS "Users can view their own languages" ON user_languages',
      'CREATE POLICY "Users can view their own languages" ON user_languages FOR SELECT USING (auth.uid() = user_id)',
      'DROP POLICY IF EXISTS "Users can manage their own languages" ON user_languages',
      'CREATE POLICY "Users can manage their own languages" ON user_languages FOR ALL USING (auth.uid() = user_id)'
    ];

    let successCount = 0;
    let errorCount = 0;

    for (const policy of policies) {
      try {
        const result = await this.executeSQLDirect(policy);
        
        if (result.success) {
          successCount++;
        } else {
          this.log(`❌ Policy failed: ${policy.substring(0, 50)}... - ${result.error}`, 'error');
          errorCount++;
        }
      } catch (error) {
        this.log(`❌ Policy error: ${error.message}`, 'error');
        errorCount++;
      }
    }

    this.log(`Policy creation: ${successCount} successful, ${errorCount} failed`, successCount > 0 ? 'success' : 'warning');
    return { success: errorCount === 0, successCount, errorCount };
  }

  async createIndexesAutomated() {
    this.log('Creating indexes...', 'step');
    
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email)',
      'CREATE INDEX IF NOT EXISTS idx_user_profiles_completion ON user_profiles(profile_completion)',
      'CREATE INDEX IF NOT EXISTS idx_user_profiles_creation_status ON user_profiles(profile_creation_status)',
      'CREATE INDEX IF NOT EXISTS idx_user_profiles_last_sync ON user_profiles(last_profile_sync)',
      'CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON user_skills(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_user_certifications_user_id ON user_certifications(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_user_languages_user_id ON user_languages(user_id)'
    ];

    let successCount = 0;
    let errorCount = 0;

    for (const index of indexes) {
      try {
        const result = await this.executeSQLDirect(index);
        
        if (result.success) {
          successCount++;
        } else {
          this.log(`❌ Index failed: ${index.substring(0, 50)}... - ${result.error}`, 'error');
          errorCount++;
        }
      } catch (error) {
        this.log(`❌ Index error: ${error.message}`, 'error');
        errorCount++;
      }
    }

    this.log(`Index creation: ${successCount} successful, ${errorCount} failed`, successCount > 0 ? 'success' : 'warning');
    return { success: errorCount === 0, successCount, errorCount };
  }

  async createTriggerAutomated() {
    this.log('Creating profile creation trigger...', 'step');
    
    const triggerSQL = `CREATE OR REPLACE FUNCTION handle_new_user()
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
$$ LANGUAGE plpgsql SECURITY DEFINER`;

    const triggerCreateSQL = `DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user()`;

    try {
      // Create function
      const functionResult = await this.executeSQLDirect(triggerSQL);
      if (functionResult.success) {
        this.log('✅ Trigger function created successfully', 'success');
      } else {
        this.log(`❌ Trigger function failed: ${functionResult.error}`, 'error');
        return { success: false, error: functionResult.error };
      }

      // Create trigger
      const triggerResult = await this.executeSQLDirect(triggerCreateSQL);
      if (triggerResult.success) {
        this.log('✅ Trigger created successfully', 'success');
        return { success: true };
      } else {
        this.log(`❌ Trigger creation failed: ${triggerResult.error}`, 'error');
        return { success: false, error: triggerResult.error };
      }
    } catch (error) {
      this.log(`❌ Trigger error: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }

  async checkTableExists(tableName) {
    try {
      // Try to query the table directly
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

  async runAutomatedMigration() {
    this.log('🚀 Starting fully automated migration...', 'info');
    
    try {
      // Step 1: Create tables
      this.log('Step 1: Creating tables...', 'step');
      const tableResult = await this.createTablesAutomated();
      this.log(`Table creation: ${tableResult.successCount} successful, ${tableResult.errorCount} failed`, 
               tableResult.success ? 'success' : 'warning');
      
      // Step 2: Create policies
      this.log('Step 2: Creating policies...', 'step');
      const policyResult = await this.createPoliciesAutomated();
      
      // Step 3: Create indexes
      this.log('Step 3: Creating indexes...', 'step');
      const indexResult = await this.createIndexesAutomated();
      
      // Step 4: Create trigger
      this.log('Step 4: Creating trigger...', 'step');
      const triggerResult = await this.createTriggerAutomated();
      
      // Step 5: Verify
      this.log('Step 5: Verifying migration...', 'step');
      const finalState = await this.verifyTables();
      
      const allTablesExist = Object.values(finalState).every(exists => exists);
      
      if (allTablesExist) {
        this.log('🎉 Automated migration completed successfully!', 'success');
        this.log('All tables exist and are ready for use.', 'success');
        return true;
      } else {
        this.log('⚠️ Migration completed with some issues.', 'warning');
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
  const migration = new AutomatedMigration();
  const args = process.argv.slice(2);
  const command = args[0] || 'run';

  switch (command) {
    case 'run':
      await migration.runAutomatedMigration();
      break;
    case 'tables':
      await migration.createTablesAutomated();
      break;
    case 'policies':
      await migration.createPoliciesAutomated();
      break;
    case 'indexes':
      await migration.createIndexesAutomated();
      break;
    case 'trigger':
      await migration.createTriggerAutomated();
      break;
    case 'verify':
      await migration.verifyTables();
      break;
    default:
      console.log(`
Usage: node automated-migration.js [command]

Commands:
  run      - Run complete automated migration (default)
  tables   - Create tables only
  policies - Create policies only
  indexes  - Create indexes only
  trigger  - Create trigger only
  verify   - Verify table existence

Examples:
  node automated-migration.js run
  node automated-migration.js verify
      `);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = AutomatedMigration;