-- Automated Feedback System Migration
-- Run this SQL in your Supabase SQL Editor (Dashboard → SQL Editor)

-- =============================================
-- 1. CREATE IDEAS TABLE
-- =============================================
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

-- =============================================
-- 2. CREATE PUBLIC FEEDBACK TABLE
-- =============================================
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

-- =============================================
-- 3. CREATE IDEA COLLABORATIONS TABLE
-- =============================================
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

-- =============================================
-- 4. CREATE PERFORMANCE INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_ideas_public ON ideas(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_ideas_user_id ON ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas(created_at);
CREATE INDEX IF NOT EXISTS idx_public_feedback_idea_id ON public_feedback(idea_id);
CREATE INDEX IF NOT EXISTS idx_public_feedback_created_at ON public_feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_idea_collaborations_idea_id ON idea_collaborations(idea_id);

-- =============================================
-- 5. ENABLE ROW LEVEL SECURITY
-- =============================================
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_collaborations ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 6. CREATE RLS POLICIES FOR IDEAS
-- =============================================
-- Users can view their own ideas
CREATE POLICY "Users can view their own ideas" ON ideas
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own ideas
CREATE POLICY "Users can insert their own ideas" ON ideas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own ideas
CREATE POLICY "Users can update their own ideas" ON ideas
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own ideas
CREATE POLICY "Users can delete their own ideas" ON ideas
  FOR DELETE USING (auth.uid() = user_id);

-- Anyone can view public ideas
CREATE POLICY "Anyone can view public ideas" ON ideas
  FOR SELECT USING (is_public = true);

-- =============================================
-- 7. CREATE RLS POLICIES FOR PUBLIC FEEDBACK
-- =============================================
-- Anyone can view public feedback
CREATE POLICY "Anyone can view public feedback" ON public_feedback
  FOR SELECT USING (true);

-- Anyone can insert public feedback
CREATE POLICY "Anyone can insert public feedback" ON public_feedback
  FOR INSERT WITH CHECK (true);

-- Users can update their own feedback
CREATE POLICY "Users can update their own feedback" ON public_feedback
  FOR UPDATE USING (auth.uid() = user_id OR is_anonymous = true);

-- Users can delete their own feedback
CREATE POLICY "Users can delete their own feedback" ON public_feedback
  FOR DELETE USING (auth.uid() = user_id OR is_anonymous = true);

-- =============================================
-- 8. CREATE RLS POLICIES FOR COLLABORATIONS
-- =============================================
-- Users can view collaborations on their ideas
CREATE POLICY "Users can view collaborations on their ideas" ON idea_collaborations
  FOR SELECT USING (
    auth.uid() = user_id OR 
    idea_id IN (SELECT id FROM ideas WHERE user_id = auth.uid())
  );

-- Users can insert collaborations
CREATE POLICY "Users can insert collaborations" ON idea_collaborations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own collaborations
CREATE POLICY "Users can update their own collaborations" ON idea_collaborations
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own collaborations
CREATE POLICY "Users can delete their own collaborations" ON idea_collaborations
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 9. CREATE UPDATE TRIGGERS
-- =============================================
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

-- =============================================
-- 10. VERIFICATION QUERIES
-- =============================================
-- Check if tables were created successfully
SELECT 
  'ideas' as table_name,
  COUNT(*) as row_count
FROM ideas
UNION ALL
SELECT 
  'public_feedback' as table_name,
  COUNT(*) as row_count
FROM public_feedback
UNION ALL
SELECT 
  'idea_collaborations' as table_name,
  COUNT(*) as row_count
FROM idea_collaborations;

-- Check if indexes were created
SELECT 
  indexname,
  tablename
FROM pg_indexes 
WHERE tablename IN ('ideas', 'public_feedback', 'idea_collaborations')
ORDER BY tablename, indexname;

-- Check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('ideas', 'public_feedback', 'idea_collaborations')
ORDER BY tablename;
