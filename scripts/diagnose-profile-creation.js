#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

class ProfileCreationDiagnostic {
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
    const colors = {
      info: '\x1b[36m',    // Cyan
      success: '\x1b[32m', // Green
      warning: '\x1b[33m', // Yellow
      error: '\x1b[31m',   // Red
      step: '\x1b[35m'     // Magenta
    };
    const reset = '\x1b[0m';
    const color = colors[type] || colors.info;
    console.log(`${color}${timestamp} ${message}${reset}`);
  }

  async checkTableSchema() {
    this.log('🔍 Checking user_profiles table schema...', 'step');
    
    try {
      // Get table schema information
      const { data, error } = await this.supabase
        .from('user_profiles')
        .select('*')
        .limit(1);

      if (error) {
        this.log(`Error querying table: ${error.message}`, 'error');
        return false;
      }

      this.log('✅ Table is accessible', 'success');
      
      // Check for specific columns that might be missing
      const requiredColumns = [
        'id', 'email', 'name', 'status', 'display_name', 'website', 
        'linkedin', 'twitter', 'github', 'work_location', 'interests',
        'availability', 'working_hours', 'preferences', 'privacy', 'last_login'
      ];

      this.log('📋 Checking for required columns...', 'info');
      
      // Try to insert a test record to see what columns are missing
      const testData = {
        id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
        email: 'test@example.com',
        name: 'Test User',
        status: 'offline',
        display_name: 'Test User',
        website: 'https://example.com',
        linkedin: 'https://linkedin.com/in/test',
        twitter: 'https://twitter.com/test',
        github: 'https://github.com/test',
        work_location: 'remote',
        interests: ['technology', 'programming'],
        availability: { isAvailable: true, workingDays: [1,2,3,4,5], timezone: 'UTC', vacationMode: false },
        working_hours: { start: '09:00', end: '17:00', days: [1,2,3,4,5], timezone: 'UTC' },
        preferences: {},
        privacy: {},
        last_login: new Date().toISOString()
      };

      const { error: insertError } = await this.supabase
        .from('user_profiles')
        .insert(testData);

      if (insertError) {
        this.log(`❌ Insert test failed: ${insertError.message}`, 'error');
        this.log(`Error code: ${insertError.code}`, 'error');
        
        if (insertError.message.includes('column') && insertError.message.includes('does not exist')) {
          this.log('🔧 Missing columns detected!', 'warning');
          this.log('Please run the fix-missing-columns.sql in Supabase SQL Editor', 'info');
        }
        
        return false;
      } else {
        this.log('✅ All required columns exist', 'success');
        
        // Clean up test data
        await this.supabase
          .from('user_profiles')
          .delete()
          .eq('id', '00000000-0000-0000-0000-000000000000');
        
        return true;
      }
    } catch (error) {
      this.log(`Unexpected error: ${error.message}`, 'error');
      return false;
    }
  }

  async checkRLSPolicies() {
    this.log('🔒 Checking RLS policies...', 'step');
    
    try {
      // Try to query the table without authentication (should fail due to RLS)
      const { data, error } = await this.supabase
        .from('user_profiles')
        .select('id')
        .limit(1);

      if (error && error.code === '42501') {
        this.log('✅ RLS is properly enabled (query blocked without auth)', 'success');
        return true;
      } else if (error) {
        this.log(`❌ RLS check failed: ${error.message}`, 'error');
        return false;
      } else {
        this.log('⚠️ RLS might not be properly configured', 'warning');
        return false;
      }
    } catch (error) {
      this.log(`Error checking RLS: ${error.message}`, 'error');
      return false;
    }
  }

  async checkAuthUser() {
    this.log('👤 Checking authentication...', 'step');
    
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser();
      
      if (error) {
        this.log(`❌ Auth error: ${error.message}`, 'error');
        return false;
      }
      
      if (user) {
        this.log(`✅ User authenticated: ${user.email}`, 'success');
        this.log(`User ID: ${user.id}`, 'info');
        return true;
      } else {
        this.log('❌ No authenticated user', 'error');
        this.log('Please sign in to test profile creation', 'info');
        return false;
      }
    } catch (error) {
      this.log(`Error checking auth: ${error.message}`, 'error');
      return false;
    }
  }

  async testProfileCreationWithAuth() {
    this.log('🧪 Testing profile creation with authenticated user...', 'step');
    
    try {
      const { data: { user }, error: authError } = await this.supabase.auth.getUser();
      
      if (authError || !user) {
        this.log('❌ No authenticated user for testing', 'error');
        return false;
      }

      // Try to create a profile for the authenticated user
      const profileData = {
        id: user.id,
        email: user.email || 'test@example.com',
        name: user.user_metadata?.name || user.email || 'User',
        avatar_url: user.user_metadata?.avatar_url || null,
        role: user.user_metadata?.role || 'user',
        status: 'offline',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await this.supabase
        .from('user_profiles')
        .insert(profileData);

      if (error) {
        this.log(`❌ Profile creation failed: ${error.message}`, 'error');
        this.log(`Error code: ${error.code}`, 'error');
        
        if (error.message.includes('column') && error.message.includes('does not exist')) {
          this.log('🔧 Missing columns detected!', 'warning');
          this.log('Please run the fix-missing-columns.sql in Supabase SQL Editor', 'info');
        }
        
        return false;
      } else {
        this.log('✅ Profile created successfully!', 'success');
        
        // Clean up test profile
        await this.supabase
          .from('user_profiles')
          .delete()
          .eq('id', user.id);
        
        return true;
      }
    } catch (error) {
      this.log(`Unexpected error: ${error.message}`, 'error');
      return false;
    }
  }

  async runDiagnostic() {
    this.log('🔍 PROFILE CREATION DIAGNOSTIC', 'step');
    this.log('================================', 'step');
    
    const results = {
      tableSchema: false,
      rlsPolicies: false,
      authUser: false,
      profileCreation: false
    };

    // Check table schema
    results.tableSchema = await this.checkTableSchema();
    
    // Check RLS policies
    results.rlsPolicies = await this.checkRLSPolicies();
    
    // Check authentication
    results.authUser = await this.checkAuthUser();
    
    // Test profile creation if user is authenticated
    if (results.authUser) {
      results.profileCreation = await this.testProfileCreationWithAuth();
    }

    // Summary
    this.log('', 'info');
    this.log('📊 DIAGNOSTIC RESULTS', 'step');
    this.log('====================', 'step');
    this.log(`Table Schema: ${results.tableSchema ? '✅ PASS' : '❌ FAIL'}`, results.tableSchema ? 'success' : 'error');
    this.log(`RLS Policies: ${results.rlsPolicies ? '✅ PASS' : '❌ FAIL'}`, results.rlsPolicies ? 'success' : 'error');
    this.log(`Authentication: ${results.authUser ? '✅ PASS' : '❌ FAIL'}`, results.authUser ? 'success' : 'error');
    this.log(`Profile Creation: ${results.profileCreation ? '✅ PASS' : '❌ FAIL'}`, results.profileCreation ? 'success' : 'error');

    // Recommendations
    this.log('', 'info');
    this.log('💡 RECOMMENDATIONS', 'step');
    this.log('==================', 'step');
    
    if (!results.tableSchema) {
      this.log('1. Run fix-missing-columns.sql in Supabase SQL Editor', 'warning');
    }
    
    if (!results.rlsPolicies) {
      this.log('2. Check RLS policies in Supabase dashboard', 'warning');
    }
    
    if (!results.authUser) {
      this.log('3. Sign in to test profile creation', 'warning');
    }
    
    if (results.tableSchema && results.rlsPolicies && results.authUser && results.profileCreation) {
      this.log('🎉 All systems working correctly!', 'success');
    } else {
      this.log('⚠️ Some issues need to be resolved', 'warning');
    }

    return results;
  }
}

// CLI Interface
async function main() {
  const diagnostic = new ProfileCreationDiagnostic();
  await diagnostic.runDiagnostic();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = ProfileCreationDiagnostic;
