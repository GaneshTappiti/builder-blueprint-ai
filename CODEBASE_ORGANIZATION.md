# Codebase Organization Structure

This document outlines the new organized structure of the Builder Blueprint AI codebase.

## 📁 Folder Structure

### `/config/`
Configuration files that are not essential for the root directory:
- `builder.config.json` - Builder-specific configuration
- `lighthouse.config.js` - Lighthouse performance testing configuration

### `/data/`
Data files and datasets:
- `Investors-Data-2021.xlsx` - Investor data spreadsheet

### `/database/`
All database-related files:

#### `/database/sql/`
- `create-missing-tables.sql` - SQL to create missing database tables
- `create-user-profiles-table.sql` - SQL for user profiles table creation
- `localstorage-migration-sql.sql` - SQL for localStorage migration
- `setup-database.sql` - Main database setup SQL
- `setup-database-tables.sql` - Database tables setup SQL

#### `/database/migration-scripts/`
- `auto-fix-database.js` - Automated database fixing script
- `check-database-schema.js` - Database schema validation
- `setup-database.js` - Database setup automation

### `/docs/`
All documentation organized by category:

#### `/docs/features/`
- `BMC_FEATURE_README.md` - Business Model Canvas feature documentation
- `INVESTOR_RADAR_README.md` - Investor Radar feature documentation
- `MVP_STUDIO_COMPLETION_SUMMARY.md` - MVP Studio completion details
- `MVP_STUDIO_STORAGE_IMPLEMENTATION.md` - MVP Studio storage implementation
- `MVP_STUDIO_TOOL_SELECTION_UPDATE.md` - MVP Studio tool selection updates

#### `/docs/production/`
- `PRODUCTION_CHECKLIST.md` - Production deployment checklist
- `PRODUCTION_READINESS_GUIDE.md` - Production readiness guide
- `MOBILE_RESPONSIVENESS_REPORT.md` - Mobile responsiveness analysis

#### `/docs/migration/`
- `CLEANUP_ANALYSIS.md` - Cleanup analysis documentation
- `CLEANUP_COMPLETE.md` - Cleanup completion status
- `ESSENTIAL_FILES_STATUS.md` - Essential files tracking
- `setup-supabase.md` - Supabase setup instructions
- `migration-instructions.md` - Migration process instructions
- `localstorage-migration-report.md` - localStorage migration report
- `get-service-key-instructions.md` - Service key setup instructions
- `localstorage-implementation-guide.md` - localStorage implementation guide

### `/scripts/`
Organized scripts by functionality:

#### `/scripts/database/`
Database-related scripts:
- `apply-profile-fix-migration.js` - Profile fix migration
- `deploy-all-fixes.js` - Deploy all database fixes
- `direct-table-creation.js` - Direct table creation
- `fix-profile-creation-direct.js` - Direct profile creation fix
- `fix-profile-creation-issues.js` - Profile creation issue fixes
- `fix-profile-simple.js` - Simple profile fixes
- `process-investor-data.js` - Investor data processing
- `run-schema-update.js` - Schema update execution
- `update-profile-context.js` - Profile context updates
- `update-profile-service.js` - Profile service updates

#### `/scripts/migration/`
Migration-related scripts:
- `automated-migration-runner.js` - Automated migration runner
- `automated-migration.js` - Migration automation
- `browser-localstorage-migration.js` - Browser localStorage migration
- `browser-migration-test.html` - Browser migration testing
- `cli-migration.js` - CLI migration tools
- `complete-migration-guide.js` - Complete migration guide
- `complete-migration.bat` / `.ps1` - Migration completion scripts
- `create-migration-tables.js` - Migration table creation
- `direct-supabase-migration.js` - Direct Supabase migration
- `execute-migration-directly.js` - Direct migration execution
- `execute-migration-step-by-step.js` - Step-by-step migration
- `localstorage-migration-browser.js` - Browser localStorage migration
- `management-api-migration.js` - Management API migration
- `mcp-migration-automation.js` - MCP migration automation
- `migrate-with-cli.js` - CLI migration tools
- `run-localstorage-migration.ps1` - PowerShell localStorage migration
- `run-migration-and-test.js` - Migration with testing
- `run-migration.bat` / `.ps1` - Migration execution scripts
- `run-sql-migration.js` - SQL migration runner
- `verify-migration.js` - Migration verification
- `migration.log` - Migration log file

#### `/scripts/testing/`
Testing and diagnostic scripts:
- `diagnose-profile-creation.js` - Profile creation diagnostics
- `fix-auth-and-test.js` - Auth fixing and testing
- `test-authenticated-profile-creation.js` - Authenticated profile testing
- `test-onboarding-db.js` - Onboarding database testing
- `test-profile-creation-final.js` - Final profile creation tests
- `test-profile-creation-practical.js` - Practical profile creation tests
- `test-profile-creation-simple.js` - Simple profile creation tests
- `test-profile-creation-with-rls.js` - RLS profile creation tests
- `test-profile-creation.js` - Profile creation testing
- `test-profile-insert.js` - Profile insertion testing
- `test-with-service-role.js` - Service role testing
- `verify-columns.js` - Column verification

## 🔄 Updated File References

Key file path changes that scripts may need to reference:

### SQL Files
- `scripts/create-missing-tables.sql` → `database/sql/create-missing-tables.sql`
- `scripts/setup-database.sql` → `database/sql/setup-database.sql`
- `scripts/localstorage-migration-sql.sql` → `database/sql/localstorage-migration-sql.sql`

### Documentation
- Root-level README files → `docs/features/`, `docs/production/`, or `docs/migration/`
- `scripts/migration-instructions.md` → `docs/migration/migration-instructions.md`

### Scripts
- Database scripts → `scripts/database/`
- Migration scripts → `scripts/migration/`
- Testing scripts → `scripts/testing/`

## 📝 Benefits of This Organization

1. **Clear Separation of Concerns**: Each folder has a specific purpose
2. **Easier Navigation**: Related files are grouped together
3. **Better Maintainability**: Easier to find and update related files
4. **Scalability**: Structure supports growth of the codebase
5. **Documentation Clarity**: All docs are organized by category

## 🚀 Next Steps

1. Update any remaining hardcoded file paths in scripts
2. Update import statements if needed
3. Update documentation references
4. Consider adding folder-specific README files for complex folders