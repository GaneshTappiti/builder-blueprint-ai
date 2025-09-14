@echo off
echo Starting MCP-based Supabase Migration...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if we're in the right directory
if not exist "package.json" (
    echo Error: package.json not found. Please run this script from the project root.
    pause
    exit /b 1
)

echo Running database setup...
node scripts/mcp-migration-automation.js migrate

if %errorlevel% equ 0 (
    echo.
    echo Migration completed successfully!
    echo.
    echo Next steps:
    echo 1. Test the profile creation by visiting /test-profile-system
    echo 2. Check the Supabase dashboard to verify tables were created
    echo 3. Test user registration to ensure profiles are created automatically
) else (
    echo.
    echo Migration failed. Please check the logs above for details.
    echo.
    echo Manual steps:
    echo 1. Run the SQL script manually in Supabase SQL Editor:
    echo    scripts/setup-database-tables.sql
    echo 2. Check your Supabase connection settings
    echo 3. Verify your MCP server configuration
)

echo.
pause