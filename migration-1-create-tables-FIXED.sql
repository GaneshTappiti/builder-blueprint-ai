-- Create missing tables for proper Supabase integration
-- This migration creates all necessary tables for the application

-- First, create the update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create audit_logs table for comprehensive audit trail
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event VARCHAR(100) NOT NULL,
  data JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  service VARCHAR(100) NOT NULL,
  version VARCHAR(20) DEFAULT '1.0.0',
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_files table for file attachments in chat
CREATE TABLE IF NOT EXISTS chat_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  file_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ideas table for Idea Vault system
CREATE TABLE IF NOT EXISTS ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
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

-- Create bmc_data table for Business Model Canvas
CREATE TABLE IF NOT EXISTS bmc_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  canvas_data JSONB DEFAULT '{}',
  wiki_sections JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create builder_context table for Builder Context
CREATE TABLE IF NOT EXISTS builder_context (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_name VARCHAR(255) NOT NULL,
  project_data JSONB DEFAULT '{}',
  app_ideas JSONB DEFAULT '[]',
  builder_state JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ai_interactions table for AI service logging
CREATE TABLE IF NOT EXISTS ai_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  service VARCHAR(50) NOT NULL CHECK (service IN ('gemini', 'openai', 'claude', 'other')),
  request_type VARCHAR(100) NOT NULL,
  request_data JSONB DEFAULT '{}',
  response_data JSONB DEFAULT '{}',
  tokens_used INTEGER DEFAULT 0,
  cost DECIMAL(10, 4) DEFAULT 0,
  duration_ms INTEGER DEFAULT 0,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create file_storage table for Supabase Storage integration
CREATE TABLE IF NOT EXISTS file_storage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT,
  bucket_name VARCHAR(100) NOT NULL,
  is_public BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_event ON audit_logs(event);
CREATE INDEX IF NOT EXISTS idx_audit_logs_service ON audit_logs(service);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_chat_files_message_id ON chat_files(message_id);
CREATE INDEX IF NOT EXISTS idx_chat_files_uploaded_by ON chat_files(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_chat_files_created_at ON chat_files(created_at);

CREATE INDEX IF NOT EXISTS idx_ideas_user_id ON ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status);
CREATE INDEX IF NOT EXISTS idx_ideas_is_public ON ideas(is_public);
CREATE INDEX IF NOT EXISTS idx_ideas_category ON ideas(category);
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas(created_at);

CREATE INDEX IF NOT EXISTS idx_idea_collaborations_idea_id ON idea_collaborations(idea_id);
CREATE INDEX IF NOT EXISTS idx_idea_collaborations_user_id ON idea_collaborations(user_id);
CREATE INDEX IF NOT EXISTS idx_idea_collaborations_type ON idea_collaborations(collaboration_type);

CREATE INDEX IF NOT EXISTS idx_public_feedback_idea_id ON public_feedback(idea_id);
CREATE INDEX IF NOT EXISTS idx_public_feedback_user_id ON public_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_public_feedback_type ON public_feedback(feedback_type);
CREATE INDEX IF NOT EXISTS idx_public_feedback_created_at ON public_feedback(created_at);

CREATE INDEX IF NOT EXISTS idx_bmc_data_user_id ON bmc_data(user_id);
CREATE INDEX IF NOT EXISTS idx_bmc_data_is_public ON bmc_data(is_public);
CREATE INDEX IF NOT EXISTS idx_bmc_data_created_at ON bmc_data(created_at);

CREATE INDEX IF NOT EXISTS idx_builder_context_user_id ON builder_context(user_id);
CREATE INDEX IF NOT EXISTS idx_builder_context_created_at ON builder_context(created_at);

CREATE INDEX IF NOT EXISTS idx_ai_interactions_user_id ON ai_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_service ON ai_interactions(service);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_created_at ON ai_interactions(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_success ON ai_interactions(success);

CREATE INDEX IF NOT EXISTS idx_file_storage_user_id ON file_storage(user_id);
CREATE INDEX IF NOT EXISTS idx_file_storage_bucket_name ON file_storage(bucket_name);
CREATE INDEX IF NOT EXISTS idx_file_storage_is_public ON file_storage(is_public);
CREATE INDEX IF NOT EXISTS idx_file_storage_created_at ON file_storage(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE bmc_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE builder_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_storage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for audit_logs
CREATE POLICY "Users can view their own audit logs" ON audit_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- RLS Policies for chat_files
CREATE POLICY "Users can view files for messages they can see" ON chat_files
  FOR SELECT USING (
    message_id IN (
      SELECT id FROM chat_messages 
      WHERE channel_id IN (
        SELECT channel_id FROM channel_members 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can upload files for their messages" ON chat_files
  FOR INSERT WITH CHECK (
    uploaded_by = auth.uid() AND
    message_id IN (
      SELECT id FROM chat_messages 
      WHERE sender_id = auth.uid()
    )
  );

-- RLS Policies for ideas
CREATE POLICY "Users can manage their own ideas" ON ideas
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view public ideas" ON ideas
  FOR SELECT USING (is_public = true);

-- RLS Policies for idea_collaborations
CREATE POLICY "Users can manage their own collaborations" ON idea_collaborations
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view collaborations for ideas they can see" ON idea_collaborations
  FOR SELECT USING (
    idea_id IN (
      SELECT id FROM ideas 
      WHERE user_id = auth.uid() OR is_public = true
    )
  );

-- RLS Policies for public_feedback
CREATE POLICY "Users can manage their own feedback" ON public_feedback
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view public feedback" ON public_feedback
  FOR SELECT USING (true);

-- RLS Policies for bmc_data
CREATE POLICY "Users can manage their own BMC data" ON bmc_data
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view public BMC data" ON bmc_data
  FOR SELECT USING (is_public = true);

-- RLS Policies for builder_context
CREATE POLICY "Users can manage their own builder context" ON builder_context
  FOR ALL USING (user_id = auth.uid());

-- RLS Policies for ai_interactions
CREATE POLICY "Users can view their own AI interactions" ON ai_interactions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert AI interactions" ON ai_interactions
  FOR INSERT WITH CHECK (true);

-- RLS Policies for file_storage
CREATE POLICY "Users can manage their own files" ON file_storage
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view public files" ON file_storage
  FOR SELECT USING (is_public = true);

-- Create triggers for updated_at
CREATE TRIGGER update_ideas_updated_at
  BEFORE UPDATE ON ideas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_public_feedback_updated_at
  BEFORE UPDATE ON public_feedback
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bmc_data_updated_at
  BEFORE UPDATE ON bmc_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_builder_context_updated_at
  BEFORE UPDATE ON builder_context
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
