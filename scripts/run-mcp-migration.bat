@echo off
REM MCP-Powered Supabase Migration - Easy Launcher
REM This batch file launches the MCP migration using PowerShell

echo.
echo ========================================
echo  MCP-Powered Supabase Migration
echo ========================================
echo.

REM Check if PowerShell is available
powershell -Command "Get-Host" >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: PowerShell is not available on this system
    echo Please install PowerShell or run the Node.js version instead
    echo.
    echo To run Node.js version:
    echo   node scripts\mcp-automated-migration.js
    echo.
    pause
    exit /b 1
)

REM Get the directory where this batch file is located
set "SCRIPT_DIR=%~dp0"

REM Run the PowerShell migration script
echo Starting MCP migration...
echo.

powershell -ExecutionPolicy Bypass -File "%SCRIPT_DIR%run-mcp-migration.ps1"

REM Check if the migration was successful
if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo  Migration completed successfully!
    echo ========================================
    echo.
    echo Your feedback system is now ready to use!
    echo.
) else (
    echo.
    echo ========================================
    echo  Migration encountered issues
    echo ========================================
    echo.
    echo Please check the output above for details.
    echo You may need to run the migration manually.
    echo.
)

echo Press any key to exit...
pause >nul
