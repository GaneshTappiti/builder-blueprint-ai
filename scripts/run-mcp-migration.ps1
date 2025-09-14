# MCP-Powered Supabase Migration Script
# This script uses the Supabase MCP server to automate database migrations

param(
    [switch]$Force,
    [switch]$Verbose
)

# Colors for output
$ErrorColor = "Red"
$SuccessColor = "Green"
$InfoColor = "Cyan"
$WarningColor = "Yellow"

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Write-Step {
    param([int]$Step, [string]$Message)
    Write-ColorOutput "`nStep $Step`: $Message" $InfoColor
}

function Write-Success {
    param([string]$Message)
    Write-ColorOutput "`n✅ $Message" $SuccessColor
}

function Write-Error {
    param([string]$Message)
    Write-ColorOutput "`n❌ $Message" $ErrorColor
}

function Write-Warning {
    param([string]$Message)
    Write-ColorOutput "`n⚠️  $Message" $WarningColor
}

# Configuration
$SupabaseUrl = "https://isvjuagegfnkuaucpsvj.supabase.co"
$ProjectRef = "isvjuagegfnkuaucpsvj"
$AccessToken = "sbp_0033b91af6b2ce25879f84babb5c5a5dd67eb6f1"

Write-ColorOutput "🚀 MCP-Powered Supabase Migration" $InfoColor
Write-ColorOutput "Target: $SupabaseUrl" $InfoColor
Write-ColorOutput "Using Supabase MCP Server for automation`n" $InfoColor

# Step 1: Check if MCP server is available
Write-Step 1 "Checking MCP Server Availability"

try {
    $mcpCheck = npx @supabase/mcp-server-supabase@latest --help 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "MCP Server package is available"
    } else {
        throw "MCP Server not working"
    }
} catch {
    Write-Warning "MCP Server package not available. Installing..."
    try {
        npm install -g @supabase/mcp-server-supabase@latest
        Write-Success "MCP Server package installed successfully"
    } catch {
        Write-Error "Failed to install MCP Server package"
        Write-Error "Please install manually: npm install -g @supabase/mcp-server-supabase@latest"
        exit 1
    }
}

# Step 2: Check existing tables
Write-Step 2 "Checking Existing Tables via MCP"

$RequiredTables = @("ideas", "public_feedback", "idea_collaborations")
$TableStatus = @{}

foreach ($table in $RequiredTables) {
    try {
        $env:SUPABASE_ACCESS_TOKEN = $AccessToken
        $checkResult = npx @supabase/mcp-server-supabase@latest --project-ref=$ProjectRef --read-only --check-table=$table 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            $TableStatus[$table] = $true
            Write-ColorOutput "  ✅ $table - exists" $SuccessColor
        } else {
            $TableStatus[$table] = $false
            Write-ColorOutput "  ❌ $table - missing" $ErrorColor
        }
    } catch {
        $TableStatus[$table] = $false
        Write-ColorOutput "  ❌ $table - missing" $ErrorColor
    }
}

$ExistingTables = ($TableStatus.GetEnumerator() | Where-Object { $_.Value }).Count
Write-ColorOutput "`n📊 Current Status: $ExistingTables/$($RequiredTables.Count) tables exist" $InfoColor

if ($ExistingTables -eq $RequiredTables.Count) {
    Write-Success "All required tables already exist! Migration not needed."
    Write-ColorOutput "Your feedback system is ready to use! 🎉" $SuccessColor
    exit 0
}

# Step 3: Create migration SQL
Write-Step 3 "Preparing Migration SQL"

$MigrationSQL = @"
-- =============================================
-- MCP AUTOMATED MIGRATION - MISSING TABLES
-- =============================================

-- 1. Create ideas table (if not exists)
CREATE TABLE IF NOT EXISTS ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  status TEXT DEFAULT 'draft',
  priority TEXT DEFAULT 'medium',
  tags TEXT[],
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_public BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 2. Create public_feedback table (if not exists)
CREATE TABLE IF NOT EXISTS public_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('like', 'dislike', 'comment', 'suggestion')),
  content TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  user_email TEXT,
  user_name TEXT,
  is_anonymous BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 3. Create idea_collaborations table (if not exists)
CREATE TABLE IF NOT EXISTS idea_collaborations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'collaborator', 'viewer')),
  permissions TEXT[] DEFAULT ARRAY['read'],
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'revoked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(idea_id, user_id)
);

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ideas_created_by ON ideas(created_by);
CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status);
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas(created_at);
CREATE INDEX IF NOT EXISTS idx_public_feedback_idea_id ON public_feedback(idea_id);
CREATE INDEX IF NOT EXISTS idx_public_feedback_created_at ON public_feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_idea_collaborations_idea_id ON idea_collaborations(idea_id);
CREATE INDEX IF NOT EXISTS idx_idea_collaborations_user_id ON idea_collaborations(user_id);

-- 5. Create update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS `$`$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
`$`$ language 'plpgsql';

-- Apply triggers to all tables
DROP TRIGGER IF EXISTS update_ideas_updated_at ON ideas;
CREATE TRIGGER update_ideas_updated_at BEFORE UPDATE ON ideas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_public_feedback_updated_at ON public_feedback;
CREATE TRIGGER update_public_feedback_updated_at BEFORE UPDATE ON public_feedback FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_idea_collaborations_updated_at ON idea_collaborations;
CREATE TRIGGER update_idea_collaborations_updated_at BEFORE UPDATE ON idea_collaborations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. Enable Row Level Security
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_collaborations ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies for ideas table
DROP POLICY IF EXISTS "Users can view public ideas" ON ideas;
CREATE POLICY "Users can view public ideas" ON ideas FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Users can view their own ideas" ON ideas;
CREATE POLICY "Users can view their own ideas" ON ideas FOR SELECT USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can insert their own ideas" ON ideas;
CREATE POLICY "Users can insert their own ideas" ON ideas FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can update their own ideas" ON ideas;
CREATE POLICY "Users can update their own ideas" ON ideas FOR UPDATE USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can delete their own ideas" ON ideas;
CREATE POLICY "Users can delete their own ideas" ON ideas FOR DELETE USING (auth.uid() = created_by);

-- 8. Create RLS policies for public_feedback table
DROP POLICY IF EXISTS "Anyone can view public feedback" ON public_feedback;
CREATE POLICY "Anyone can view public feedback" ON public_feedback FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert public feedback" ON public_feedback;
CREATE POLICY "Anyone can insert public feedback" ON public_feedback FOR INSERT WITH CHECK (true);

-- 9. Create RLS policies for idea_collaborations table
DROP POLICY IF EXISTS "Users can view their collaborations" ON idea_collaborations;
CREATE POLICY "Users can view their collaborations" ON idea_collaborations FOR SELECT USING (auth.uid() = user_id OR auth.uid() = invited_by);

DROP POLICY IF EXISTS "Users can insert collaborations" ON idea_collaborations;
CREATE POLICY "Users can insert collaborations" ON idea_collaborations FOR INSERT WITH CHECK (auth.uid() = invited_by);

DROP POLICY IF EXISTS "Users can update their collaborations" ON idea_collaborations;
CREATE POLICY "Users can update their collaborations" ON idea_collaborations FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = invited_by);

-- 10. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ideas TO anon, authenticated;
GRANT ALL ON public_feedback TO anon, authenticated;
GRANT ALL ON idea_collaborations TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Migration completed successfully!
SELECT 'MCP Migration completed successfully!' as status;
"@

# Save SQL to temporary file
$TempSqlFile = Join-Path $PSScriptRoot "temp_mcp_migration.sql"
$MigrationSQL | Out-File -FilePath $TempSqlFile -Encoding UTF8

# Step 4: Execute migration via MCP
Write-Step 4 "Executing Migration via MCP Server"

try {
    $env:SUPABASE_ACCESS_TOKEN = $AccessToken
    Write-ColorOutput "Executing migration SQL via MCP server..." $InfoColor
    
    # Try to execute via MCP server
    $migrationResult = npx @supabase/mcp-server-supabase@latest --project-ref=$ProjectRef --execute-sql="$TempSqlFile" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Migration executed successfully via MCP!"
    } else {
        throw "MCP execution failed"
    }
} catch {
    Write-Warning "MCP execution failed. Falling back to manual process..."
    Write-ColorOutput "`n📋 MANUAL MIGRATION REQUIRED" $WarningColor
    Write-ColorOutput "=" * 60 $WarningColor
    Write-ColorOutput $MigrationSQL $InfoColor
    Write-ColorOutput "=" * 60 $WarningColor
    
    Write-ColorOutput "`n📋 STEP-BY-STEP INSTRUCTIONS:" $InfoColor
    Write-ColorOutput "1. Go to https://supabase.com/dashboard" $InfoColor
    Write-ColorOutput "2. Select your project ($ProjectRef)" $InfoColor
    Write-ColorOutput "3. Click on 'SQL Editor' in the left sidebar" $InfoColor
    Write-ColorOutput "4. Click 'New Query'" $InfoColor
    Write-ColorOutput "5. Copy and paste the SQL above" $InfoColor
    Write-ColorOutput "6. Click 'Run' button" $InfoColor
    Write-ColorOutput "7. Wait for 'Migration completed successfully!' message" $InfoColor
    Write-ColorOutput "8. Run this script again to verify" $InfoColor
    
    # Clean up temp file
    Remove-Item $TempSqlFile -ErrorAction SilentlyContinue
    exit 1
}

# Clean up temp file
Remove-Item $TempSqlFile -ErrorAction SilentlyContinue

# Step 5: Verify migration
Write-Step 5 "Verifying Migration Success"

$VerificationStatus = @{}
foreach ($table in $RequiredTables) {
    try {
        $env:SUPABASE_ACCESS_TOKEN = $AccessToken
        $checkResult = npx @supabase/mcp-server-supabase@latest --project-ref=$ProjectRef --read-only --check-table=$table 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            $VerificationStatus[$table] = $true
            Write-ColorOutput "  ✅ $table - verified" $SuccessColor
        } else {
            $VerificationStatus[$table] = $false
            Write-ColorOutput "  ❌ $table - verification failed" $ErrorColor
        }
    } catch {
        $VerificationStatus[$table] = $false
        Write-ColorOutput "  ❌ $table - verification failed" $ErrorColor
    }
}

$VerifiedTables = ($VerificationStatus.GetEnumerator() | Where-Object { $_.Value }).Count

if ($VerifiedTables -eq $RequiredTables.Count) {
    Write-Success "🎉 MCP Migration completed successfully!"
    Write-ColorOutput "`nYour Supabase database now has:" $SuccessColor
    Write-ColorOutput "  ✅ ideas table - For Idea Vault system" $SuccessColor
    Write-ColorOutput "  ✅ public_feedback table - For feedback collection" $SuccessColor
    Write-ColorOutput "  ✅ idea_collaborations table - For team collaboration" $SuccessColor
    Write-ColorOutput "  ✅ Performance indexes for fast queries" $SuccessColor
    Write-ColorOutput "  ✅ Row Level Security policies for data protection" $SuccessColor
    Write-ColorOutput "  ✅ Update triggers for automatic timestamps" $SuccessColor
    
    Write-ColorOutput "`nNext steps:" $InfoColor
    Write-ColorOutput "  1. Test your feedback system - Share Feedback Link should now work!" $InfoColor
    Write-ColorOutput "  2. Check that data persists in Supabase instead of localStorage" $InfoColor
    Write-ColorOutput "  3. Verify all features are working correctly" $InfoColor
} else {
    Write-Error "Migration verification failed. Some tables may not have been created properly."
    Write-ColorOutput "Please check the manual migration instructions above." $WarningColor
    exit 1
}
