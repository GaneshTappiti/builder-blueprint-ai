-- Create ideas table for the idea vault feature
-- This migration creates the necessary table for idea management with privacy and team collaboration features

-- Create ideas table
CREATE TABLE IF NOT EXISTS ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) DEFAULT 'general',
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'validated', 'exploring', 'archived')),
  tags TEXT[] DEFAULT '{}',
  votes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  validation_score INTEGER CHECK (validation_score >= 0 AND validation_score <= 100),
  market_opportunity TEXT,
  risk_assessment TEXT,
  monetization_strategy TEXT,
  key_features TEXT[] DEFAULT '{}',
  next_steps TEXT[] DEFAULT '{}',
  competitor_analysis TEXT,
  target_market TEXT,
  problem_statement TEXT,
  
  -- Privacy and team settings
  is_private BOOLEAN DEFAULT true,
  team_id UUID,
  visibility VARCHAR(20) DEFAULT 'private' CHECK (visibility IN ('private', 'team')),
  
  -- Team collaboration features (stored as JSONB for flexibility)
  team_comments JSONB DEFAULT '[]',
  team_suggestions JSONB DEFAULT '[]',
  team_status VARCHAR(20) DEFAULT 'under_review' CHECK (team_status IN ('under_review', 'in_progress', 'approved', 'rejected')),
  last_modified_by UUID,
  
  -- Standard fields
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ideas_user_id ON ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_ideas_is_private ON ideas(is_private);
CREATE INDEX IF NOT EXISTS idx_ideas_visibility ON ideas(visibility);
CREATE INDEX IF NOT EXISTS idx_ideas_team_id ON ideas(team_id);
CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status);
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas(created_at);
CREATE INDEX IF NOT EXISTS idx_ideas_updated_at ON ideas(updated_at);

-- Create GIN index for JSONB columns for better query performance
CREATE INDEX IF NOT EXISTS idx_ideas_team_comments_gin ON ideas USING GIN (team_comments);
CREATE INDEX IF NOT EXISTS idx_ideas_team_suggestions_gin ON ideas USING GIN (team_suggestions);

-- Create updated_at trigger
CREATE TRIGGER update_ideas_updated_at 
    BEFORE UPDATE ON ideas 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for ideas
-- Users can view their own private ideas and all team ideas
CREATE POLICY "Users can view own private ideas and all team ideas" ON ideas
    FOR SELECT USING (
        auth.uid() = user_id OR 
        (is_private = false)
    );

-- Users can insert their own ideas
CREATE POLICY "Users can insert own ideas" ON ideas
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own ideas
CREATE POLICY "Users can update own ideas" ON ideas
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own ideas
CREATE POLICY "Users can delete own ideas" ON ideas
    FOR DELETE USING (auth.uid() = user_id);

-- Team members can update team ideas (for collaboration features)
CREATE POLICY "Team members can update team ideas" ON ideas
    FOR UPDATE USING (
        is_private = false AND 
        (auth.uid() = user_id OR auth.uid() = last_modified_by)
    );

-- Comments for documentation
COMMENT ON TABLE ideas IS 'Stores user ideas with privacy and team collaboration features';
COMMENT ON COLUMN ideas.is_private IS 'Whether the idea is private (true) or shared with team (false)';
COMMENT ON COLUMN ideas.visibility IS 'Visibility level: private or team';
COMMENT ON COLUMN ideas.team_comments IS 'JSONB array of team comments';
COMMENT ON COLUMN ideas.team_suggestions IS 'JSONB array of team suggestions';
COMMENT ON COLUMN ideas.team_status IS 'Current team review status';
COMMENT ON COLUMN ideas.validation_score IS 'Idea validation score (0-100)';
