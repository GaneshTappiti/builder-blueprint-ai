/**
 * Simple Feedback System Migration
 * Creates the necessary tables for the feedback system
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

console.log('🚀 Starting Simple Feedback System Migration...\n');

// Check environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please check your .env.local file contains:');
  console.error('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key');
  process.exit(1);
}

console.log('✅ Environment variables found');
console.log(`📊 Supabase URL: ${supabaseUrl}`);
console.log(`🔑 API Key: ${supabaseKey.substring(0, 20)}...\n`);

// SQL migration statements
const migrationSQL = `
-- Create ideas table for Idea Vault system
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

-- Create public_feedback table for public feedback system
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

-- Create idea_collaborations table for team collaboration
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ideas_public ON ideas(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_ideas_user_id ON ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas(created_at);
CREATE INDEX IF NOT EXISTS idx_public_feedback_idea_id ON public_feedback(idea_id);
CREATE INDEX IF NOT EXISTS idx_public_feedback_created_at ON public_feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_idea_collaborations_idea_id ON idea_collaborations(idea_id);

-- Enable RLS on all tables
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_collaborations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for ideas
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

-- Create RLS policies for public feedback
CREATE POLICY "Anyone can view public feedback" ON public_feedback
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert public feedback" ON public_feedback
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own feedback" ON public_feedback
  FOR UPDATE USING (auth.uid() = user_id OR is_anonymous = true);

CREATE POLICY "Users can delete their own feedback" ON public_feedback
  FOR DELETE USING (auth.uid() = user_id OR is_anonymous = true);

-- Create RLS policies for collaborations
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

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_ideas_updated_at BEFORE UPDATE ON ideas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_public_feedback_updated_at BEFORE UPDATE ON public_feedback
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

console.log('📝 Migration SQL prepared');
console.log('📋 This migration will create:');
console.log('   - ideas table (for storing public ideas)');
console.log('   - public_feedback table (for storing feedback)');
console.log('   - idea_collaborations table (for team collaboration)');
console.log('   - Performance indexes');
console.log('   - Row Level Security policies');
console.log('   - Update triggers');
console.log('');

console.log('🔧 To run this migration:');
console.log('1. Go to your Supabase Dashboard');
console.log('2. Navigate to SQL Editor');
console.log('3. Copy and paste the SQL below:');
console.log('');
console.log('=' * 60);
console.log(migrationSQL);
console.log('=' * 60);
console.log('');
console.log('4. Click "Run" to execute the migration');
console.log('');
console.log('✅ After running the migration, your feedback system will be ready!');
console.log('🚀 You can then test the Share Feedback Link functionality.');
