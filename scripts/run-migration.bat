@echo off
echo.
echo ========================================
echo  Supabase Database Migration Tool
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js is installed. Proceeding with migration...
echo.

REM Run the PowerShell script
powershell -ExecutionPolicy Bypass -File "%~dp0run-migration.ps1" -Method dashboard

echo.
echo Migration process completed!
echo.
pause
