#!/usr/bin/env node

/**
 * Complete Migration Guide Script
 * Provides step-by-step instructions to complete the database migration
 */

const fs = require('fs');
const path = require('path');

class MigrationGuide {
  constructor() {
    this.migrationFile = path.join(__dirname, '..', 'migration-complete.sql');
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

  displayInstructions() {
    console.log('\n' + '='.repeat(80));
    console.log('🚀 COMPLETE DATABASE MIGRATION GUIDE');
    console.log('='.repeat(80));
    
    this.log('Step 1: Open your Supabase Dashboard', 'step');
    console.log('   1. Go to https://supabase.com/dashboard');
    console.log('   2. Select your project');
    console.log('   3. Click on "SQL Editor" in the left sidebar');
    
    this.log('Step 2: Execute the Migration SQL', 'step');
    console.log('   1. Open the file: migration-complete.sql');
    console.log('   2. Copy ALL contents of the file');
    console.log('   3. Paste into the Supabase SQL Editor');
    console.log('   4. Click "Run" to execute');
    
    this.log('Step 3: Verify Migration Success', 'step');
    console.log('   1. Run: node scripts/test-profile-creation.js tables');
    console.log('   2. All tables should show as "EXISTS"');
    
    console.log('\n' + '='.repeat(80));
    console.log('📁 MIGRATION FILE LOCATION:');
    console.log(`   ${this.migrationFile}`);
    console.log('='.repeat(80) + '\n');
  }

  displaySQLPreview() {
    if (fs.existsSync(this.migrationFile)) {
      this.log('SQL Migration Preview (first 500 characters):', 'info');
      const content = fs.readFileSync(this.migrationFile, 'utf8');
      console.log('\n' + '='.repeat(80));
      console.log(content.substring(0, 500) + '...');
      console.log('='.repeat(80) + '\n');
    } else {
      this.log('Migration file not found!', 'error');
    }
  }

  async checkMigrationStatus() {
    this.log('Checking current migration status...', 'info');
    
    try {
      const { createClient } = require('@supabase/supabase-js');
      require('dotenv').config({ path: '.env.local' });

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        this.log('Missing Supabase environment variables', 'error');
        return false;
      }
      
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const tables = ['user_profiles', 'user_skills', 'user_certifications', 'user_languages'];
      const results = {};
      
      for (const table of tables) {
        try {
          const { data, error } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public')
            .eq('table_name', table)
            .single();
          
          results[table] = !error && data;
        } catch (error) {
          results[table] = false;
        }
      }
      
      const allTablesExist = Object.values(results).every(exists => exists);
      
      this.log('Migration Status:', 'info');
      for (const [table, exists] of Object.entries(results)) {
        this.log(`   ${table}: ${exists ? 'EXISTS' : 'MISSING'}`, exists ? 'success' : 'error');
      }
      
      if (allTablesExist) {
        this.log('✅ Migration is COMPLETE! All tables exist.', 'success');
        return true;
      } else {
        this.log('❌ Migration is INCOMPLETE. Please follow the steps above.', 'error');
        return false;
      }
      
    } catch (error) {
      this.log(`Error checking migration status: ${error.message}`, 'error');
      return false;
    }
  }

  async runCompleteTest() {
    this.log('Running complete profile creation test...', 'info');
    
    try {
      const { exec } = require('child_process');
      const util = require('util');
      const execAsync = util.promisify(exec);
      
      const { stdout, stderr } = await execAsync('node scripts/test-profile-creation.js run');
      
      console.log('\n' + '='.repeat(80));
      console.log('TEST RESULTS:');
      console.log('='.repeat(80));
      console.log(stdout);
      if (stderr) {
        console.log('STDERR:', stderr);
      }
      console.log('='.repeat(80) + '\n');
      
      return stdout.includes('All tests passed');
      
    } catch (error) {
      this.log(`Test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async main() {
    const args = process.argv.slice(2);
    const command = args[0] || 'guide';

    switch (command) {
      case 'guide':
        this.displayInstructions();
        this.displaySQLPreview();
        break;
        
      case 'check':
        await this.checkMigrationStatus();
        break;
        
      case 'test':
        const isComplete = await this.checkMigrationStatus();
        if (isComplete) {
          await this.runCompleteTest();
        } else {
          this.log('Migration not complete. Please run the SQL first.', 'warning');
        }
        break;
        
      case 'status':
        await this.checkMigrationStatus();
        break;
        
      default:
        console.log(`
Usage: node complete-migration-guide.js [command]

Commands:
  guide   - Show step-by-step instructions (default)
  check   - Check if migration is complete
  test    - Run complete test suite
  status  - Same as check

Examples:
  node complete-migration-guide.js guide
  node complete-migration-guide.js check
  node complete-migration-guide.js test
        `);
    }
  }
}

if (require.main === module) {
  const guide = new MigrationGuide();
  guide.main().catch(console.error);
}

module.exports = MigrationGuide;
