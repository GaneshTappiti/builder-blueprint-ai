#!/usr/bin/env node

/**
 * Test Profile Creation Script
 * Tests the profile creation process with enhanced error handling
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

class ProfileCreationTest {
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
      warning: '⚠️'
    }[type];
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async checkTableExists(tableName) {
    try {
      // Try to query the table directly - this is more reliable
      const { data, error } = await this.supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      return !error;
    } catch (error) {
      return false;
    }
  }

  async testProfileCreation() {
    this.log('Testing profile creation process...', 'info');
    
    // Check if tables exist
    const tables = ['user_profiles', 'user_skills', 'user_certifications', 'user_languages'];
    const tableStatus = {};
    
    for (const table of tables) {
      const exists = await this.checkTableExists(table);
      tableStatus[table] = exists;
      this.log(`Table ${table}: ${exists ? 'EXISTS' : 'MISSING'}`, exists ? 'success' : 'error');
    }
    
    const allTablesExist = Object.values(tableStatus).every(exists => exists);
    
    if (!allTablesExist) {
      this.log('Cannot test profile creation - missing required tables', 'error');
      this.log('Please run the database migration first:', 'info');
      this.log('node scripts/apply-database-migration.js run', 'info');
      return false;
    }
    
    // Test profile creation with a test user
    const testUserId = '550e8400-e29b-41d4-a716-446655440000'; // Valid UUID for testing
    const testProfileData = {
      id: testUserId,
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
      first_name: 'Test',
      last_name: 'User',
      bio: 'Test profile for validation',
      timezone: 'UTC',
      status: 'offline',
      profile_completion: 25,
      is_active: true,
      onboarding_completed: false
    };
    
    try {
      this.log('Creating test profile...', 'info');
      
      const { data, error } = await this.supabase
        .from('user_profiles')
        .insert(testProfileData);
      
      if (error) {
        this.log(`Profile creation failed: ${error.message}`, 'error');
        this.log(`Error code: ${error.code}`, 'error');
        this.log(`Error details: ${JSON.stringify(error, null, 2)}`, 'error');
        return false;
      }
      
      this.log('Test profile created successfully', 'success');
      
      // Verify profile was created
      const { data: profile, error: fetchError } = await this.supabase
        .from('user_profiles')
        .select('*')
        .eq('id', testUserId)
        .single();
      
      if (fetchError) {
        this.log(`Failed to fetch created profile: ${fetchError.message}`, 'error');
        return false;
      }
      
      this.log('Profile verification successful', 'success');
      this.log(`Created profile: ${JSON.stringify(profile, null, 2)}`, 'info');
      
      // Clean up test profile
      const { error: deleteError } = await this.supabase
        .from('user_profiles')
        .delete()
        .eq('id', testUserId);
      
      if (deleteError) {
        this.log(`Failed to clean up test profile: ${deleteError.message}`, 'warning');
      } else {
        this.log('Test profile cleaned up successfully', 'success');
      }
      
      return true;
      
    } catch (error) {
      this.log(`Profile creation test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testProfileService() {
    this.log('Testing ProfileService integration...', 'info');
    
    try {
      // Import the ProfileService
      const ProfileService = require('../app/services/profileService.ts');
      
      // Test profile creation with retry logic
      const testUserId = 'service-test-' + Date.now();
      const testData = {
        email: 'service-test@example.com',
        name: 'Service Test User',
        role: 'user'
      };
      
      this.log('Testing ProfileService.createProfile...', 'info');
      const success = await ProfileService.createProfile(testUserId, testData);
      
      if (success) {
        this.log('ProfileService.createProfile succeeded', 'success');
        
        // Test profile retrieval
        const profile = await ProfileService.getProfile(testUserId);
        if (profile) {
          this.log('ProfileService.getProfile succeeded', 'success');
        } else {
          this.log('ProfileService.getProfile failed', 'error');
        }
        
        // Clean up
        await this.supabase
          .from('user_profiles')
          .delete()
          .eq('id', testUserId);
        
        return true;
      } else {
        this.log('ProfileService.createProfile failed', 'error');
        return false;
      }
      
    } catch (error) {
      this.log(`ProfileService test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async runTests() {
    this.log('Starting profile creation tests...', 'info');
    
    const results = {
      tableCheck: false,
      directCreation: false,
      serviceIntegration: false
    };
    
    // Test 1: Check tables
    const tables = ['user_profiles', 'user_skills', 'user_certifications', 'user_languages'];
    const tableStatus = {};
    
    for (const table of tables) {
      const exists = await this.checkTableExists(table);
      tableStatus[table] = exists;
    }
    
    results.tableCheck = Object.values(tableStatus).every(exists => exists);
    
    if (results.tableCheck) {
      this.log('All required tables exist', 'success');
      
      // Test 2: Direct profile creation
      results.directCreation = await this.testProfileCreation();
      
      // Test 3: ProfileService integration
      results.serviceIntegration = await this.testProfileService();
    } else {
      this.log('Missing required tables - skipping other tests', 'warning');
    }
    
    // Summary
    this.log('Test Results Summary:', 'info');
    this.log(`Table Check: ${results.tableCheck ? 'PASS' : 'FAIL'}`, results.tableCheck ? 'success' : 'error');
    this.log(`Direct Creation: ${results.directCreation ? 'PASS' : 'FAIL'}`, results.directCreation ? 'success' : 'error');
    this.log(`Service Integration: ${results.serviceIntegration ? 'PASS' : 'FAIL'}`, results.serviceIntegration ? 'success' : 'error');
    
    const allPassed = Object.values(results).every(result => result);
    
    if (allPassed) {
      this.log('All tests passed! Profile creation is working correctly.', 'success');
    } else {
      this.log('Some tests failed. Please check the issues above.', 'error');
    }
    
    return allPassed;
  }
}

// CLI Interface
async function main() {
  const test = new ProfileCreationTest();
  const args = process.argv.slice(2);
  const command = args[0] || 'run';

  switch (command) {
    case 'run':
      await test.runTests();
      break;
    case 'tables':
      const tables = ['user_profiles', 'user_skills', 'user_certifications', 'user_languages'];
      for (const table of tables) {
        const exists = await test.checkTableExists(table);
        test.log(`Table ${table}: ${exists ? 'EXISTS' : 'MISSING'}`, exists ? 'success' : 'error');
      }
      break;
    case 'create':
      await test.testProfileCreation();
      break;
    case 'service':
      await test.testProfileService();
      break;
    default:
      console.log(`
Usage: node test-profile-creation.js [command]

Commands:
  run      - Run all tests (default)
  tables   - Check table existence
  create   - Test direct profile creation
  service  - Test ProfileService integration

Examples:
  node test-profile-creation.js run
  node test-profile-creation.js tables
      `);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = ProfileCreationTest;
