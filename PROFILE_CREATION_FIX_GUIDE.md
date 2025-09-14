# Profile Creation Fix Guide

This guide explains how to fix the profile creation failure issues in the Builder Blueprint AI application.

## Problem Summary

The application was experiencing profile creation failures due to:
1. Missing database tables (`user_profiles`, `user_skills`, `user_certifications`, `user_languages`)
2. Missing database triggers for automatic profile creation
3. Insufficient error handling in the profile creation process

## Solution Overview

The fix includes:
1. **Enhanced Profile Service** - Added retry logic and better error handling
2. **Database Migration Scripts** - Automated creation of required tables and triggers
3. **Comprehensive Testing** - Scripts to verify the fix works correctly

## Step-by-Step Fix Process

### Step 1: Apply Database Migration

The database tables are missing and need to be created. Run the migration script:

```bash
node scripts/apply-database-migration.js run
```

This will output SQL commands that need to be executed in your Supabase dashboard.

### Step 2: Execute SQL in Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the SQL output from the migration script
4. Execute the SQL commands

The SQL will create:
- `user_profiles` table with all required columns
- `user_skills`, `user_certifications`, `user_languages` tables
- Row Level Security (RLS) policies
- Database triggers for automatic profile creation
- Performance indexes

### Step 3: Verify the Fix

Run the test script to verify everything is working:

```bash
node test-profile-creation.js run
```

This will test:
- Table existence
- Direct profile creation
- ProfileService integration

## Enhanced Error Handling

The ProfileService has been enhanced with:

### Retry Logic
- Automatic retry with exponential backoff (2s, 4s, 8s)
- Maximum 3 retry attempts
- Detailed error logging

### Error Classification
- **23505**: Duplicate key error (profile already exists)
- **23503**: Foreign key constraint error (user not found in auth.users)
- **42P01**: Table doesn't exist error
- **Network errors**: Temporary connection issues

### Profile Creation Status Tracking
- `profile_creation_status`: 'pending', 'completed', 'failed'
- `profile_creation_error`: Detailed error message
- `last_profile_sync`: Timestamp of last sync attempt

## Database Schema

### user_profiles Table
```sql
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  role VARCHAR(50) DEFAULT 'user',
  -- ... additional columns
  profile_creation_status VARCHAR(20) DEFAULT 'completed',
  profile_creation_error TEXT,
  last_profile_sync TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Automatic Profile Creation Trigger
```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, name, ...)
  VALUES (NEW.id, NEW.email, NEW.email, ...)
  ON CONFLICT (id) DO UPDATE SET ...;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Testing Commands

### Check Table Status
```bash
node test-profile-creation.js tables
```

### Test Direct Profile Creation
```bash
node test-profile-creation.js create
```

### Test ProfileService Integration
```bash
node test-profile-creation.js service
```

### Run All Tests
```bash
node test-profile-creation.js run
```

## Migration Scripts

### Apply Database Migration
```bash
node scripts/apply-database-migration.js run
```

### Verify Migration
```bash
node scripts/apply-database-migration.js verify
```

### Create Tables Only
```bash
node scripts/apply-database-migration.js tables
```

### Create Trigger Only
```bash
node scripts/apply-database-migration.js trigger
```

## Troubleshooting

### Common Issues

1. **"relation 'public.user_profiles' does not exist"**
   - Solution: Run the database migration script and execute the SQL in Supabase dashboard

2. **"Foreign key constraint error"**
   - Solution: Ensure the user exists in `auth.users` table before creating profile

3. **"Profile creation succeeded but profile not found"**
   - Solution: Check RLS policies and ensure user has proper permissions

4. **"Cannot execute SQL directly"**
   - Solution: Use the Supabase dashboard SQL editor to execute the migration SQL

### Debug Steps

1. Check if tables exist:
   ```bash
   node test-profile-creation.js tables
   ```

2. Test direct profile creation:
   ```bash
   node test-profile-creation.js create
   ```

3. Check Supabase logs for detailed error messages

4. Verify RLS policies are correctly configured

## Files Modified

- `app/services/profileService.ts` - Enhanced with retry logic and error handling
- `app/contexts/ProfileContext.tsx` - Updated with better error handling
- `scripts/apply-database-migration.js` - New migration script
- `scripts/test-profile-creation.js` - New testing script
- `scripts/automated-migration.js` - Updated with correct Supabase CLI commands

## Next Steps

After applying this fix:

1. Test user registration and login
2. Verify profile creation works automatically
3. Test profile updates and data persistence
4. Monitor error logs for any remaining issues
5. Consider implementing profile creation monitoring/alerting

## Support

If you encounter issues:

1. Check the test results for specific error messages
2. Review Supabase logs for detailed error information
3. Verify all SQL commands were executed successfully
4. Ensure environment variables are correctly configured

The enhanced error handling will provide detailed information about any remaining issues.
