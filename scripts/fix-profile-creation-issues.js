#!/usr/bin/env node

/**
 * Fix Profile Creation Issues
 * Comprehensive solution to fix all profile creation issues
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

class ProfileCreationFixer {
  constructor() {
    this.supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    this.supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    this.supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!this.supabaseUrl || !this.supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }
    
    this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
    this.supabaseAdmin = this.supabaseServiceKey && this.supabaseServiceKey !== 'placeholder-service-role-key' ? 
      createClient(this.supabaseUrl, this.supabaseServiceKey) : null;
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

  async checkCurrentRLSPolicies() {
    this.log('Checking current RLS policies...', 'step');
    
    if (!this.supabaseAdmin) {
      this.log('No admin access - cannot check RLS policies', 'warning');
      return null;
    }

    try {
      // Check if RLS is enabled
      const { data: rlsData, error: rlsError } = await this.supabaseAdmin
        .rpc('get_table_rls_status', { table_name: 'user_profiles' });

      if (rlsError) {
        this.log(`Could not check RLS status: ${rlsError.message}`, 'warning');
      } else {
        this.log(`RLS status: ${rlsData ? 'Enabled' : 'Disabled'}`, rlsData ? 'success' : 'warning');
      }

      // Check existing policies
      const { data: policies, error: policiesError } = await this.supabaseAdmin
        .from('pg_policies')
        .select('*')
        .eq('tablename', 'user_profiles');

      if (policiesError) {
        this.log(`Could not check policies: ${policiesError.message}`, 'warning');
      } else {
        this.log(`Found ${policies?.length || 0} RLS policies on user_profiles`, 'info');
        policies?.forEach(policy => {
          this.log(`  - ${policy.policyname}: ${policy.cmd}`, 'info');
        });
      }

      return { rlsEnabled: rlsData, policies: policies || [] };
    } catch (error) {
      this.log(`Error checking RLS: ${error.message}`, 'error');
      return null;
    }
  }

  async createProfileCreationTrigger() {
    this.log('Creating profile creation trigger...', 'fix');
    
    if (!this.supabaseAdmin) {
      this.log('No admin access - cannot create trigger', 'error');
      return false;
    }

    const triggerSQL = `
-- Create function to handle new user profile creation
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
    profile_creation_status
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'User'),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    NEW.created_at,
    NEW.updated_at,
    'completed'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    avatar_url = EXCLUDED.avatar_url,
    role = EXCLUDED.role,
    updated_at = NOW(),
    profile_creation_status = 'completed';
  
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

    try {
      const { error } = await this.supabaseAdmin.rpc('exec_sql', { sql: triggerSQL });
      
      if (error) {
        this.log(`Trigger creation failed: ${error.message}`, 'error');
        return false;
      }

      this.log('Profile creation trigger created successfully', 'success');
      return true;
    } catch (error) {
      this.log(`Trigger creation error: ${error.message}`, 'error');
      return false;
    }
  }

  async fixRLSPolicies() {
    this.log('Fixing RLS policies for profile creation...', 'fix');
    
    if (!this.supabaseAdmin) {
      this.log('No admin access - cannot fix RLS policies', 'error');
      return false;
    }

    const policySQL = `
-- Fix RLS policies to allow profile creation during signup
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to view their own profile
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow service role to manage all profiles (for admin operations)
DROP POLICY IF EXISTS "Service role can manage all profiles" ON user_profiles;
CREATE POLICY "Service role can manage all profiles" ON user_profiles
  FOR ALL USING (auth.role() = 'service_role');
`;

    try {
      const { error } = await this.supabaseAdmin.rpc('exec_sql', { sql: policySQL });
      
      if (error) {
        this.log(`Policy fix failed: ${error.message}`, 'error');
        return false;
      }

      this.log('RLS policies fixed successfully', 'success');
      return true;
    } catch (error) {
      this.log(`Policy fix error: ${error.message}`, 'error');
      return false;
    }
  }

  async testProfileCreationAfterFix() {
    this.log('Testing profile creation after fixes...', 'test');
    
    const testEmail = `testuser${Date.now()}@gmail.com`;
    const testPassword = 'TestPassword123!';
    
    try {
      // Create a test user
      this.log('Creating test user...', 'step');
      const { data: signupData, error: signupError } = await this.supabase.auth.signUp({
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
      const { data: profile, error: profileError } = await this.supabase
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
      if (this.supabaseAdmin) {
        await this.supabaseAdmin
          .from('user_profiles')
          .delete()
          .eq('id', signupData.user.id);

        await this.supabaseAdmin.auth.admin.deleteUser(signupData.user.id);
        this.log('Test user cleaned up', 'success');
      }

      return true;
    } catch (error) {
      this.log(`Test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async runFix() {
    this.log('🔧 FIXING PROFILE CREATION ISSUES', 'fix');
    this.log('==================================', 'fix');
    
    const results = {
      rlsChecked: false,
      triggerCreated: false,
      policiesFixed: false,
      testPassed: false
    };

    // Step 1: Check current RLS status
    this.log('Step 1: Checking current RLS status...', 'step');
    const rlsStatus = await this.checkCurrentRLSPolicies();
    results.rlsChecked = rlsStatus !== null;

    // Step 2: Create profile creation trigger
    this.log('Step 2: Creating profile creation trigger...', 'step');
    results.triggerCreated = await this.createProfileCreationTrigger();

    // Step 3: Fix RLS policies
    this.log('Step 3: Fixing RLS policies...', 'step');
    results.policiesFixed = await this.fixRLSPolicies();

    // Step 4: Test profile creation
    this.log('Step 4: Testing profile creation...', 'step');
    results.testPassed = await this.testProfileCreationAfterFix();

    // Summary
    this.log('', 'info');
    this.log('📊 FIX RESULTS SUMMARY', 'fix');
    this.log('=====================', 'fix');
    this.log(`RLS Checked: ${results.rlsChecked ? '✅ PASS' : '❌ FAIL'}`, results.rlsChecked ? 'success' : 'error');
    this.log(`Trigger Created: ${results.triggerCreated ? '✅ PASS' : '❌ FAIL'}`, results.triggerCreated ? 'success' : 'error');
    this.log(`Policies Fixed: ${results.policiesFixed ? '✅ PASS' : '❌ FAIL'}`, results.policiesFixed ? 'success' : 'error');
    this.log(`Test Passed: ${results.testPassed ? '✅ PASS' : '❌ FAIL'}`, results.testPassed ? 'success' : 'error');

    const allPassed = Object.values(results).every(result => result);
    
    if (allPassed) {
      this.log('🎉 All fixes applied successfully! Profile creation should now work.', 'success');
    } else {
      this.log('⚠️ Some fixes failed. Please check the issues above.', 'warning');
    }

    return results;
  }
}

// CLI Interface
async function main() {
  const fixer = new ProfileCreationFixer();
  await fixer.runFix();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = ProfileCreationFixer;
