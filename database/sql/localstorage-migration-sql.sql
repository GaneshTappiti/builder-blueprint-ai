-- =============================================
-- localStorage to Supabase Migration SQL
-- =============================================
-- This migration creates tables to replace all localStorage usage
-- with proper Supabase persistence and sync

-- 1. User Settings and Preferences
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  setting_key VARCHAR(100) NOT NULL,
  setting_value JSONB NOT NULL,
  last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, setting_key)
);

-- 2. User Drafts (for unsent messages, form drafts, etc.)
CREATE TABLE IF NOT EXISTS user_drafts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  draft_type VARCHAR(50) NOT NULL, -- 'message', 'idea', 'bmc', 'project', etc.
  draft_key VARCHAR(100) NOT NULL, -- unique identifier for the draft
  content JSONB NOT NULL,
  last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE, -- for ephemeral drafts
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, draft_type, draft_key)
);

-- 3. Builder Context and Project History
CREATE TABLE IF NOT EXISTS builder_context (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id VARCHAR(100) NOT NULL,
  context_data JSONB NOT NULL,
  last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, project_id)
);

-- 4. MVP Studio Projects (replaces mvp_studio_projects localStorage)
CREATE TABLE IF NOT EXISTS mvp_studio_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id VARCHAR(100) NOT NULL,
  project_data JSONB NOT NULL,
  last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, project_id)
);

-- 5. Idea Forge Data (replaces ideaforge_ideas localStorage)
CREATE TABLE IF NOT EXISTS ideaforge_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  idea_id VARCHAR(100) NOT NULL,
  idea_data JSONB NOT NULL,
  last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, idea_id)
);

-- 6. Business Model Canvas Data (replaces bmc-* localStorage keys)
CREATE TABLE IF NOT EXISTS bmc_canvas_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  canvas_id VARCHAR(100) NOT NULL, -- can be idea-specific or general
  canvas_data JSONB NOT NULL,
  last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, canvas_id)
);

-- 7. Notification Preferences (replaces notificationPreferences localStorage)
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  preferences JSONB NOT NULL,
  last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 8. Chat Notification Preferences (replaces chat-notification-preferences localStorage)
CREATE TABLE IF NOT EXISTS chat_notification_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  preferences JSONB NOT NULL,
  last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 9. Public Feedback Ideas (replaces public_feedback_ideas localStorage)
CREATE TABLE IF NOT EXISTS public_feedback_ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE NOT NULL,
  feedback_data JSONB NOT NULL,
  last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(idea_id)
);

-- 10. Offline Queue (for queuing writes when offline)
CREATE TABLE IF NOT EXISTS offline_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  operation_type VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete'
  table_name VARCHAR(100) NOT NULL,
  record_id VARCHAR(100) NOT NULL,
  data JSONB NOT NULL,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_key ON user_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_user_settings_last_modified ON user_settings(last_modified);

CREATE INDEX IF NOT EXISTS idx_user_drafts_user_id ON user_drafts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_drafts_type ON user_drafts(draft_type);
CREATE INDEX IF NOT EXISTS idx_user_drafts_expires_at ON user_drafts(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_drafts_last_modified ON user_drafts(last_modified);

CREATE INDEX IF NOT EXISTS idx_builder_context_user_id ON builder_context(user_id);
CREATE INDEX IF NOT EXISTS idx_builder_context_project_id ON builder_context(project_id);
CREATE INDEX IF NOT EXISTS idx_builder_context_last_modified ON builder_context(last_modified);

CREATE INDEX IF NOT EXISTS idx_mvp_studio_projects_user_id ON mvp_studio_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_mvp_studio_projects_project_id ON mvp_studio_projects(project_id);
CREATE INDEX IF NOT EXISTS idx_mvp_studio_projects_last_modified ON mvp_studio_projects(last_modified);

CREATE INDEX IF NOT EXISTS idx_ideaforge_data_user_id ON ideaforge_data(user_id);
CREATE INDEX IF NOT EXISTS idx_ideaforge_data_idea_id ON ideaforge_data(idea_id);
CREATE INDEX IF NOT EXISTS idx_ideaforge_data_last_modified ON ideaforge_data(last_modified);

CREATE INDEX IF NOT EXISTS idx_bmc_canvas_data_user_id ON bmc_canvas_data(user_id);
CREATE INDEX IF NOT EXISTS idx_bmc_canvas_data_canvas_id ON bmc_canvas_data(canvas_id);
CREATE INDEX IF NOT EXISTS idx_bmc_canvas_data_last_modified ON bmc_canvas_data(last_modified);

CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_notification_preferences_user_id ON chat_notification_preferences(user_id);

CREATE INDEX IF NOT EXISTS idx_public_feedback_ideas_idea_id ON public_feedback_ideas(idea_id);
CREATE INDEX IF NOT EXISTS idx_public_feedback_ideas_last_modified ON public_feedback_ideas(last_modified);

CREATE INDEX IF NOT EXISTS idx_offline_queue_user_id ON offline_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_offline_queue_status ON offline_queue(status);
CREATE INDEX IF NOT EXISTS idx_offline_queue_created_at ON offline_queue(created_at);

-- Enable Row Level Security
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE builder_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE mvp_studio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideaforge_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE bmc_canvas_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_feedback_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_settings
CREATE POLICY "Users can manage their own settings" ON user_settings
  FOR ALL USING (user_id = auth.uid());

-- RLS Policies for user_drafts
CREATE POLICY "Users can manage their own drafts" ON user_drafts
  FOR ALL USING (user_id = auth.uid());

-- RLS Policies for builder_context
CREATE POLICY "Users can manage their own builder context" ON builder_context
  FOR ALL USING (user_id = auth.uid());

-- RLS Policies for mvp_studio_projects
CREATE POLICY "Users can manage their own MVP projects" ON mvp_studio_projects
  FOR ALL USING (user_id = auth.uid());

-- RLS Policies for ideaforge_data
CREATE POLICY "Users can manage their own idea forge data" ON ideaforge_data
  FOR ALL USING (user_id = auth.uid());

-- RLS Policies for bmc_canvas_data
CREATE POLICY "Users can manage their own BMC canvas data" ON bmc_canvas_data
  FOR ALL USING (user_id = auth.uid());

-- RLS Policies for notification_preferences
CREATE POLICY "Users can manage their own notification preferences" ON notification_preferences
  FOR ALL USING (user_id = auth.uid());

-- RLS Policies for chat_notification_preferences
CREATE POLICY "Users can manage their own chat notification preferences" ON chat_notification_preferences
  FOR ALL USING (user_id = auth.uid());

-- RLS Policies for public_feedback_ideas
CREATE POLICY "Anyone can view public feedback ideas" ON public_feedback_ideas
  FOR SELECT USING (true);

CREATE POLICY "Users can manage public feedback ideas for their ideas" ON public_feedback_ideas
  FOR ALL USING (
    idea_id IN (
      SELECT id FROM ideas WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for offline_queue
CREATE POLICY "Users can manage their own offline queue" ON offline_queue
  FOR ALL USING (user_id = auth.uid());

-- Create update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.last_modified = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_drafts_updated_at
  BEFORE UPDATE ON user_drafts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_builder_context_updated_at
  BEFORE UPDATE ON builder_context
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mvp_studio_projects_updated_at
  BEFORE UPDATE ON mvp_studio_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ideaforge_data_updated_at
  BEFORE UPDATE ON ideaforge_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bmc_canvas_data_updated_at
  BEFORE UPDATE ON bmc_canvas_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_notification_preferences_updated_at
  BEFORE UPDATE ON chat_notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_public_feedback_ideas_updated_at
  BEFORE UPDATE ON public_feedback_ideas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_offline_queue_updated_at
  BEFORE UPDATE ON offline_queue
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON user_settings TO anon, authenticated;
GRANT ALL ON user_drafts TO anon, authenticated;
GRANT ALL ON builder_context TO anon, authenticated;
GRANT ALL ON mvp_studio_projects TO anon, authenticated;
GRANT ALL ON ideaforge_data TO anon, authenticated;
GRANT ALL ON bmc_canvas_data TO anon, authenticated;
GRANT ALL ON notification_preferences TO anon, authenticated;
GRANT ALL ON chat_notification_preferences TO anon, authenticated;
GRANT ALL ON public_feedback_ideas TO anon, authenticated;
GRANT ALL ON offline_queue TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Migration completed successfully!
SELECT 'localStorage to Supabase migration tables created successfully!' as status;
