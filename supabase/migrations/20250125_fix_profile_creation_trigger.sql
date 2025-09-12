-- Fix Critical Profile Creation Issues
-- This migration addresses the missing database trigger and race condition issues

-- Create function to handle new user profile creation with proper error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert profile with proper error handling and conflict resolution
  INSERT INTO user_profiles (
    id, 
    email, 
    name, 
    avatar_url, 
    role,
    created_at,
    updated_at,
    profile_creation_status
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'User'),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    NEW.created_at,
    NEW.updated_at,
    'completed'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    avatar_url = EXCLUDED.avatar_url,
    role = EXCLUDED.role,
    updated_at = NOW(),
    profile_creation_status = 'completed';
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the auth user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Add profile creation status tracking column
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS profile_creation_status VARCHAR(20) DEFAULT 'completed' 
CHECK (profile_creation_status IN ('pending', 'completed', 'failed'));

-- Add profile creation error tracking
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS profile_creation_error TEXT;

-- Add last profile sync timestamp
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS last_profile_sync TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create function to safely upsert profile data
CREATE OR REPLACE FUNCTION upsert_user_profile(
  user_id UUID,
  profile_data JSONB
)
RETURNS BOOLEAN AS $$
BEGIN
  INSERT INTO user_profiles (
    id,
    email,
    name,
    avatar_url,
    role,
    first_name,
    last_name,
    display_name,
    bio,
    phone,
    location,
    timezone,
    job_title,
    department,
    status,
    preferences,
    privacy,
    working_hours,
    availability,
    profile_completion,
    is_active,
    created_at,
    updated_at,
    last_profile_sync
  ) VALUES (
    user_id,
    COALESCE(profile_data->>'email', ''),
    COALESCE(profile_data->>'name', 'User'),
    profile_data->>'avatar_url',
    COALESCE(profile_data->>'role', 'user'),
    profile_data->>'firstName',
    profile_data->>'lastName',
    profile_data->>'displayName',
    profile_data->>'bio',
    profile_data->>'phone',
    profile_data->>'location',
    COALESCE(profile_data->>'timezone', 'UTC'),
    profile_data->>'jobTitle',
    profile_data->>'department',
    COALESCE(profile_data->>'status', 'offline'),
    COALESCE(profile_data->'preferences', '{}'),
    COALESCE(profile_data->'privacy', '{}'),
    COALESCE(profile_data->'workingHours', '{"start": "09:00", "end": "17:00", "days": [1,2,3,4,5], "timezone": "UTC"}'),
    COALESCE(profile_data->'availability', '{"isAvailable": true, "workingDays": [1,2,3,4,5], "timezone": "UTC", "vacationMode": false}'),
    COALESCE((profile_data->>'profileCompletion')::INTEGER, 0),
    COALESCE((profile_data->>'isActive')::BOOLEAN, true),
    COALESCE((profile_data->>'created_at')::TIMESTAMP WITH TIME ZONE, NOW()),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    avatar_url = EXCLUDED.avatar_url,
    role = EXCLUDED.role,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    display_name = EXCLUDED.display_name,
    bio = EXCLUDED.bio,
    phone = EXCLUDED.phone,
    location = EXCLUDED.location,
    timezone = EXCLUDED.timezone,
    job_title = EXCLUDED.job_title,
    department = EXCLUDED.department,
    status = EXCLUDED.status,
    preferences = EXCLUDED.preferences,
    privacy = EXCLUDED.privacy,
    working_hours = EXCLUDED.working_hours,
    availability = EXCLUDED.availability,
    profile_completion = EXCLUDED.profile_completion,
    is_active = EXCLUDED.is_active,
    updated_at = NOW(),
    last_profile_sync = NOW(),
    profile_creation_status = 'completed',
    profile_creation_error = NULL;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    -- Update profile with error status
    UPDATE user_profiles 
    SET 
      profile_creation_status = 'failed',
      profile_creation_error = SQLERRM,
      updated_at = NOW()
    WHERE id = user_id;
    
    RAISE WARNING 'Failed to upsert profile for user %: %', user_id, SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to validate profile sync
CREATE OR REPLACE FUNCTION validate_profile_sync(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  auth_user RECORD;
  profile_record RECORD;
BEGIN
  -- Get auth user data
  SELECT id, email, created_at, updated_at, raw_user_meta_data
  INTO auth_user
  FROM auth.users
  WHERE id = user_id;
  
  -- Get profile data
  SELECT id, email, created_at, updated_at
  INTO profile_record
  FROM user_profiles
  WHERE id = user_id;
  
  -- Check if both exist and data matches
  IF auth_user.id IS NULL OR profile_record.id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if email matches
  IF auth_user.email != profile_record.email THEN
    RETURN FALSE;
  END IF;
  
  -- Check if profile is not too old compared to auth user
  IF profile_record.updated_at < auth_user.updated_at - INTERVAL '1 hour' THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to retry failed profile creation
CREATE OR REPLACE FUNCTION retry_profile_creation(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  auth_user RECORD;
  retry_count INTEGER := 0;
  max_retries INTEGER := 3;
BEGIN
  -- Get auth user data
  SELECT id, email, created_at, updated_at, raw_user_meta_data
  INTO auth_user
  FROM auth.users
  WHERE id = user_id;
  
  IF auth_user.id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Try to create profile with retry logic
  WHILE retry_count < max_retries LOOP
    BEGIN
      -- Attempt to create profile
      INSERT INTO user_profiles (
        id, 
        email, 
        name, 
        avatar_url, 
        role,
        created_at,
        updated_at,
        profile_creation_status,
        last_profile_sync
      ) VALUES (
        auth_user.id,
        auth_user.email,
        COALESCE(auth_user.raw_user_meta_data->>'full_name', auth_user.raw_user_meta_data->>'name', 'User'),
        auth_user.raw_user_meta_data->>'avatar_url',
        COALESCE(auth_user.raw_user_meta_data->>'role', 'user'),
        auth_user.created_at,
        auth_user.updated_at,
        'completed',
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        avatar_url = EXCLUDED.avatar_url,
        role = EXCLUDED.role,
        updated_at = NOW(),
        last_profile_sync = NOW(),
        profile_creation_status = 'completed',
        profile_creation_error = NULL;
      
      RETURN TRUE;
    EXCEPTION
      WHEN OTHERS THEN
        retry_count := retry_count + 1;
        IF retry_count < max_retries THEN
          PERFORM pg_sleep(1 * retry_count); -- Exponential backoff
        END IF;
    END;
  END LOOP;
  
  -- Mark as failed if all retries exhausted
  UPDATE user_profiles 
  SET 
    profile_creation_status = 'failed',
    profile_creation_error = 'Max retries exceeded',
    updated_at = NOW()
  WHERE id = user_id;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_creation_status 
ON user_profiles(profile_creation_status) 
WHERE profile_creation_status IN ('pending', 'failed');

-- Create index for sync validation
CREATE INDEX IF NOT EXISTS idx_user_profiles_last_sync 
ON user_profiles(last_profile_sync);

-- Update existing profiles to have proper status
UPDATE user_profiles 
SET 
  profile_creation_status = 'completed',
  last_profile_sync = COALESCE(updated_at, created_at)
WHERE profile_creation_status IS NULL;
