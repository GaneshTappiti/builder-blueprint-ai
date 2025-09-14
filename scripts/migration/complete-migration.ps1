# Complete Database Migration Script for Buildtrix
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "🚀 COMPLETE DATABASE MIGRATION FOR BUILDER BLUEPRINT AI" -ForegroundColor Yellow
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "STEP 1: Execute SQL Migration" -ForegroundColor Green
Write-Host "-----------------------------" -ForegroundColor Green
Write-Host "1. Open your Supabase Dashboard: https://supabase.com/dashboard" -ForegroundColor White
Write-Host "2. Go to SQL Editor" -ForegroundColor White
Write-Host "3. Open the file: migration-complete.sql" -ForegroundColor White
Write-Host "4. Copy ALL contents and paste into SQL Editor" -ForegroundColor White
Write-Host "5. Click 'Run' to execute" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter when you have completed the SQL execution"

Write-Host ""
Write-Host "STEP 2: Verifying Migration" -ForegroundColor Green
Write-Host "---------------------------" -ForegroundColor Green
node scripts/complete-migration-guide.js check

Write-Host ""
Write-Host "STEP 3: Running Complete Test" -ForegroundColor Green
Write-Host "-----------------------------" -ForegroundColor Green
node scripts/complete-migration-guide.js test

Write-Host ""
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "Migration process complete!" -ForegroundColor Yellow
Write-Host "================================================================================" -ForegroundColor Cyan
