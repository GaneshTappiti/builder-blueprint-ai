@echo off
echo.
echo ========================================
echo  Quick Supabase Migration Tool
echo ========================================
echo.

echo Opening Supabase Dashboard...
start https://supabase.com/dashboard/project/isvjuagegfnkuaucpsvj

echo.
echo Opening migration files...
start migration-1-create-tables.sql
start migration-2-cleanup-tables.sql

echo.
echo ========================================
echo  Migration Instructions:
echo ========================================
echo.
echo 1. The Supabase Dashboard should now be open
echo 2. Click on "SQL Editor" in the left sidebar
echo 3. Click "New query"
echo 4. Copy and paste the contents of migration-1-create-tables.sql
echo 5. Click "Run" to execute Migration 1
echo 6. After Migration 1 completes, copy and paste migration-2-cleanup-tables.sql
echo 7. Click "Run" to execute Migration 2
echo.
echo Your database will be optimized and ready for production!
echo.
pause
