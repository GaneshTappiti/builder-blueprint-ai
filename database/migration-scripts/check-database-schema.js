#!/usr/bin/env node

/**
 * Check Database Schema
 * Inspect the actual database schema to understand the table structure
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

class SchemaChecker {
  constructor() {
    this.supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    this.supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!this.supabaseUrl || !this.supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }
    
    this.supabaseAdmin = createClient(this.supabaseUrl, this.supabaseServiceKey);
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '📋',
      success: '✅',
      error: '❌',
      warning: '⚠️',
      step: '🔄'
    }[type];
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async checkUserProfilesSchema() {
    this.log('Checking user_profiles table schema...', 'step');
    
    try {
      // Get table information
      const { data: tableInfo, error: tableError } = await this.supabaseAdmin
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable, column_default')
        .eq('table_name', 'user_profiles')
        .eq('table_schema', 'public')
        .order('ordinal_position');

      if (tableError) {
        this.log(`Error getting table info: ${tableError.message}`, 'error');
        return null;
      }

      this.log('user_profiles table columns:', 'info');
      tableInfo.forEach(column => {
        this.log(`  - ${column.column_name}: ${column.data_type} (nullable: ${column.is_nullable})`, 'info');
      });

      return tableInfo;
    } catch (error) {
      this.log(`Schema check error: ${error.message}`, 'error');
      return null;
    }
  }

  async checkIfTableExists() {
    this.log('Checking if user_profiles table exists...', 'step');
    
    try {
      const { data, error } = await this.supabaseAdmin
        .from('user_profiles')
        .select('*')
        .limit(1);

      if (error) {
        if (error.code === 'PGRST116') {
          this.log('user_profiles table does not exist', 'warning');
          return false;
        } else {
          this.log(`Error checking table: ${error.message}`, 'error');
          return false;
        }
      }

      this.log('user_profiles table exists', 'success');
      return true;
    } catch (error) {
      this.log(`Table check error: ${error.message}`, 'error');
      return false;
    }
  }

  async runCheck() {
    this.log('🔍 CHECKING DATABASE SCHEMA', 'step');
    this.log('============================', 'step');
    
    const tableExists = await this.checkIfTableExists();
    
    if (tableExists) {
      await this.checkUserProfilesSchema();
    } else {
      this.log('Table does not exist - need to create it first', 'warning');
    }
  }
}

// CLI Interface
async function main() {
  const checker = new SchemaChecker();
  await checker.runCheck();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = SchemaChecker;
