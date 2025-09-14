@echo off
echo ========================================
echo   FIXED MIGRATION - Missing Tables Only
echo ========================================
echo.

echo Running minimal migration script...
node scripts/minimal-migration.js

echo.
echo ========================================
echo   NEXT STEPS:
echo ========================================
echo 1. Copy the SQL from above
echo 2. Go to https://supabase.com/dashboard
echo 3. Select your project
echo 4. Go to SQL Editor
echo 5. Paste and run the SQL
echo 6. Wait for success message
echo.
echo This will create the missing tables:
echo - public_feedback
echo - idea_collaborations
echo.
echo Your feedback system will be complete!
echo ========================================
pause
