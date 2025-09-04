# Supabase Setup Instructions

## Environment Variables Required

To fix the Supabase configuration error, you need to create a `.env.local` file in your project root with the following variables:

```env
# Supabase Configuration
# Get these values from your Supabase project dashboard:
# https://supabase.com/dashboard/project/_/settings/api
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Google Gemini AI Configuration
# Get your API key from: https://aistudio.google.com/app/apikey
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
```

## How to Get Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or select an existing one
3. Go to Settings → API
4. Copy the following values:
   - **Project URL** → Use as `NEXT_PUBLIC_SUPABASE_URL`
   - **Project API keys → anon public** → Use as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## How to Get Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key and use it as `GOOGLE_GEMINI_API_KEY`

## Current Status

The application has been updated to handle missing Supabase configuration gracefully:
- ✅ No more runtime errors when Supabase is not configured
- ✅ Database features will show appropriate error messages
- ✅ Application will continue to work for non-database features
- ✅ Clear warnings in console about missing configuration

Once you add the environment variables, restart your development server and the database features will work properly.
