# Automated Feedback System Migration Script
# PowerShell version

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Automated Feedback System Migration" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if .env.local exists
Write-Host "Checking .env.local file..." -ForegroundColor Yellow
if (-not (Test-Path "..\.env.local")) {
    Write-Host "❌ ERROR: .env.local file not found" -ForegroundColor Red
    Write-Host "Please create .env.local with your Supabase credentials" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "✅ .env.local file found" -ForegroundColor Green

Write-Host ""
Write-Host "Starting migration..." -ForegroundColor Yellow
Write-Host ""

# Run the migration
try {
    node automate-feedback-migration.js
    
    Write-Host ""
    Write-Host "✅ Migration completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Check your Supabase dashboard for the new tables" -ForegroundColor White
    Write-Host "2. Test the feedback system in your app" -ForegroundColor White
    Write-Host "3. Verify data is being stored correctly" -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host "❌ Migration failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

Read-Host "Press Enter to exit"
