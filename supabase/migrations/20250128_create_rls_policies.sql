-- =====================================================
-- Row Level Security Policies for localStorage Migration Tables
-- =====================================================
-- This migration enables RLS and creates policies for all tables
-- to ensure users can only access their own data

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE mvp_studio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE builder_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE bmc_canvas_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideaforge_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_feedback_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_queue ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- MVP STUDIO PROJECTS POLICIES
-- =====================================================

-- Users can view their own projects
CREATE POLICY "Users can view own mvp studio projects" ON mvp_studio_projects
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own projects
CREATE POLICY "Users can insert own mvp studio projects" ON mvp_studio_projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own projects
CREATE POLICY "Users can update own mvp studio projects" ON mvp_studio_projects
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own projects
CREATE POLICY "Users can delete own mvp studio projects" ON mvp_studio_projects
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- BUILDER CONTEXT POLICIES
-- =====================================================

-- Users can view their own builder context
CREATE POLICY "Users can view own builder context" ON builder_context
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own builder context
CREATE POLICY "Users can insert own builder context" ON builder_context
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own builder context
CREATE POLICY "Users can update own builder context" ON builder_context
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own builder context
CREATE POLICY "Users can delete own builder context" ON builder_context
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- NOTIFICATION PREFERENCES POLICIES
-- =====================================================

-- Users can view their own notification preferences
CREATE POLICY "Users can view own notification preferences" ON notification_preferences
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own notification preferences
CREATE POLICY "Users can insert own notification preferences" ON notification_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own notification preferences
CREATE POLICY "Users can update own notification preferences" ON notification_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own notification preferences
CREATE POLICY "Users can delete own notification preferences" ON notification_preferences
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- CHAT NOTIFICATION PREFERENCES POLICIES
-- =====================================================

-- Users can view their own chat notification preferences
CREATE POLICY "Users can view own chat notification preferences" ON chat_notification_preferences
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own chat notification preferences
CREATE POLICY "Users can insert own chat notification preferences" ON chat_notification_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own chat notification preferences
CREATE POLICY "Users can update own chat notification preferences" ON chat_notification_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own chat notification preferences
CREATE POLICY "Users can delete own chat notification preferences" ON chat_notification_preferences
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- BMC CANVAS DATA POLICIES
-- =====================================================

-- Users can view their own BMC canvas data
CREATE POLICY "Users can view own bmc canvas data" ON bmc_canvas_data
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own BMC canvas data
CREATE POLICY "Users can insert own bmc canvas data" ON bmc_canvas_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own BMC canvas data
CREATE POLICY "Users can update own bmc canvas data" ON bmc_canvas_data
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own BMC canvas data
CREATE POLICY "Users can delete own bmc canvas data" ON bmc_canvas_data
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- IDEA FORGE DATA POLICIES
-- =====================================================

-- Users can view their own idea forge data
CREATE POLICY "Users can view own ideaforge data" ON ideaforge_data
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own idea forge data
CREATE POLICY "Users can insert own ideaforge data" ON ideaforge_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own idea forge data
CREATE POLICY "Users can update own ideaforge data" ON ideaforge_data
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own idea forge data
CREATE POLICY "Users can delete own ideaforge data" ON ideaforge_data
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- PUBLIC FEEDBACK IDEAS POLICIES
-- =====================================================

-- Users can view their own public feedback ideas
CREATE POLICY "Users can view own public feedback ideas" ON public_feedback_ideas
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- Users can insert their own public feedback ideas
CREATE POLICY "Users can insert own public feedback ideas" ON public_feedback_ideas
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Users can update their own public feedback ideas
CREATE POLICY "Users can update own public feedback ideas" ON public_feedback_ideas
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own public feedback ideas
CREATE POLICY "Users can delete own public feedback ideas" ON public_feedback_ideas
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- USER SETTINGS POLICIES
-- =====================================================

-- Users can view their own user settings
CREATE POLICY "Users can view own user settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own user settings
CREATE POLICY "Users can insert own user settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own user settings
CREATE POLICY "Users can update own user settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own user settings
CREATE POLICY "Users can delete own user settings" ON user_settings
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- DRAFTS POLICIES
-- =====================================================

-- Users can view their own drafts
CREATE POLICY "Users can view own drafts" ON drafts
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own drafts
CREATE POLICY "Users can insert own drafts" ON drafts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own drafts
CREATE POLICY "Users can update own drafts" ON drafts
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own drafts
CREATE POLICY "Users can delete own drafts" ON drafts
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- OFFLINE QUEUE POLICIES
-- =====================================================

-- Users can view their own offline queue
CREATE POLICY "Users can view own offline queue" ON offline_queue
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own offline queue
CREATE POLICY "Users can insert own offline queue" ON offline_queue
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own offline queue
CREATE POLICY "Users can update own offline queue" ON offline_queue
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own offline queue
CREATE POLICY "Users can delete own offline queue" ON offline_queue
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- SERVICE ROLE POLICIES (for admin operations)
-- =====================================================

-- Service role can manage all records (for admin operations)
CREATE POLICY "Service role can manage all mvp studio projects" ON mvp_studio_projects
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage all builder context" ON builder_context
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage all notification preferences" ON notification_preferences
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage all chat notification preferences" ON chat_notification_preferences
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage all bmc canvas data" ON bmc_canvas_data
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage all ideaforge data" ON ideaforge_data
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage all public feedback ideas" ON public_feedback_ideas
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage all user settings" ON user_settings
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage all drafts" ON drafts
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage all offline queue" ON offline_queue
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON POLICY "Users can view own mvp studio projects" ON mvp_studio_projects IS 'Allows users to view only their own MVP Studio projects';
COMMENT ON POLICY "Users can view own builder context" ON builder_context IS 'Allows users to view only their own builder context';
COMMENT ON POLICY "Users can view own notification preferences" ON notification_preferences IS 'Allows users to view only their own notification preferences';
COMMENT ON POLICY "Users can view own bmc canvas data" ON bmc_canvas_data IS 'Allows users to view only their own BMC canvas data';
COMMENT ON POLICY "Users can view own user settings" ON user_settings IS 'Allows users to view only their own user settings';
COMMENT ON POLICY "Users can view own drafts" ON drafts IS 'Allows users to view only their own drafts';
COMMENT ON POLICY "Users can view own offline queue" ON offline_queue IS 'Allows users to view only their own offline queue';
