-- Comprehensive Database Setup Script
-- This script ensures all required tables exist for the profile system

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create user_profiles table with all required fields
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  first_name TEXT,
  last_name TEXT,
  display_name TEXT,
  bio TEXT,
  phone TEXT,
  location TEXT,
  timezone TEXT DEFAULT 'UTC',
  website TEXT,
  linkedin TEXT,
  twitter TEXT,
  github TEXT,
  job_title TEXT,
  department TEXT,
  manager TEXT,
  direct_reports TEXT[],
  hire_date DATE,
  employee_id TEXT,
  work_location TEXT DEFAULT 'remote',
  skills JSONB DEFAULT '[]'::jsonb,
  certifications JSONB DEFAULT '[]'::jsonb,
  languages JSONB DEFAULT '[]'::jsonb,
  interests TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'offline',
  availability JSONB DEFAULT '{"isAvailable": true, "workingDays": [1,2,3,4,5], "timezone": "UTC", "vacationMode": false}'::jsonb,
  working_hours JSONB DEFAULT '{"start": "09:00", "end": "17:00", "timezone": "UTC"}'::jsonb,
  preferences JSONB DEFAULT '{}'::jsonb,
  privacy JSONB DEFAULT '{}'::jsonb,
  performance_data JSONB DEFAULT '{}'::jsonb,
  activity_data JSONB DEFAULT '{}'::jsonb,
  team_member JSONB,
  team_role TEXT,
  permissions TEXT[] DEFAULT '{}',
  connections JSONB DEFAULT '[]'::jsonb,
  collaborations JSONB DEFAULT '[]'::jsonb,
  achievements JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  profile_completion INTEGER DEFAULT 0,
  onboarding_completed BOOLEAN DEFAULT false,
  universal_id TEXT,
  version INTEGER DEFAULT 1,
  version_history JSONB DEFAULT '[]'::jsonb,
  media_storage JSONB DEFAULT '{"used": 0, "limit": 1000000000, "files": []}'::jsonb,
  data_retention JSONB DEFAULT '{"policy": "standard", "retentionPeriod": 365, "autoDelete": false}'::jsonb,
  gdpr_consent JSONB DEFAULT '{"given": false, "date": null, "version": "1.0"}'::jsonb,
  deletion_status JSONB DEFAULT '{"status": "active", "requestedAt": null, "scheduledFor": null, "reason": null}'::jsonb,
  merge_history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_skills table
CREATE TABLE IF NOT EXISTS user_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  level TEXT NOT NULL,
  category TEXT,
  years_experience INTEGER,
  last_used DATE,
  is_certified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_certifications table
CREATE TABLE IF NOT EXISTS user_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  issuer TEXT NOT NULL,
  issue_date DATE NOT NULL,
  expiry_date DATE,
  credential_id TEXT,
  credential_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_languages table
CREATE TABLE IF NOT EXISTS user_languages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  proficiency TEXT NOT NULL,
  is_native BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  earned_date DATE NOT NULL,
  issuer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create profile_timeline_events table
CREATE TABLE IF NOT EXISTS profile_timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create gamification_data table
CREATE TABLE IF NOT EXISTS gamification_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  badges JSONB DEFAULT '[]'::jsonb,
  achievements JSONB DEFAULT '[]'::jsonb,
  streak_days INTEGER DEFAULT 0,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON user_profiles(status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_active ON user_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_certifications_user_id ON user_certifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_languages_user_id ON user_languages(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_timeline_events_user_id ON profile_timeline_events(user_id);
CREATE INDEX IF NOT EXISTS idx_gamification_data_user_id ON gamification_data(user_id);

-- Create the profile creation trigger function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (
    id, email, name, avatar_url, role, created_at, updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create function to calculate profile completion
CREATE OR REPLACE FUNCTION calculate_profile_completion(profile_data JSONB)
RETURNS INTEGER AS $$
DECLARE
  completion INTEGER := 0;
  total_fields INTEGER := 20;
  filled_fields INTEGER := 0;
BEGIN
  -- Check required fields
  IF profile_data->>'email' IS NOT NULL AND profile_data->>'email' != '' THEN
    filled_fields := filled_fields + 1;
  END IF;
  
  IF profile_data->>'name' IS NOT NULL AND profile_data->>'name' != '' THEN
    filled_fields := filled_fields + 1;
  END IF;
  
  IF profile_data->>'first_name' IS NOT NULL AND profile_data->>'first_name' != '' THEN
    filled_fields := filled_fields + 1;
  END IF;
  
  IF profile_data->>'last_name' IS NOT NULL AND profile_data->>'last_name' != '' THEN
    filled_fields := filled_fields + 1;
  END IF;
  
  IF profile_data->>'bio' IS NOT NULL AND profile_data->>'bio' != '' THEN
    filled_fields := filled_fields + 1;
  END IF;
  
  IF profile_data->>'phone' IS NOT NULL AND profile_data->>'phone' != '' THEN
    filled_fields := filled_fields + 1;
  END IF;
  
  IF profile_data->>'location' IS NOT NULL AND profile_data->>'location' != '' THEN
    filled_fields := filled_fields + 1;
  END IF;
  
  IF profile_data->>'job_title' IS NOT NULL AND profile_data->>'job_title' != '' THEN
    filled_fields := filled_fields + 1;
  END IF;
  
  IF profile_data->>'department' IS NOT NULL AND profile_data->>'department' != '' THEN
    filled_fields := filled_fields + 1;
  END IF;
  
  IF profile_data->>'website' IS NOT NULL AND profile_data->>'website' != '' THEN
    filled_fields := filled_fields + 1;
  END IF;
  
  IF profile_data->>'linkedin' IS NOT NULL AND profile_data->>'linkedin' != '' THEN
    filled_fields := filled_fields + 1;
  END IF;
  
  IF profile_data->>'twitter' IS NOT NULL AND profile_data->>'twitter' != '' THEN
    filled_fields := filled_fields + 1;
  END IF;
  
  IF profile_data->>'github' IS NOT NULL AND profile_data->>'github' != '' THEN
    filled_fields := filled_fields + 1;
  END IF;
  
  IF profile_data->'skills' IS NOT NULL AND jsonb_array_length(profile_data->'skills') > 0 THEN
    filled_fields := filled_fields + 1;
  END IF;
  
  IF profile_data->'certifications' IS NOT NULL AND jsonb_array_length(profile_data->'certifications') > 0 THEN
    filled_fields := filled_fields + 1;
  END IF;
  
  IF profile_data->'languages' IS NOT NULL AND jsonb_array_length(profile_data->'languages') > 0 THEN
    filled_fields := filled_fields + 1;
  END IF;
  
  IF profile_data->'interests' IS NOT NULL AND jsonb_array_length(profile_data->'interests') > 0 THEN
    filled_fields := filled_fields + 1;
  END IF;
  
  IF profile_data->>'timezone' IS NOT NULL AND profile_data->>'timezone' != '' THEN
    filled_fields := filled_fields + 1;
  END IF;
  
  IF profile_data->>'work_location' IS NOT NULL AND profile_data->>'work_location' != '' THEN
    filled_fields := filled_fields + 1;
  END IF;
  
  IF profile_data->'preferences' IS NOT NULL AND profile_data->'preferences' != '{}'::jsonb THEN
    filled_fields := filled_fields + 1;
  END IF;
  
  -- Calculate completion percentage
  completion := (filled_fields * 100) / total_fields;
  
  RETURN completion;
END;
$$ LANGUAGE plpgsql;

-- Create function to update profile completion automatically
CREATE OR REPLACE FUNCTION update_profile_completion()
RETURNS TRIGGER AS $$
BEGIN
  NEW.profile_completion := calculate_profile_completion(
    jsonb_build_object(
      'email', NEW.email,
      'name', NEW.name,
      'first_name', NEW.first_name,
      'last_name', NEW.last_name,
      'bio', NEW.bio,
      'phone', NEW.phone,
      'location', NEW.location,
      'job_title', NEW.job_title,
      'department', NEW.department,
      'website', NEW.website,
      'linkedin', NEW.linkedin,
      'twitter', NEW.twitter,
      'github', NEW.github,
      'skills', NEW.skills,
      'certifications', NEW.certifications,
      'languages', NEW.languages,
      'interests', to_jsonb(NEW.interests),
      'timezone', NEW.timezone,
      'work_location', NEW.work_location,
      'preferences', NEW.preferences
    )
  );
  
  NEW.updated_at := NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update profile completion
DROP TRIGGER IF EXISTS update_profile_completion_trigger ON user_profiles;
CREATE TRIGGER update_profile_completion_trigger
  BEFORE INSERT OR UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_profile_completion();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamification_data ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own skills" ON user_skills
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own skills" ON user_skills
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own certifications" ON user_certifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own certifications" ON user_certifications
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own languages" ON user_languages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own languages" ON user_languages
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own achievements" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own achievements" ON user_achievements
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own timeline events" ON profile_timeline_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own timeline events" ON profile_timeline_events
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own gamification data" ON gamification_data
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own gamification data" ON gamification_data
  FOR ALL USING (auth.uid() = user_id);

-- Create a function to get user profile with all related data
CREATE OR REPLACE FUNCTION get_user_profile_with_relations(user_id UUID)
RETURNS JSONB AS $$
DECLARE
  profile_data JSONB;
  skills_data JSONB;
  certifications_data JSONB;
  languages_data JSONB;
  achievements_data JSONB;
  timeline_data JSONB;
  gamification_data JSONB;
BEGIN
  -- Get main profile data
  SELECT to_jsonb(p.*) INTO profile_data
  FROM user_profiles p
  WHERE p.id = user_id;
  
  -- Get skills data
  SELECT COALESCE(jsonb_agg(to_jsonb(s.*)), '[]'::jsonb) INTO skills_data
  FROM user_skills s
  WHERE s.user_id = user_id;
  
  -- Get certifications data
  SELECT COALESCE(jsonb_agg(to_jsonb(c.*)), '[]'::jsonb) INTO certifications_data
  FROM user_certifications c
  WHERE c.user_id = user_id;
  
  -- Get languages data
  SELECT COALESCE(jsonb_agg(to_jsonb(l.*)), '[]'::jsonb) INTO languages_data
  FROM user_languages l
  WHERE l.user_id = user_id;
  
  -- Get achievements data
  SELECT COALESCE(jsonb_agg(to_jsonb(a.*)), '[]'::jsonb) INTO achievements_data
  FROM user_achievements a
  WHERE a.user_id = user_id;
  
  -- Get timeline data
  SELECT COALESCE(jsonb_agg(to_jsonb(t.*) ORDER BY t.timestamp DESC), '[]'::jsonb) INTO timeline_data
  FROM profile_timeline_events t
  WHERE t.user_id = user_id;
  
  -- Get gamification data
  SELECT to_jsonb(g.*) INTO gamification_data
  FROM gamification_data g
  WHERE g.user_id = user_id;
  
  -- Combine all data
  profile_data := profile_data || jsonb_build_object(
    'skills', skills_data,
    'certifications', certifications_data,
    'languages', languages_data,
    'achievements', achievements_data,
    'timeline_events', timeline_data,
    'gamification', gamification_data
  );
  
  RETURN profile_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_user_profile_with_relations(UUID) TO anon, authenticated;

-- Create a function to check if profile exists
CREATE OR REPLACE FUNCTION profile_exists(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(SELECT 1 FROM user_profiles WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION profile_exists(UUID) TO anon, authenticated;

-- Insert a test profile if none exists (for testing)
INSERT INTO user_profiles (id, email, name, role)
SELECT 
  gen_random_uuid(),
  'test@example.com',
  'Test User',
  'user'
WHERE NOT EXISTS (SELECT 1 FROM user_profiles LIMIT 1);

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Database setup completed successfully!';
  RAISE NOTICE 'All tables, indexes, triggers, and functions have been created.';
  RAISE NOTICE 'Row Level Security policies have been applied.';
END $$;
