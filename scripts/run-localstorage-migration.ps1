# localStorage to Supabase Migration PowerShell Script
# This script executes the localStorage migration SQL

Write-Host "🚀 Starting localStorage to Supabase Migration" -ForegroundColor Cyan
Write-Host "Target: https://isvjuagegfnkuaucpsvj.supabase.co" -ForegroundColor Yellow

# Configuration
$ProjectRef = "isvjuagegfnkuaucpsvj"
$AccessToken = "sbp_0033b91af6b2ce25879f84babb5c5a5dd67eb6f1"
$SqlFile = "scripts\localstorage-migration-sql.sql"

# Check if SQL file exists
if (-not (Test-Path $SqlFile)) {
    Write-Host "❌ SQL file not found: $SqlFile" -ForegroundColor Red
    exit 1
}

Write-Host "📄 Found SQL file: $SqlFile" -ForegroundColor Green

# Read SQL content
$SqlContent = Get-Content $SqlFile -Raw
Write-Host "📊 SQL file size: $($SqlContent.Length) characters" -ForegroundColor Yellow

# Create temporary SQL file for execution
$TempSqlFile = "temp_localstorage_migration_$(Get-Date -Format 'yyyyMMddHHmmss').sql"
$SqlContent | Out-File -FilePath $TempSqlFile -Encoding UTF8

Write-Host "📝 Created temporary SQL file: $TempSqlFile" -ForegroundColor Green

try {
    # Set environment variable
    $env:SUPABASE_ACCESS_TOKEN = $AccessToken
    
    Write-Host "🔄 Executing localStorage migration SQL..." -ForegroundColor Yellow
    
    # Execute via MCP server
    $Command = "npx @supabase/mcp-server-supabase@latest --project-ref=$ProjectRef --execute-sql=`"$TempSqlFile`""
    
    Write-Host "Command: $Command" -ForegroundColor Gray
    
    # Run the command
    Invoke-Expression $Command
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ localStorage migration tables created successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Migration failed with exit code: $LASTEXITCODE" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Error executing migration: $($_.Exception.Message)" -ForegroundColor Red
} finally {
    # Clean up temporary file
    if (Test-Path $TempSqlFile) {
        Remove-Item $TempSqlFile -Force
        Write-Host "🧹 Cleaned up temporary file" -ForegroundColor Gray
    }
}

Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Check your Supabase dashboard for the new tables" -ForegroundColor White
Write-Host "2. Update your components to use localStorageSyncer service" -ForegroundColor White
Write-Host "3. Test the migration with real data" -ForegroundColor White
Write-Host "4. Clear localStorage after successful migration" -ForegroundColor White

Write-Host "`n🎉 Migration setup complete!" -ForegroundColor Green
