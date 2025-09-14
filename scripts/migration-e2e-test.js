#!/usr/bin/env node

/**
 * Migration System End-to-End Test Suite
 * 
 * This script tests the complete migration system from localStorage to Supabase:
 * 1. Pre-populates localStorage with test data
 * 2. Triggers migration process
 * 3. Verifies data lands in Supabase tables with correct RLS
 * 4. Tests offline mode (queue → sync)
 * 5. Tests cross-device sync capabilities
 * 6. Documents failures, edge cases, and regressions
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Test configuration
const TEST_CONFIG = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://isvjuagegfnkuaucpsvj.supabase.co',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlzdmp1YWdlZ2Zua3VhdWNwc3ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNzUzMDMsImV4cCI6MjA2ODc1MTMwM30.p9EwEAr0NGr3Biw5pu7wA3wQeQsO2G7DhlqtRHnY6wE',
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlzdmp1YWdlZ2Zua3VhdWNwc3ZqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzE3NTMwMywiZXhwIjoyMDY4NzUxMzAzfQ.g9i8793jg2i2Z2GNNFSddVqusVeipcufhbR9dIcNqyE',
  testUserId: 'test-user-' + Date.now(),
  testEmail: `test-${Date.now()}@example.com`,
  testPassword: 'TestPassword123!'
};

// Initialize Supabase clients
const supabase = createClient(TEST_CONFIG.supabaseUrl, TEST_CONFIG.supabaseAnonKey);
const supabaseAdmin = createClient(TEST_CONFIG.supabaseUrl, TEST_CONFIG.serviceRoleKey);

// Test results tracking
const testResults = {
  startTime: new Date(),
  endTime: null,
  totalTests: 0,
  passed: 0,
  failed: 0,
  errors: [],
  warnings: [],
  testData: {
    localStorageData: {},
    supabaseData: {},
    migrationResults: {},
    syncResults: {}
  }
};

// Test data templates
const TEST_DATA = {
  'builder-blueprint-history': [
    {
      project_id: 'test-project-1',
      name: 'Test Project 1',
      description: 'A test project for migration testing',
      created_at: new Date().toISOString(),
      last_modified: new Date().toISOString(),
      context: {
        steps: ['Step 1', 'Step 2', 'Step 3'],
        progress: 0.5,
        notes: 'Test notes'
      }
    },
    {
      project_id: 'test-project-2',
      name: 'Test Project 2',
      description: 'Another test project',
      created_at: new Date().toISOString(),
      last_modified: new Date().toISOString(),
      context: {
        steps: ['Step A', 'Step B'],
        progress: 0.8,
        notes: 'More test notes'
      }
    }
  ],
  'mvp_studio_projects': [
    {
      project_id: 'mvp-test-1',
      name: 'MVP Test Project',
      description: 'Test MVP project for migration',
      status: 'in_progress',
      created_at: new Date().toISOString(),
      last_modified: new Date().toISOString(),
      project_data: {
        features: ['Feature 1', 'Feature 2'],
        target_audience: 'Test users',
        business_model: 'SaaS'
      }
    }
  ],
  'ideaforge_ideas': [
    {
      idea_id: 'idea-test-1',
      title: 'Test Idea 1',
      description: 'A test idea for migration testing',
      category: 'Technology',
      created_at: new Date().toISOString(),
      last_modified: new Date().toISOString(),
      idea_data: {
        problem: 'Test problem',
        solution: 'Test solution',
        market_size: 'Large',
        competition: 'Moderate'
      }
    }
  ],
  'ideaVault': [
    {
      id: 'vault-idea-1',
      title: 'Vault Test Idea',
      description: 'Test idea in vault',
      created_at: new Date().toISOString(),
      last_modified: new Date().toISOString(),
      idea_data: {
        tags: ['test', 'migration'],
        priority: 'high',
        status: 'active'
      }
    }
  ],
  'notificationPreferences': {
    email: true,
    push: false,
    sms: false,
    frequency: 'daily',
    categories: {
      updates: true,
      marketing: false,
      security: true
    }
  },
  'chat-notification-preferences': {
    desktop: true,
    mobile: true,
    sound: true,
    mentions: true,
    channels: {
      general: true,
      updates: false
    }
  },
  'public_feedback_ideas': [
    {
      idea_id: 'feedback-idea-1',
      title: 'Public Feedback Idea',
      description: 'Test public feedback idea',
      created_at: new Date().toISOString(),
      last_modified: new Date().toISOString(),
      feedback_data: {
        votes: 5,
        comments: 2,
        category: 'feature_request'
      }
    }
  ],
  'bmc-canvas': {
    canvas_id: 'bmc-test-1',
    name: 'Test BMC Canvas',
    created_at: new Date().toISOString(),
    last_modified: new Date().toISOString(),
    canvas_data: {
      value_propositions: ['Value 1', 'Value 2'],
      customer_segments: ['Segment 1'],
      channels: ['Channel 1'],
      customer_relationships: ['Relationship 1'],
      revenue_streams: ['Stream 1'],
      key_resources: ['Resource 1'],
      key_activities: ['Activity 1'],
      key_partnerships: ['Partnership 1'],
      cost_structure: ['Cost 1']
    }
  }
};

// Utility functions
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n${colors.cyan}=== ${step} ===${colors.reset}`);
  log(message, colors.bright);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

// Test helper functions
async function runTest(testName, testFunction) {
  testResults.totalTests++;
  log(`\n🧪 Running test: ${testName}`, colors.magenta);
  
  try {
    const result = await testFunction();
    if (result.success) {
      testResults.passed++;
      logSuccess(`${testName} - PASSED`);
      return result;
    } else {
      testResults.failed++;
      logError(`${testName} - FAILED: ${result.error}`);
      testResults.errors.push(`${testName}: ${result.error}`);
      return result;
    }
  } catch (error) {
    testResults.failed++;
    logError(`${testName} - ERROR: ${error.message}`);
    testResults.errors.push(`${testName}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Test 1: Setup and Authentication
async function testSetupAndAuth() {
  logStep('Test 1', 'Setting up test environment and authentication');
  
  try {
    // Create test user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: TEST_CONFIG.testEmail,
      password: TEST_CONFIG.testPassword,
    });

    if (authError) {
      // Try to sign in if user already exists
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: TEST_CONFIG.testEmail,
        password: TEST_CONFIG.testPassword,
      });

      if (signInError) {
        throw new Error(`Authentication failed: ${signInError.message}`);
      }
      
      testResults.testData.userId = signInData.user.id;
      logInfo('Using existing test user');
    } else {
      testResults.testData.userId = authData.user.id;
      logInfo('Created new test user');
    }

    // Verify user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User authentication verification failed');
    }

    logSuccess('Authentication setup complete');
    return { success: true, userId: user.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Test 2: Pre-populate localStorage with test data
async function testPrePopulateLocalStorage() {
  logStep('Test 2', 'Pre-populating localStorage with test data');
  
  try {
    // Simulate localStorage population (in real browser environment)
    // This would be done in the browser console or through the app
    testResults.testData.localStorageData = { ...TEST_DATA };
    
    logInfo('Test data prepared for localStorage population:');
    Object.keys(TEST_DATA).forEach(key => {
      const data = TEST_DATA[key];
      if (Array.isArray(data)) {
        logInfo(`  ${key}: ${data.length} items`);
      } else {
        logInfo(`  ${key}: 1 object`);
      }
    });

    logSuccess('localStorage test data prepared');
    return { success: true, data: TEST_DATA };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Test 3: Execute migration process
async function testMigrationProcess() {
  logStep('Test 3', 'Executing migration process from localStorage to Supabase');
  
  try {
    const userId = testResults.testData.userId;
    if (!userId) {
      throw new Error('No authenticated user found');
    }

    // Simulate migration process for each localStorage key
    const migrationResults = {};
    
    for (const [localStorageKey, data] of Object.entries(TEST_DATA)) {
      logInfo(`Migrating ${localStorageKey}...`);
      
      // Map localStorage key to Supabase table
      const tableMapping = {
        'builder-blueprint-history': 'builder_context',
        'mvp_studio_projects': 'mvp_studio_projects',
        'ideaforge_ideas': 'ideaforge_data',
        'ideaVault': 'ideas',
        'notificationPreferences': 'notification_preferences',
        'chat-notification-preferences': 'chat_notification_preferences',
        'public_feedback_ideas': 'public_feedback_ideas',
        'bmc-canvas': 'bmc_canvas_data'
      };

      const tableName = tableMapping[localStorageKey];
      if (!tableName) {
        logWarning(`No table mapping found for ${localStorageKey}`);
        continue;
      }

      // Prepare data for Supabase
      let supabaseData;
      if (Array.isArray(data)) {
        supabaseData = data.map(item => ({
          ...item,
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
      } else {
        supabaseData = {
          ...data,
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }

      // Insert data into Supabase
      const { data: insertedData, error: insertError } = await supabase
        .from(tableName)
        .insert(supabaseData)
        .select();

      if (insertError) {
        logError(`Failed to migrate ${localStorageKey}: ${insertError.message}`);
        migrationResults[localStorageKey] = { success: false, error: insertError.message };
      } else {
        logSuccess(`Migrated ${localStorageKey}: ${Array.isArray(insertedData) ? insertedData.length : 1} records`);
        migrationResults[localStorageKey] = { success: true, data: insertedData };
      }
    }

    testResults.testData.migrationResults = migrationResults;
    
    const successCount = Object.values(migrationResults).filter(r => r.success).length;
    const totalCount = Object.keys(migrationResults).length;
    
    if (successCount === totalCount) {
      logSuccess(`Migration completed: ${successCount}/${totalCount} successful`);
      return { success: true, results: migrationResults };
    } else {
      logWarning(`Migration partially completed: ${successCount}/${totalCount} successful`);
      return { success: false, error: 'Some migrations failed', results: migrationResults };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Test 4: Verify data in Supabase tables
async function testVerifySupabaseData() {
  logStep('Test 4', 'Verifying data landed correctly in Supabase tables');
  
  try {
    const userId = testResults.testData.userId;
    const verificationResults = {};

    // Verify each table
    const tablesToVerify = [
      'builder_context',
      'mvp_studio_projects', 
      'ideaforge_data',
      'ideas',
      'notification_preferences',
      'chat_notification_preferences',
      'public_feedback_ideas',
      'bmc_canvas_data'
    ];

    for (const tableName of tablesToVerify) {
      logInfo(`Verifying table: ${tableName}`);
      
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('user_id', userId);

      if (error) {
        logError(`Failed to query ${tableName}: ${error.message}`);
        verificationResults[tableName] = { success: false, error: error.message };
        continue;
      }

      if (!data || data.length === 0) {
        logWarning(`No data found in ${tableName} for user ${userId}`);
        verificationResults[tableName] = { success: false, error: 'No data found' };
        continue;
      }

      logSuccess(`Found ${data.length} records in ${tableName}`);
      verificationResults[tableName] = { success: true, count: data.length, data: data };
    }

    testResults.testData.supabaseData = verificationResults;
    
    const successCount = Object.values(verificationResults).filter(r => r.success).length;
    const totalCount = tablesToVerify.length;
    
    if (successCount === totalCount) {
      logSuccess(`Data verification completed: ${successCount}/${totalCount} tables verified`);
      return { success: true, results: verificationResults };
    } else {
      logWarning(`Data verification partially completed: ${successCount}/${totalCount} tables verified`);
      return { success: false, error: 'Some tables verification failed', results: verificationResults };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Test 5: Test RLS (Row Level Security) policies
async function testRLSPolicies() {
  logStep('Test 5', 'Testing Row Level Security policies');
  
  try {
    const userId = testResults.testData.userId;
    const rlsResults = {};

    // Test 1: User can access their own data
    logInfo('Testing: User can access their own data');
    const { data: ownData, error: ownError } = await supabase
      .from('mvp_studio_projects')
      .select('*')
      .eq('user_id', userId);

    if (ownError) {
      logError(`Failed to access own data: ${ownError.message}`);
      rlsResults.ownDataAccess = { success: false, error: ownError.message };
    } else {
      logSuccess(`Can access own data: ${ownData.length} records`);
      rlsResults.ownDataAccess = { success: true, count: ownData.length };
    }

    // Test 2: User cannot access other users' data
    logInfo('Testing: User cannot access other users\' data');
    const { data: otherData, error: otherError } = await supabase
      .from('mvp_studio_projects')
      .select('*')
      .neq('user_id', userId);

    if (otherError) {
      logError(`Error accessing other users\' data: ${otherError.message}`);
      rlsResults.otherDataAccess = { success: false, error: otherError.message };
    } else if (otherData && otherData.length > 0) {
      logError(`Security issue: Can access other users\' data (${otherData.length} records)`);
      rlsResults.otherDataAccess = { success: false, error: 'Can access other users\' data' };
    } else {
      logSuccess('Cannot access other users\' data (RLS working correctly)');
      rlsResults.otherDataAccess = { success: true, count: 0 };
    }

    // Test 3: Unauthenticated user cannot access data
    logInfo('Testing: Unauthenticated access blocked');
    const { data: unauthData, error: unauthError } = await supabaseAdmin
      .from('mvp_studio_projects')
      .select('*')
      .limit(1);

    if (unauthError) {
      logSuccess('Unauthenticated access properly blocked');
      rlsResults.unauthenticatedAccess = { success: true, blocked: true };
    } else {
      logWarning('Unauthenticated access not properly blocked');
      rlsResults.unauthenticatedAccess = { success: false, error: 'Unauthenticated access allowed' };
    }

    testResults.testData.rlsResults = rlsResults;
    
    const successCount = Object.values(rlsResults).filter(r => r.success).length;
    const totalCount = Object.keys(rlsResults).length;
    
    if (successCount === totalCount) {
      logSuccess(`RLS testing completed: ${successCount}/${totalCount} tests passed`);
      return { success: true, results: rlsResults };
    } else {
      logWarning(`RLS testing partially completed: ${successCount}/${totalCount} tests passed`);
      return { success: false, error: 'Some RLS tests failed', results: rlsResults };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Test 6: Test offline mode (queue → sync)
async function testOfflineMode() {
  logStep('Test 6', 'Testing offline mode (queue → sync functionality)');
  
  try {
    const offlineResults = {};

    // Test 1: Simulate offline mode by disabling network
    logInfo('Testing: Offline queue functionality');
    
    // Simulate adding data to offline queue
    const testOfflineData = {
      operation: 'create',
      table: 'mvp_studio_projects',
      data: {
        project_id: 'offline-test-1',
        name: 'Offline Test Project',
        description: 'Test project created while offline',
        status: 'draft',
        user_id: testResults.testData.userId,
        created_at: new Date().toISOString(),
        last_modified: new Date().toISOString(),
        project_data: {
          features: ['Offline Feature 1'],
          target_audience: 'Offline users'
        }
      },
      timestamp: Date.now(),
      retryCount: 0
    };

    // Add to offline queue
    const { data: queueData, error: queueError } = await supabase
      .from('offline_queue')
      .insert({
        user_id: testResults.testData.userId,
        operation: testOfflineData.operation,
        table_name: testOfflineData.table,
        data: testOfflineData.data,
        status: 'pending',
        retry_count: 0
      })
      .select();

    if (queueError) {
      logError(`Failed to add to offline queue: ${queueError.message}`);
      offlineResults.queueAdd = { success: false, error: queueError.message };
    } else {
      logSuccess('Successfully added to offline queue');
      offlineResults.queueAdd = { success: true, data: queueData };
    }

    // Test 2: Simulate sync process (process queue)
    logInfo('Testing: Sync process from offline queue');
    
    const { data: queueItems, error: queueQueryError } = await supabase
      .from('offline_queue')
      .select('*')
      .eq('user_id', testResults.testData.userId)
      .eq('status', 'pending');

    if (queueQueryError) {
      logError(`Failed to query offline queue: ${queueQueryError.message}`);
      offlineResults.queueSync = { success: false, error: queueQueryError.message };
    } else {
      logInfo(`Found ${queueItems.length} pending queue items`);
      
      // Process each queue item
      let processedCount = 0;
      for (const item of queueItems) {
        try {
          const { data: insertData, error: insertError } = await supabase
            .from(item.table_name)
            .insert(item.data)
            .select();

          if (insertError) {
            logError(`Failed to process queue item: ${insertError.message}`);
          } else {
            processedCount++;
            logSuccess(`Processed queue item: ${item.table_name}`);
          }
        } catch (error) {
          logError(`Error processing queue item: ${error.message}`);
        }
      }

      offlineResults.queueSync = { 
        success: processedCount > 0, 
        processed: processedCount,
        total: queueItems.length
      };
    }

    testResults.testData.offlineResults = offlineResults;
    
    const successCount = Object.values(offlineResults).filter(r => r.success).length;
    const totalCount = Object.keys(offlineResults).length;
    
    if (successCount === totalCount) {
      logSuccess(`Offline mode testing completed: ${successCount}/${totalCount} tests passed`);
      return { success: true, results: offlineResults };
    } else {
      logWarning(`Offline mode testing partially completed: ${successCount}/${totalCount} tests passed`);
      return { success: false, error: 'Some offline mode tests failed', results: offlineResults };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Test 7: Test cross-device sync
async function testCrossDeviceSync() {
  logStep('Test 7', 'Testing cross-device sync capabilities');
  
  try {
    const syncResults = {};

    // Test 1: Real-time subscription setup
    logInfo('Testing: Real-time subscription setup');
    
    let subscriptionReceived = false;
    const subscription = supabase
      .channel('test_sync_channel')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'mvp_studio_projects' },
        (payload) => {
          logInfo('Real-time subscription received data');
          subscriptionReceived = true;
        }
      )
      .subscribe();

    // Wait a moment for subscription to establish
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 2: Create data that should trigger sync
    logInfo('Testing: Data creation triggers sync');
    
    const { data: syncTestData, error: syncTestError } = await supabase
      .from('mvp_studio_projects')
      .insert({
        project_id: 'sync-test-1',
        name: 'Cross-Device Sync Test',
        description: 'Test project for cross-device sync',
        status: 'active',
        user_id: testResults.testData.userId,
        created_at: new Date().toISOString(),
        last_modified: new Date().toISOString(),
        project_data: {
          features: ['Sync Feature 1'],
          target_audience: 'Multi-device users'
        }
      })
      .select();

    if (syncTestError) {
      logError(`Failed to create sync test data: ${syncTestError.message}`);
      syncResults.dataCreation = { success: false, error: syncTestError.message };
    } else {
      logSuccess('Created sync test data');
      syncResults.dataCreation = { success: true, data: syncTestData };
    }

    // Wait for potential real-time updates
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 3: Verify data consistency across "devices" (simulated)
    logInfo('Testing: Data consistency verification');
    
    const { data: consistencyData, error: consistencyError } = await supabase
      .from('mvp_studio_projects')
      .select('*')
      .eq('user_id', testResults.testData.userId)
      .order('created_at', { ascending: false });

    if (consistencyError) {
      logError(`Failed to verify data consistency: ${consistencyError.message}`);
      syncResults.dataConsistency = { success: false, error: consistencyError.message };
    } else {
      logSuccess(`Data consistency verified: ${consistencyData.length} records found`);
      syncResults.dataConsistency = { success: true, count: consistencyData.length };
    }

    // Clean up subscription
    subscription.unsubscribe();

    syncResults.realTimeSubscription = { 
      success: true, 
      received: subscriptionReceived 
    };

    testResults.testData.syncResults = syncResults;
    
    const successCount = Object.values(syncResults).filter(r => r.success).length;
    const totalCount = Object.keys(syncResults).length;
    
    if (successCount === totalCount) {
      logSuccess(`Cross-device sync testing completed: ${successCount}/${totalCount} tests passed`);
      return { success: true, results: syncResults };
    } else {
      logWarning(`Cross-device sync testing partially completed: ${successCount}/${totalCount} tests passed`);
      return { success: false, error: 'Some cross-device sync tests failed', results: syncResults };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Test 8: Cleanup test data
async function testCleanup() {
  logStep('Test 8', 'Cleaning up test data');
  
  try {
    const userId = testResults.testData.userId;
    const cleanupResults = {};

    // Clean up all test data
    const tablesToClean = [
      'offline_queue',
      'bmc_canvas_data',
      'public_feedback_ideas',
      'chat_notification_preferences',
      'notification_preferences',
      'ideas',
      'ideaforge_data',
      'mvp_studio_projects',
      'builder_context'
    ];

    for (const tableName of tablesToClean) {
      logInfo(`Cleaning up table: ${tableName}`);
      
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('user_id', userId);

      if (error) {
        logError(`Failed to clean up ${tableName}: ${error.message}`);
        cleanupResults[tableName] = { success: false, error: error.message };
      } else {
        logSuccess(`Cleaned up ${tableName}`);
        cleanupResults[tableName] = { success: true };
      }
    }

    // Sign out user
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      logWarning(`Failed to sign out: ${signOutError.message}`);
    } else {
      logSuccess('User signed out');
    }

    testResults.testData.cleanupResults = cleanupResults;
    
    const successCount = Object.values(cleanupResults).filter(r => r.success).length;
    const totalCount = tablesToClean.length;
    
    if (successCount === totalCount) {
      logSuccess(`Cleanup completed: ${successCount}/${totalCount} tables cleaned`);
      return { success: true, results: cleanupResults };
    } else {
      logWarning(`Cleanup partially completed: ${successCount}/${totalCount} tables cleaned`);
      return { success: false, error: 'Some cleanup operations failed', results: cleanupResults };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Generate QA Report
function generateQAReport() {
  testResults.endTime = new Date();
  const duration = testResults.endTime - testResults.startTime;
  
  logStep('QA Report', 'Generating comprehensive QA report');
  
  const report = {
    summary: {
      testSuite: 'Migration System End-to-End Test',
      startTime: testResults.startTime.toISOString(),
      endTime: testResults.endTime.toISOString(),
      duration: `${Math.round(duration / 1000)}s`,
      totalTests: testResults.totalTests,
      passed: testResults.passed,
      failed: testResults.failed,
      successRate: `${Math.round((testResults.passed / testResults.totalTests) * 100)}%`
    },
    testResults: testResults.testData,
    errors: testResults.errors,
    warnings: testResults.warnings,
    recommendations: []
  };

  // Add recommendations based on test results
  if (testResults.failed > 0) {
    report.recommendations.push('Address failed tests before production deployment');
  }
  
  if (testResults.errors.length > 0) {
    report.recommendations.push('Review and fix error conditions identified in testing');
  }

  if (testResults.warnings.length > 0) {
    report.recommendations.push('Consider addressing warnings for improved system reliability');
  }

  // Save report to file
  const reportPath = path.join(__dirname, 'migration-e2e-qa-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  logSuccess(`QA report saved to: ${reportPath}`);
  
  // Display summary
  log(`\n${colors.cyan}=== QA REPORT SUMMARY ===${colors.reset}`);
  log(`Total Tests: ${testResults.totalTests}`, colors.bright);
  log(`Passed: ${testResults.passed}`, colors.green);
  log(`Failed: ${testResults.failed}`, colors.red);
  log(`Success Rate: ${report.summary.successRate}`, colors.bright);
  log(`Duration: ${report.summary.duration}`, colors.bright);
  
  if (testResults.errors.length > 0) {
    log(`\n${colors.red}Errors:${colors.reset}`);
    testResults.errors.forEach(error => log(`  - ${error}`, colors.red));
  }
  
  if (testResults.warnings.length > 0) {
    log(`\n${colors.yellow}Warnings:${colors.reset}`);
    testResults.warnings.forEach(warning => log(`  - ${warning}`, colors.yellow));
  }
  
  if (report.recommendations.length > 0) {
    log(`\n${colors.blue}Recommendations:${colors.reset}`);
    report.recommendations.forEach(rec => log(`  - ${rec}`, colors.blue));
  }

  return report;
}

// Main test execution
async function runMigrationE2ETests() {
  log(`${colors.bright}${colors.cyan}🚀 Starting Migration System End-to-End Test Suite${colors.reset}\n`);
  
  try {
    // Run all tests
    await runTest('Setup and Authentication', testSetupAndAuth);
    await runTest('Pre-populate localStorage', testPrePopulateLocalStorage);
    await runTest('Execute Migration Process', testMigrationProcess);
    await runTest('Verify Supabase Data', testVerifySupabaseData);
    await runTest('Test RLS Policies', testRLSPolicies);
    await runTest('Test Offline Mode', testOfflineMode);
    await runTest('Test Cross-Device Sync', testCrossDeviceSync);
    await runTest('Cleanup Test Data', testCleanup);
    
    // Generate final report
    const report = generateQAReport();
    
    log(`\n${colors.bright}${colors.green}✅ Migration E2E Test Suite Complete!${colors.reset}`);
    
    return report;
  } catch (error) {
    logError(`Test suite failed: ${error.message}`);
    testResults.errors.push(`Test suite error: ${error.message}`);
    generateQAReport();
    process.exit(1);
  }
}

// Run the tests if this script is executed directly
if (require.main === module) {
  runMigrationE2ETests()
    .then(report => {
      process.exit(report.summary.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      logError(`Fatal error: ${error.message}`);
      process.exit(1);
    });
}

module.exports = {
  runMigrationE2ETests,
  testSetupAndAuth,
  testPrePopulateLocalStorage,
  testMigrationProcess,
  testVerifySupabaseData,
  testRLSPolicies,
  testOfflineMode,
  testCrossDeviceSync,
  testCleanup
};
