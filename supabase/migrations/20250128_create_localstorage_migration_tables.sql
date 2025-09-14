-- =====================================================
-- localStorage to Supabase Migration Tables
-- =====================================================
-- This migration creates all tables needed to replace localStorage
-- with proper Supabase persistence and sync

-- =====================================================
-- 1. MVP Studio Projects Table
-- =====================================================
CREATE TABLE IF NOT EXISTS mvp_studio_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID DEFAULT gen_random_uuid(),
  project_data JSONB NOT NULL DEFAULT '{}',
  title VARCHAR(255),
  description TEXT,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'archived')),
  is_public BOOLEAN DEFAULT false,
  team_id UUID,
  last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. Builder Context Table
-- =====================================================
CREATE TABLE IF NOT EXISTS builder_context (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES mvp_studio_projects(id) ON DELETE CASCADE,
  context_data JSONB NOT NULL DEFAULT '{}',
  context_type VARCHAR(100) DEFAULT 'blueprint',
  last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. Notification Preferences Table
-- =====================================================
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  preferences JSONB NOT NULL DEFAULT '{}',
  last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- =====================================================
-- 4. Chat Notification Preferences Table
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_notification_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  preferences JSONB NOT NULL DEFAULT '{}',
  last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- =====================================================
-- 5. BMC Canvas Data Table
-- =====================================================
CREATE TABLE IF NOT EXISTS bmc_canvas_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  canvas_id VARCHAR(255) NOT NULL, -- For bmc-{ideaId} or 'bmc-canvas'
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  canvas_data JSONB NOT NULL DEFAULT '{}',
  last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, canvas_id)
);

-- =====================================================
-- 6. Idea Forge Data Table
-- =====================================================
CREATE TABLE IF NOT EXISTS ideaforge_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  idea_id UUID DEFAULT gen_random_uuid(),
  idea_data JSONB NOT NULL DEFAULT '{}',
  last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. Public Feedback Ideas Table
-- =====================================================
CREATE TABLE IF NOT EXISTS public_feedback_ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  feedback_data JSONB NOT NULL DEFAULT '{}',
  is_anonymous BOOLEAN DEFAULT false,
  last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 8. User Settings Table (for general preferences)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  key VARCHAR(255) NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, key)
);

-- =====================================================
-- 9. Drafts Table (for ephemeral drafts)
-- =====================================================
CREATE TABLE IF NOT EXISTS drafts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(100) NOT NULL,
  context_id UUID,
  content JSONB NOT NULL DEFAULT '{}',
  last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, type, context_id)
);

-- =====================================================
-- 10. Offline Queue Table (for offline sync)
-- =====================================================
CREATE TABLE IF NOT EXISTS offline_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  operation VARCHAR(50) NOT NULL CHECK (operation IN ('create', 'update', 'delete')),
  table_name VARCHAR(100) NOT NULL,
  record_id UUID,
  data JSONB NOT NULL DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- MVP Studio Projects indexes
CREATE INDEX IF NOT EXISTS idx_mvp_studio_projects_user_id ON mvp_studio_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_mvp_studio_projects_status ON mvp_studio_projects(status);
CREATE INDEX IF NOT EXISTS idx_mvp_studio_projects_last_modified ON mvp_studio_projects(last_modified);

-- Builder Context indexes
CREATE INDEX IF NOT EXISTS idx_builder_context_user_id ON builder_context(user_id);
CREATE INDEX IF NOT EXISTS idx_builder_context_project_id ON builder_context(project_id);
CREATE INDEX IF NOT EXISTS idx_builder_context_last_modified ON builder_context(last_modified);

-- Notification Preferences indexes
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_notification_preferences_user_id ON chat_notification_preferences(user_id);

-- BMC Canvas Data indexes
CREATE INDEX IF NOT EXISTS idx_bmc_canvas_data_user_id ON bmc_canvas_data(user_id);
CREATE INDEX IF NOT EXISTS idx_bmc_canvas_data_canvas_id ON bmc_canvas_data(canvas_id);
CREATE INDEX IF NOT EXISTS idx_bmc_canvas_data_idea_id ON bmc_canvas_data(idea_id);

-- Idea Forge Data indexes
CREATE INDEX IF NOT EXISTS idx_ideaforge_data_user_id ON ideaforge_data(user_id);
CREATE INDEX IF NOT EXISTS idx_ideaforge_data_idea_id ON ideaforge_data(idea_id);

-- Public Feedback Ideas indexes
CREATE INDEX IF NOT EXISTS idx_public_feedback_ideas_user_id ON public_feedback_ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_public_feedback_ideas_idea_id ON public_feedback_ideas(idea_id);

-- User Settings indexes
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_key ON user_settings(key);

-- Drafts indexes
CREATE INDEX IF NOT EXISTS idx_drafts_user_id ON drafts(user_id);
CREATE INDEX IF NOT EXISTS idx_drafts_type ON drafts(type);
CREATE INDEX IF NOT EXISTS idx_drafts_context_id ON drafts(context_id);

-- Offline Queue indexes
CREATE INDEX IF NOT EXISTS idx_offline_queue_user_id ON offline_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_offline_queue_status ON offline_queue(status);
CREATE INDEX IF NOT EXISTS idx_offline_queue_created_at ON offline_queue(created_at);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for all tables
CREATE TRIGGER update_mvp_studio_projects_updated_at BEFORE UPDATE ON mvp_studio_projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_builder_context_updated_at BEFORE UPDATE ON builder_context FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON notification_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chat_notification_preferences_updated_at BEFORE UPDATE ON chat_notification_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bmc_canvas_data_updated_at BEFORE UPDATE ON bmc_canvas_data FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ideaforge_data_updated_at BEFORE UPDATE ON ideaforge_data FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_public_feedback_ideas_updated_at BEFORE UPDATE ON public_feedback_ideas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_drafts_updated_at BEFORE UPDATE ON drafts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE mvp_studio_projects IS 'Stores MVP Studio project data migrated from localStorage';
COMMENT ON TABLE builder_context IS 'Stores builder context and project history migrated from localStorage';
COMMENT ON TABLE notification_preferences IS 'Stores user notification preferences migrated from localStorage';
COMMENT ON TABLE chat_notification_preferences IS 'Stores chat-specific notification preferences migrated from localStorage';
COMMENT ON TABLE bmc_canvas_data IS 'Stores Business Model Canvas data migrated from localStorage';
COMMENT ON TABLE ideaforge_data IS 'Stores Idea Forge data migrated from localStorage';
COMMENT ON TABLE public_feedback_ideas IS 'Stores public feedback ideas migrated from localStorage';
COMMENT ON TABLE user_settings IS 'Stores general user settings and preferences';
COMMENT ON TABLE drafts IS 'Stores ephemeral drafts and unsent content';
COMMENT ON TABLE offline_queue IS 'Stores offline operations for sync when connection is restored';
