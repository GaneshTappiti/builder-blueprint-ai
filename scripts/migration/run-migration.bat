@echo off
echo ========================================
echo   Automated Feedback System Migration
echo ========================================
echo.

echo Running migration script...
node scripts/quick-migration.js

echo.
echo ========================================
echo   NEXT STEPS:
echo ========================================
echo 1. Copy the SQL from above
echo 2. Go to https://supabase.com/dashboard
echo 3. Select your project
echo 4. Go to SQL Editor
echo 5. Paste and run the SQL
echo 6. Verify tables in Table Editor
echo.
echo Your feedback system will be ready!
echo ========================================
pause
