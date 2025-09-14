@echo off
echo ========================================
echo   Automated Feedback System Migration
echo ========================================
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Checking .env.local file...
if not exist "..\.env.local" (
    echo ERROR: .env.local file not found
    echo Please create .env.local with your Supabase credentials
    pause
    exit /b 1
)

echo.
echo Starting migration...
echo.

node automate-feedback-migration.js

echo.
echo Migration completed!
echo.
echo Next steps:
echo 1. Check your Supabase dashboard for the new tables
echo 2. Test the feedback system in your app
echo 3. Verify data is being stored correctly
echo.
pause
