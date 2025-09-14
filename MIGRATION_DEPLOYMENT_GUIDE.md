# Migration Deployment Guide

## Current Status
- ✅ 6/13 tables exist in Supabase
- ❌ 7 critical tables missing
- ❌ Authentication needs email confirmation bypass
- ⚠️ E2E tests failing due to missing tables

## Step 1: Run SQL Migration in Supabase

### Option A: Using Supabase Dashboard (Recommended)
1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `isvjuagegfnkuaucpsvj`
3. Navigate to **SQL Editor**
4. Copy the entire contents of `scripts/create-missing-tables.sql`
5. Paste it into the SQL Editor
6. Click **Run** to execute the migration

### Option B: Using Supabase CLI (Alternative)
```bash
supabase db push --file scripts/create-missing-tables.sql
```

## Step 2: Verify Migration Success

After running the SQL migration, verify all tables exist:

```bash
node scripts/test-with-service-role.js
```

Expected output:
- ✅ All 13 tables should exist
- ✅ Data insertion should work
- ✅ RLS policies should be working

## Step 3: Run E2E Tests

### Node.js Tests
```bash
node scripts/migration-e2e-test.js
```

### Browser Tests
1. Open `scripts/browser-migration-test.html` in your browser
2. Configure the test settings
3. Click "Run All Tests"

## Missing Tables to Create

The following 7 tables need to be created:

1. **builder_context** - Builder context and project history
2. **mvp_studio_projects** - MVP Studio project data
3. **ideaforge_data** - Idea Forge storage data
4. **chat_notification_preferences** - Chat notification settings
5. **public_feedback_ideas** - Public feedback data
6. **bmc_canvas_data** - Business Model Canvas data
7. **offline_queue** - Offline synchronization queue

## Expected Test Results

After successful migration:
- ✅ 8/8 E2E tests should pass
- ✅ 100% test pass rate
- ✅ All RLS policies working
- ✅ Authentication working
- ✅ Data migration working
- ✅ Offline sync working
- ✅ Cross-device sync working

## Troubleshooting

### If SQL Migration Fails
1. Check Supabase project permissions
2. Ensure you have admin access
3. Try running statements one by one
4. Check for syntax errors

### If Authentication Fails
1. Check email confirmation settings in Supabase Auth
2. Use service role key for testing
3. Verify environment variables

### If Tables Still Missing
1. Check table names match exactly
2. Verify schema is 'public'
3. Check for typos in SQL

## Next Steps After Migration

1. ✅ Run complete E2E test suite
2. ✅ Document test results
3. ✅ Fix any remaining issues
4. ✅ Deploy to production
5. ✅ Monitor migration success

## Files to Reference

- `scripts/create-missing-tables.sql` - Complete SQL migration
- `scripts/migration-e2e-test.js` - Node.js E2E tests
- `scripts/browser-migration-test.html` - Browser E2E tests
- `scripts/test-with-service-role.js` - Verification script
- `migration-complete.sql` - Full migration (if needed)