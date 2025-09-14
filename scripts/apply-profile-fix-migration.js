#!/usr/bin/env node

/**
 * Apply Profile Creation Fix Migration
 * Uses direct database connection to apply the migration
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

class MigrationApplier {
  constructor() {
    this.supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    this.supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!this.supabaseUrl || !this.supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }
    
    this.supabaseAdmin = createClient(this.supabaseUrl, this.supabaseServiceKey);
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '📋',
      success: '✅',
      error: '❌',
      warning: '⚠️',
      step: '🔄',
      fix: '🔧',
      sql: '🗄️'
    }[type];
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async applyMigration() {
    this.log('🔧 APPLYING PROFILE CREATION FIX MIGRATION', 'fix');
    this.log('==========================================', 'fix');
    
    try {
      // Read the migration file
      const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '1757871800000_fix_profile_creation.sql');
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
      
      this.log('Migration SQL loaded successfully', 'success');
      
      // Split the SQL into individual statements
      const statements = migrationSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
      
      this.log(`Found ${statements.length} SQL statements to execute`, 'info');
      
      let successCount = 0;
      let errorCount = 0;
      
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (statement.trim()) {
          this.log(`Executing statement ${i + 1}/${statements.length}...`, 'step');
          
          try {
            // Use the REST API to execute SQL
            const response = await fetch(`${this.supabaseUrl}/rest/v1/rpc/exec`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.supabaseServiceKey}`,
                'apikey': this.supabaseServiceKey
              },
              body: JSON.stringify({ sql: statement })
            });

            if (response.ok) {
              this.log(`Statement ${i + 1} executed successfully`, 'success');
              successCount++;
            } else {
              const errorText = await response.text();
              this.log(`Statement ${i + 1} failed: ${response.status} ${errorText}`, 'error');
              errorCount++;
            }
          } catch (error) {
            this.log(`Statement ${i + 1} error: ${error.message}`, 'error');
            errorCount++;
          }
        }
      }
      
      // Summary
      this.log('', 'info');
      this.log('📊 MIGRATION RESULTS', 'fix');
      this.log('===================', 'fix');
      this.log(`Successful: ${successCount}`, successCount > 0 ? 'success' : 'error');
      this.log(`Failed: ${errorCount}`, errorCount > 0 ? 'error' : 'success');
      
      if (errorCount === 0) {
        this.log('🎉 Migration applied successfully!', 'success');
        return true;
      } else {
        this.log('⚠️ Some statements failed. Check the errors above.', 'warning');
        return false;
      }
      
    } catch (error) {
      this.log(`Migration failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testProfileCreation() {
    this.log('Testing profile creation after migration...', 'test');
    
    const testEmail = `testuser${Date.now()}@gmail.com`;
    const testPassword = 'TestPassword123!';
    
    try {
      // Create a test user
      this.log('Creating test user...', 'step');
      const { data: signupData, error: signupError } = await this.supabaseAdmin.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            name: 'Test User',
            role: 'user'
          }
        }
      });

      if (signupError) {
        this.log(`Signup failed: ${signupError.message}`, 'error');
        return false;
      }

      if (!signupData.user) {
        this.log('Signup succeeded but no user returned', 'error');
        return false;
      }

      this.log(`User created: ${signupData.user.email}`, 'success');

      // Wait for trigger to process
      this.log('Waiting for profile creation trigger...', 'step');
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Check if profile was created
      const { data: profile, error: profileError } = await this.supabaseAdmin
        .from('user_profiles')
        .select('*')
        .eq('id', signupData.user.id)
        .single();

      if (profileError) {
        this.log(`Profile not found: ${profileError.message}`, 'error');
        return false;
      }

      this.log('Profile created successfully!', 'success');
      this.log(`Profile data: ${JSON.stringify(profile, null, 2)}`, 'info');

      // Clean up
      await this.supabaseAdmin
        .from('user_profiles')
        .delete()
        .eq('id', signupData.user.id);

      await this.supabaseAdmin.auth.admin.deleteUser(signupData.user.id);
      this.log('Test user cleaned up', 'success');

      return true;
    } catch (error) {
      this.log(`Test failed: ${error.message}`, 'error');
      return false;
    }
  }
}

// CLI Interface
async function main() {
  const applier = new MigrationApplier();
  
  const migrationSuccess = await applier.applyMigration();
  
  if (migrationSuccess) {
    const testSuccess = await applier.testProfileCreation();
    
    if (testSuccess) {
      console.log('\n🎉 All profile creation issues have been fixed!');
    } else {
      console.log('\n⚠️ Migration applied but test failed. Check the database manually.');
    }
  } else {
    console.log('\n❌ Migration failed. Please check the errors above.');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = MigrationApplier;
