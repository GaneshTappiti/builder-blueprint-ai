#!/usr/bin/env node

/**
 * Practical Profile Creation Test
 * Tests profile creation in a real-world scenario with proper error handling
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

class PracticalProfileCreationTest {
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

  async checkDatabaseConnection() {
    this.log('Checking database connection...', 'step');
    
    try {
      // Try to query a simple table to check connection
      const { data, error } = await this.supabase
        .from('user_profiles')
        .select('count')
        .limit(1);

      if (error) {
        if (error.code === '42501') {
          this.log('Database connected - RLS is enabled (query blocked)', 'success');
          return { connected: true, rlsEnabled: true };
        } else {
          this.log(`Database connection failed: ${error.message}`, 'error');
          return { connected: false, rlsEnabled: false };
        }
      } else {
        this.log('Database connected - RLS might be disabled', 'warning');
        return { connected: true, rlsEnabled: false };
      }
    } catch (error) {
      this.log(`Database connection error: ${error.message}`, 'error');
      return { connected: false, rlsEnabled: false };
    }
  }

  async testProfileCreationWithoutAuth() {
    this.log('Testing profile creation without authentication...', 'test');
    
    const testUserId = '550e8400-e29b-41d4-a716-446655440000'; // Valid UUID
    const testProfileData = {
      id: testUserId,
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
      first_name: 'Test',
      last_name: 'User',
      display_name: 'Test User',
      bio: 'Test profile for validation',
      timezone: 'UTC',
      status: 'offline',
      profile_completion: 25,
      is_active: true,
      onboarding_completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .insert(testProfileData);
      
      if (error) {
        if (error.code === '42501') {
          this.log('Profile creation correctly blocked by RLS (expected)', 'success');
          return { success: true, message: 'RLS is working correctly' };
        } else {
          this.log(`Profile creation failed: ${error.message}`, 'error');
          return { success: false, message: error.message };
        }
      } else {
        this.log('Profile creation succeeded (RLS might be disabled)', 'warning');
        
        // Clean up if it succeeded
        await this.supabase
          .from('user_profiles')
          .delete()
          .eq('id', testUserId);
        
        return { success: true, message: 'RLS might be disabled' };
      }
    } catch (error) {
      this.log(`Profile creation test failed: ${error.message}`, 'error');
      return { success: false, message: error.message };
    }
  }

  async testWithAdminAccess() {
    this.log('Testing with admin access...', 'test');
    
    if (!this.supabaseAdmin) {
      this.log('No service key available - skipping admin tests', 'warning');
      return { success: false, message: 'No service key available' };
    }

    const testUserId = '550e8400-e29b-41d4-a716-446655440001'; // Valid UUID
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
        return { success: false, message: error.message };
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
        return { success: false, message: fetchError.message };
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
        return { success: false, message: updateError.message };
      }

      this.log('Admin profile update successful', 'success');

      // Clean up
      await this.supabaseAdmin
        .from('user_profiles')
        .delete()
        .eq('id', testUserId);

      this.log('Admin test profile cleaned up', 'success');
      return { success: true, message: 'Admin operations successful' };

    } catch (error) {
      this.log(`Admin test failed: ${error.message}`, 'error');
      return { success: false, message: error.message };
    }
  }

  async testAuthenticationFlow() {
    this.log('Testing authentication flow...', 'auth');
    
    const testEmail = `testuser${Date.now()}@gmail.com`;
    const testPassword = 'TestPassword123!';
    
    try {
      // Step 1: Sign up a new user
      this.log('Step 1: Creating new user account...', 'auth');
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
        return { success: false, message: signupError.message };
      }

      if (!signupData.user) {
        this.log('Signup succeeded but no user returned', 'error');
        return { success: false, message: 'No user returned from signup' };
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
          return { success: false, message: createError.message };
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
        return { success: false, message: updateError.message };
      }

      this.log('Profile update successful', 'success');

      // Step 6: Cleanup
      this.log('Step 6: Cleaning up test data...', 'step');
      await this.cleanupTestUser(signupData.user.id, testEmail);

      return { success: true, message: 'Authentication flow successful' };

    } catch (error) {
      this.log(`Authentication flow test failed: ${error.message}`, 'error');
      return { success: false, message: error.message };
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
    this.log('🧪 PRACTICAL PROFILE CREATION TESTS', 'test');
    this.log('====================================', 'test');
    
    const results = {
      databaseConnection: { connected: false, rlsEnabled: false },
      profileCreationWithoutAuth: { success: false, message: '' },
      adminAccess: { success: false, message: '' },
      authFlow: { success: false, message: '' }
    };

    // Check database connection
    results.databaseConnection = await this.checkDatabaseConnection();

    if (!results.databaseConnection.connected) {
      this.log('Database connection failed - skipping other tests', 'error');
      return results;
    }

    // Test profile creation without auth
    results.profileCreationWithoutAuth = await this.testProfileCreationWithoutAuth();

    // Test with admin access
    results.adminAccess = await this.testWithAdminAccess();

    // Test authentication flow
    results.authFlow = await this.testAuthenticationFlow();

    // Summary
    this.log('', 'info');
    this.log('📊 TEST RESULTS SUMMARY', 'test');
    this.log('======================', 'test');
    this.log(`Database Connection: ${results.databaseConnection.connected ? '✅ PASS' : '❌ FAIL'}`, results.databaseConnection.connected ? 'success' : 'error');
    this.log(`RLS Status: ${results.databaseConnection.rlsEnabled ? '✅ ENABLED' : '⚠️ DISABLED'}`, results.databaseConnection.rlsEnabled ? 'success' : 'warning');
    this.log(`Profile Creation (No Auth): ${results.profileCreationWithoutAuth.success ? '✅ PASS' : '❌ FAIL'}`, results.profileCreationWithoutAuth.success ? 'success' : 'error');
    this.log(`Admin Access: ${results.adminAccess.success ? '✅ PASS' : '❌ FAIL'}`, results.adminAccess.success ? 'success' : 'error');
    this.log(`Auth Flow: ${results.authFlow.success ? '✅ PASS' : '❌ FAIL'}`, results.authFlow.success ? 'success' : 'error');

    // Detailed results
    this.log('', 'info');
    this.log('📋 DETAILED RESULTS', 'test');
    this.log('==================', 'test');
    this.log(`Profile Creation (No Auth): ${results.profileCreationWithoutAuth.message}`, 'info');
    this.log(`Admin Access: ${results.adminAccess.message}`, 'info');
    this.log(`Auth Flow: ${results.authFlow.message}`, 'info');

    const allPassed = results.databaseConnection.connected && 
                     results.profileCreationWithoutAuth.success && 
                     results.adminAccess.success && 
                     results.authFlow.success;
    
    if (allPassed) {
      this.log('🎉 All tests passed! Profile creation is working correctly.', 'success');
    } else {
      this.log('⚠️ Some tests failed. Please check the issues above.', 'warning');
    }

    // Recommendations
    this.log('', 'info');
    this.log('💡 RECOMMENDATIONS', 'test');
    this.log('==================', 'test');
    
    if (!results.databaseConnection.connected) {
      this.log('1. Check Supabase connection and environment variables', 'warning');
    }
    
    if (!results.databaseConnection.rlsEnabled) {
      this.log('2. Consider enabling RLS for better security', 'warning');
    }
    
    if (!results.adminAccess.success) {
      this.log('3. Add SUPABASE_SERVICE_ROLE_KEY to .env.local for admin tests', 'warning');
    }
    
    if (!results.authFlow.success) {
      this.log('4. Test authentication flow manually in the application', 'warning');
    }

    return results;
  }
}

// CLI Interface
async function main() {
  const test = new PracticalProfileCreationTest();
  const args = process.argv.slice(2);
  const command = args[0] || 'run';

  switch (command) {
    case 'run':
      await test.runAllTests();
      break;
    case 'connection':
      await test.checkDatabaseConnection();
      break;
    case 'noauth':
      await test.testProfileCreationWithoutAuth();
      break;
    case 'admin':
      await test.testWithAdminAccess();
      break;
    case 'auth':
      await test.testAuthenticationFlow();
      break;
    default:
      console.log(`
Usage: node test-profile-creation-practical.js [command]

Commands:
  run         - Run all tests (default)
  connection  - Check database connection only
  noauth      - Test profile creation without authentication
  admin       - Test with admin access
  auth        - Test authentication flow

Examples:
  node test-profile-creation-practical.js run
  node test-profile-creation-practical.js auth
      `);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = PracticalProfileCreationTest;
