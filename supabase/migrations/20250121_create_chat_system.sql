-- Create chat channels table
CREATE TABLE IF NOT EXISTS chat_channels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL DEFAULT 'group', -- 'group', 'private', 'public'
  team_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_archived BOOLEAN DEFAULT FALSE,
  settings JSONB DEFAULT '{}'::jsonb
);

-- Create chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id UUID REFERENCES chat_channels(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'text', -- 'text', 'file', 'voice', 'system', 'image'
  metadata JSONB DEFAULT '{}'::jsonb, -- For attachments, mentions, etc.
  reply_to UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
  edited_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Create message read receipts table
CREATE TABLE IF NOT EXISTS message_read_receipts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(message_id, user_id)
);

-- Create typing indicators table
CREATE TABLE IF NOT EXISTS typing_indicators (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id UUID REFERENCES chat_channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(channel_id, user_id)
);

-- Create channel members table
CREATE TABLE IF NOT EXISTS channel_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id UUID REFERENCES chat_channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member', -- 'admin', 'member', 'moderator'
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notification_settings JSONB DEFAULT '{"mentions": true, "all_messages": true}'::jsonb,
  UNIQUE(channel_id, user_id)
);

-- Create file attachments table
CREATE TABLE IF NOT EXISTS file_attachments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  file_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create message reactions table
CREATE TABLE IF NOT EXISTS message_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji VARCHAR(10) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(message_id, user_id, emoji)
);

-- Create message mentions table
CREATE TABLE IF NOT EXISTS message_mentions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
  mentioned_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_channel_id ON chat_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_message_read_receipts_message_id ON message_read_receipts(message_id);
CREATE INDEX IF NOT EXISTS idx_message_read_receipts_user_id ON message_read_receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_typing_indicators_channel_id ON typing_indicators(channel_id);
CREATE INDEX IF NOT EXISTS idx_channel_members_channel_id ON channel_members(channel_id);
CREATE INDEX IF NOT EXISTS idx_channel_members_user_id ON channel_members(user_id);
CREATE INDEX IF NOT EXISTS idx_file_attachments_message_id ON file_attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_mentions_message_id ON message_mentions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_mentions_mentioned_user_id ON message_mentions(mentioned_user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE chat_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_read_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE typing_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_mentions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_channels
CREATE POLICY "Users can view channels they are members of" ON chat_channels
  FOR SELECT USING (
    id IN (
      SELECT channel_id FROM channel_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create channels" ON chat_channels
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Channel creators can update their channels" ON chat_channels
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Channel creators can delete their channels" ON chat_channels
  FOR DELETE USING (auth.uid() = created_by);

-- RLS Policies for chat_messages
CREATE POLICY "Users can view messages in channels they are members of" ON chat_messages
  FOR SELECT USING (
    channel_id IN (
      SELECT channel_id FROM channel_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in channels they are members of" ON chat_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    channel_id IN (
      SELECT channel_id FROM channel_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own messages" ON chat_messages
  FOR UPDATE USING (auth.uid() = sender_id);

CREATE POLICY "Users can delete their own messages" ON chat_messages
  FOR DELETE USING (auth.uid() = sender_id);

-- RLS Policies for message_read_receipts
CREATE POLICY "Users can view read receipts for messages they can see" ON message_read_receipts
  FOR SELECT USING (
    message_id IN (
      SELECT id FROM chat_messages 
      WHERE channel_id IN (
        SELECT channel_id FROM channel_members 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create read receipts for their own reads" ON message_read_receipts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own read receipts" ON message_read_receipts
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for typing_indicators
CREATE POLICY "Users can view typing indicators in channels they are members of" ON typing_indicators
  FOR SELECT USING (
    channel_id IN (
      SELECT channel_id FROM channel_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create typing indicators for themselves" ON typing_indicators
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    channel_id IN (
      SELECT channel_id FROM channel_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own typing indicators" ON typing_indicators
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own typing indicators" ON typing_indicators
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for channel_members
CREATE POLICY "Users can view channel members for channels they are in" ON channel_members
  FOR SELECT USING (
    channel_id IN (
      SELECT channel_id FROM channel_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Channel admins can add members" ON channel_members
  FOR INSERT WITH CHECK (
    channel_id IN (
      SELECT channel_id FROM channel_members 
      WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "Users can update their own channel membership" ON channel_members
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Channel admins can remove members" ON channel_members
  FOR DELETE USING (
    channel_id IN (
      SELECT channel_id FROM channel_members 
      WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

-- RLS Policies for file_attachments
CREATE POLICY "Users can view attachments for messages they can see" ON file_attachments
  FOR SELECT USING (
    message_id IN (
      SELECT id FROM chat_messages 
      WHERE channel_id IN (
        SELECT channel_id FROM channel_members 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create attachments for their messages" ON file_attachments
  FOR INSERT WITH CHECK (
    message_id IN (
      SELECT id FROM chat_messages 
      WHERE sender_id = auth.uid()
    )
  );

-- RLS Policies for message_reactions
CREATE POLICY "Users can view reactions for messages they can see" ON message_reactions
  FOR SELECT USING (
    message_id IN (
      SELECT id FROM chat_messages 
      WHERE channel_id IN (
        SELECT channel_id FROM channel_members 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create reactions for their own" ON message_reactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions" ON message_reactions
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for message_mentions
CREATE POLICY "Users can view mentions for messages they can see" ON message_mentions
  FOR SELECT USING (
    message_id IN (
      SELECT id FROM chat_messages 
      WHERE channel_id IN (
        SELECT channel_id FROM channel_members 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create mentions" ON message_mentions
  FOR INSERT WITH CHECK (
    message_id IN (
      SELECT id FROM chat_messages 
      WHERE sender_id = auth.uid()
    )
  );

-- Create functions for common operations
CREATE OR REPLACE FUNCTION get_user_channels(user_uuid UUID)
RETURNS TABLE (
  channel_id UUID,
  channel_name VARCHAR,
  channel_type VARCHAR,
  last_message_content TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE,
  unread_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.type,
    cm.content,
    cm.created_at,
    COALESCE(
      (SELECT COUNT(*) 
       FROM chat_messages m 
       WHERE m.channel_id = c.id 
       AND m.created_at > cm_members.last_read_at
       AND m.sender_id != user_uuid
      ), 0
    ) as unread_count
  FROM chat_channels c
  JOIN channel_members cm_members ON c.id = cm_members.channel_id
  LEFT JOIN LATERAL (
    SELECT content, created_at
    FROM chat_messages
    WHERE channel_id = c.id
    ORDER BY created_at DESC
    LIMIT 1
  ) cm ON true
  WHERE cm_members.user_id = user_uuid
  AND c.is_archived = FALSE
  ORDER BY COALESCE(cm.created_at, c.created_at) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_as_read(
  channel_uuid UUID,
  user_uuid UUID,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS VOID AS $$
BEGIN
  -- Update last_read_at for the channel member
  UPDATE channel_members 
  SET last_read_at = read_at
  WHERE channel_id = channel_uuid AND user_id = user_uuid;
  
  -- Insert read receipts for unread messages
  INSERT INTO message_read_receipts (message_id, user_id, read_at)
  SELECT m.id, user_uuid, read_at
  FROM chat_messages m
  WHERE m.channel_id = channel_uuid
  AND m.sender_id != user_uuid
  AND m.created_at <= read_at
  AND NOT EXISTS (
    SELECT 1 FROM message_read_receipts mr 
    WHERE mr.message_id = m.id AND mr.user_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to clean up old typing indicators
CREATE OR REPLACE FUNCTION cleanup_typing_indicators()
RETURNS VOID AS $$
BEGIN
  DELETE FROM typing_indicators 
  WHERE started_at < NOW() - INTERVAL '30 seconds';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_chat_channels_updated_at
  BEFORE UPDATE ON chat_channels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_messages_updated_at
  BEFORE UPDATE ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to automatically add creator as channel member
CREATE OR REPLACE FUNCTION add_creator_as_channel_member()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO channel_members (channel_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'admin');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER add_creator_as_channel_member_trigger
  AFTER INSERT ON chat_channels
  FOR EACH ROW
  EXECUTE FUNCTION add_creator_as_channel_member();

-- Create trigger to clean up typing indicators on message send
CREATE OR REPLACE FUNCTION cleanup_typing_on_message()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM typing_indicators 
  WHERE channel_id = NEW.channel_id AND user_id = NEW.sender_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cleanup_typing_on_message_trigger
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_typing_on_message();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
