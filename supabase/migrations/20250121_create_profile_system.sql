-- Create comprehensive profile system tables
-- This migration creates all necessary tables for the enhanced profile system

-- Create user_profiles table (main profile table)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  
  -- Basic Information
  universal_id UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  role VARCHAR(50) DEFAULT 'user',
  
  -- Versioning and Audit Trail
  version INTEGER DEFAULT 1,
  last_version_at TIMESTAMP WITH TIME ZONE,
  version_history JSONB DEFAULT '[]',
  
  -- Personal Information
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  display_name VARCHAR(100),
  bio TEXT,
  phone VARCHAR(20),
  location VARCHAR(255),
  timezone VARCHAR(50) DEFAULT 'UTC',
  website TEXT,
  linkedin TEXT,
  twitter TEXT,
  github TEXT,
  
  -- Professional Information
  job_title VARCHAR(255),
  department VARCHAR(100),
  manager VARCHAR(255),
  direct_reports TEXT[] DEFAULT '{}',
  hire_date DATE,
  employee_id VARCHAR(50),
  work_location VARCHAR(20) DEFAULT 'remote' CHECK (work_location IN ('remote', 'hybrid', 'office')),
  
  -- Interests and Tags
  interests TEXT[] DEFAULT '{}',
  
  -- Status and Availability
  status VARCHAR(20) DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'busy', 'away')),
  status_message TEXT,
  availability JSONB DEFAULT '{"isAvailable": true, "workingDays": [1,2,3,4,5], "timezone": "UTC", "vacationMode": false}',
  working_hours JSONB DEFAULT '{"start": "09:00", "end": "17:00", "days": [1,2,3,4,5], "timezone": "UTC"}',
  
  -- Preferences and Settings
  preferences JSONB DEFAULT '{}',
  privacy JSONB DEFAULT '{}',
  
  -- Performance and Activity Data
  performance_data JSONB DEFAULT '{}',
  activity_data JSONB DEFAULT '{}',
  
  -- System Fields
  is_active BOOLEAN DEFAULT true,
  profile_completion INTEGER DEFAULT 0 CHECK (profile_completion >= 0 AND profile_completion <= 100),
  onboarding_completed BOOLEAN DEFAULT false,
  last_active TIMESTAMP WITH TIME ZONE,
  last_login TIMESTAMP WITH TIME ZONE,
  
  -- Media Storage Strategy
  media_storage JSONB DEFAULT '{"avatarStorage": "supabase", "certificatesStorage": "supabase", "portfolioStorage": "supabase", "portfolioFiles": [], "storageQuota": 100, "storageUsed": 0}',
  
  -- GDPR and Data Management
  data_retention JSONB DEFAULT '{"retentionPeriod": 2555, "autoDeleteAfter": 3650, "anonymizeAfter": 1095, "exportBeforeDeletion": true, "notifyBeforeDeletion": true}',
  gdpr_consent JSONB DEFAULT '{"dataProcessing": true, "marketing": false, "analytics": true, "thirdPartySharing": false, "consentGivenAt": "", "consentVersion": "1.0"}',
  
  -- Profile Deletion/Deactivation
  deletion_status VARCHAR(20) DEFAULT 'active' CHECK (deletion_status IN ('active', 'pending_deletion', 'deactivated', 'deleted')),
  deletion_requested_at TIMESTAMP WITH TIME ZONE,
  deletion_scheduled_for TIMESTAMP WITH TIME ZONE,
  deletion_reason TEXT,
  
  -- Merge Strategy
  merged_from TEXT[] DEFAULT '{}',
  merged_to UUID,
  merge_history JSONB DEFAULT '[]',
  
  -- Security Settings
  security_settings JSONB DEFAULT '{"mfaEnabled": false, "mfaMethods": [], "sensitiveFieldsMfa": ["phone", "email", "personalInfo"], "lastSecurityReview": "", "securityScore": 0}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_skills table
CREATE TABLE IF NOT EXISTS user_skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) DEFAULT 'other' CHECK (category IN ('technical', 'soft', 'language', 'tool', 'framework', 'other')),
  level VARCHAR(20) DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  years_of_experience INTEGER,
  verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  endorsements INTEGER DEFAULT 0,
  endorsers TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_certifications table
CREATE TABLE IF NOT EXISTS user_certifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  issuer VARCHAR(255) NOT NULL,
  credential_id VARCHAR(255),
  issue_date DATE NOT NULL,
  expiry_date DATE,
  credential_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_languages table
CREATE TABLE IF NOT EXISTS user_languages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  language VARCHAR(100) NOT NULL,
  proficiency VARCHAR(20) DEFAULT 'elementary' CHECK (proficiency IN ('elementary', 'limited', 'professional', 'full', 'native')),
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) DEFAULT 'performance' CHECK (category IN ('performance', 'collaboration', 'innovation', 'leadership', 'learning')),
  icon VARCHAR(100),
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  points INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  verified_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_connections table
CREATE TABLE IF NOT EXISTS user_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  connected_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  connection_type VARCHAR(50) DEFAULT 'colleague' CHECK (connection_type IN ('colleague', 'mentor', 'mentee', 'collaborator', 'friend')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  mutual_connections INTEGER DEFAULT 0,
  collaboration_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, connected_user_id)
);

-- Create user_collaborations table
CREATE TABLE IF NOT EXISTS user_collaborations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  collaboration_type VARCHAR(50) NOT NULL CHECK (collaboration_type IN ('project', 'idea', 'task', 'meeting', 'other')),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  participants TEXT[] DEFAULT '{}',
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  outcome TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profile_timeline_events table
CREATE TABLE IF NOT EXISTS profile_timeline_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('achievement', 'skill_added', 'project_completed', 'idea_submitted', 'collaboration', 'status_change')),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  icon VARCHAR(100),
  is_public BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create gamification_data table
CREATE TABLE IF NOT EXISTS gamification_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  total_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  badges JSONB DEFAULT '[]',
  streaks JSONB DEFAULT '[]',
  progress_rings JSONB DEFAULT '[]',
  leaderboard_position INTEGER DEFAULT 0,
  next_milestone JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create trend_analytics table
CREATE TABLE IF NOT EXISTS trend_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  period VARCHAR(20) NOT NULL CHECK (period IN ('week', 'month', 'quarter', 'year')),
  skills_growth JSONB DEFAULT '[]',
  project_contributions JSONB DEFAULT '[]',
  collaboration_patterns JSONB DEFAULT '[]',
  productivity_metrics JSONB DEFAULT '[]',
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, period)
);

-- Create benchmarking_data table
CREATE TABLE IF NOT EXISTS benchmarking_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  team_average JSONB DEFAULT '{}',
  department_average JSONB DEFAULT '{}',
  company_average JSONB DEFAULT '{}',
  industry_average JSONB DEFAULT '{}',
  percentile_rankings JSONB DEFAULT '{}',
  recommendations JSONB DEFAULT '[]',
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create engagement_sentiment table
CREATE TABLE IF NOT EXISTS engagement_sentiment (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  overall_sentiment VARCHAR(20) DEFAULT 'neutral' CHECK (overall_sentiment IN ('positive', 'neutral', 'negative')),
  collaboration_sentiment DECIMAL(3,2) DEFAULT 0 CHECK (collaboration_sentiment >= -1 AND collaboration_sentiment <= 1),
  recognition_sentiment DECIMAL(3,2) DEFAULT 0 CHECK (recognition_sentiment >= -1 AND recognition_sentiment <= 1),
  idea_adoption_sentiment DECIMAL(3,2) DEFAULT 0 CHECK (idea_adoption_sentiment >= -1 AND idea_adoption_sentiment <= 1),
  patterns JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create admin_override_rules table
CREATE TABLE IF NOT EXISTS admin_override_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  conditions JSONB DEFAULT '[]',
  permissions JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profile_media_files table
CREATE TABLE IF NOT EXISTS profile_media_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('image', 'document', 'certificate', 'portfolio')),
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  size BIGINT NOT NULL, -- in bytes
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_public BOOLEAN DEFAULT false,
  storage_provider VARCHAR(50) DEFAULT 'supabase' CHECK (storage_provider IN ('supabase', 'cdn', 'local')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON user_profiles(status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_department ON user_profiles(department);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_location ON user_profiles(location);
CREATE INDEX IF NOT EXISTS idx_user_profiles_timezone ON user_profiles(timezone);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_active ON user_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON user_profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_user_profiles_updated_at ON user_profiles(updated_at);

CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_name ON user_skills(name);
CREATE INDEX IF NOT EXISTS idx_user_skills_category ON user_skills(category);
CREATE INDEX IF NOT EXISTS idx_user_skills_level ON user_skills(level);
CREATE INDEX IF NOT EXISTS idx_user_skills_is_public ON user_skills(is_public);

CREATE INDEX IF NOT EXISTS idx_user_certifications_user_id ON user_certifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_certifications_issuer ON user_certifications(issuer);
CREATE INDEX IF NOT EXISTS idx_user_certifications_is_public ON user_certifications(is_public);

CREATE INDEX IF NOT EXISTS idx_user_languages_user_id ON user_languages(user_id);
CREATE INDEX IF NOT EXISTS idx_user_languages_language ON user_languages(language);
CREATE INDEX IF NOT EXISTS idx_user_languages_is_public ON user_languages(is_public);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_category ON user_achievements(category);
CREATE INDEX IF NOT EXISTS idx_user_achievements_is_public ON user_achievements(is_public);

CREATE INDEX IF NOT EXISTS idx_user_connections_user_id ON user_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_connected_user_id ON user_connections(connected_user_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_status ON user_connections(status);

CREATE INDEX IF NOT EXISTS idx_user_collaborations_user_id ON user_collaborations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_collaborations_type ON user_collaborations(collaboration_type);
CREATE INDEX IF NOT EXISTS idx_user_collaborations_status ON user_collaborations(status);

CREATE INDEX IF NOT EXISTS idx_profile_timeline_events_user_id ON profile_timeline_events(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_timeline_events_type ON profile_timeline_events(type);
CREATE INDEX IF NOT EXISTS idx_profile_timeline_events_timestamp ON profile_timeline_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_profile_timeline_events_is_public ON profile_timeline_events(is_public);

CREATE INDEX IF NOT EXISTS idx_gamification_data_user_id ON gamification_data(user_id);
CREATE INDEX IF NOT EXISTS idx_gamification_data_level ON gamification_data(level);
CREATE INDEX IF NOT EXISTS idx_gamification_data_total_points ON gamification_data(total_points);

CREATE INDEX IF NOT EXISTS idx_trend_analytics_user_id ON trend_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_trend_analytics_period ON trend_analytics(period);
CREATE INDEX IF NOT EXISTS idx_trend_analytics_calculated_at ON trend_analytics(calculated_at);

CREATE INDEX IF NOT EXISTS idx_benchmarking_data_user_id ON benchmarking_data(user_id);
CREATE INDEX IF NOT EXISTS idx_benchmarking_data_calculated_at ON benchmarking_data(calculated_at);

CREATE INDEX IF NOT EXISTS idx_engagement_sentiment_user_id ON engagement_sentiment(user_id);
CREATE INDEX IF NOT EXISTS idx_engagement_sentiment_overall_sentiment ON engagement_sentiment(overall_sentiment);

CREATE INDEX IF NOT EXISTS idx_admin_override_rules_created_by ON admin_override_rules(created_by);
CREATE INDEX IF NOT EXISTS idx_admin_override_rules_is_active ON admin_override_rules(is_active);

CREATE INDEX IF NOT EXISTS idx_profile_media_files_user_id ON profile_media_files(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_media_files_type ON profile_media_files(type);
CREATE INDEX IF NOT EXISTS idx_profile_media_files_is_public ON profile_media_files(is_public);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamification_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE trend_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE benchmarking_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_sentiment ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_override_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_media_files ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Team members can view public profiles" ON user_profiles
  FOR SELECT USING (
    is_active = true AND 
    (privacy->>'profileVisibility' = 'public' OR 
     privacy->>'profileVisibility' = 'team')
  );

-- Create RLS policies for user_skills
CREATE POLICY "Users can manage own skills" ON user_skills
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Team members can view public skills" ON user_skills
  FOR SELECT USING (
    is_public = true AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = user_skills.user_id 
      AND is_active = true
      AND (privacy->>'skillsVisibility' = 'public' OR privacy->>'skillsVisibility' = 'team')
    )
  );

-- Create RLS policies for user_certifications
CREATE POLICY "Users can manage own certifications" ON user_certifications
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Team members can view public certifications" ON user_certifications
  FOR SELECT USING (
    is_public = true AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = user_certifications.user_id 
      AND is_active = true
    )
  );

-- Create RLS policies for user_languages
CREATE POLICY "Users can manage own languages" ON user_languages
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Team members can view public languages" ON user_languages
  FOR SELECT USING (
    is_public = true AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = user_languages.user_id 
      AND is_active = true
    )
  );

-- Create RLS policies for user_achievements
CREATE POLICY "Users can manage own achievements" ON user_achievements
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Team members can view public achievements" ON user_achievements
  FOR SELECT USING (
    is_public = true AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = user_achievements.user_id 
      AND is_active = true
    )
  );

-- Create RLS policies for user_connections
CREATE POLICY "Users can manage own connections" ON user_connections
  FOR ALL USING (auth.uid() = user_id OR auth.uid() = connected_user_id);

-- Create RLS policies for user_collaborations
CREATE POLICY "Users can manage own collaborations" ON user_collaborations
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for profile_timeline_events
CREATE POLICY "Users can manage own timeline events" ON profile_timeline_events
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Team members can view public timeline events" ON profile_timeline_events
  FOR SELECT USING (
    is_public = true AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = profile_timeline_events.user_id 
      AND is_active = true
    )
  );

-- Create RLS policies for gamification_data
CREATE POLICY "Users can manage own gamification data" ON gamification_data
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Team members can view gamification data" ON gamification_data
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = gamification_data.user_id 
      AND is_active = true
    )
  );

-- Create RLS policies for trend_analytics
CREATE POLICY "Users can manage own trend analytics" ON trend_analytics
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for benchmarking_data
CREATE POLICY "Users can manage own benchmarking data" ON benchmarking_data
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for engagement_sentiment
CREATE POLICY "Users can manage own engagement sentiment" ON engagement_sentiment
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for admin_override_rules
CREATE POLICY "Admins can manage override rules" ON admin_override_rules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Create RLS policies for profile_media_files
CREATE POLICY "Users can manage own media files" ON profile_media_files
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Team members can view public media files" ON profile_media_files
  FOR SELECT USING (
    is_public = true AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = profile_media_files.user_id 
      AND is_active = true
    )
  );

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_skills_updated_at BEFORE UPDATE ON user_skills
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_certifications_updated_at BEFORE UPDATE ON user_certifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_languages_updated_at BEFORE UPDATE ON user_languages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_achievements_updated_at BEFORE UPDATE ON user_achievements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_connections_updated_at BEFORE UPDATE ON user_connections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_collaborations_updated_at BEFORE UPDATE ON user_collaborations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to calculate profile completion
CREATE OR REPLACE FUNCTION calculate_profile_completion(profile_id UUID)
RETURNS INTEGER AS $$
DECLARE
    completion_score INTEGER := 0;
    total_fields INTEGER := 7;
    profile_record RECORD;
BEGIN
    SELECT * INTO profile_record FROM user_profiles WHERE id = profile_id;
    
    -- Check required fields
    IF profile_record.first_name IS NOT NULL AND profile_record.first_name != '' THEN
        completion_score := completion_score + 1;
    END IF;
    
    IF profile_record.last_name IS NOT NULL AND profile_record.last_name != '' THEN
        completion_score := completion_score + 1;
    END IF;
    
    IF profile_record.bio IS NOT NULL AND profile_record.bio != '' THEN
        completion_score := completion_score + 1;
    END IF;
    
    IF profile_record.job_title IS NOT NULL AND profile_record.job_title != '' THEN
        completion_score := completion_score + 1;
    END IF;
    
    IF profile_record.location IS NOT NULL AND profile_record.location != '' THEN
        completion_score := completion_score + 1;
    END IF;
    
    IF profile_record.timezone IS NOT NULL AND profile_record.timezone != '' THEN
        completion_score := completion_score + 1;
    END IF;
    
    IF EXISTS (SELECT 1 FROM user_skills WHERE user_id = profile_id) THEN
        completion_score := completion_score + 1;
    END IF;
    
    RETURN ROUND((completion_score::DECIMAL / total_fields) * 100);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update profile completion
CREATE OR REPLACE FUNCTION update_profile_completion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.profile_completion := calculate_profile_completion(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profile_completion_trigger
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_profile_completion();

-- Create function to merge profiles
CREATE OR REPLACE FUNCTION merge_profiles(
    source_id UUID,
    target_id UUID,
    merge_reason TEXT,
    merged_by UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    source_profile RECORD;
    target_profile RECORD;
    merge_record JSONB;
BEGIN
    -- Get source profile
    SELECT * INTO source_profile FROM user_profiles WHERE id = source_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Source profile not found';
    END IF;

    -- Get target profile
    SELECT * INTO target_profile FROM user_profiles WHERE id = target_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Target profile not found';
    END IF;

    -- Create merge record
    merge_record := jsonb_build_object(
        'id', gen_random_uuid(),
        'sourceProfileId', source_id,
        'targetProfileId', target_id,
        'mergedAt', NOW(),
        'mergedBy', merged_by,
        'mergeReason', merge_reason,
        'dataConflicts', '[]'::jsonb,
        'resolutionStrategy', 'target_wins'
    );

    -- Update target profile with merged data
    UPDATE user_profiles SET
        merged_from = COALESCE(merged_from, '{}') || ARRAY[source_id::text],
        merge_history = COALESCE(merge_history, '[]'::jsonb) || jsonb_build_array(merge_record),
        updated_at = NOW()
    WHERE id = target_id;

    -- Mark source profile as merged
    UPDATE user_profiles SET
        merged_to = target_id,
        is_active = false,
        deletion_status = 'deleted',
        updated_at = NOW()
    WHERE id = source_id;

    -- Move related data to target profile
    UPDATE user_skills SET user_id = target_id WHERE user_id = source_id;
    UPDATE user_certifications SET user_id = target_id WHERE user_id = source_id;
    UPDATE user_languages SET user_id = target_id WHERE user_id = source_id;
    UPDATE user_achievements SET user_id = target_id WHERE user_id = source_id;
    UPDATE user_connections SET user_id = target_id WHERE user_id = source_id;
    UPDATE user_collaborations SET user_id = target_id WHERE user_id = source_id;
    UPDATE profile_timeline_events SET user_id = target_id WHERE user_id = source_id;
    UPDATE gamification_data SET user_id = target_id WHERE user_id = source_id;
    UPDATE trend_analytics SET user_id = target_id WHERE user_id = source_id;
    UPDATE benchmarking_data SET user_id = target_id WHERE user_id = source_id;
    UPDATE engagement_sentiment SET user_id = target_id WHERE user_id = source_id;
    UPDATE profile_media_files SET user_id = target_id WHERE user_id = source_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Insert default profile for existing users (if any)
INSERT INTO user_profiles (id, email, name, role, created_at, updated_at)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', 'User') as name,
    COALESCE(raw_user_meta_data->>'role', 'user') as role,
    created_at,
    updated_at
FROM auth.users
WHERE id NOT IN (SELECT id FROM user_profiles)
ON CONFLICT (id) DO NOTHING;
