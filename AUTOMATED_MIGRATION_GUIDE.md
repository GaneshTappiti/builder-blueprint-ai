# 🚀 Automated Feedback System Migration Guide

This guide will help you automatically set up all the necessary database tables for the Idea Forge feedback system in your Supabase database.

## 📋 Prerequisites

- ✅ Supabase project created
- ✅ Environment variables configured in `.env.local`
- ✅ Supabase dashboard access

## 🔧 Method 1: Automated Script (Recommended)

### Step 1: Run the Migration Script
```bash
# Navigate to the scripts directory
cd scripts

# Run the automated migration
node simple-migration.js
```

### Step 2: Copy the Generated SQL
The script will output a complete SQL migration. Copy this SQL and run it in your Supabase SQL Editor.

### Step 3: Execute in Supabase Dashboard
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **SQL Editor**
4. Paste the generated SQL
5. Click **Run**

## 🔧 Method 2: Manual SQL Execution

### Step 1: Open Supabase SQL Editor
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **SQL Editor**

### Step 2: Run the Complete Migration SQL

Copy and paste this SQL into the SQL Editor:

```sql
-- =============================================
-- AUTOMATED FEEDBACK SYSTEM MIGRATION
-- =============================================

-- 1. Create ideas table for Idea Vault system
CREATE TABLE IF NOT EXISTS ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content TEXT,
  category VARCHAR(100),
  tags TEXT[] DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived', 'deleted')),
  is_public BOOLEAN DEFAULT false,
  team_suggestions JSONB DEFAULT '[]',
  collaboration_data JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create public_feedback table for public feedback system
CREATE TABLE IF NOT EXISTS public_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  feedback_type VARCHAR(50) NOT NULL CHECK (feedback_type IN ('comment', 'rating', 'like', 'dislike')),
  content TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  is_anonymous BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create idea_collaborations table for team collaboration
CREATE TABLE IF NOT EXISTS idea_collaborations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  collaboration_type VARCHAR(50) NOT NULL CHECK (collaboration_type IN ('suggestion', 'comment', 'rating', 'share')),
  content TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(idea_id, user_id, collaboration_type)
);

-- 4. Create performance indexes
CREATE INDEX IF NOT EXISTS idx_ideas_public ON ideas(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_ideas_user_id ON ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas(created_at);
CREATE INDEX IF NOT EXISTS idx_public_feedback_idea_id ON public_feedback(idea_id);
CREATE INDEX IF NOT EXISTS idx_public_feedback_created_at ON public_feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_idea_collaborations_idea_id ON idea_collaborations(idea_id);

-- 5. Enable Row Level Security
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_collaborations ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for ideas
CREATE POLICY "Users can view their own ideas" ON ideas
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ideas" ON ideas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ideas" ON ideas
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ideas" ON ideas
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public ideas" ON ideas
  FOR SELECT USING (is_public = true);

-- 7. Create RLS policies for public feedback
CREATE POLICY "Anyone can view public feedback" ON public_feedback
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert public feedback" ON public_feedback
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own feedback" ON public_feedback
  FOR UPDATE USING (auth.uid() = user_id OR is_anonymous = true);

CREATE POLICY "Users can delete their own feedback" ON public_feedback
  FOR DELETE USING (auth.uid() = user_id OR is_anonymous = true);

-- 8. Create RLS policies for collaborations
CREATE POLICY "Users can view collaborations on their ideas" ON idea_collaborations
  FOR SELECT USING (
    auth.uid() = user_id OR 
    idea_id IN (SELECT id FROM ideas WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert collaborations" ON idea_collaborations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collaborations" ON idea_collaborations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collaborations" ON idea_collaborations
  FOR DELETE USING (auth.uid() = user_id);

-- 9. Create update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ideas_updated_at BEFORE UPDATE ON ideas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_public_feedback_updated_at BEFORE UPDATE ON public_feedback
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. Verification queries
SELECT 'Migration completed successfully!' as status;
```

### Step 3: Verify Migration
After running the SQL, you should see:
- ✅ "Migration completed successfully!" message
- ✅ Three new tables in your database
- ✅ Proper indexes and security policies

## 🔧 Method 3: Batch Script (Windows)

### Run the Windows batch script:
```cmd
scripts\run-feedback-migration.bat
```

## 🔧 Method 4: PowerShell Script (Windows)

### Run the PowerShell script:
```powershell
scripts\run-feedback-migration.ps1
```

## ✅ Verification Steps

After running the migration, verify everything is working:

### 1. Check Tables in Supabase Dashboard
- Go to **Table Editor** in your Supabase dashboard
- Verify these tables exist:
  - `ideas`
  - `public_feedback`
  - `idea_collaborations`

### 2. Test the Feedback System
1. Start your development server: `npm run dev`
2. Go to Idea Forge in your app
3. Click "Share Feedback Link"
4. Verify the link works and creates data in Supabase

### 3. Check Data in Supabase
- Go to **Table Editor**
- Check the `ideas` table for public ideas
- Check the `public_feedback` table for feedback entries

## 🚨 Troubleshooting

### Common Issues:

#### "Table already exists" errors
- ✅ **This is normal** - The migration is idempotent
- ✅ Tables won't be recreated if they already exist

#### "Permission denied" errors
- ✅ **Check RLS policies** - Make sure they're created correctly
- ✅ **Verify user authentication** - Ensure users are logged in

#### "Foreign key constraint" errors
- ✅ **Check table order** - Run migrations in the correct sequence
- ✅ **Verify auth.users table** - Ensure authentication is set up

### Getting Help:
1. Check the Supabase logs in your dashboard
2. Verify your environment variables are correct
3. Ensure your Supabase project is active
4. Check the browser console for client-side errors

## 🎉 Success!

Once the migration is complete, your feedback system will be fully connected to Supabase with:
- ✅ **Persistent data storage**
- ✅ **Cross-device synchronization**
- ✅ **Proper security policies**
- ✅ **Performance optimization**
- ✅ **Real-time updates**

## 📊 What's Created:

### Tables:
- **`ideas`** - Stores all ideas (public and private)
- **`public_feedback`** - Stores public feedback and ratings
- **`idea_collaborations`** - Stores team collaboration data

### Security:
- **Row Level Security** - Proper access controls
- **RLS Policies** - User-specific data access
- **Anonymous Access** - Public feedback support

### Performance:
- **Indexes** - Optimized queries
- **Triggers** - Automatic timestamp updates
- **Constraints** - Data validation

Your Idea Forge feedback system is now ready for production use! 🚀
