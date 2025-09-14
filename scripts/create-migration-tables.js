#!/usr/bin/env node

/**
 * Create Migration Tables via Supabase REST API
 * This script creates the localStorage migration tables using direct SQL execution
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function createTables() {
  try {
    log('🚀 Creating localStorage Migration Tables', colors.cyan);
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing required environment variables');
    }
    
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    // Define table creation SQL statements
    const tableCreations = [
      {
        name: 'builder_context',
        sql: `
          CREATE TABLE IF NOT EXISTS builder_context (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            project_id VARCHAR(255) NOT NULL,
            context_data JSONB NOT NULL DEFAULT '{}',
            last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, project_id)
          );
        `
      },
      {
        name: 'mvp_studio_projects',
        sql: `
          CREATE TABLE IF NOT EXISTS mvp_studio_projects (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            project_id VARCHAR(255) NOT NULL,
            project_data JSONB NOT NULL DEFAULT '{}',
            status VARCHAR(50) DEFAULT 'draft',
            last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, project_id)
          );
        `
      },
      {
        name: 'ideaforge_data',
        sql: `
          CREATE TABLE IF NOT EXISTS ideaforge_data (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            idea_id VARCHAR(255) NOT NULL,
            idea_data JSONB NOT NULL DEFAULT '{}',
            last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, idea_id)
          );
        `
      },
      {
        name: 'chat_notification_preferences',
        sql: `
          CREATE TABLE IF NOT EXISTS chat_notification_preferences (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            preferences JSONB NOT NULL DEFAULT '{}',
            last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id)
          );
        `
      },
      {
        name: 'public_feedback_ideas',
        sql: `
          CREATE TABLE IF NOT EXISTS public_feedback_ideas (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE NOT NULL,
            feedback_data JSONB NOT NULL DEFAULT '{}',
            last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(idea_id)
          );
        `
      },
      {
        name: 'bmc_canvas_data',
        sql: `
          CREATE TABLE IF NOT EXISTS bmc_canvas_data (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            canvas_id VARCHAR(255) NOT NULL,
            canvas_data JSONB NOT NULL DEFAULT '{}',
            last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, canvas_id)
          );
        `
      },
      {
        name: 'offline_queue',
        sql: `
          CREATE TABLE IF NOT EXISTS offline_queue (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            operation VARCHAR(50) NOT NULL CHECK (operation IN ('create', 'update', 'delete')),
            table_name VARCHAR(100) NOT NULL,
            record_id UUID,
            data JSONB NOT NULL DEFAULT '{}',
            status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
            error_message TEXT,
            retry_count INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            processed_at TIMESTAMP WITH TIME ZONE
          );
        `
      }
    ];
    
    // Create tables
    for (const table of tableCreations) {
      log(`📋 Creating table: ${table.name}`, colors.blue);
      
      try {
        // Use raw SQL execution via REST API
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey
          },
          body: JSON.stringify({
            sql: table.sql
          })
        });
        
        if (response.ok) {
          log(`  ✅ Table ${table.name} created successfully`, colors.green);
        } else {
          const error = await response.text();
          log(`  ⚠️  Table ${table.name}: ${error}`, colors.yellow);
        }
      } catch (err) {
        log(`  ❌ Table ${table.name}: ${err.message}`, colors.red);
      }
    }
    
    // Create indexes
    log('📊 Creating indexes...', colors.blue);
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_builder_context_user_id ON builder_context(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_builder_context_project_id ON builder_context(project_id);',
      'CREATE INDEX IF NOT EXISTS idx_mvp_studio_projects_user_id ON mvp_studio_projects(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_ideaforge_data_user_id ON ideaforge_data(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_offline_queue_user_id ON offline_queue(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_offline_queue_status ON offline_queue(status);'
    ];
    
    for (const indexSql of indexes) {
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey
          },
          body: JSON.stringify({
            sql: indexSql
          })
        });
        
        if (response.ok) {
          log(`  ✅ Index created`, colors.green);
        } else {
          log(`  ⚠️  Index creation: ${await response.text()}`, colors.yellow);
        }
      } catch (err) {
        log(`  ❌ Index creation: ${err.message}`, colors.red);
      }
    }
    
    // Enable RLS
    log('🔐 Enabling Row Level Security...', colors.blue);
    const rlsTables = [
      'builder_context',
      'mvp_studio_projects', 
      'ideaforge_data',
      'chat_notification_preferences',
      'public_feedback_ideas',
      'bmc_canvas_data',
      'offline_queue'
    ];
    
    for (const tableName of rlsTables) {
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey
          },
          body: JSON.stringify({
            sql: `ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;`
          })
        });
        
        if (response.ok) {
          log(`  ✅ RLS enabled for ${tableName}`, colors.green);
        } else {
          log(`  ⚠️  RLS for ${tableName}: ${await response.text()}`, colors.yellow);
        }
      } catch (err) {
        log(`  ❌ RLS for ${tableName}: ${err.message}`, colors.red);
      }
    }
    
    // Create RLS policies
    log('🛡️  Creating RLS policies...', colors.blue);
    const policies = [
      {
        table: 'builder_context',
        policies: [
          'CREATE POLICY "Users can view own builder context" ON builder_context FOR SELECT USING (auth.uid() = user_id);',
          'CREATE POLICY "Users can insert own builder context" ON builder_context FOR INSERT WITH CHECK (auth.uid() = user_id);',
          'CREATE POLICY "Users can update own builder context" ON builder_context FOR UPDATE USING (auth.uid() = user_id);',
          'CREATE POLICY "Users can delete own builder context" ON builder_context FOR DELETE USING (auth.uid() = user_id);'
        ]
      },
      {
        table: 'mvp_studio_projects',
        policies: [
          'CREATE POLICY "Users can view own mvp studio projects" ON mvp_studio_projects FOR SELECT USING (auth.uid() = user_id);',
          'CREATE POLICY "Users can insert own mvp studio projects" ON mvp_studio_projects FOR INSERT WITH CHECK (auth.uid() = user_id);',
          'CREATE POLICY "Users can update own mvp studio projects" ON mvp_studio_projects FOR UPDATE USING (auth.uid() = user_id);',
          'CREATE POLICY "Users can delete own mvp studio projects" ON mvp_studio_projects FOR DELETE USING (auth.uid() = user_id);'
        ]
      },
      {
        table: 'ideaforge_data',
        policies: [
          'CREATE POLICY "Users can view own ideaforge data" ON ideaforge_data FOR SELECT USING (auth.uid() = user_id);',
          'CREATE POLICY "Users can insert own ideaforge data" ON ideaforge_data FOR INSERT WITH CHECK (auth.uid() = user_id);',
          'CREATE POLICY "Users can update own ideaforge data" ON ideaforge_data FOR UPDATE USING (auth.uid() = user_id);',
          'CREATE POLICY "Users can delete own ideaforge data" ON ideaforge_data FOR DELETE USING (auth.uid() = user_id);'
        ]
      },
      {
        table: 'chat_notification_preferences',
        policies: [
          'CREATE POLICY "Users can view own chat notification preferences" ON chat_notification_preferences FOR SELECT USING (auth.uid() = user_id);',
          'CREATE POLICY "Users can insert own chat notification preferences" ON chat_notification_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);',
          'CREATE POLICY "Users can update own chat notification preferences" ON chat_notification_preferences FOR UPDATE USING (auth.uid() = user_id);',
          'CREATE POLICY "Users can delete own chat notification preferences" ON chat_notification_preferences FOR DELETE USING (auth.uid() = user_id);'
        ]
      },
      {
        table: 'public_feedback_ideas',
        policies: [
          'CREATE POLICY "Users can view own public feedback ideas" ON public_feedback_ideas FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);',
          'CREATE POLICY "Users can insert own public feedback ideas" ON public_feedback_ideas FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);',
          'CREATE POLICY "Users can update own public feedback ideas" ON public_feedback_ideas FOR UPDATE USING (auth.uid() = user_id);',
          'CREATE POLICY "Users can delete own public feedback ideas" ON public_feedback_ideas FOR DELETE USING (auth.uid() = user_id);'
        ]
      },
      {
        table: 'bmc_canvas_data',
        policies: [
          'CREATE POLICY "Users can view own bmc canvas data" ON bmc_canvas_data FOR SELECT USING (auth.uid() = user_id);',
          'CREATE POLICY "Users can insert own bmc canvas data" ON bmc_canvas_data FOR INSERT WITH CHECK (auth.uid() = user_id);',
          'CREATE POLICY "Users can update own bmc canvas data" ON bmc_canvas_data FOR UPDATE USING (auth.uid() = user_id);',
          'CREATE POLICY "Users can delete own bmc canvas data" ON bmc_canvas_data FOR DELETE USING (auth.uid() = user_id);'
        ]
      },
      {
        table: 'offline_queue',
        policies: [
          'CREATE POLICY "Users can view own offline queue" ON offline_queue FOR SELECT USING (auth.uid() = user_id);',
          'CREATE POLICY "Users can insert own offline queue" ON offline_queue FOR INSERT WITH CHECK (auth.uid() = user_id);',
          'CREATE POLICY "Users can update own offline queue" ON offline_queue FOR UPDATE USING (auth.uid() = user_id);',
          'CREATE POLICY "Users can delete own offline queue" ON offline_queue FOR DELETE USING (auth.uid() = user_id);'
        ]
      }
    ];
    
    for (const tablePolicies of policies) {
      for (const policy of tablePolicies.policies) {
        try {
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${serviceRoleKey}`,
              'apikey': serviceRoleKey
            },
            body: JSON.stringify({
              sql: policy
            })
          });
          
          if (response.ok) {
            log(`  ✅ Policy created for ${tablePolicies.table}`, colors.green);
          } else {
            log(`  ⚠️  Policy for ${tablePolicies.table}: ${await response.text()}`, colors.yellow);
          }
        } catch (err) {
          log(`  ❌ Policy for ${tablePolicies.table}: ${err.message}`, colors.red);
        }
      }
    }
    
    // Verify tables exist
    log('🔍 Verifying table creation...', colors.blue);
    const expectedTables = [
      'builder_context',
      'mvp_studio_projects',
      'ideaforge_data',
      'chat_notification_preferences',
      'public_feedback_ideas',
      'bmc_canvas_data',
      'offline_queue'
    ];
    
    for (const tableName of expectedTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (error) {
          log(`  ❌ Table ${tableName}: ${error.message}`, colors.red);
        } else {
          log(`  ✅ Table ${tableName}: Exists`, colors.green);
        }
      } catch (err) {
        log(`  ❌ Table ${tableName}: ${err.message}`, colors.red);
      }
    }
    
    log('✅ Migration tables setup complete!', colors.green);
    
  } catch (error) {
    log(`❌ Setup failed: ${error.message}`, colors.red);
    process.exit(1);
  }
}

// Run the setup
createTables();
