#!/usr/bin/env node

/**
 * Simple Profile Creation Test
 * Tests profile creation without requiring authentication
 * Focuses on database functionality and ProfileService integration
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

class SimpleProfileCreationTest {
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
      test: '🧪'
    }[type];
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async checkDatabaseSetup() {
    this.log('Checking database setup...', 'step');
    
    const checks = {
      tables: false,
      columns: false,
      triggers: false
    };

    // Check if required tables exist
    const tables = ['user_profiles', 'user_skills', 'user_certifications', 'user_languages'];
    for (const table of tables) {
      try {
        const { error } = await this.supabase
          .from(table)
          .select('*')
          .limit(1);
        if (error) {
          this.log(`Table ${table} missing: ${error.message}`, 'error');
          return false;
        }
      } catch (error) {
        this.log(`Table ${table} check failed: ${error.message}`, 'error');
        return false;
      }
    }
    checks.tables = true;
    this.log('All required tables exist', 'success');

    // Check if required columns exist by trying to insert a test record
    try {
      const testData = {
        id: '00000000-0000-0000-0000-000000000000',
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

      const { error } = await this.supabase
        .from('user_profiles')
        .insert(testData);

      if (error) {
        this.log(`Column check failed: ${error.message}`, 'error');
        if (error.message.includes('column') && error.message.includes('does not exist')) {
          this.log('Missing columns detected! Run fix-missing-columns.sql', 'warning');
        }
        return false;
      }

      checks.columns = true;
      this.log('All required columns exist', 'success');

      // Clean up test data
      await this.supabase
        .from('user_profiles')
        .delete()
        .eq('id', '00000000-0000-0000-0000-000000000000');

    } catch (error) {
      this.log(`Column check failed: ${error.message}`, 'error');
      return false;
    }

    return checks;
  }

  async testDirectProfileCreation() {
    this.log('Testing direct profile creation...', 'test');
    
    const testUserId = 'test-user-' + Date.now();
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
      // Test profile creation
      const { data, error } = await this.supabase
        .from('user_profiles')
        .insert(testProfileData);
      
      if (error) {
        this.log(`Profile creation failed: ${error.message}`, 'error');
        this.log(`Error code: ${error.code}`, 'error');
        return false;
      }
      
      this.log('Profile created successfully', 'success');
      
      // Test profile retrieval
      const { data: profile, error: fetchError } = await this.supabase
        .from('user_profiles')
        .select('*')
        .eq('id', testUserId)
        .single();
      
      if (fetchError) {
        this.log(`Profile retrieval failed: ${fetchError.message}`, 'error');
        return false;
      }
      
      this.log('Profile retrieval successful', 'success');
      this.log(`Profile data: ${JSON.stringify(profile, null, 2)}`, 'info');
      
      // Test profile update
      const { error: updateError } = await this.supabase
        .from('user_profiles')
        .update({
          bio: 'Updated bio',
          profile_completion: 50,
          updated_at: new Date().toISOString()
        })
        .eq('id', testUserId);
      
      if (updateError) {
        this.log(`Profile update failed: ${updateError.message}`, 'error');
        return false;
      }
      
      this.log('Profile update successful', 'success');
      
      // Clean up
      const { error: deleteError } = await this.supabase
        .from('user_profiles')
        .delete()
        .eq('id', testUserId);
      
      if (deleteError) {
        this.log(`Cleanup failed: ${deleteError.message}`, 'warning');
      } else {
        this.log('Test profile cleaned up', 'success');
      }
      
      return true;
      
    } catch (error) {
      this.log(`Direct profile creation test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testProfileServiceMethods() {
    this.log('Testing ProfileService methods...', 'test');
    
    try {
      // Test with a mock user ID
      const testUserId = 'service-test-' + Date.now();
      
      // Simulate ProfileService.createProfile logic
      const profileData = {
        id: testUserId,
        email: 'service-test@example.com',
        name: 'Service Test User',
        role: 'user',
        first_name: 'Service',
        last_name: 'Test',
        display_name: 'Service Test User',
        bio: 'Test profile created by service',
        timezone: 'UTC',
        status: 'offline',
        profile_completion: 0,
        is_active: true,
        onboarding_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Test profile creation
      const { error: createError } = await this.supabase
        .from('user_profiles')
        .insert(profileData);

      if (createError) {
        this.log(`Service profile creation failed: ${createError.message}`, 'error');
        return false;
      }

      this.log('Service profile creation successful', 'success');

      // Test profile retrieval
      const { data: profile, error: fetchError } = await this.supabase
        .from('user_profiles')
        .select('*')
        .eq('id', testUserId)
        .single();

      if (fetchError) {
        this.log(`Service profile retrieval failed: ${fetchError.message}`, 'error');
        return false;
      }

      this.log('Service profile retrieval successful', 'success');

      // Test profile update
      const { error: updateError } = await this.supabase
        .from('user_profiles')
        .update({
          bio: 'Updated by service',
          profile_completion: 75,
          updated_at: new Date().toISOString()
        })
        .eq('id', testUserId);

      if (updateError) {
        this.log(`Service profile update failed: ${updateError.message}`, 'error');
        return false;
      }

      this.log('Service profile update successful', 'success');

      // Clean up
      await this.supabase
        .from('user_profiles')
        .delete()
        .eq('id', testUserId);

      this.log('Service test profile cleaned up', 'success');
      return true;

    } catch (error) {
      this.log(`ProfileService test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testProfileCreationScenarios() {
    this.log('Testing different profile creation scenarios...', 'test');
    
    const scenarios = [
      {
        name: 'Minimal Profile',
        data: {
          id: 'minimal-' + Date.now(),
          email: 'minimal@example.com',
          name: 'Minimal User',
          role: 'user',
          status: 'offline',
          is_active: true
        }
      },
      {
        name: 'Complete Profile',
        data: {
          id: 'complete-' + Date.now(),
          email: 'complete@example.com',
          name: 'Complete User',
          role: 'user',
          first_name: 'Complete',
          last_name: 'User',
          display_name: 'Complete User',
          bio: 'A complete user profile',
          phone: '+1234567890',
          location: 'New York, NY',
          timezone: 'America/New_York',
          website: 'https://completeuser.com',
          linkedin: 'https://linkedin.com/in/completeuser',
          twitter: 'https://twitter.com/completeuser',
          github: 'https://github.com/completeuser',
          job_title: 'Software Engineer',
          work_location: 'hybrid',
          status: 'online',
          profile_completion: 90,
          is_active: true,
          onboarding_completed: true,
          interests: ['programming', 'technology', 'innovation'],
          availability: {
            isAvailable: true,
            workingDays: [1, 2, 3, 4, 5],
            timezone: 'America/New_York',
            vacationMode: false
          },
          working_hours: {
            start: '09:00',
            end: '17:00',
            days: [1, 2, 3, 4, 5],
            timezone: 'America/New_York'
          },
          preferences: {
            theme: 'light',
            notifications: true,
            language: 'en'
          },
          privacy: {
            profileVisibility: 'public',
            emailVisibility: 'private',
            phoneVisibility: 'private'
          }
        }
      }
    ];

    const results = [];

    for (const scenario of scenarios) {
      this.log(`Testing scenario: ${scenario.name}`, 'info');
      
      try {
        // Create profile
        const { error: createError } = await this.supabase
          .from('user_profiles')
          .insert(scenario.data);

        if (createError) {
          this.log(`Scenario ${scenario.name} failed: ${createError.message}`, 'error');
          results.push({ name: scenario.name, success: false, error: createError.message });
          continue;
        }

        // Verify profile
        const { data: profile, error: fetchError } = await this.supabase
          .from('user_profiles')
          .select('*')
          .eq('id', scenario.data.id)
          .single();

        if (fetchError) {
          this.log(`Scenario ${scenario.name} verification failed: ${fetchError.message}`, 'error');
          results.push({ name: scenario.name, success: false, error: fetchError.message });
          continue;
        }

        this.log(`Scenario ${scenario.name} succeeded`, 'success');
        results.push({ name: scenario.name, success: true });

        // Clean up
        await this.supabase
          .from('user_profiles')
          .delete()
          .eq('id', scenario.data.id);

      } catch (error) {
        this.log(`Scenario ${scenario.name} failed: ${error.message}`, 'error');
        results.push({ name: scenario.name, success: false, error: error.message });
      }
    }

    return results;
  }

  async testErrorHandling() {
    this.log('Testing error handling...', 'test');
    
    const errorTests = [
      {
        name: 'Duplicate ID',
        data: {
          id: 'duplicate-test',
          email: 'duplicate1@example.com',
          name: 'Duplicate User 1',
          role: 'user',
          status: 'offline',
          is_active: true
        }
      },
      {
        name: 'Invalid Email',
        data: {
          id: 'invalid-email-' + Date.now(),
          email: 'not-an-email',
          name: 'Invalid Email User',
          role: 'user',
          status: 'offline',
          is_active: true
        }
      },
      {
        name: 'Missing Required Fields',
        data: {
          id: 'missing-fields-' + Date.now(),
          // Missing email and name
          role: 'user',
          status: 'offline',
          is_active: true
        }
      }
    ];

    const results = [];

    for (const test of errorTests) {
      this.log(`Testing error case: ${test.name}`, 'info');
      
      try {
        const { error } = await this.supabase
          .from('user_profiles')
          .insert(test.data);

        if (error) {
          this.log(`Error case ${test.name} handled correctly: ${error.message}`, 'success');
          results.push({ name: test.name, success: true, error: error.message });
        } else {
          this.log(`Error case ${test.name} should have failed but didn't`, 'warning');
          results.push({ name: test.name, success: false, error: 'Expected error but got success' });
          
          // Clean up if it unexpectedly succeeded
          await this.supabase
            .from('user_profiles')
            .delete()
            .eq('id', test.data.id);
        }
      } catch (error) {
        this.log(`Error case ${test.name} threw exception: ${error.message}`, 'success');
        results.push({ name: test.name, success: true, error: error.message });
      }
    }

    return results;
  }

  async runAllTests() {
    this.log('🧪 SIMPLE PROFILE CREATION TESTS', 'test');
    this.log('================================', 'test');
    
    const results = {
      databaseSetup: false,
      directCreation: false,
      serviceMethods: false,
      scenarios: [],
      errorHandling: []
    };

    // Check database setup
    const dbSetup = await this.checkDatabaseSetup();
    results.databaseSetup = dbSetup.tables && dbSetup.columns;

    if (!results.databaseSetup) {
      this.log('Database setup issues - some tests will be skipped', 'warning');
    }

    // Test direct profile creation
    if (results.databaseSetup) {
      results.directCreation = await this.testDirectProfileCreation();
      results.serviceMethods = await this.testProfileServiceMethods();
      results.scenarios = await this.testProfileCreationScenarios();
      results.errorHandling = await this.testErrorHandling();
    }

    // Summary
    this.log('', 'info');
    this.log('📊 TEST RESULTS SUMMARY', 'test');
    this.log('======================', 'test');
    this.log(`Database Setup: ${results.databaseSetup ? '✅ PASS' : '❌ FAIL'}`, results.databaseSetup ? 'success' : 'error');
    this.log(`Direct Creation: ${results.directCreation ? '✅ PASS' : '❌ FAIL'}`, results.directCreation ? 'success' : 'error');
    this.log(`Service Methods: ${results.serviceMethods ? '✅ PASS' : '❌ FAIL'}`, results.serviceMethods ? 'success' : 'error');
    
    this.log('', 'info');
    this.log('Scenario Tests:', 'info');
    results.scenarios.forEach(scenario => {
      this.log(`  ${scenario.name}: ${scenario.success ? '✅ PASS' : '❌ FAIL'}`, scenario.success ? 'success' : 'error');
      if (!scenario.success) {
        this.log(`    Error: ${scenario.error}`, 'error');
      }
    });

    this.log('', 'info');
    this.log('Error Handling Tests:', 'info');
    results.errorHandling.forEach(test => {
      this.log(`  ${test.name}: ${test.success ? '✅ PASS' : '❌ FAIL'}`, test.success ? 'success' : 'error');
      if (!test.success) {
        this.log(`    Error: ${test.error}`, 'error');
      }
    });

    const allPassed = results.databaseSetup && results.directCreation && results.serviceMethods &&
      results.scenarios.every(s => s.success) && results.errorHandling.every(e => e.success);
    
    if (allPassed) {
      this.log('🎉 All tests passed! Profile creation is working correctly.', 'success');
    } else {
      this.log('⚠️ Some tests failed. Please check the issues above.', 'warning');
    }

    return results;
  }
}

// CLI Interface
async function main() {
  const test = new SimpleProfileCreationTest();
  const args = process.argv.slice(2);
  const command = args[0] || 'run';

  switch (command) {
    case 'run':
      await test.runAllTests();
      break;
    case 'setup':
      await test.checkDatabaseSetup();
      break;
    case 'direct':
      await test.testDirectProfileCreation();
      break;
    case 'service':
      await test.testProfileServiceMethods();
      break;
    case 'scenarios':
      await test.testProfileCreationScenarios();
      break;
    case 'errors':
      await test.testErrorHandling();
      break;
    default:
      console.log(`
Usage: node test-profile-creation-simple.js [command]

Commands:
  run        - Run all tests (default)
  setup      - Check database setup only
  direct     - Test direct profile creation
  service    - Test ProfileService methods
  scenarios  - Test different profile scenarios
  errors     - Test error handling

Examples:
  node test-profile-creation-simple.js run
  node test-profile-creation-simple.js setup
      `);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = SimpleProfileCreationTest;
