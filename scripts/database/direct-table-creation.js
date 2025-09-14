#!/usr/bin/env node

/**
 * Direct Table Creation using Supabase Client
 * Creates tables using Supabase's built-in methods instead of raw SQL
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

class DirectTableCreation {
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

  async createTableByInsertingData(tableName, sampleData) {
    try {
      this.log(`Creating table ${tableName} by inserting sample data...`, 'info');
      
      // Try to insert sample data to create the table structure
      const { data, error } = await this.supabase
        .from(tableName)
        .insert(sampleData);
      
      if (error) {
        this.log(`Failed to create table ${tableName}: ${error.message}`, 'error');
        return false;
      }
      
      this.log(`✅ Table ${tableName} created successfully`, 'success');
      
      // Clean up the sample data
      if (data && data.length > 0) {
        await this.supabase
          .from(tableName)
          .delete()
          .eq('id', data[0].id);
      }
      
      return true;
    } catch (error) {
      this.log(`Error creating table ${tableName}: ${error.message}`, 'error');
      return false;
    }
  }

  async createUserSkillsTable() {
    const sampleData = {
      id: '00000000-0000-0000-0000-000000000000',
      user_id: '00000000-0000-0000-0000-000000000000',
      name: 'Sample Skill',
      category: 'technical',
      level: 'beginner',
      years_of_experience: 1,
      verified: false,
      endorsements: 0,
      endorsers: [],
      is_public: true
    };

    return await this.createTableByInsertingData('user_skills', sampleData);
  }

  async createUserCertificationsTable() {
    const sampleData = {
      id: '00000000-0000-0000-0000-000000000000',
      user_id: '00000000-0000-0000-0000-000000000000',
      name: 'Sample Certification',
      issuer: 'Sample Issuer',
      credential_id: 'SAMPLE-123',
      issue_date: '2024-01-01',
      expiry_date: '2025-01-01',
      credential_url: 'https://example.com',
      is_verified: false,
      is_public: true
    };

    return await this.createTableByInsertingData('user_certifications', sampleData);
  }

  async createUserLanguagesTable() {
    const sampleData = {
      id: '00000000-0000-0000-0000-000000000000',
      user_id: '00000000-0000-0000-0000-000000000000',
      language: 'English',
      proficiency: 'native',
      is_public: true
    };

    return await this.createTableByInsertingData('user_languages', sampleData);
  }

  async createAllTables() {
    this.log('🚀 Creating all missing tables...', 'info');
    
    const results = {
      user_skills: false,
      user_certifications: false,
      user_languages: false
    };

    // Check what tables already exist
    const userProfilesExists = await this.checkTableExists('user_profiles');
    const userSkillsExists = await this.checkTableExists('user_skills');
    const userCertificationsExists = await this.checkTableExists('user_certifications');
    const userLanguagesExists = await this.checkTableExists('user_languages');

    this.log(`Current table status:`, 'info');
    this.log(`  user_profiles: ${userProfilesExists ? 'EXISTS' : 'MISSING'}`, userProfilesExists ? 'success' : 'error');
    this.log(`  user_skills: ${userSkillsExists ? 'EXISTS' : 'MISSING'}`, userSkillsExists ? 'success' : 'error');
    this.log(`  user_certifications: ${userCertificationsExists ? 'EXISTS' : 'MISSING'}`, userCertificationsExists ? 'success' : 'error');
    this.log(`  user_languages: ${userLanguagesExists ? 'EXISTS' : 'MISSING'}`, userLanguagesExists ? 'success' : 'error');

    // Create missing tables
    if (!userSkillsExists) {
      results.user_skills = await this.createUserSkillsTable();
    } else {
      this.log('✅ user_skills table already exists', 'success');
      results.user_skills = true;
    }

    if (!userCertificationsExists) {
      results.user_certifications = await this.createUserCertificationsTable();
    } else {
      this.log('✅ user_certifications table already exists', 'success');
      results.user_certifications = true;
    }

    if (!userLanguagesExists) {
      results.user_languages = await this.createUserLanguagesTable();
    } else {
      this.log('✅ user_languages table already exists', 'success');
      results.user_languages = true;
    }

    return results;
  }

  async verifyAllTables() {
    this.log('Verifying all tables...', 'step');
    
    const tables = ['user_profiles', 'user_skills', 'user_certifications', 'user_languages'];
    const results = {};
    
    for (const table of tables) {
      const exists = await this.checkTableExists(table);
      results[table] = exists;
      this.log(`Table ${table}: ${exists ? 'EXISTS' : 'MISSING'}`, exists ? 'success' : 'error');
    }
    
    const allTablesExist = Object.values(results).every(exists => exists);
    
    if (allTablesExist) {
      this.log('🎉 All tables exist! Migration is complete!', 'success');
    } else {
      this.log('⚠️ Some tables are still missing', 'warning');
    }
    
    return { allTablesExist, results };
  }

  async runCompleteMigration() {
    this.log('🚀 Starting direct table creation migration...', 'info');
    
    try {
      // Create all tables
      const createResults = await this.createAllTables();
      
      // Verify all tables
      const verifyResults = await this.verifyAllTables();
      
      if (verifyResults.allTablesExist) {
        this.log('🎉 Migration completed successfully!', 'success');
        this.log('All required tables are now available.', 'success');
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
  const migration = new DirectTableCreation();
  const args = process.argv.slice(2);
  const command = args[0] || 'run';

  switch (command) {
    case 'run':
      await migration.runCompleteMigration();
      break;
    case 'verify':
      await migration.verifyAllTables();
      break;
    case 'skills':
      await migration.createUserSkillsTable();
      break;
    case 'certifications':
      await migration.createUserCertificationsTable();
      break;
    case 'languages':
      await migration.createUserLanguagesTable();
      break;
    default:
      console.log(`
Usage: node direct-table-creation.js [command]

Commands:
  run            - Run complete migration (default)
  verify         - Verify table existence
  skills         - Create user_skills table only
  certifications - Create user_certifications table only
  languages      - Create user_languages table only

Examples:
  node direct-table-creation.js run
  node direct-table-creation.js verify
      `);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = DirectTableCreation;
