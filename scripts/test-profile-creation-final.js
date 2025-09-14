#!/usr/bin/env node

/**
 * Final Profile Creation Test
 * Tests profile creation with proper authentication and shows how to fix remaining issues
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

class FinalProfileCreationTest {
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
      test: '🧪',
      auth: '🔐',
      rls: '🔒',
      fix: '🔧'
    }[type];
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async testCurrentSetup() {
    this.log('Testing current profile creation setup...', 'test');
    
    const results = {
      databaseConnection: false,
      rlsWorking: false,
      authWorking: false,
      profileCreationWorking: false,
      serviceKeyValid: false
    };

    // Test 1: Database Connection
    this.log('Test 1: Checking database connection...', 'step');
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .select('count')
        .limit(1);

      if (error && error.code === '42501') {
        this.log('✅ Database connected - RLS is working correctly', 'success');
        results.databaseConnection = true;
        results.rlsWorking = true;
      } else if (error) {
        this.log(`❌ Database connection failed: ${error.message}`, 'error');
      } else {
        this.log('⚠️ Database connected but RLS might be disabled', 'warning');
        results.databaseConnection = true;
      }
    } catch (error) {
      this.log(`❌ Database connection error: ${error.message}`, 'error');
    }

    // Test 2: Authentication
    this.log('Test 2: Testing authentication...', 'step');
    const testEmail = `testuser${Date.now()}@gmail.com`;
    const testPassword = 'TestPassword123!';
    
    try {
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
        this.log(`❌ Authentication failed: ${signupError.message}`, 'error');
      } else if (signupData.user) {
        this.log(`✅ Authentication working - User created: ${signupData.user.email}`, 'success');
        results.authWorking = true;
        
        // Test 3: Profile Creation with Authenticated User
        this.log('Test 3: Testing profile creation with authenticated user...', 'step');
        
        // Wait a moment for any triggers
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check if profile was created automatically
        const { data: profile, error: profileError } = await this.supabase
          .from('user_profiles')
          .select('*')
          .eq('id', signupData.user.id)
          .single();

        if (profileError) {
          this.log(`⚠️ Profile not found automatically: ${profileError.message}`, 'warning');
          
          // Try manual profile creation
          this.log('Trying manual profile creation...', 'step');
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
            this.log(`❌ Manual profile creation failed: ${createError.message}`, 'error');
            this.log('This is expected due to RLS policies', 'info');
          } else {
            this.log('✅ Manual profile creation succeeded', 'success');
            results.profileCreationWorking = true;
          }
        } else {
          this.log('✅ Profile was created automatically by trigger!', 'success');
          results.profileCreationWorking = true;
        }

        // Clean up
        this.log('Cleaning up test user...', 'step');
        await this.cleanupTestUser(signupData.user.id, testEmail);
      }
    } catch (error) {
      this.log(`❌ Authentication test failed: ${error.message}`, 'error');
    }

    // Test 4: Service Key
    this.log('Test 4: Checking service key...', 'step');
    if (this.supabaseAdmin) {
      try {
        const { data, error } = await this.supabaseAdmin
          .from('user_profiles')
          .select('count')
          .limit(1);

        if (error) {
          this.log(`❌ Service key invalid: ${error.message}`, 'error');
        } else {
          this.log('✅ Service key is working', 'success');
          results.serviceKeyValid = true;
        }
      } catch (error) {
        this.log(`❌ Service key test failed: ${error.message}`, 'error');
      }
    } else {
      this.log('⚠️ No service key available', 'warning');
    }

    return results;
  }

  async cleanupTestUser(userId, email) {
    try {
      if (this.supabaseAdmin) {
        await this.supabaseAdmin
          .from('user_profiles')
          .delete()
          .eq('id', userId);

        await this.supabaseAdmin.auth.admin.deleteUser(userId);
        this.log('Test user cleaned up successfully', 'success');
      } else {
        this.log('⚠️ Cannot delete auth user without service key', 'warning');
        this.log(`Please manually delete user: ${email}`, 'info');
      }
    } catch (error) {
      this.log(`⚠️ Cleanup failed: ${error.message}`, 'warning');
    }
  }

  showFixInstructions() {
    this.log('', 'info');
    this.log('🔧 HOW TO FIX THE REMAINING ISSUES', 'fix');
    this.log('====================================', 'fix');
    
    this.log('', 'info');
    this.log('1. GET THE REAL SERVICE ROLE KEY:', 'fix');
    this.log('   - Go to your Supabase dashboard: https://supabase.com/dashboard', 'info');
    this.log('   - Select your project: isvjuagegfnkuaucpsvj', 'info');
    this.log('   - Go to Settings → API', 'info');
    this.log('   - Copy the "service_role" key (not the anon key)', 'info');
    this.log('   - Replace the placeholder in .env.local', 'info');
    
    this.log('', 'info');
    this.log('2. FIX PROFILE CREATION AFTER AUTH:', 'fix');
    this.log('   - The issue is that RLS policies require the user to be authenticated', 'info');
    this.log('   - But the profile creation happens in the context of the signup process', 'info');
    this.log('   - You need to either:', 'info');
    this.log('     a) Create a database trigger that creates profiles automatically', 'info');
    this.log('     b) Use the service key to create profiles after user signup', 'info');
    this.log('     c) Modify RLS policies to allow profile creation during signup', 'info');
    
    this.log('', 'info');
    this.log('3. TEST MANUALLY IN THE APPLICATION:', 'fix');
    this.log('   - Start the dev server: npm run dev', 'info');
    this.log('   - Go to http://localhost:3000/auth', 'info');
    this.log('   - Create a new account', 'info');
    this.log('   - Check if profile is created automatically', 'info');
    
    this.log('', 'info');
    this.log('4. CHECK DATABASE TRIGGERS:', 'fix');
    this.log('   - Go to Supabase dashboard → SQL Editor', 'info');
    this.log('   - Check if there are triggers on auth.users table', 'info');
    this.log('   - If not, create one to automatically create profiles', 'info');
  }

  async runTest() {
    this.log('🧪 FINAL PROFILE CREATION TEST', 'test');
    this.log('==============================', 'test');
    
    const results = await this.testCurrentSetup();
    
    // Summary
    this.log('', 'info');
    this.log('📊 TEST RESULTS SUMMARY', 'test');
    this.log('======================', 'test');
    this.log(`Database Connection: ${results.databaseConnection ? '✅ PASS' : '❌ FAIL'}`, results.databaseConnection ? 'success' : 'error');
    this.log(`RLS Working: ${results.rlsWorking ? '✅ PASS' : '❌ FAIL'}`, results.rlsWorking ? 'success' : 'error');
    this.log(`Authentication: ${results.authWorking ? '✅ PASS' : '❌ FAIL'}`, results.authWorking ? 'success' : 'error');
    this.log(`Profile Creation: ${results.profileCreationWorking ? '✅ PASS' : '❌ FAIL'}`, results.profileCreationWorking ? 'success' : 'error');
    this.log(`Service Key: ${results.serviceKeyValid ? '✅ PASS' : '❌ FAIL'}`, results.serviceKeyValid ? 'success' : 'error');

    const allPassed = Object.values(results).every(result => result);
    
    if (allPassed) {
      this.log('🎉 All tests passed! Profile creation is working correctly.', 'success');
    } else {
      this.log('⚠️ Some tests failed. See fix instructions below.', 'warning');
      this.showFixInstructions();
    }

    return results;
  }
}

// CLI Interface
async function main() {
  const test = new FinalProfileCreationTest();
  await test.runTest();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = FinalProfileCreationTest;
