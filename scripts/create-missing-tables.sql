-- Create Missing Tables for localStorage Migration
-- Run this in Supabase SQL Editor

-- 1. Create builder_context table
CREATE TABLE IF NOT EXISTS builder_context (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  description TEXT,
  context JSONB NOT NULL DEFAULT '{}',
  context_data JSONB NOT NULL DEFAULT '{}',
  last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, project_id)
);

-- 2. Create mvp_studio_projects table
CREATE TABLE IF NOT EXISTS mvp_studio_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  description TEXT,
  project_data JSONB NOT NULL DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'draft',
  last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, project_id)
);

-- 3. Create ideaforge_data table
CREATE TABLE IF NOT EXISTS ideaforge_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  idea_id VARCHAR(255) NOT NULL,
  title VARCHAR(255),
  description TEXT,
  category VARCHAR(100),
  idea_data JSONB NOT NULL DEFAULT '{}',
  last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, idea_id)
);

-- 4. Create chat_notification_preferences table
CREATE TABLE IF NOT EXISTS chat_notification_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  preferences JSONB NOT NULL DEFAULT '{}',
  last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 5. Create public_feedback_ideas table
CREATE TABLE IF NOT EXISTS public_feedback_ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE NOT NULL,
  feedback_data JSONB NOT NULL DEFAULT '{}',
  last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(idea_id)
);

-- 6. Create bmc_canvas_data table
CREATE TABLE IF NOT EXISTS bmc_canvas_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  canvas_id VARCHAR(255) NOT NULL,
  canvas_data JSONB NOT NULL DEFAULT '{}',
  last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, canvas_id)
);

-- 7. Create offline_queue table
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_builder_context_user_id ON builder_context(user_id);
CREATE INDEX IF NOT EXISTS idx_builder_context_project_id ON builder_context(project_id);
CREATE INDEX IF NOT EXISTS idx_mvp_studio_projects_user_id ON mvp_studio_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_ideaforge_data_user_id ON ideaforge_data(user_id);
CREATE INDEX IF NOT EXISTS idx_offline_queue_user_id ON offline_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_offline_queue_status ON offline_queue(status);

-- Enable RLS
ALTER TABLE builder_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE mvp_studio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideaforge_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_feedback_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE bmc_canvas_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_queue ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for builder_context
DROP POLICY IF EXISTS "Users can view own builder context" ON builder_context;
CREATE POLICY "Users can view own builder context" ON builder_context FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own builder context" ON builder_context;
CREATE POLICY "Users can insert own builder context" ON builder_context FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own builder context" ON builder_context;
CREATE POLICY "Users can update own builder context" ON builder_context FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own builder context" ON builder_context;
CREATE POLICY "Users can delete own builder context" ON builder_context FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for mvp_studio_projects
DROP POLICY IF EXISTS "Users can view own mvp studio projects" ON mvp_studio_projects;
CREATE POLICY "Users can view own mvp studio projects" ON mvp_studio_projects FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own mvp studio projects" ON mvp_studio_projects;
CREATE POLICY "Users can insert own mvp studio projects" ON mvp_studio_projects FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own mvp studio projects" ON mvp_studio_projects;
CREATE POLICY "Users can update own mvp studio projects" ON mvp_studio_projects FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own mvp studio projects" ON mvp_studio_projects;
CREATE POLICY "Users can delete own mvp studio projects" ON mvp_studio_projects FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for ideaforge_data
DROP POLICY IF EXISTS "Users can view own ideaforge data" ON ideaforge_data;
CREATE POLICY "Users can view own ideaforge data" ON ideaforge_data FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own ideaforge data" ON ideaforge_data;
CREATE POLICY "Users can insert own ideaforge data" ON ideaforge_data FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own ideaforge data" ON ideaforge_data;
CREATE POLICY "Users can update own ideaforge data" ON ideaforge_data FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own ideaforge data" ON ideaforge_data;
CREATE POLICY "Users can delete own ideaforge data" ON ideaforge_data FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for chat_notification_preferences
DROP POLICY IF EXISTS "Users can view own chat notification preferences" ON chat_notification_preferences;
CREATE POLICY "Users can view own chat notification preferences" ON chat_notification_preferences FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own chat notification preferences" ON chat_notification_preferences;
CREATE POLICY "Users can insert own chat notification preferences" ON chat_notification_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own chat notification preferences" ON chat_notification_preferences;
CREATE POLICY "Users can update own chat notification preferences" ON chat_notification_preferences FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own chat notification preferences" ON chat_notification_preferences;
CREATE POLICY "Users can delete own chat notification preferences" ON chat_notification_preferences FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for public_feedback_ideas
DROP POLICY IF EXISTS "Users can view own public feedback ideas" ON public_feedback_ideas;
CREATE POLICY "Users can view own public feedback ideas" ON public_feedback_ideas FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can insert own public feedback ideas" ON public_feedback_ideas;
CREATE POLICY "Users can insert own public feedback ideas" ON public_feedback_ideas FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can update own public feedback ideas" ON public_feedback_ideas;
CREATE POLICY "Users can update own public feedback ideas" ON public_feedback_ideas FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own public feedback ideas" ON public_feedback_ideas;
CREATE POLICY "Users can delete own public feedback ideas" ON public_feedback_ideas FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for bmc_canvas_data
DROP POLICY IF EXISTS "Users can view own bmc canvas data" ON bmc_canvas_data;
CREATE POLICY "Users can view own bmc canvas data" ON bmc_canvas_data FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own bmc canvas data" ON bmc_canvas_data;
CREATE POLICY "Users can insert own bmc canvas data" ON bmc_canvas_data FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own bmc canvas data" ON bmc_canvas_data;
CREATE POLICY "Users can update own bmc canvas data" ON bmc_canvas_data FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own bmc canvas data" ON bmc_canvas_data;
CREATE POLICY "Users can delete own bmc canvas data" ON bmc_canvas_data FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for offline_queue
DROP POLICY IF EXISTS "Users can view own offline queue" ON offline_queue;
CREATE POLICY "Users can view own offline queue" ON offline_queue FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own offline queue" ON offline_queue;
CREATE POLICY "Users can insert own offline queue" ON offline_queue FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own offline queue" ON offline_queue;
CREATE POLICY "Users can update own offline queue" ON offline_queue FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own offline queue" ON offline_queue;
CREATE POLICY "Users can delete own offline queue" ON offline_queue FOR DELETE USING (auth.uid() = user_id);

-- Verify tables were created
SELECT 'Migration completed successfully!' as status;
