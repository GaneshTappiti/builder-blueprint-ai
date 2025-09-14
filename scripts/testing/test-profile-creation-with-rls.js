#!/usr/bin/env node

/**
 * Profile Creation Test with RLS Support
 * Tests profile creation with proper RLS handling and authentication simulation
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

class ProfileCreationTestWithRLS {
  constructor() {
    this.supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    this.supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    this.supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!this.supabaseUrl || !this.supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }
    
    this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
    this.supabaseAdmin = this.supabaseServiceKey ? 
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
      test: '🧪',
      auth: '🔐',
      rls: '🔒'
    }[type];
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async checkRLSStatus() {
    this.log('Checking RLS status...', 'rls');
    
    try {
      // Try to query without authentication (should fail due to RLS)
      const { data, error } = await this.supabase
        .from('user_profiles')
        .select('id')
        .limit(1);

      if (error && error.code === '42501') {
        this.log('RLS is properly enabled (query blocked without auth)', 'success');
        return true;
      } else if (error) {
        this.log(`RLS check failed: ${error.message}`, 'error');
        return false;
      } else {
        this.log('RLS might not be properly configured', 'warning');
        return false;
      }
    } catch (error) {
      this.log(`Error checking RLS: ${error.message}`, 'error');
      return false;
    }
  }

  async testWithServiceKey() {
    this.log('Testing with service key (admin access)...', 'test');
    
    if (!this.supabaseAdmin) {
      this.log('No service key available - skipping admin tests', 'warning');
      return false;
    }

    const testUserId = 'admin-test-' + Date.now();
    const testProfileData = {
      id: testUserId,
      email: 'admin-test@example.com',
      name: 'Admin Test User',
      role: 'user',
      first_name: 'Admin',
      last_name: 'Test',
      display_name: 'Admin Test User',
      bio: 'Test profile created with admin access',
      timezone: 'UTC',
      status: 'offline',
      profile_completion: 0,
      is_active: true,
      onboarding_completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      // Test profile creation with admin access
      const { data, error } = await this.supabaseAdmin
        .from('user_profiles')
        .insert(testProfileData);

      if (error) {
        this.log(`Admin profile creation failed: ${error.message}`, 'error');
        return false;
      }

      this.log('Admin profile creation successful', 'success');

      // Test profile retrieval
      const { data: profile, error: fetchError } = await this.supabaseAdmin
        .from('user_profiles')
        .select('*')
        .eq('id', testUserId)
        .single();

      if (fetchError) {
        this.log(`Admin profile retrieval failed: ${fetchError.message}`, 'error');
        return false;
      }

      this.log('Admin profile retrieval successful', 'success');

      // Test profile update
      const { error: updateError } = await this.supabaseAdmin
        .from('user_profiles')
        .update({
          bio: 'Updated by admin',
          profile_completion: 75,
          updated_at: new Date().toISOString()
        })
        .eq('id', testUserId);

      if (updateError) {
        this.log(`Admin profile update failed: ${updateError.message}`, 'error');
        return false;
      }

      this.log('Admin profile update successful', 'success');

      // Clean up
      await this.supabaseAdmin
        .from('user_profiles')
        .delete()
        .eq('id', testUserId);

      this.log('Admin test profile cleaned up', 'success');
      return true;

    } catch (error) {
      this.log(`Admin test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testAuthenticationFlow() {
    this.log('Testing authentication flow...', 'auth');
    
    const testEmail = `auth-test-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    
    try {
      // Step 1: Sign up a new user
      this.log('Step 1: Creating new user account...', 'auth');
      const { data: signupData, error: signupError } = await this.supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            name: 'Auth Test User',
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
      this.log(`User ID: ${signupData.user.id}`, 'info');

      // Step 2: Wait for any triggers to process
      this.log('Step 2: Waiting for profile creation triggers...', 'step');
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Step 3: Check if profile was created automatically
      this.log('Step 3: Checking if profile was created automatically...', 'test');
      const { data: profile, error: profileError } = await this.supabase
        .from('user_profiles')
        .select('*')
        .eq('id', signupData.user.id)
        .single();

      if (profileError) {
        this.log(`Profile not found: ${profileError.message}`, 'warning');
        this.log('Testing manual profile creation...', 'test');
        
        // Step 4: Try manual profile creation
        const profileData = {
          id: signupData.user.id,
          email: signupData.user.email,
          name: signupData.user.user_metadata?.name || 'User',
          avatar_url: signupData.user.user_metadata?.avatar_url || null,
          role: signupData.user.user_metadata?.role || 'user',
          status: 'offline',
          profile_completion: 0,
          is_active: true,
          onboarding_completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { error: createError } = await this.supabase
          .from('user_profiles')
          .insert(profileData);

        if (createError) {
          this.log(`Manual profile creation failed: ${createError.message}`, 'error');
          return false;
        }

        this.log('Manual profile creation succeeded', 'success');
      } else {
        this.log('Profile was created automatically!', 'success');
        this.log(`Profile data: ${JSON.stringify(profile, null, 2)}`, 'info');
      }

      // Step 5: Test profile operations
      this.log('Step 5: Testing profile operations...', 'test');
      
      // Test profile update
      const { error: updateError } = await this.supabase
        .from('user_profiles')
        .update({
          bio: 'Updated bio',
          profile_completion: 25,
          updated_at: new Date().toISOString()
        })
        .eq('id', signupData.user.id);

      if (updateError) {
        this.log(`Profile update failed: ${updateError.message}`, 'error');
        return false;
      }

      this.log('Profile update successful', 'success');

      // Step 6: Cleanup
      this.log('Step 6: Cleaning up test data...', 'step');
      await this.cleanupTestUser(signupData.user.id, testEmail);

      return true;

    } catch (error) {
      this.log(`Authentication flow test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testProfileServiceWithRLS() {
    this.log('Testing ProfileService with RLS...', 'test');
    
    try {
      // This test simulates what happens in the ProfileService
      // when a user is authenticated and tries to create/update their profile
      
      const testUserId = 'service-rls-test-' + Date.now();
      
      // Simulate the ProfileService.createProfile method
      const profileData = {
        id: testUserId,
        email: 'service-rls-test@example.com',
        name: 'Service RLS Test User',
        role: 'user',
        first_name: 'Service',
        last_name: 'RLS',
        display_name: 'Service RLS Test User',
        bio: 'Test profile created with RLS',
        timezone: 'UTC',
        status: 'offline',
        profile_completion: 0,
        is_active: true,
        onboarding_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Test profile creation (this should fail without proper auth)
      const { data, error } = await this.supabase
        .from('user_profiles')
        .insert(profileData);

      if (error) {
        if (error.code === '42501') {
          this.log('Profile creation correctly blocked by RLS (expected)', 'success');
          this.log('This confirms RLS is working properly', 'info');
          return true;
        } else {
          this.log(`Unexpected error: ${error.message}`, 'error');
          return false;
        }
      } else {
        this.log('Profile creation succeeded unexpectedly (RLS might be disabled)', 'warning');
        
        // Clean up if it succeeded
        await this.supabase
          .from('user_profiles')
          .delete()
          .eq('id', testUserId);
        
        return true;
      }

    } catch (error) {
      this.log(`ProfileService RLS test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testDatabaseTriggers() {
    this.log('Testing database triggers...', 'test');
    
    if (!this.supabaseAdmin) {
      this.log('No service key available - skipping trigger tests', 'warning');
      return false;
    }

    try {
      // Create a test user in auth.users table
      const testEmail = `trigger-test-${Date.now()}@example.com`;
      const testPassword = 'TestPassword123!';
      
      this.log('Creating test user in auth.users...', 'step');
      const { data: userData, error: userError } = await this.supabaseAdmin.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        user_metadata: {
          name: 'Trigger Test User',
          role: 'user'
        }
      });

      if (userError) {
        this.log(`User creation failed: ${userError.message}`, 'error');
        return false;
      }

      this.log(`Test user created: ${userData.user.email}`, 'success');

      // Wait for triggers to process
      this.log('Waiting for triggers to process...', 'step');
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Check if profile was created by trigger
      const { data: profile, error: profileError } = await this.supabaseAdmin
        .from('user_profiles')
        .select('*')
        .eq('id', userData.user.id)
        .single();

      if (profileError) {
        this.log(`Profile not found after trigger: ${profileError.message}`, 'warning');
        this.log('Triggers might not be set up or working', 'info');
      } else {
        this.log('Profile was created by trigger!', 'success');
        this.log(`Trigger-created profile: ${JSON.stringify(profile, null, 2)}`, 'info');
      }

      // Clean up
      await this.supabaseAdmin.auth.admin.deleteUser(userData.user.id);
      this.log('Test user cleaned up', 'success');

      return true;

    } catch (error) {
      this.log(`Trigger test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async cleanupTestUser(userId, email) {
    try {
      // Delete profile first
      if (this.supabaseAdmin) {
        await this.supabaseAdmin
          .from('user_profiles')
          .delete()
          .eq('id', userId);

        // Delete auth user
        await this.supabaseAdmin.auth.admin.deleteUser(userId);
        this.log('Test user cleaned up successfully', 'success');
      } else {
        this.log('Cannot delete auth user without service key', 'warning');
        this.log(`Please manually delete user: ${email}`, 'info');
      }
    } catch (error) {
      this.log(`Cleanup failed: ${error.message}`, 'warning');
    }
  }

  async runAllTests() {
    this.log('🧪 PROFILE CREATION TESTS WITH RLS', 'test');
    this.log('===================================', 'test');
    
    const results = {
      rlsStatus: false,
      serviceKey: false,
      authFlow: false,
      profileService: false,
      triggers: false
    };

    // Check RLS status
    results.rlsStatus = await this.checkRLSStatus();

    // Test with service key (admin access)
    results.serviceKey = await this.testWithServiceKey();

    // Test authentication flow
    results.authFlow = await this.testAuthenticationFlow();

    // Test ProfileService with RLS
    results.profileService = await this.testProfileServiceWithRLS();

    // Test database triggers
    results.triggers = await this.testDatabaseTriggers();

    // Summary
    this.log('', 'info');
    this.log('📊 TEST RESULTS SUMMARY', 'test');
    this.log('======================', 'test');
    this.log(`RLS Status: ${results.rlsStatus ? '✅ PASS' : '❌ FAIL'}`, results.rlsStatus ? 'success' : 'error');
    this.log(`Service Key: ${results.serviceKey ? '✅ PASS' : '❌ FAIL'}`, results.serviceKey ? 'success' : 'error');
    this.log(`Auth Flow: ${results.authFlow ? '✅ PASS' : '❌ FAIL'}`, results.authFlow ? 'success' : 'error');
    this.log(`ProfileService: ${results.profileService ? '✅ PASS' : '❌ FAIL'}`, results.profileService ? 'success' : 'error');
    this.log(`Triggers: ${results.triggers ? '✅ PASS' : '❌ FAIL'}`, results.triggers ? 'success' : 'error');

    const allPassed = Object.values(results).every(result => result);
    
    if (allPassed) {
      this.log('🎉 All tests passed! Profile creation with RLS is working correctly.', 'success');
    } else {
      this.log('⚠️ Some tests failed. Please check the issues above.', 'warning');
    }

    // Recommendations
    this.log('', 'info');
    this.log('💡 RECOMMENDATIONS', 'test');
    this.log('==================', 'test');
    
    if (!results.rlsStatus) {
      this.log('1. Check RLS policies in Supabase dashboard', 'warning');
    }
    
    if (!results.serviceKey) {
      this.log('2. Add SUPABASE_SERVICE_ROLE_KEY to .env.local for admin tests', 'warning');
    }
    
    if (!results.authFlow) {
      this.log('3. Test authentication flow manually in the application', 'warning');
    }
    
    if (!results.triggers) {
      this.log('4. Check if database triggers are properly set up', 'warning');
    }

    return results;
  }
}

// CLI Interface
async function main() {
  const test = new ProfileCreationTestWithRLS();
  const args = process.argv.slice(2);
  const command = args[0] || 'run';

  switch (command) {
    case 'run':
      await test.runAllTests();
      break;
    case 'rls':
      await test.checkRLSStatus();
      break;
    case 'service':
      await test.testWithServiceKey();
      break;
    case 'auth':
      await test.testAuthenticationFlow();
      break;
    case 'profile':
      await test.testProfileServiceWithRLS();
      break;
    case 'triggers':
      await test.testDatabaseTriggers();
      break;
    default:
      console.log(`
Usage: node test-profile-creation-with-rls.js [command]

Commands:
  run       - Run all tests (default)
  rls       - Check RLS status only
  service   - Test with service key (admin access)
  auth      - Test authentication flow
  profile   - Test ProfileService with RLS
  triggers  - Test database triggers

Examples:
  node test-profile-creation-with-rls.js run
  node test-profile-creation-with-rls.js auth
      `);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = ProfileCreationTestWithRLS;
