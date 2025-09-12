# 🚀 Supabase Database Migration Automation

This guide provides automated scripts to apply the two critical database migrations to your Supabase project.

## 📋 What These Migrations Do

### Migration 1 - Creates Missing Tables (`20250126_create_missing_tables.sql`)
- **audit_logs** - For comprehensive audit trail
- **chat_files** - For file attachments in chat
- **ideas** - For Idea Vault system
- **idea_collaborations** - For team collaboration on ideas
- **public_feedback** - For public feedback system
- **bmc_data** - For Business Model Canvas data
- **builder_context** - For Builder Context and project data
- **ai_interactions** - For AI service logging
- **file_storage** - For Supabase Storage integration

### Migration 2 - Cleans Up Unnecessary Tables (`20250127_cleanup_unnecessary_tables.sql`)
- Removes 15 unused tables that were cluttering the database
- Consolidates duplicate tables (chat-files → file_attachments)
- Updates foreign key constraints
- Creates backward compatibility views

## 🎯 After Running Migrations

Your Supabase database will be:
- ✅ Properly connected to all components
- ✅ Free of localStorage dependencies
- ✅ Optimized with only necessary tables
- ✅ Secure with proper RLS policies
- ✅ Ready for production use

## 🛠️ Migration Methods

### Method 1: Automated Scripts (Recommended)

#### For Windows Users:
```bash
# Run the batch file (easiest)
scripts\run-migration.bat

# Or run PowerShell script directly
powershell -ExecutionPolicy Bypass -File scripts\run-migration.ps1
```

#### For All Platforms:
```bash
# Using Node.js script
node scripts\automate-migration.js

# Using CLI-based script
node scripts\migrate-with-cli.js
```

### Method 2: Manual Migration (Most Reliable)

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard/project/isvjuagegfnkuaucpsvj
   - Navigate to SQL Editor

2. **Run Migration 1**
   - Copy contents of `supabase/migrations/20250126_create_missing_tables.sql`
   - Paste into SQL Editor
   - Click "Run"

3. **Run Migration 2**
   - Copy contents of `supabase/migrations/20250127_cleanup_unnecessary_tables.sql`
   - Paste into SQL Editor
   - Click "Run"

## 🔧 Prerequisites

- Node.js installed (for automated scripts)
- Access to your Supabase project
- Database password (if using CLI method)

## 📁 Project Configuration

Your Supabase project details:
- **URL**: https://isvjuagegfnkuaucpsvj.supabase.co
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlzdmp1YWdlZ2Zua3VhdWNwc3ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNzUzMDMsImV4cCI6MjA2ODc1MTMwM30.p9EwEAr0NGr3Biw5pu7wA3wQeQsO2G7DhlqtRHnY6wE`

## 🚨 Safety Notes

- **The migrations are safe to run** - they only add new tables and remove unused ones
- **No existing data will be affected** - only structural changes
- **Backup recommended** - Always backup your database before major changes
- **Test after migration** - Verify your application works correctly

## 🔍 Troubleshooting

### Common Issues:

1. **"exec_sql function not found"**
   - The script will create this function automatically
   - If it fails, run the migrations manually via dashboard

2. **"Permission denied"**
   - Ensure you're using the correct Supabase credentials
   - Check that your project is accessible

3. **"Table already exists"**
   - This is normal - the migrations use `IF NOT EXISTS`
   - The warnings can be safely ignored

### Getting Help:

1. Check the console output for specific error messages
2. Try the manual migration method if automated scripts fail
3. Verify your Supabase project is accessible
4. Ensure all required tables exist before running

## 📊 Verification

After running migrations, verify success by checking:

1. **Key tables exist:**
   - audit_logs
   - chat_files
   - ideas
   - idea_collaborations
   - public_feedback
   - bmc_data
   - builder_context
   - ai_interactions
   - file_storage

2. **Application functionality:**
   - Test all major features
   - Check that data loads correctly
   - Verify no localStorage errors

## 🎉 Success!

Once migrations are complete, your application will have:
- Full Supabase integration
- Optimized database structure
- Proper security policies
- Production-ready setup

## 📞 Support

If you encounter issues:
1. Check the error messages in the console
2. Try the manual migration method
3. Verify your Supabase project configuration
4. Ensure all dependencies are installed

---

**Happy migrating! 🚀**
