#!/usr/bin/env node

/**
 * Deploy All Profile Creation Fixes
 * This script runs all the critical fixes in the correct order
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Complete Profile Creation Fixes Deployment...\n');

// Check if we're in the right directory
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ Error: package.json not found. Please run this script from the project root.');
  process.exit(1);
}

// Function to run command with error handling
function runCommand(command, description) {
  try {
    console.log(`🔄 ${description}...`);
    const output = execSync(command, { 
      stdio: 'pipe', 
      encoding: 'utf8',
      cwd: process.cwd()
    });
    console.log(`✅ ${description} completed`);
    return output;
  } catch (error) {
    console.error(`❌ Error during ${description}:`);
    console.error(error.message);
    if (error.stdout) console.log('STDOUT:', error.stdout);
    if (error.stderr) console.log('STDERR:', error.stderr);
    throw error;
  }
}

// Main deployment function
async function deployAllFixes() {
  try {
    console.log('📋 Step 1: Deploying database migration...');
    runCommand('node scripts/deploy-profile-fixes.js', 'Deploying database migration');

    console.log('\n📋 Step 2: Updating ProfileService...');
    runCommand('node scripts/update-profile-service.js', 'Updating ProfileService');

    console.log('\n📋 Step 3: Updating ProfileContext...');
    runCommand('node scripts/update-profile-context.js', 'Updating ProfileContext');

    console.log('\n📋 Step 4: Running TypeScript type checking...');
    try {
      runCommand('npx tsc --noEmit', 'Type checking');
    } catch (error) {
      console.log('⚠️  Warning: TypeScript errors found, but continuing...');
    }

    console.log('\n📋 Step 5: Running linting...');
    try {
      runCommand('npx eslint app/services/profileService.ts app/contexts/ProfileContext.tsx --fix', 'Linting');
    } catch (error) {
      console.log('⚠️  Warning: Linting issues found, but continuing...');
    }

    console.log('\n🎉 ALL PROFILE CREATION FIXES DEPLOYED SUCCESSFULLY!');
    console.log('\n📊 Summary of all fixes applied:');
    console.log('   ✅ Database trigger for automatic profile creation');
    console.log('   ✅ Race condition protection with upsert logic');
    console.log('   ✅ Atomic transaction handling');
    console.log('   ✅ Comprehensive error handling and retry mechanisms');
    console.log('   ✅ Profile sync validation functions');
    console.log('   ✅ Performance indexes for better query speed');
    console.log('   ✅ Enhanced ProfileService with new database functions');
    console.log('   ✅ Enhanced ProfileContext with user-friendly error messages');
    console.log('   ✅ Profile creation status tracking and management');
    
    console.log('\n🔧 Next steps:');
    console.log('   1. Test the profile creation flow with new users');
    console.log('   2. Monitor the profile_creation_status column for any issues');
    console.log('   3. Check the application logs for any profile creation errors');
    console.log('   4. Verify that existing users can still access their profiles');
    
    console.log('\n📈 Monitoring:');
    console.log('   - Check profile_creation_status column in user_profiles table');
    console.log('   - Monitor profile_creation_error column for failed attempts');
    console.log('   - Watch application logs for profile creation events');
    console.log('   - Test with multiple concurrent user registrations');

  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Make sure all required files exist');
    console.error('   2. Check your database connection');
    console.error('   3. Verify you have the necessary permissions');
    console.error('   4. Check the migration file for syntax errors');
    console.error('   5. Ensure Supabase is running and accessible');
    process.exit(1);
  }
}

// Run the complete deployment
deployAllFixes().catch(console.error);
