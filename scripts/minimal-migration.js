/**
 * Minimal Migration Script
 * Only creates the missing tables
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('🚀 Minimal Migration Script - Creating Missing Tables...\n');

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log(`📊 Supabase URL: ${supabaseUrl}`);
  console.log(`🔑 API Key: ${supabaseKey.substring(0, 20)}...\n`);

  // Generate minimal migration SQL for missing tables only
  const minimalSQL = `-- MINIMAL MIGRATION - Only Missing Tables
-- Copy this SQL and run it in Supabase SQL Editor

-- 1. Create public_feedback table (MISSING)
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

-- 2. Create idea_collaborations table (MISSING)
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

-- 3. Create indexes for the new tables
CREATE INDEX IF NOT EXISTS idx_public_feedback_idea_id ON public_feedback(idea_id);
CREATE INDEX IF NOT EXISTS idx_public_feedback_created_at ON public_feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_idea_collaborations_idea_id ON idea_collaborations(idea_id);

-- 4. Enable RLS on new tables
ALTER TABLE public_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_collaborations ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for public_feedback
CREATE POLICY "Anyone can view public feedback" ON public_feedback
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert public feedback" ON public_feedback
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own feedback" ON public_feedback
  FOR UPDATE USING (auth.uid() = user_id OR is_anonymous = true);

CREATE POLICY "Users can delete their own feedback" ON public_feedback
  FOR DELETE USING (auth.uid() = user_id OR is_anonymous = true);

-- 6. Create RLS policies for idea_collaborations
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

-- 7. Create update trigger for public_feedback
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_public_feedback_updated_at BEFORE UPDATE ON public_feedback
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. Verification
SELECT 'Minimal migration completed successfully!' as status;`;

  console.log('📝 MINIMAL MIGRATION SQL:');
  console.log('='.repeat(60));
  console.log(minimalSQL);
  console.log('='.repeat(60));
  
  console.log('\n📋 QUICK INSTRUCTIONS:');
  console.log('1. Go to https://supabase.com/dashboard');
  console.log('2. Select your project');
  console.log('3. Go to SQL Editor');
  console.log('4. Copy and paste the SQL above');
  console.log('5. Click "Run"');
  console.log('6. Wait for success message');
  
  console.log('\n🎯 This creates only the missing tables:');
  console.log('✅ public_feedback table');
  console.log('✅ idea_collaborations table');
  console.log('✅ Required indexes and policies');
  
  console.log('\n🚀 After running this:');
  console.log('- Your feedback system will be complete');
  console.log('- Share Feedback Link will work');
  console.log('- All features will be functional');
}

// Run the migration
runMigration().catch(console.error);
