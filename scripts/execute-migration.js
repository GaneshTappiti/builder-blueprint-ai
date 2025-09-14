/**
 * Execute Feedback System Migration Directly
 * This script will directly create the tables in your Supabase database
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('🚀 Executing Direct Migration to Supabase...\n');

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Migration SQL statements
const migrations = [
  {
    name: 'Create Ideas Table',
    sql: `
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
    `
  },
  {
    name: 'Create Public Feedback Table',
    sql: `
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
    `
  },
  {
    name: 'Create Idea Collaborations Table',
    sql: `
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
    `
  },
  {
    name: 'Create Performance Indexes',
    sql: `
      CREATE INDEX IF NOT EXISTS idx_ideas_public ON ideas(is_public) WHERE is_public = true;
      CREATE INDEX IF NOT EXISTS idx_ideas_user_id ON ideas(user_id);
      CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas(created_at);
      CREATE INDEX IF NOT EXISTS idx_public_feedback_idea_id ON public_feedback(idea_id);
      CREATE INDEX IF NOT EXISTS idx_public_feedback_created_at ON public_feedback(created_at);
      CREATE INDEX IF NOT EXISTS idx_idea_collaborations_idea_id ON idea_collaborations(idea_id);
    `
  },
  {
    name: 'Enable Row Level Security',
    sql: `
      ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public_feedback ENABLE ROW LEVEL SECURITY;
      ALTER TABLE idea_collaborations ENABLE ROW LEVEL SECURITY;
    `
  },
  {
    name: 'Create RLS Policies for Ideas',
    sql: `
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
    `
  },
  {
    name: 'Create RLS Policies for Public Feedback',
    sql: `
      CREATE POLICY "Anyone can view public feedback" ON public_feedback
        FOR SELECT USING (true);
      
      CREATE POLICY "Anyone can insert public feedback" ON public_feedback
        FOR INSERT WITH CHECK (true);
      
      CREATE POLICY "Users can update their own feedback" ON public_feedback
        FOR UPDATE USING (auth.uid() = user_id OR is_anonymous = true);
      
      CREATE POLICY "Users can delete their own feedback" ON public_feedback
        FOR DELETE USING (auth.uid() = user_id OR is_anonymous = true);
    `
  },
  {
    name: 'Create RLS Policies for Collaborations',
    sql: `
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
    `
  },
  {
    name: 'Create Update Triggers',
    sql: `
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
    `
  }
];

async function runMigration() {
  console.log(`📊 Supabase URL: ${supabaseUrl}`);
  console.log(`🔑 API Key: ${supabaseKey.substring(0, 20)}...\n`);

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const migration of migrations) {
    console.log(`📝 Running: ${migration.name}...`);
    
    try {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: migration.sql
      });

      if (error) {
        // Some errors are expected (like table already exists)
        if (error.message.includes('already exists') || 
            error.message.includes('already defined') ||
            error.message.includes('duplicate key')) {
          console.log(`⚠️  ${migration.name} - Already exists (skipped)`);
          skipCount++;
        } else {
          console.log(`❌ ${migration.name} - Failed: ${error.message}`);
          errorCount++;
        }
      } else {
        console.log(`✅ ${migration.name} - Success`);
        successCount++;
      }
    } catch (error) {
      console.log(`❌ ${migration.name} - Error: ${error.message}`);
      errorCount++;
    }
  }

  console.log('\n📋 MIGRATION SUMMARY');
  console.log('===================');
  console.log(`✅ Successful: ${successCount}`);
  console.log(`⚠️  Skipped: ${skipCount}`);
  console.log(`❌ Failed: ${errorCount}`);

  if (errorCount === 0) {
    console.log('\n🎉 Migration completed successfully!');
    console.log('🚀 Your feedback system is now connected to Supabase!');
    
    // Test the connection
    console.log('\n🔍 Testing connection...');
    try {
      const { data, error } = await supabase
        .from('ideas')
        .select('count')
        .limit(1);
      
      if (error) {
        console.log('⚠️  Connection test failed:', error.message);
      } else {
        console.log('✅ Connection test successful!');
      }
    } catch (error) {
      console.log('⚠️  Connection test failed:', error.message);
    }
  } else {
    console.log('\n⚠️  Some migrations failed. Please check the errors above.');
  }
}

// Run the migration
runMigration().catch(console.error);
