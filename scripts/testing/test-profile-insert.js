#!/usr/bin/env node

/**
 * Test Profile Insert
 * Test different column combinations to understand the schema
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

class ProfileInsertTester {
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

  async testMinimalInsert() {
    this.log('Testing minimal profile insert...', 'step');
    
    const testUserId = '00000000-0000-0000-0000-000000000001';
    const testEmail = 'test@example.com';
    
    try {
      // Try with just id, email, name
      const { data, error } = await this.supabaseAdmin
        .from('user_profiles')
        .insert({
          id: testUserId,
          email: testEmail,
          name: 'Test User'
        })
        .select()
        .single();

      if (error) {
        this.log(`Minimal insert failed: ${error.message}`, 'error');
        this.log(`Error details: ${JSON.stringify(error, null, 2)}`, 'info');
        return false;
      }

      this.log('Minimal insert successful!', 'success');
      this.log(`Data: ${JSON.stringify(data, null, 2)}`, 'info');
      
      // Clean up
      await this.supabaseAdmin
        .from('user_profiles')
        .delete()
        .eq('id', testUserId);
      
      return true;
    } catch (error) {
      this.log(`Minimal insert error: ${error.message}`, 'error');
      return false;
    }
  }

  async testWithUserId() {
    this.log('Testing with user_id column...', 'step');
    
    const testUserId = '00000000-0000-0000-0000-000000000002';
    const testEmail = 'test2@example.com';
    
    try {
      // Try with user_id instead of id
      const { data, error } = await this.supabaseAdmin
        .from('user_profiles')
        .insert({
          user_id: testUserId,
          email: testEmail,
          name: 'Test User 2'
        })
        .select()
        .single();

      if (error) {
        this.log(`user_id insert failed: ${error.message}`, 'error');
        this.log(`Error details: ${JSON.stringify(error, null, 2)}`, 'info');
        return false;
      }

      this.log('user_id insert successful!', 'success');
      this.log(`Data: ${JSON.stringify(data, null, 2)}`, 'info');
      
      // Clean up
      await this.supabaseAdmin
        .from('user_profiles')
        .delete()
        .eq('user_id', testUserId);
      
      return true;
    } catch (error) {
      this.log(`user_id insert error: ${error.message}`, 'error');
      return false;
    }
  }

  async testWithBoth() {
    this.log('Testing with both id and user_id...', 'step');
    
    const testUserId = '00000000-0000-0000-0000-000000000003';
    const testEmail = 'test3@example.com';
    
    try {
      // Try with both id and user_id
      const { data, error } = await this.supabaseAdmin
        .from('user_profiles')
        .insert({
          id: testUserId,
          user_id: testUserId,
          email: testEmail,
          name: 'Test User 3'
        })
        .select()
        .single();

      if (error) {
        this.log(`Both columns insert failed: ${error.message}`, 'error');
        this.log(`Error details: ${JSON.stringify(error, null, 2)}`, 'info');
        return false;
      }

      this.log('Both columns insert successful!', 'success');
      this.log(`Data: ${JSON.stringify(data, null, 2)}`, 'info');
      
      // Clean up
      await this.supabaseAdmin
        .from('user_profiles')
        .delete()
        .eq('id', testUserId);
      
      return true;
    } catch (error) {
      this.log(`Both columns insert error: ${error.message}`, 'error');
      return false;
    }
  }

  async runTests() {
    this.log('🧪 TESTING PROFILE INSERT SCHEMA', 'step');
    this.log('==================================', 'step');
    
    const results = {
      minimal: false,
      withUserId: false,
      withBoth: false
    };

    results.minimal = await this.testMinimalInsert();
    results.withUserId = await this.testWithUserId();
    results.withBoth = await this.testWithBoth();

    this.log('', 'info');
    this.log('📊 TEST RESULTS', 'step');
    this.log('===============', 'step');
    this.log(`Minimal insert (id only): ${results.minimal ? '✅ PASS' : '❌ FAIL'}`, results.minimal ? 'success' : 'error');
    this.log(`With user_id: ${results.withUserId ? '✅ PASS' : '❌ FAIL'}`, results.withUserId ? 'success' : 'error');
    this.log(`With both: ${results.withBoth ? '✅ PASS' : '❌ FAIL'}`, results.withBoth ? 'success' : 'error');

    return results;
  }
}

// CLI Interface
async function main() {
  const tester = new ProfileInsertTester();
  await tester.runTests();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = ProfileInsertTester;
