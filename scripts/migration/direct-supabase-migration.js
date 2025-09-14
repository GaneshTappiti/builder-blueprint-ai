/**
 * Direct Supabase Migration
 * Attempts to create tables directly using Supabase client
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('🚀 Starting Direct Supabase Migration...\n');

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔍 Testing Supabase connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('pg_tables')
      .select('tablename')
      .limit(1);

    if (error) {
      console.log('⚠️  Connection test failed:', error.message);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.log('❌ Connection test failed:', error.message);
    return false;
  }
}

async function checkExistingTables() {
  console.log('\n🔍 Checking existing tables...');
  
  const tables = ['ideas', 'public_feedback', 'idea_collaborations'];
  const existingTables = [];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .limit(1);
      
      if (!error) {
        existingTables.push(table);
        console.log(`✅ Table '${table}' already exists`);
      } else {
        console.log(`⚠️  Table '${table}' not found`);
      }
    } catch (error) {
      console.log(`⚠️  Table '${table}' not found`);
    }
  }
  
  return existingTables;
}

async function createTestData() {
  console.log('\n🧪 Creating test data...');
  
  try {
    // Create a test idea
    const { data: ideaData, error: ideaError } = await supabase
      .from('ideas')
      .insert({
        title: 'Test Idea for Migration',
        description: 'This is a test idea created during migration',
        content: 'Test content for migration verification',
        is_public: true,
        status: 'published'
      })
      .select()
      .single();

    if (ideaError) {
      console.log('❌ Failed to create test idea:', ideaError.message);
      return null;
    }

    console.log('✅ Test idea created:', ideaData.id);

    // Create test feedback
    const { data: feedbackData, error: feedbackError } = await supabase
      .from('public_feedback')
      .insert({
        idea_id: ideaData.id,
        feedback_type: 'comment',
        content: 'Test feedback for migration verification',
        rating: 5,
        is_anonymous: true
      })
      .select()
      .single();

    if (feedbackError) {
      console.log('❌ Failed to create test feedback:', feedbackError.message);
      return ideaData;
    }

    console.log('✅ Test feedback created:', feedbackData.id);
    return ideaData;

  } catch (error) {
    console.log('❌ Error creating test data:', error.message);
    return null;
  }
}

async function cleanupTestData(ideaId) {
  if (!ideaId) return;
  
  console.log('\n🧹 Cleaning up test data...');
  
  try {
    // Delete test feedback
    await supabase
      .from('public_feedback')
      .delete()
      .eq('idea_id', ideaId);

    // Delete test idea
    await supabase
      .from('ideas')
      .delete()
      .eq('id', ideaId);

    console.log('✅ Test data cleaned up');
  } catch (error) {
    console.log('⚠️  Error cleaning up test data:', error.message);
  }
}

async function runMigration() {
  console.log(`📊 Supabase URL: ${supabaseUrl}`);
  console.log(`🔑 API Key: ${supabaseKey.substring(0, 20)}...\n`);

  // Test connection
  const connected = await testConnection();
  if (!connected) {
    console.log('\n❌ Cannot proceed without Supabase connection');
    console.log('Please check your environment variables and try again.');
    return;
  }

  // Check existing tables
  const existingTables = await checkExistingTables();
  
  if (existingTables.length === 3) {
    console.log('\n🎉 All tables already exist! Migration not needed.');
    
    // Test the tables by creating test data
    const testIdea = await createTestData();
    if (testIdea) {
      console.log('✅ Tables are working correctly!');
      await cleanupTestData(testIdea.id);
    }
    
    return;
  }

  console.log('\n📝 Tables need to be created. Please run the SQL migration manually:');
  console.log('1. Go to https://supabase.com/dashboard');
  console.log('2. Select your project');
  console.log('3. Go to SQL Editor');
  console.log('4. Run the migration SQL from the quick-migration.js script');
  console.log('5. Then run this script again to verify');
}

// Run the migration
runMigration().catch(console.error);
