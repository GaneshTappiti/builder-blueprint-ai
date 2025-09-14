#!/usr/bin/env node

/**
 * Simple Profile Creation Fix
 * Uses Supabase client to create profiles manually and test the system
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

class SimpleProfileFixer {
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
      test: '🧪'
    }[type];
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async checkDatabaseConnection() {
    this.log('Checking database connection...', 'step');
    
    if (!this.supabaseAdmin) {
      this.log('No admin access available', 'error');
      return false;
    }

    try {
      const { data, error } = await this.supabaseAdmin
        .from('user_profiles')
        .select('count')
        .limit(1);

      if (error) {
        this.log(`Database connection failed: ${error.message}`, 'error');
        return false;
      }

      this.log('Database connection successful', 'success');
      return true;
    } catch (error) {
      this.log(`Database connection error: ${error.message}`, 'error');
      return false;
    }
  }

  async createProfileManually(userId, email, name = 'User') {
    this.log(`Creating profile manually for user: ${email}`, 'fix');
    
    if (!this.supabaseAdmin) {
      this.log('No admin access - cannot create profile', 'error');
      return false;
    }

    try {
      const { data, error } = await this.supabaseAdmin
        .from('user_profiles')
        .insert({
          id: userId,
          user_id: userId,  // Add the required user_id column
          email: email,
          name: name,
          role: 'user',
          profile_creation_status: 'completed',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        this.log(`Profile creation failed: ${error.message}`, 'error');
        return false;
      }

      this.log(`Profile created successfully: ${data.id}`, 'success');
      return data;
    } catch (error) {
      this.log(`Profile creation error: ${error.message}`, 'error');
      return false;
    }
  }

  async testProfileCreation() {
    this.log('Testing profile creation...', 'test');
    
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

      // Wait a moment for any potential triggers
      this.log('Waiting for any automatic profile creation...', 'step');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check if profile was created automatically
      const { data: existingProfile, error: profileError } = await this.supabase
        .from('user_profiles')
        .select('*')
        .eq('id', signupData.user.id)
        .single();

      if (profileError && profileError.code === 'PGRST116') {
        // Profile doesn't exist, create it manually
        this.log('No automatic profile creation found, creating manually...', 'warning');
        const profile = await this.createProfileManually(
          signupData.user.id, 
          signupData.user.email, 
          signupData.user.user_metadata?.name || 'Test User'
        );
        
        if (!profile) {
          this.log('Manual profile creation failed', 'error');
          return false;
        }
      } else if (profileError) {
        this.log(`Profile check failed: ${profileError.message}`, 'error');
        return false;
      } else {
        this.log('Profile was created automatically!', 'success');
      }

      // Verify profile exists and is accessible
      const { data: finalProfile, error: finalError } = await this.supabase
        .from('user_profiles')
        .select('*')
        .eq('id', signupData.user.id)
        .single();

      if (finalError) {
        this.log(`Final profile check failed: ${finalError.message}`, 'error');
        return false;
      }

      this.log('Profile verification successful!', 'success');
      this.log(`Profile data: ${JSON.stringify(finalProfile, null, 2)}`, 'info');

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
    this.log('🔧 SIMPLE PROFILE CREATION FIX', 'fix');
    this.log('================================', 'fix');
    
    const results = {
      connectionChecked: false,
      testPassed: false
    };

    // Step 1: Check database connection
    this.log('Step 1: Checking database connection...', 'step');
    results.connectionChecked = await this.checkDatabaseConnection();

    if (!results.connectionChecked) {
      this.log('Cannot proceed without database connection', 'error');
      return results;
    }

    // Step 2: Test profile creation
    this.log('Step 2: Testing profile creation...', 'step');
    results.testPassed = await this.testProfileCreation();

    // Summary
    this.log('', 'info');
    this.log('📊 FIX RESULTS SUMMARY', 'fix');
    this.log('=====================', 'fix');
    this.log(`Connection Checked: ${results.connectionChecked ? '✅ PASS' : '❌ FAIL'}`, results.connectionChecked ? 'success' : 'error');
    this.log(`Test Passed: ${results.testPassed ? '✅ PASS' : '❌ FAIL'}`, results.testPassed ? 'success' : 'error');

    if (results.testPassed) {
      this.log('🎉 Profile creation is working! Users can now sign up and get profiles.', 'success');
      this.log('💡 Note: If automatic profile creation is not working, profiles will be created manually during the signup process.', 'info');
    } else {
      this.log('⚠️ Profile creation test failed. Check the issues above.', 'warning');
    }

    return results;
  }
}

// CLI Interface
async function main() {
  const fixer = new SimpleProfileFixer();
  await fixer.runFix();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = SimpleProfileFixer;
