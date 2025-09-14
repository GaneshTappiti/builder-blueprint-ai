# Supabase Setup Guide

## Quick Setup Steps

### 1. Create Supabase Project
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `builder-blueprint-ai`
   - Database Password: (create a strong password)
   - Region: Choose closest to you
5. Click "Create new project"

### 2. Get Your Credentials
1. Go to Settings → API
2. Copy these values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **Project API keys → anon public** (starts with `eyJ...`)

### 3. Update Environment Variables
Replace the values in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Set up Database Schema
Run this SQL in your Supabase SQL Editor (Dashboard → SQL Editor):

```sql
-- Copy and paste the contents of each migration file in order:
-- 1. 20250102_create_profile_system.sql
-- 2. 20250103_create_projects_tasks_tables.sql
-- 3. 20250104_create_team_invitations_table.sql
-- 4. 20250106_create_rag_tool_documentation.sql
-- 5. 20250120_create_ideas_table.sql
-- 6. 20250121_create_chat_system.sql
-- 7. 20250122_enhance_chat_system.sql
-- 8. 20250125_fix_profile_creation_trigger.sql
-- 9. 20250126_create_missing_tables.sql
-- 10. 20250127_cleanup_unnecessary_tables.sql
```

### 5. Configure Authentication
1. Go to Authentication → Settings
2. Set **Site URL** to: `http://localhost:3000`
3. Add **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/workspace`

### 6. Test the Setup
1. Restart your development server: `npm run dev`
2. Go to `http://localhost:3000`
3. Try to access `/workspace` - you should be redirected to `/auth`
4. Create a test account and verify authentication works

## What This Gives You

✅ **Full Authentication System**
- User registration and login
- Password reset functionality
- Email verification (optional)

✅ **Complete Database Schema**
- User profiles
- Projects and tasks
- Ideas vault
- Team management
- Chat system
- RAG tool documentation

✅ **Production-Ready Features**
- Row Level Security (RLS)
- Real-time subscriptions
- File storage
- API endpoints

## Troubleshooting

If you encounter issues:
1. Check the browser console for errors
2. Verify your environment variables are correct
3. Make sure all migrations ran successfully
4. Check Supabase logs in the dashboard

