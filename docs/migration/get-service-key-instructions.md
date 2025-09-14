# How to Fix Profile Creation Issues

## Current Status
✅ **Database Connection**: Working  
✅ **Authentication**: Working (users can sign up successfully)  
❌ **Profile Creation**: Failing due to RLS policies  
❌ **Service Key**: Invalid placeholder  

## Step 1: Get the Real Service Role Key

1. **Go to your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project: `isvjuagegfnkuaucpsvj`

2. **Navigate to API Settings**
   - Go to Settings → API
   - You'll see two keys:
     - `anon` `public` (this is what you already have)
     - `service_role` `secret` (this is what you need)

3. **Copy the Service Role Key**
   - Click the "Reveal" button next to the service_role key
   - Copy the entire key (it starts with `eyJ...`)

4. **Update .env.local**
   - Open `.env.local` in your project
   - Replace the placeholder service key with the real one:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your-real-key-here
   ```

## Step 2: Fix Profile Creation

After getting the service key, run this command to fix the profile creation issues:

```bash
node scripts/fix-profile-creation-issues.js
```

This will:
- Create a database trigger to automatically create profiles when users sign up
- Fix RLS policies to allow proper profile creation
- Test the fix to make sure it works

## Step 3: Test Manually

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Test the authentication flow**
   - Go to http://localhost:3000/auth
   - Create a new account
   - Check if profile is created automatically

3. **Run the test suite**
   ```bash
   node scripts/test-profile-creation-final.js
   ```

## What This Fixes

- **Automatic Profile Creation**: Users will get profiles created automatically when they sign up
- **RLS Policies**: Proper security policies that allow authenticated users to manage their profiles
- **Service Key Access**: Admin operations will work for testing and maintenance

## Alternative: Manual Database Setup

If you prefer to set up the database manually, you can run this SQL in your Supabase SQL Editor:

```sql
-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (
    id, email, name, avatar_url, role, created_at, updated_at, profile_creation_status
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
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

## Expected Results

After completing these steps:
- ✅ Users can sign up successfully
- ✅ Profiles are created automatically
- ✅ Users can view and edit their profiles
- ✅ All tests pass
- ✅ RLS security is maintained
