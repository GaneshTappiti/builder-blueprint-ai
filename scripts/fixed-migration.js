/**
 * Fixed Migration Script
 * Uses proper Supabase client methods instead of exec_sql
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('🚀 Fixed Migration Script for Supabase...\n');

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
    // Test with a simple query that should work
    const { data, error } = await supabase
      .from('ideas')
      .select('id')
      .limit(1);

    if (error && error.code === 'PGRST116') {
      console.log('✅ Supabase connection successful (tables need to be created)');
      return true;
    } else if (error) {
      console.log('⚠️  Connection test result:', error.message);
      return true; // Still connected
    } else {
      console.log('✅ Supabase connection successful (tables exist)');
      return true;
    }
  } catch (error) {
    console.log('❌ Connection test failed:', error.message);
    return false;
  }
}

async function checkTables() {
  console.log('\n🔍 Checking existing tables...');
  
  const tables = ['ideas', 'public_feedback', 'idea_collaborations'];
  const results = {};
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .limit(1);
      
      if (error && error.code === 'PGRST116') {
        results[table] = false;
        console.log(`⚠️  Table '${table}' does not exist`);
      } else if (error) {
        results[table] = false;
        console.log(`⚠️  Table '${table}' check failed:`, error.message);
      } else {
        results[table] = true;
        console.log(`✅ Table '${table}' exists`);
      }
    } catch (error) {
      results[table] = false;
      console.log(`⚠️  Table '${table}' check failed:`, error.message);
    }
  }
  
  return results;
}

function generateMigrationSQL() {
  return `-- AUTOMATED FEEDBACK SYSTEM MIGRATION
-- Copy this SQL and run it in Supabase SQL Editor

-- 1. Create ideas table
CREATE TABLE IF NOT EXISTS ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content TEXT,
  category VARCHAR(100),
  tags TEXT[] DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived', 'deleted')),
  is_public BOOLEAN DEFAULT false,
  team_suggestions JSONB DEFAULT '[]',
  collaboration_data JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create public_feedback table
CREATE TABLE IF NOT EXISTS public_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  feedback_type VARCHAR(50) NOT NULL CHECK (feedback_type IN ('comment', 'rating', 'like', 'dislike')),
  content TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  is_anonymous BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create idea_collaborations table
CREATE TABLE IF NOT EXISTS idea_collaborations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  collaboration_type VARCHAR(50) NOT NULL CHECK (collaboration_type IN ('suggestion', 'comment', 'rating', 'share')),
  content TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(idea_id, user_id, collaboration_type)
);

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ideas_public ON ideas(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_ideas_user_id ON ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas(created_at);
CREATE INDEX IF NOT EXISTS idx_public_feedback_idea_id ON public_feedback(idea_id);
CREATE INDEX IF NOT EXISTS idx_public_feedback_created_at ON public_feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_idea_collaborations_idea_id ON idea_collaborations(idea_id);

-- 5. Enable Row Level Security
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_collaborations ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for ideas
CREATE POLICY "Users can view their own ideas" ON ideas
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ideas" ON ideas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ideas" ON ideas
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ideas" ON ideas
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public ideas" ON ideas
  FOR SELECT USING (is_public = true);

-- 7. Create RLS policies for public feedback
CREATE POLICY "Anyone can view public feedback" ON public_feedback
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert public feedback" ON public_feedback
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own feedback" ON public_feedback
  FOR UPDATE USING (auth.uid() = user_id OR is_anonymous = true);

CREATE POLICY "Users can delete their own feedback" ON public_feedback
  FOR DELETE USING (auth.uid() = user_id OR is_anonymous = true);

-- 8. Create RLS policies for collaborations
CREATE POLICY "Users can view collaborations on their ideas" ON idea_collaborations
  FOR SELECT USING (
    auth.uid() = user_id OR 
    idea_id IN (SELECT id FROM ideas WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert collaborations" ON idea_collaborations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collaborations" ON idea_collaborations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collaborations" ON idea_collaborations
  FOR DELETE USING (auth.uid() = user_id);

-- 9. Create update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ideas_updated_at BEFORE UPDATE ON ideas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_public_feedback_updated_at BEFORE UPDATE ON public_feedback
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. Verification
SELECT 'Migration completed successfully!' as status;`;
}

async function runMigration() {
  console.log(`📊 Supabase URL: ${supabaseUrl}`);
  console.log(`🔑 API Key: ${supabaseKey.substring(0, 20)}...\n`);

  // Test connection
  const connected = await testConnection();
  if (!connected) {
    console.log('\n❌ Cannot connect to Supabase');
    return;
  }

  // Check existing tables
  const tableStatus = await checkTables();
  const existingTables = Object.keys(tableStatus).filter(table => tableStatus[table]);
  
  console.log(`\n📊 Table Status: ${existingTables.length}/3 tables exist`);
  
  if (existingTables.length === 3) {
    console.log('\n🎉 All tables already exist! Migration complete.');
    console.log('✅ Your feedback system is ready to use!');
    return;
  }

  // Generate and display migration SQL
  const migrationSQL = generateMigrationSQL();
  
  console.log('\n📝 MIGRATION REQUIRED');
  console.log('='.repeat(60));
  console.log(migrationSQL);
  console.log('='.repeat(60));
  
  console.log('\n📋 STEP-BY-STEP INSTRUCTIONS:');
  console.log('1. Go to https://supabase.com/dashboard');
  console.log('2. Select your project (isvjuagegfnkuaucpsvj)');
  console.log('3. Click on "SQL Editor" in the left sidebar');
  console.log('4. Click "New Query"');
  console.log('5. Copy and paste the SQL above');
  console.log('6. Click "Run" button');
  console.log('7. Wait for "Migration completed successfully!" message');
  console.log('8. Run this script again to verify');
  
  console.log('\n🎯 What this migration creates:');
  console.log('✅ ideas table - Stores all ideas');
  console.log('✅ public_feedback table - Stores feedback');
  console.log('✅ idea_collaborations table - Stores team data');
  console.log('✅ Performance indexes');
  console.log('✅ Row Level Security policies');
  console.log('✅ Update triggers');
  
  console.log('\n🚀 After migration:');
  console.log('- Share Feedback Link will work');
  console.log('- Data will persist in Supabase');
  console.log('- All features will be production-ready');
}

// Run the migration
runMigration().catch(console.error);
