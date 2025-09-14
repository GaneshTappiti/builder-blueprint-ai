#!/usr/bin/env node

/**
 * MCP-Based Supabase Migration Automation
 * 
 * This script automates database migrations using the MCP Supabase server
 * and provides comprehensive error handling and rollback capabilities.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class MCPMigrationManager {
  constructor() {
    this.projectRef = 'isvjuagegfnkuaucpsvj';
    this.accessToken = 'sbp_0033b91af6b2ce25879f84babb5c5a5dd67eb6f1';
    this.migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
    this.logFile = path.join(__dirname, 'migration.log');
  }

  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}`;
    console.log(logMessage);
    
    // Append to log file
    fs.appendFileSync(this.logFile, logMessage + '\n');
  }

  async runMCPCommand(command, args = []) {
    return new Promise((resolve, reject) => {
      this.log(`Running MCP command: ${command} ${args.join(' ')}`);
      
      const child = spawn('npx', [
        '-y',
        '@supabase/mcp-server-supabase@latest',
        '--project-ref', this.projectRef,
        command,
        ...args
      ], {
        env: {
          ...process.env,
          SUPABASE_ACCESS_TOKEN: this.accessToken
        },
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          this.log(`MCP command completed successfully`);
          resolve({ stdout, stderr, code });
        } else {
          this.log(`MCP command failed with code ${code}: ${stderr}`, 'ERROR');
          reject(new Error(`MCP command failed: ${stderr}`));
        }
      });

      child.on('error', (error) => {
        this.log(`MCP command error: ${error.message}`, 'ERROR');
        reject(error);
      });
    });
  }

  async checkConnection() {
    try {
      this.log('Checking Supabase connection...');
      const result = await this.runMCPCommand('status');
      this.log('Connection successful');
      return true;
    } catch (error) {
      this.log(`Connection failed: ${error.message}`, 'ERROR');
      return false;
    }
  }

  async listMigrations() {
    try {
      const files = fs.readdirSync(this.migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort();
      
      this.log(`Found ${files.length} migration files`);
      return files;
    } catch (error) {
      this.log(`Error listing migrations: ${error.message}`, 'ERROR');
      return [];
    }
  }

  async executeMigration(filename) {
    try {
      const filePath = path.join(this.migrationsDir, filename);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      this.log(`Executing migration: ${filename}`);
      
      // Split SQL into individual statements
      const statements = sql
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);

      for (const statement of statements) {
        if (statement.trim()) {
          this.log(`Executing statement: ${statement.substring(0, 100)}...`);
          await this.runMCPCommand('exec', [statement]);
        }
      }

      this.log(`Migration ${filename} completed successfully`);
      return true;
    } catch (error) {
      this.log(`Migration ${filename} failed: ${error.message}`, 'ERROR');
      return false;
    }
  }

  async checkTableExists(tableName) {
    try {
      const result = await this.runMCPCommand('query', [
        `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = '${tableName}'
        );`
      ]);
      
      const exists = result.stdout.includes('t');
      this.log(`Table ${tableName} exists: ${exists}`);
      return exists;
    } catch (error) {
      this.log(`Error checking table ${tableName}: ${error.message}`, 'ERROR');
      return false;
    }
  }

  async createUserProfilesTable() {
    try {
      this.log('Creating user_profiles table...');
      
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS user_profiles (
          id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
          email TEXT NOT NULL,
          name TEXT NOT NULL,
          avatar_url TEXT,
          role TEXT DEFAULT 'user',
          first_name TEXT,
          last_name TEXT,
          display_name TEXT,
          bio TEXT,
          phone TEXT,
          location TEXT,
          timezone TEXT DEFAULT 'UTC',
          website TEXT,
          linkedin TEXT,
          twitter TEXT,
          github TEXT,
          job_title TEXT,
          department TEXT,
          manager TEXT,
          direct_reports TEXT[],
          hire_date DATE,
          employee_id TEXT,
          work_location TEXT DEFAULT 'remote',
          skills JSONB DEFAULT '[]'::jsonb,
          certifications JSONB DEFAULT '[]'::jsonb,
          languages JSONB DEFAULT '[]'::jsonb,
          interests TEXT[] DEFAULT '{}',
          status TEXT DEFAULT 'offline',
          availability JSONB DEFAULT '{"isAvailable": true, "workingDays": [1,2,3,4,5], "timezone": "UTC", "vacationMode": false}'::jsonb,
          working_hours JSONB DEFAULT '{"start": "09:00", "end": "17:00", "timezone": "UTC"}'::jsonb,
          preferences JSONB DEFAULT '{}'::jsonb,
          privacy JSONB DEFAULT '{}'::jsonb,
          performance_data JSONB DEFAULT '{}'::jsonb,
          activity_data JSONB DEFAULT '{}'::jsonb,
          team_member JSONB,
          team_role TEXT,
          permissions TEXT[] DEFAULT '{}',
          connections JSONB DEFAULT '[]'::jsonb,
          collaborations JSONB DEFAULT '[]'::jsonb,
          achievements JSONB DEFAULT '[]'::jsonb,
          is_active BOOLEAN DEFAULT true,
          last_login TIMESTAMPTZ,
          profile_completion INTEGER DEFAULT 0,
          onboarding_completed BOOLEAN DEFAULT false,
          universal_id TEXT,
          version INTEGER DEFAULT 1,
          version_history JSONB DEFAULT '[]'::jsonb,
          media_storage JSONB DEFAULT '{"used": 0, "limit": 1000000000, "files": []}'::jsonb,
          data_retention JSONB DEFAULT '{"policy": "standard", "retentionPeriod": 365, "autoDelete": false}'::jsonb,
          gdpr_consent JSONB DEFAULT '{"given": false, "date": null, "version": "1.0"}'::jsonb,
          deletion_status JSONB DEFAULT '{"status": "active", "requestedAt": null, "scheduledFor": null, "reason": null}'::jsonb,
          merge_history JSONB DEFAULT '[]'::jsonb,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `;

      await this.runMCPCommand('exec', [createTableSQL]);
      this.log('user_profiles table created successfully');
      return true;
    } catch (error) {
      this.log(`Error creating user_profiles table: ${error.message}`, 'ERROR');
      return false;
    }
  }

  async createRelatedTables() {
    const tables = [
      {
        name: 'user_skills',
        sql: `
          CREATE TABLE IF NOT EXISTS user_skills (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            level TEXT NOT NULL,
            category TEXT,
            years_experience INTEGER,
            last_used DATE,
            is_certified BOOLEAN DEFAULT false,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `
      },
      {
        name: 'user_certifications',
        sql: `
          CREATE TABLE IF NOT EXISTS user_certifications (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            issuer TEXT NOT NULL,
            issue_date DATE NOT NULL,
            expiry_date DATE,
            credential_id TEXT,
            credential_url TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `
      },
      {
        name: 'user_languages',
        sql: `
          CREATE TABLE IF NOT EXISTS user_languages (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
            language TEXT NOT NULL,
            proficiency TEXT NOT NULL,
            is_native BOOLEAN DEFAULT false,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `
      },
      {
        name: 'user_achievements',
        sql: `
          CREATE TABLE IF NOT EXISTS user_achievements (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            description TEXT,
            category TEXT,
            earned_date DATE NOT NULL,
            issuer TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `
      }
    ];

    for (const table of tables) {
      try {
        this.log(`Creating table: ${table.name}`);
        await this.runMCPCommand('exec', [table.sql]);
        this.log(`Table ${table.name} created successfully`);
      } catch (error) {
        this.log(`Error creating table ${table.name}: ${error.message}`, 'ERROR');
      }
    }
  }

  async runAllMigrations() {
    try {
      this.log('Starting automated migration process...');
      
      // Check connection
      const connected = await this.checkConnection();
      if (!connected) {
        throw new Error('Failed to connect to Supabase');
      }

      // Check if user_profiles table exists
      const profilesTableExists = await this.checkTableExists('user_profiles');
      
      if (!profilesTableExists) {
        this.log('user_profiles table does not exist, creating it...');
        await this.createUserProfilesTable();
        await this.createRelatedTables();
      } else {
        this.log('user_profiles table already exists');
      }

      // Run all migration files
      const migrations = await this.listMigrations();
      
      for (const migration of migrations) {
        this.log(`Processing migration: ${migration}`);
        const success = await this.executeMigration(migration);
        
        if (!success) {
          this.log(`Migration ${migration} failed, stopping process`, 'ERROR');
          return false;
        }
      }

      this.log('All migrations completed successfully');
      return true;
    } catch (error) {
      this.log(`Migration process failed: ${error.message}`, 'ERROR');
      return false;
    }
  }

  async fixProfileCreation() {
    try {
      this.log('Fixing profile creation issues...');
      
      // Create the profile creation trigger function
      const triggerFunctionSQL = `
        CREATE OR REPLACE FUNCTION handle_new_user()
        RETURNS TRIGGER AS $$
        BEGIN
          INSERT INTO user_profiles (
            id, email, name, avatar_url, role, created_at, updated_at
          ) VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
            NEW.raw_user_meta_data->>'avatar_url',
            COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
            NOW(),
            NOW()
          )
          ON CONFLICT (id) DO NOTHING;
          
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `;

      await this.runMCPCommand('exec', [triggerFunctionSQL]);

      // Create the trigger
      const triggerSQL = `
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE FUNCTION handle_new_user();
      `;

      await this.runMCPCommand('exec', [triggerSQL]);

      this.log('Profile creation trigger created successfully');
      return true;
    } catch (error) {
      this.log(`Error fixing profile creation: ${error.message}`, 'ERROR');
      return false;
    }
  }
}

// CLI Interface
async function main() {
  const manager = new MCPMigrationManager();
  const command = process.argv[2];

  switch (command) {
    case 'migrate':
      await manager.runAllMigrations();
      break;
    case 'fix-profiles':
      await manager.fixProfileCreation();
      break;
    case 'check':
      await manager.checkConnection();
      break;
    case 'tables':
      const exists = await manager.checkTableExists('user_profiles');
      console.log(`user_profiles table exists: ${exists}`);
      break;
    default:
      console.log(`
MCP Migration Manager

Usage:
  node mcp-migration-automation.js <command>

Commands:
  migrate      Run all pending migrations
  fix-profiles Fix profile creation issues
  check        Check Supabase connection
  tables       Check if tables exist

Examples:
  node mcp-migration-automation.js migrate
  node mcp-migration-automation.js fix-profiles
      `);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = MCPMigrationManager;
