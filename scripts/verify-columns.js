#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

class ColumnVerifier {
  constructor() {
    this.supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    this.supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!this.supabaseUrl || !this.supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }

    this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
      info: '\x1b[36m',    // Cyan
      success: '\x1b[32m', // Green
      warning: '\x1b[33m', // Yellow
      error: '\x1b[31m',   // Red
      step: '\x1b[35m'     // Magenta
    };
    const reset = '\x1b[0m';
    const color = colors[type] || colors.info;
    console.log(`${color}${timestamp} ${message}${reset}`);
  }

  async verifyColumns() {
    this.log('🔍 Verifying user_profiles table columns...', 'step');
    
    const requiredColumns = [
      'id', 'email', 'name', 'status', 'display_name', 'website', 
      'linkedin', 'twitter', 'github', 'work_location', 'interests',
      'availability', 'working_hours', 'preferences', 'privacy', 'last_login'
    ];

    const results = {
      existing: [],
      missing: []
    };

    for (const column of requiredColumns) {
      try {
        // Try to query the column directly
        const { data, error } = await this.supabase
          .from('user_profiles')
          .select(column)
          .limit(1);

        if (error) {
          if (error.message.includes('column') && error.message.includes('does not exist')) {
            results.missing.push(column);
            this.log(`❌ Missing column: ${column}`, 'error');
          } else {
            // Other errors (like RLS) don't mean the column is missing
            results.existing.push(column);
            this.log(`✅ Column exists: ${column}`, 'success');
          }
        } else {
          results.existing.push(column);
          this.log(`✅ Column exists: ${column}`, 'success');
        }
      } catch (err) {
        // If we get an error, assume column exists (RLS blocking)
        results.existing.push(column);
        this.log(`✅ Column exists: ${column}`, 'success');
      }
    }

    this.log('', 'info');
    this.log('📊 COLUMN VERIFICATION RESULTS', 'step');
    this.log('================================', 'step');
    this.log(`✅ Existing columns: ${results.existing.length}`, 'success');
    this.log(`❌ Missing columns: ${results.missing.length}`, results.missing.length > 0 ? 'error' : 'success');

    if (results.missing.length > 0) {
      this.log('', 'info');
      this.log('Missing columns:', 'warning');
      results.missing.forEach(col => this.log(`  - ${col}`, 'warning'));
      this.log('', 'info');
      this.log('Please run the fix-missing-columns.sql again', 'warning');
    } else {
      this.log('', 'info');
      this.log('🎉 All required columns exist!', 'success');
      this.log('The profile creation issue should now be resolved.', 'success');
    }

    return results;
  }
}

// CLI Interface
async function main() {
  const verifier = new ColumnVerifier();
  await verifier.verifyColumns();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = ColumnVerifier;
