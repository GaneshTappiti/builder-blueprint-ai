-- Enhanced chat system migrations
-- This migration adds additional features for the enhanced IndividualChat component

-- Create notifications table for push notifications
CREATE TABLE IF NOT EXISTS chat_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(50) NOT NULL, -- 'message', 'mention', 'reaction', 'file_upload', 'channel_invite'
  channel_id UUID REFERENCES chat_channels(id) ON DELETE CASCADE,
  message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user notification preferences table
CREATE TABLE IF NOT EXISTS user_notification_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_id UUID REFERENCES chat_channels(id) ON DELETE CASCADE,
  mentions BOOLEAN DEFAULT TRUE,
  all_messages BOOLEAN DEFAULT TRUE,
  reactions BOOLEAN DEFAULT TRUE,
  file_uploads BOOLEAN DEFAULT TRUE,
  system_messages BOOLEAN DEFAULT TRUE,
  push_enabled BOOLEAN DEFAULT TRUE,
  email_enabled BOOLEAN DEFAULT FALSE,
  quiet_hours JSONB DEFAULT '{"enabled": false, "start": "22:00", "end": "08:00", "timezone": "UTC"}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, channel_id)
);

-- Create message search index for better search performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_content_search ON chat_messages USING gin(to_tsvector('english', content));

-- Create message search by user index
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_content ON chat_messages(sender_id, created_at DESC);

-- Create message search by date index
CREATE INDEX IF NOT EXISTS idx_chat_messages_date_search ON chat_messages(channel_id, created_at DESC);

-- Create notification indexes
CREATE INDEX IF NOT EXISTS idx_chat_notifications_recipient ON chat_notifications(recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_notifications_channel ON chat_notifications(channel_id);
CREATE INDEX IF NOT EXISTS idx_chat_notifications_unread ON chat_notifications(recipient_id, read) WHERE read = FALSE;

-- Create user notification preferences index
CREATE INDEX IF NOT EXISTS idx_user_notification_preferences_user ON user_notification_preferences(user_id);

-- Add new columns to existing tables for enhanced features
ALTER TABLE chat_channels ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{
  "can_send_messages": true,
  "can_edit_messages": true,
  "can_delete_messages": true,
  "can_add_reactions": true,
  "can_upload_files": true,
  "can_create_channels": false,
  "can_manage_channels": false,
  "can_invite_members": false,
  "can_remove_members": false,
  "can_manage_roles": false,
  "can_view_history": true,
  "can_mention_everyone": false,
  "can_pin_messages": false,
  "can_delete_channel": false
}'::jsonb;

-- Add message pinning functionality
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS pinned_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS pinned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add message threading support
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS thread_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS thread_count INTEGER DEFAULT 0;

-- Add message encryption support
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS is_encrypted BOOLEAN DEFAULT FALSE;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS encryption_key_id VARCHAR(255);

-- Add message priority levels
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'normal'; -- 'low', 'normal', 'high', 'urgent'

-- Add message expiration
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- Create message threads table for better thread management
CREATE TABLE IF NOT EXISTS message_threads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  root_message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
  channel_id UUID REFERENCES chat_channels(id) ON DELETE CASCADE,
  title VARCHAR(255),
  message_count INTEGER DEFAULT 0,
  last_message_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create channel roles table for granular permissions
CREATE TABLE IF NOT EXISTS channel_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id UUID REFERENCES chat_channels(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  permissions JSONB NOT NULL,
  color VARCHAR(20) DEFAULT '#6366f1',
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(channel_id, name)
);

-- Update channel_members to include role_id
ALTER TABLE channel_members ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES channel_roles(id) ON DELETE SET NULL;

-- Create message bookmarks table
CREATE TABLE IF NOT EXISTS message_bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, message_id)
);

-- Create message drafts table for unsent messages
CREATE TABLE IF NOT EXISTS message_drafts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_id UUID REFERENCES chat_channels(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, channel_id)
);

-- Create indexes for new tables
CREATE INDEX IF NOT EXISTS idx_message_threads_channel ON message_threads(channel_id);
CREATE INDEX IF NOT EXISTS idx_message_threads_root_message ON message_threads(root_message_id);
CREATE INDEX IF NOT EXISTS idx_channel_roles_channel ON channel_roles(channel_id);
CREATE INDEX IF NOT EXISTS idx_message_bookmarks_user ON message_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_message_drafts_user_channel ON message_drafts(user_id, channel_id);

-- Enable RLS on new tables
ALTER TABLE chat_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_drafts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_notifications
CREATE POLICY "Users can view their own notifications" ON chat_notifications
  FOR SELECT USING (auth.uid() = recipient_id);

CREATE POLICY "Users can update their own notifications" ON chat_notifications
  FOR UPDATE USING (auth.uid() = recipient_id);

-- RLS Policies for user_notification_preferences
CREATE POLICY "Users can view their own notification preferences" ON user_notification_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own notification preferences" ON user_notification_preferences
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for message_threads
CREATE POLICY "Users can view threads in channels they are members of" ON message_threads
  FOR SELECT USING (
    channel_id IN (
      SELECT channel_id FROM channel_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create threads in channels they are members of" ON message_threads
  FOR INSERT WITH CHECK (
    channel_id IN (
      SELECT channel_id FROM channel_members 
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for channel_roles
CREATE POLICY "Users can view roles in channels they are members of" ON channel_roles
  FOR SELECT USING (
    channel_id IN (
      SELECT channel_id FROM channel_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Channel admins can manage roles" ON channel_roles
  FOR ALL USING (
    channel_id IN (
      SELECT channel_id FROM channel_members 
      WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

-- RLS Policies for message_bookmarks
CREATE POLICY "Users can manage their own bookmarks" ON message_bookmarks
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for message_drafts
CREATE POLICY "Users can manage their own drafts" ON message_drafts
  FOR ALL USING (auth.uid() = user_id);

-- Create functions for enhanced chat features

-- Function to create notification
CREATE OR REPLACE FUNCTION create_chat_notification(
  notification_type VARCHAR,
  channel_uuid UUID,
  message_uuid UUID,
  sender_uuid UUID,
  recipient_uuid UUID,
  notification_title VARCHAR,
  notification_body TEXT,
  notification_data JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO chat_notifications (
    type, channel_id, message_id, sender_id, recipient_id, 
    title, body, data
  ) VALUES (
    notification_type, channel_uuid, message_uuid, sender_uuid, recipient_uuid,
    notification_title, notification_body, notification_data
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM chat_notifications
    WHERE recipient_id = user_uuid AND read = FALSE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark notifications as read
CREATE OR REPLACE FUNCTION mark_notifications_as_read(user_uuid UUID, channel_uuid UUID DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
  IF channel_uuid IS NULL THEN
    UPDATE chat_notifications 
    SET read = TRUE 
    WHERE recipient_id = user_uuid;
  ELSE
    UPDATE chat_notifications 
    SET read = TRUE 
    WHERE recipient_id = user_uuid AND channel_id = channel_uuid;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to search messages with advanced filtering
CREATE OR REPLACE FUNCTION search_messages_advanced(
  search_query TEXT,
  channel_uuid UUID DEFAULT NULL,
  sender_uuid UUID DEFAULT NULL,
  message_type VARCHAR DEFAULT NULL,
  date_from TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  date_to TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  limit_count INTEGER DEFAULT 50,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  channel_id UUID,
  sender_id UUID,
  content TEXT,
  message_type VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE,
  sender_name TEXT,
  sender_email TEXT,
  sender_avatar TEXT,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.channel_id,
    m.sender_id,
    m.content,
    m.message_type,
    m.created_at,
    p.name as sender_name,
    p.email as sender_email,
    p.avatar_url as sender_avatar,
    ts_rank(to_tsvector('english', m.content), plainto_tsquery('english', search_query)) as rank
  FROM chat_messages m
  JOIN profiles p ON m.sender_id = p.id
  WHERE 
    m.is_deleted = FALSE
    AND to_tsvector('english', m.content) @@ plainto_tsquery('english', search_query)
    AND (channel_uuid IS NULL OR m.channel_id = channel_uuid)
    AND (sender_uuid IS NULL OR m.sender_id = sender_uuid)
    AND (message_type IS NULL OR m.message_type = message_type)
    AND (date_from IS NULL OR m.created_at >= date_from)
    AND (date_to IS NULL OR m.created_at <= date_to)
    AND m.channel_id IN (
      SELECT channel_id FROM channel_members 
      WHERE user_id = auth.uid()
    )
  ORDER BY rank DESC, m.created_at DESC
  LIMIT limit_count OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get channel statistics
CREATE OR REPLACE FUNCTION get_channel_stats(channel_uuid UUID)
RETURNS TABLE (
  total_messages BIGINT,
  total_members BIGINT,
  messages_today BIGINT,
  files_shared BIGINT,
  most_active_user TEXT,
  average_response_time INTERVAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM chat_messages WHERE channel_id = channel_uuid AND is_deleted = FALSE) as total_messages,
    (SELECT COUNT(*) FROM channel_members WHERE channel_id = channel_uuid) as total_members,
    (SELECT COUNT(*) FROM chat_messages WHERE channel_id = channel_uuid AND created_at >= CURRENT_DATE) as messages_today,
    (SELECT COUNT(*) FROM file_attachments fa JOIN chat_messages m ON fa.message_id = m.id WHERE m.channel_id = channel_uuid) as files_shared,
    (SELECT p.name FROM profiles p 
     JOIN (SELECT sender_id, COUNT(*) as msg_count FROM chat_messages WHERE channel_id = channel_uuid GROUP BY sender_id ORDER BY msg_count DESC LIMIT 1) top_user ON p.id = top_user.sender_id) as most_active_user,
    (SELECT AVG(EXTRACT(EPOCH FROM (m2.created_at - m1.created_at))/60) as avg_response_minutes
     FROM chat_messages m1
     JOIN chat_messages m2 ON m1.channel_id = m2.channel_id AND m2.created_at > m1.created_at
     WHERE m1.channel_id = channel_uuid AND m1.sender_id != m2.sender_id
     LIMIT 1000) as average_response_time;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to pin/unpin messages
CREATE OR REPLACE FUNCTION toggle_message_pin(
  message_uuid UUID,
  user_uuid UUID,
  pin_status BOOLEAN
)
RETURNS VOID AS $$
DECLARE
  channel_uuid UUID;
  user_role VARCHAR;
BEGIN
  -- Get channel and user role
  SELECT m.channel_id, cm.role INTO channel_uuid, user_role
  FROM chat_messages m
  JOIN channel_members cm ON m.channel_id = cm.channel_id
  WHERE m.id = message_uuid AND cm.user_id = user_uuid;
  
  -- Check if user has permission to pin messages
  IF user_role NOT IN ('admin', 'moderator') THEN
    RAISE EXCEPTION 'Insufficient permissions to pin/unpin messages';
  END IF;
  
  -- Update message pin status
  UPDATE chat_messages 
  SET 
    is_pinned = pin_status,
    pinned_at = CASE WHEN pin_status THEN NOW() ELSE NULL END,
    pinned_by = CASE WHEN pin_status THEN user_uuid ELSE NULL END
  WHERE id = message_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for enhanced features

-- Trigger to update thread count when messages are added/removed
CREATE OR REPLACE FUNCTION update_thread_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.thread_id IS NOT NULL THEN
    UPDATE message_threads 
    SET message_count = message_count + 1,
        last_message_at = NEW.created_at
    WHERE root_message_id = NEW.thread_id;
  ELSIF TG_OP = 'DELETE' AND OLD.thread_id IS NOT NULL THEN
    UPDATE message_threads 
    SET message_count = GREATEST(message_count - 1, 0)
    WHERE root_message_id = OLD.thread_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_thread_count_trigger
  AFTER INSERT OR DELETE ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_thread_count();

-- Trigger to create notifications for mentions
CREATE OR REPLACE FUNCTION create_mention_notifications()
RETURNS TRIGGER AS $$
DECLARE
  mentioned_user_id UUID;
  channel_name TEXT;
  sender_name TEXT;
BEGIN
  -- Get channel and sender names
  SELECT c.name, p.name INTO channel_name, sender_name
  FROM chat_channels c
  JOIN profiles p ON p.id = NEW.sender_id
  WHERE c.id = NEW.channel_id;
  
  -- Create notifications for mentioned users
  FOR mentioned_user_id IN 
    SELECT mentioned_user_id FROM message_mentions WHERE message_id = NEW.id
  LOOP
    PERFORM create_chat_notification(
      'mention',
      NEW.channel_id,
      NEW.id,
      NEW.sender_id,
      mentioned_user_id,
      'You were mentioned in ' || channel_name,
      sender_name || ': ' || LEFT(NEW.content, 100),
      '{"channel_name": "' || channel_name || '", "sender_name": "' || sender_name || '"}'
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_mention_notifications_trigger
  AFTER INSERT ON message_mentions
  FOR EACH ROW
  EXECUTE FUNCTION create_mention_notifications();

-- Grant permissions
GRANT ALL ON chat_notifications TO authenticated;
GRANT ALL ON user_notification_preferences TO authenticated;
GRANT ALL ON message_threads TO authenticated;
GRANT ALL ON channel_roles TO authenticated;
GRANT ALL ON message_bookmarks TO authenticated;
GRANT ALL ON message_drafts TO authenticated;

GRANT EXECUTE ON FUNCTION create_chat_notification TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_notification_count TO authenticated;
GRANT EXECUTE ON FUNCTION mark_notifications_as_read TO authenticated;
GRANT EXECUTE ON FUNCTION search_messages_advanced TO authenticated;
GRANT EXECUTE ON FUNCTION get_channel_stats TO authenticated;
GRANT EXECUTE ON FUNCTION toggle_message_pin TO authenticated;
