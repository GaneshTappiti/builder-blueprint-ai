# Codebase Cleanup Analysis

## 🎯 Files to Remove

### 1. **Redundant Migration Scripts** (91 files in scripts/)
**Status**: Many are duplicates or outdated

#### Keep (Essential):
- `scripts/mcp-migration-automation.js` - Main migration script
- `scripts/run-migration.bat` - Main entry point
- `scripts/create-missing-tables.sql` - Core SQL migration
- `scripts/setup-database.js` - Database setup

#### Remove (Redundant/Outdated):
- `scripts/apply-database-migration.js` - Duplicate functionality
- `scripts/automate-migration.js` - Superseded by mcp-migration-automation.js
- `scripts/complete-migration-automation.js` - Duplicate
- `scripts/comprehensive-migration.js` - Duplicate
- `scripts/direct-migration.js` - Duplicate
- `scripts/execute-migration.js` - Duplicate
- `scripts/execute-migration-mcp.js` - Duplicate
- `scripts/final-migration-solution.js` - Duplicate
- `scripts/fixed-migration.js` - Duplicate
- `scripts/guided-migration-and-test.js` - Duplicate
- `scripts/localstorage-migration.js` - Completed migration
- `scripts/mcp-automated-migration.js` - Duplicate
- `scripts/mcp-migration.js` - Duplicate
- `scripts/migration-e2e-test.js` - Test file, not needed in production
- `scripts/migration-e2e-test-fixed.js` - Test file
- `scripts/migration-e2e-qa-report.json` - Test output
- `scripts/migration-e2e-qa-report-fixed.json` - Test output
- `scripts/minimal-migration.js` - Duplicate
- `scripts/one-click-migration.js` - Duplicate
- `scripts/quick-migration.js` - Duplicate
- `scripts/run-migration.js` - Duplicate
- `scripts/simple-migration.js` - Duplicate
- `scripts/working-migration.js` - Duplicate
- All `.bat` files except `run-migration.bat` - Redundant batch files
- All `.ps1` files - PowerShell duplicates

### 2. **Outdated Documentation Files** (30+ files)
**Status**: Many are migration logs and temporary docs

#### Remove:
- `AUTHENTICATION_SETUP.md` - Outdated setup guide
- `AUTOMATED_DATABASE_FIX.md` - Migration log
- `AUTOMATED_MIGRATION_GUIDE.md` - Migration log
- `CSS_ISSUES_FIXED.md` - Issue log
- `DEVELOPMENT_AUTH_BYPASS.md` - Development note
- `FEEDBACK_TESTING_GUIDE.md` - Testing guide
- `FINAL_MIGRATION_STATUS.md` - Migration log
- `FORMATTING_IMPROVEMENTS.md` - Issue log
- `IDEA_VAULT_FIX_SUMMARY.md` - Fix log
- `LOCALSTORAGE_MIGRATION_COMPLETE.md` - Migration log
- `LOCALSTORAGE_MIGRATION_SUMMARY.md` - Migration log
- `MCP_MIGRATION_GUIDE.md` - Migration guide
- `MIGRATION_AUTOMATION_README.md` - Migration guide
- `MIGRATION_COMPLETE_SUMMARY.md` - Migration log
- `MIGRATION_DEPLOYMENT_GUIDE.md` - Migration guide
- `MIGRATION_DEPLOYMENT_GUIDE_FINAL.md` - Migration guide
- `MIGRATION_E2E_QA_REPORT.md` - Test report
- `MIGRATION_E2E_QA_REPORT_FINAL.md` - Test report
- `MIGRATION_INSTRUCTIONS.md` - Migration guide
- `MIGRATION_SUMMARY.md` - Migration log
- `PROFILE_CREATION_FIX_GUIDE.md` - Fix guide
- `PROFILE_SYSTEM_IMPLEMENTATION_ROADMAP.md` - Implementation guide
- `QUICK_FIX_AI_CONFIGURATION.md` - Fix guide
- `SCROLL_PERFORMANCE_FIXES.md` - Fix log
- `SUPABASE_INTEGRATION_FIXES.md` - Fix log
- `SUPABASE_SETUP.md` - Setup guide
- `TASK_PLANNER_IMPROVEMENTS.md` - Improvement log
- `VIDEO_CALLING_FEATURES.md` - Feature doc

#### Keep:
- `README.md` - Main project readme
- `BMC_FEATURE_README.md` - Feature documentation
- `INVESTOR_RADAR_README.md` - Feature documentation
- `MVP_STUDIO_COMPLETION_SUMMARY.md` - Feature documentation
- `docs/` folder - Main documentation

### 3. **SQL Migration Files** (Multiple duplicates)
**Status**: Many are outdated or duplicate

#### Remove:
- `fix-database-issues-SAFE.sql` - Fix file
- `fix-database-issues-ULTRA-SAFE.sql` - Fix file
- `fix-database-issues.sql` - Fix file
- `fix-missing-columns.sql` - Fix file
- `migration-1-create-tables-FIXED.sql` - Duplicate
- `migration-1-create-tables.sql` - Duplicate
- `migration-2-cleanup-tables-FIXED.sql` - Duplicate
- `migration-2-cleanup-tables.sql` - Duplicate
- `migration-complete.sql` - Duplicate
- `one-click-migration.sql` - Duplicate

#### Keep:
- `supabase/migrations/` folder - Official migration files
- `scripts/create-missing-tables.sql` - Core migration

### 4. **Test and Development Files**
**Status**: Not needed in production

#### Remove:
- `test-complete-feedback-system.js` - Test file
- `test-feedback-features.html` - Test file
- `test-feedback-link-fix.html` - Test file
- `test-feedback-link.html` - Test file
- `test-feedback-system.js` - Test file
- `test-supabase-feedback-integration.html` - Test file
- `setup-test-data.js` - Test data
- `localstorage_inventory.json` - Test data
- `investors_data_cleaned.json` - Test data
- `Investors-Data-2021.xlsx` - Test data

### 5. **Build and Config Duplicates**
**Status**: Redundant build files

#### Remove:
- `Build` folder - Build artifacts
- `next.config.production.js` - Duplicate config
- `docker-compose.production.yml` - Production config
- `Dockerfile.production` - Production config
- `bun.lockb` - Alternative lock file
- `pnpm-lock.yaml` - Alternative lock file
- `tsconfig.tsbuildinfo` - Build cache

### 6. **RAG Directory Cleanup**
**Status**: Some files may be unused

#### Keep (Essential):
- `RAG/data/` - Core documentation
- `RAG/templates/` - Templates
- `RAG/index.json` - Index file
- `RAG/README.md` - Documentation

#### Remove (Potentially):
- `RAG/requirements.txt` - Python requirements (not used in Next.js app)
- `RAG/TROUBLESHOOTING.md` - Troubleshooting guide
- `RAG/INTEGRATION_README.md` - Integration guide

## 📊 Summary

### Files to Remove: ~150+ files
- **Scripts**: ~70 redundant migration scripts
- **Documentation**: ~30 migration logs and fix guides
- **SQL**: ~10 duplicate migration files
- **Test Files**: ~10 test and development files
- **Build Files**: ~7 redundant build/config files

### Files to Keep: ~50 essential files
- Core application files in `app/`
- Essential configuration files
- Main documentation in `docs/`
- Core RAG documentation
- Essential migration scripts

## 🚀 Cleanup Benefits

1. **Reduced Repository Size**: ~70% reduction in file count
2. **Improved Navigation**: Easier to find relevant files
3. **Reduced Confusion**: No duplicate or outdated files
4. **Better Maintenance**: Cleaner codebase structure
5. **Faster Builds**: Fewer files to process

## ⚠️ Safety Notes

- All files marked for removal are either duplicates, logs, or completed migrations
- Core application functionality will not be affected
- Migration history is preserved in `supabase/migrations/`
- Essential documentation is preserved in `docs/`
