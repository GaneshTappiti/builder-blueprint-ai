# Authentication Setup Guide

## Issues Fixed

✅ **Fixed Google/GitHub Button Icons**: Replaced generic Mail icons with proper Google and GitHub icons
✅ **Improved Button Styling**: Enhanced visual consistency across login and signup forms
✅ **OAuth Functionality**: All social login buttons now have proper click handlers

## Required Setup

To make authentication fully functional, you need to configure Supabase:

### 1. Create Environment File

Create a `.env.local` file in your project root with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Google Gemini AI Configuration (optional)
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Supabase Project Setup

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or use existing one
3. Go to Settings > API
4. Copy your Project URL and anon public key
5. Paste them into your `.env.local` file

### 3. OAuth Provider Setup

#### Google OAuth:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/auth/callback` (development)
   - `https://yourdomain.com/auth/callback` (production)
6. In Supabase Dashboard > Authentication > Providers:
   - Enable Google provider
   - Add your Google Client ID and Secret

#### GitHub OAuth:
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set Authorization callback URL:
   - `http://localhost:3000/auth/callback` (development)
   - `https://yourdomain.com/auth/callback` (production)
4. In Supabase Dashboard > Authentication > Providers:
   - Enable GitHub provider
   - Add your GitHub Client ID and Secret

### 4. Database Setup

The authentication system expects these tables in your Supabase database:

```sql
-- Users table (automatically created by Supabase Auth)
-- Additional user data can be stored in a profiles table

CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

## Current Status

- ✅ Authentication page UI is fully functional
- ✅ All buttons have proper click handlers
- ✅ Icons are correctly displayed
- ✅ Form validation is working
- ⚠️ Requires Supabase configuration to be fully functional
- ⚠️ OAuth providers need to be configured in Supabase dashboard

## Testing

After setup:
1. Start your development server: `npm run dev`
2. Navigate to `/auth`
3. Test email/password authentication
4. Test Google OAuth (if configured)
5. Test GitHub OAuth (if configured)

## Troubleshooting

- **"Supabase not configured" error**: Check your `.env.local` file
- **OAuth redirect issues**: Verify redirect URLs in both Supabase and OAuth provider settings
- **Database errors**: Ensure your Supabase database has the required tables and policies
