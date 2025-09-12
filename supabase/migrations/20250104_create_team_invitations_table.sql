-- Create team_invitations table for in-app team invitation flow
-- This migration creates the necessary table for team invitation management

-- Create team_invitations table with production-level optimizations
CREATE TABLE IF NOT EXISTS team_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL,
  inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_email VARCHAR(255) NOT NULL,
  role VARCHAR(100) NOT NULL,
  department VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired', 'failed')),
  message TEXT,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints for data integrity
  CONSTRAINT valid_email CHECK (invitee_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT valid_role CHECK (role IN (
    'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'UI/UX Designer',
    'Product Manager', 'Marketing Manager', 'Sales Representative', 'Data Analyst',
    'DevOps Engineer', 'QA Engineer', 'Project Manager', 'Business Analyst',
    'Admin', 'Member', 'Viewer'
  )),
  CONSTRAINT valid_department CHECK (department IN (
    'Engineering', 'Design', 'Product', 'Marketing', 'Sales', 'Operations',
    'Finance', 'HR', 'Customer Success', 'Business Development'
  )),
  CONSTRAINT valid_expiry CHECK (expires_at > created_at),
  
  -- Unique constraint to prevent duplicate invitations
  UNIQUE(team_id, invitee_email, status) DEFERRABLE INITIALLY DEFERRED
);

-- Create notifications table for team invitations with production optimizations
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  payload JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  action_url VARCHAR(500),
  action_text VARCHAR(100),
  priority INTEGER DEFAULT 0 CHECK (priority >= 0 AND priority <= 10),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints for data integrity
  CONSTRAINT valid_notification_type CHECK (type IN (
    'team_invite', 'team_invite_accepted', 'team_invite_declined', 'team_invite_failed',
    'meeting', 'task', 'idea', 'chat', 'system', 'team'
  )),
  CONSTRAINT valid_priority CHECK (priority >= 0 AND priority <= 10),
  CONSTRAINT valid_expiry CHECK (expires_at IS NULL OR expires_at > created_at)
);

-- Create team_members table to track team membership with production optimizations
CREATE TABLE IF NOT EXISTS team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(100) NOT NULL,
  department VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  permissions JSONB DEFAULT '{}',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints for data integrity
  CONSTRAINT valid_role CHECK (role IN (
    'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'UI/UX Designer',
    'Product Manager', 'Marketing Manager', 'Sales Representative', 'Data Analyst',
    'DevOps Engineer', 'QA Engineer', 'Project Manager', 'Business Analyst',
    'Admin', 'Member', 'Viewer'
  )),
  CONSTRAINT valid_department CHECK (department IN (
    'Engineering', 'Design', 'Product', 'Marketing', 'Sales', 'Operations',
    'Finance', 'HR', 'Customer Success', 'Business Development'
  )),
  CONSTRAINT valid_permissions CHECK (jsonb_typeof(permissions) = 'object'),
  
  -- Unique constraint to prevent users from joining multiple teams
  UNIQUE(user_id) DEFERRABLE INITIALLY DEFERRED,
  UNIQUE(team_id, user_id) DEFERRABLE INITIALLY DEFERRED
);

-- Create teams table with production optimizations
CREATE TABLE IF NOT EXISTS teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  settings JSONB DEFAULT '{}',
  max_members INTEGER DEFAULT 50 CHECK (max_members > 0 AND max_members <= 1000),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints for data integrity
  CONSTRAINT valid_name CHECK (LENGTH(TRIM(name)) > 0),
  CONSTRAINT valid_settings CHECK (jsonb_typeof(settings) = 'object'),
  CONSTRAINT valid_max_members CHECK (max_members > 0 AND max_members <= 1000)
);

-- Create comprehensive indexes for optimal performance
-- Team invitations indexes
CREATE INDEX IF NOT EXISTS idx_team_invitations_team_id ON team_invitations(team_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_inviter_id ON team_invitations(inviter_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_invitee_id ON team_invitations(invitee_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_invitee_email ON team_invitations(invitee_email);
CREATE INDEX IF NOT EXISTS idx_team_invitations_status ON team_invitations(status);
CREATE INDEX IF NOT EXISTS idx_team_invitations_expires_at ON team_invitations(expires_at);
CREATE INDEX IF NOT EXISTS idx_team_invitations_created_at ON team_invitations(created_at);
CREATE INDEX IF NOT EXISTS idx_team_invitations_status_team ON team_invitations(status, team_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_email_status ON team_invitations(invitee_email, status);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON notifications(expires_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_type_user ON notifications(type, user_id);

-- Team members indexes
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_status ON team_members(status);
CREATE INDEX IF NOT EXISTS idx_team_members_role ON team_members(role);
CREATE INDEX IF NOT EXISTS idx_team_members_department ON team_members(department);
CREATE INDEX IF NOT EXISTS idx_team_members_last_active ON team_members(last_active);
CREATE INDEX IF NOT EXISTS idx_team_members_team_status ON team_members(team_id, status);

-- Teams indexes
CREATE INDEX IF NOT EXISTS idx_teams_owner_id ON teams(owner_id);
CREATE INDEX IF NOT EXISTS idx_teams_is_active ON teams(is_active);
CREATE INDEX IF NOT EXISTS idx_teams_created_at ON teams(created_at);
CREATE INDEX IF NOT EXISTS idx_teams_name ON teams(name);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_team_invitations_pending_by_team ON team_invitations(team_id, status, created_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_team_invitations_pending_by_user ON team_invitations(invitee_id, status, created_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_notifications_recent_unread ON notifications(user_id, created_at, is_read) WHERE is_read = false;

-- Add RLS policies
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Team invitations policies
CREATE POLICY "Users can view invitations they sent or received" ON team_invitations
  FOR SELECT USING (
    inviter_id = auth.uid() OR 
    invitee_id = auth.uid() OR
    invitee_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "Users can create invitations for their teams" ON team_invitations
  FOR INSERT WITH CHECK (
    inviter_id = auth.uid() AND
    team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid())
  );

CREATE POLICY "Users can update invitations they received" ON team_invitations
  FOR UPDATE USING (invitee_id = auth.uid());

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create notifications" ON notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Team members policies
CREATE POLICY "Users can view team members of their teams" ON team_members
  FOR SELECT USING (
    team_id IN (
      SELECT id FROM teams WHERE owner_id = auth.uid()
      UNION
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team owners can manage members" ON team_members
  FOR ALL USING (
    team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid())
  );

-- Teams policies
CREATE POLICY "Users can view their own teams" ON teams
  FOR SELECT USING (
    owner_id = auth.uid() OR
    id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create teams" ON teams
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Team owners can update their teams" ON teams
  FOR UPDATE USING (owner_id = auth.uid());

-- Create production-level functions and triggers

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to clean up expired invitations
CREATE OR REPLACE FUNCTION cleanup_expired_invitations()
RETURNS void AS $$
BEGIN
  UPDATE team_invitations 
  SET status = 'expired' 
  WHERE status = 'pending' 
  AND expires_at < NOW();
END;
$$ language 'plpgsql';

-- Function to get team member count
CREATE OR REPLACE FUNCTION get_team_member_count(team_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) 
    FROM team_members 
    WHERE team_id = team_uuid 
    AND status = 'active'
  );
END;
$$ language 'plpgsql';

-- Function to check if team has space for new members
CREATE OR REPLACE FUNCTION can_add_team_member(team_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_count INTEGER;
  max_members INTEGER;
BEGIN
  SELECT get_team_member_count(team_uuid), t.max_members
  INTO current_count, max_members
  FROM teams t
  WHERE t.id = team_uuid;
  
  RETURN current_count < max_members;
END;
$$ language 'plpgsql';

-- Function to send team invitation with validation
CREATE OR REPLACE FUNCTION send_team_invitation(
  p_team_id UUID,
  p_inviter_id UUID,
  p_invitee_email TEXT,
  p_role TEXT,
  p_department TEXT,
  p_message TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_invitee_id UUID;
  v_team_name TEXT;
  v_inviter_name TEXT;
  v_invitation_id UUID;
  v_result JSONB;
BEGIN
  -- Check if inviter is team owner
  IF NOT EXISTS (
    SELECT 1 FROM teams 
    WHERE id = p_team_id AND owner_id = p_inviter_id
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Only team owners can send invitations'
    );
  END IF;

  -- Check if team has space
  IF NOT can_add_team_member(p_team_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Team has reached maximum member limit'
    );
  END IF;

  -- Check if user exists
  SELECT id INTO v_invitee_id
  FROM auth.users
  WHERE email = p_invitee_email;

  IF v_invitee_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'This user is not registered. Please ask them to sign up first.'
    );
  END IF;

  -- Check if user is already in a team
  IF EXISTS (
    SELECT 1 FROM team_members 
    WHERE user_id = v_invitee_id
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'This user is already in another team.'
    );
  END IF;

  -- Check for existing pending invitation
  IF EXISTS (
    SELECT 1 FROM team_invitations 
    WHERE team_id = p_team_id 
    AND invitee_email = p_invitee_email 
    AND status = 'pending'
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'An invitation has already been sent to this user.'
    );
  END IF;

  -- Get team and inviter names
  SELECT name INTO v_team_name FROM teams WHERE id = p_team_id;
  SELECT name INTO v_inviter_name FROM auth.users WHERE id = p_inviter_id;

  -- Create invitation
  INSERT INTO team_invitations (
    team_id, inviter_id, invitee_id, invitee_email, 
    role, department, message
  ) VALUES (
    p_team_id, p_inviter_id, v_invitee_id, p_invitee_email,
    p_role, p_department, p_message
  ) RETURNING id INTO v_invitation_id;

  -- Create notification for invitee
  INSERT INTO notifications (
    user_id, type, title, message, payload, priority
  ) VALUES (
    v_invitee_id,
    'team_invite',
    'Team Invitation',
    format('You''ve been invited to join %s by %s', v_team_name, v_inviter_name),
    jsonb_build_object(
      'teamName', v_team_name,
      'inviterName', v_inviter_name,
      'invitationId', v_invitation_id
    ),
    8
  );

  RETURN jsonb_build_object(
    'success', true,
    'invitationId', v_invitation_id,
    'message', 'Invitation sent successfully'
  );
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_team_invitations_updated_at
  BEFORE UPDATE ON team_invitations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON team_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create scheduled job to clean up expired invitations (if pg_cron is available)
-- This would typically be set up in your cron job system
-- SELECT cron.schedule('cleanup-expired-invitations', '0 2 * * *', 'SELECT cleanup_expired_invitations();');
