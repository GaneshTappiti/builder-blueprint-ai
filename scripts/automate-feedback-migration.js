/**
 * Automated Feedback System Migration Script
 * Creates all necessary tables for the Idea Forge feedback system in Supabase
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please check your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Migration SQL statements
const migrations = [
  {
    name: 'Create Ideas Table',
    sql: `
      -- Create ideas table for Idea Vault system
      CREATE TABLE IF NOT EXISTS ideas (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        content TEXT,
        category VARCHAR(100),
        tags TEXT[] DEFAULT '{}',
        status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived', 'deleted')),
        is_public BOOLEAN DEFAULT false,
        team_suggestions JSONB DEFAULT '[]',
        collaboration_data JSONB DEFAULT '{}',
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
  },
  {
    name: 'Create Public Feedback Table',
    sql: `
      -- Create public_feedback table for public feedback system
      CREATE TABLE IF NOT EXISTS public_feedback (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE NOT NULL,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        feedback_type VARCHAR(50) NOT NULL CHECK (feedback_type IN ('comment', 'rating', 'like', 'dislike')),
        content TEXT,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        is_anonymous BOOLEAN DEFAULT false,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
  },
  {
    name: 'Create Idea Collaborations Table',
    sql: `
      -- Create idea_collaborations table for team collaboration
      CREATE TABLE IF NOT EXISTS idea_collaborations (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE NOT NULL,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        collaboration_type VARCHAR(50) NOT NULL CHECK (collaboration_type IN ('suggestion', 'comment', 'rating', 'share')),
        content TEXT,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(idea_id, user_id, collaboration_type)
      );
    `
  },
  {
    name: 'Create Indexes for Performance',
    sql: `
      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_ideas_public ON ideas(is_public) WHERE is_public = true;
      CREATE INDEX IF NOT EXISTS idx_ideas_user_id ON ideas(user_id);
      CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas(created_at);
      CREATE INDEX IF NOT EXISTS idx_public_feedback_idea_id ON public_feedback(idea_id);
      CREATE INDEX IF NOT EXISTS idx_public_feedback_created_at ON public_feedback(created_at);
      CREATE INDEX IF NOT EXISTS idx_idea_collaborations_idea_id ON idea_collaborations(idea_id);
    `
  },
  {
    name: 'Create Row Level Security Policies',
    sql: `
      -- Enable RLS on all tables
      ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public_feedback ENABLE ROW LEVEL SECURITY;
      ALTER TABLE idea_collaborations ENABLE ROW LEVEL SECURITY;

      -- Ideas policies
      CREATE POLICY "Users can view their own ideas" ON ideas
        FOR SELECT USING (auth.uid() = user_id);
      
      CREATE POLICY "Users can insert their own ideas" ON ideas
        FOR INSERT WITH CHECK (auth.uid() = user_id);
      
      CREATE POLICY "Users can update their own ideas" ON ideas
        FOR UPDATE USING (auth.uid() = user_id);
      
      CREATE POLICY "Users can delete their own ideas" ON ideas
        FOR DELETE USING (auth.uid() = user_id);
      
      CREATE POLICY "Anyone can view public ideas" ON ideas
        FOR SELECT USING (is_public = true);

      -- Public feedback policies
      CREATE POLICY "Anyone can view public feedback" ON public_feedback
        FOR SELECT USING (true);
      
      CREATE POLICY "Anyone can insert public feedback" ON public_feedback
        FOR INSERT WITH CHECK (true);
      
      CREATE POLICY "Users can update their own feedback" ON public_feedback
        FOR UPDATE USING (auth.uid() = user_id OR is_anonymous = true);
      
      CREATE POLICY "Users can delete their own feedback" ON public_feedback
        FOR DELETE USING (auth.uid() = user_id OR is_anonymous = true);

      -- Idea collaborations policies
      CREATE POLICY "Users can view collaborations on their ideas" ON idea_collaborations
        FOR SELECT USING (
          auth.uid() = user_id OR 
          idea_id IN (SELECT id FROM ideas WHERE user_id = auth.uid())
        );
      
      CREATE POLICY "Users can insert collaborations" ON idea_collaborations
        FOR INSERT WITH CHECK (auth.uid() = user_id);
      
      CREATE POLICY "Users can update their own collaborations" ON idea_collaborations
        FOR UPDATE USING (auth.uid() = user_id);
      
      CREATE POLICY "Users can delete their own collaborations" ON idea_collaborations
        FOR DELETE USING (auth.uid() = user_id);
    `
  },
  {
    name: 'Create Update Triggers',
    sql: `
      -- Create function to update updated_at timestamp
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';

      -- Create triggers for updated_at
      CREATE TRIGGER update_ideas_updated_at BEFORE UPDATE ON ideas
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      
      CREATE TRIGGER update_public_feedback_updated_at BEFORE UPDATE ON public_feedback
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `
  }
];

class FeedbackMigrationAutomator {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
  }

  async runMigrations() {
    console.log('🚀 Starting Automated Feedback System Migration...\n');
    console.log(`📊 Supabase URL: ${supabaseUrl}`);
    console.log(`🔑 Using API Key: ${supabaseKey.substring(0, 20)}...\n`);

    try {
      // Test connection first
      await this.testConnection();

      // Run each migration
      for (const migration of migrations) {
        await this.runMigration(migration);
      }

      // Verify tables were created
      await this.verifyTables();

      // Generate summary report
      this.generateReport();

    } catch (error) {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }
  }

  async testConnection() {
    console.log('🔍 Testing Supabase connection...');
    
    try {
      const { data, error } = await supabase
        .from('pg_tables')
        .select('tablename')
        .limit(1);

      if (error) throw error;
      
      console.log('✅ Supabase connection successful\n');
    } catch (error) {
      throw new Error(`Connection failed: ${error.message}`);
    }
  }

  async runMigration(migration) {
    console.log(`📝 Running: ${migration.name}...`);
    
    try {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: migration.sql
      });

      if (error) {
        // Some errors are expected (like table already exists)
        if (error.message.includes('already exists') || 
            error.message.includes('already defined')) {
          console.log(`⚠️  ${migration.name} - Already exists (skipped)`);
          this.results.push({
            name: migration.name,
            status: 'skipped',
            message: 'Already exists'
          });
        } else {
          throw error;
        }
      } else {
        console.log(`✅ ${migration.name} - Success`);
        this.results.push({
          name: migration.name,
          status: 'success',
          message: 'Created successfully'
        });
      }
    } catch (error) {
      console.log(`❌ ${migration.name} - Failed: ${error.message}`);
      this.results.push({
        name: migration.name,
        status: 'failed',
        message: error.message
      });
    }
  }

  async verifyTables() {
    console.log('\n🔍 Verifying tables were created...');
    
    const expectedTables = ['ideas', 'public_feedback', 'idea_collaborations'];
    const { data, error } = await supabase
      .from('pg_tables')
      .select('tablename')
      .in('tablename', expectedTables);

    if (error) {
      console.log('⚠️  Could not verify tables:', error.message);
      return;
    }

    const createdTables = data.map(row => row.tablename);
    
    expectedTables.forEach(table => {
      if (createdTables.includes(table)) {
        console.log(`✅ Table '${table}' exists`);
      } else {
        console.log(`❌ Table '${table}' missing`);
      }
    });
  }

  generateReport() {
    const endTime = Date.now();
    const duration = ((endTime - this.startTime) / 1000).toFixed(2);
    
    console.log('\n📋 MIGRATION REPORT');
    console.log('==================\n');
    
    const successful = this.results.filter(r => r.status === 'success').length;
    const skipped = this.results.filter(r => r.status === 'skipped').length;
    const failed = this.results.filter(r => r.status === 'failed').length;
    
    console.log(`⏱️  Duration: ${duration}s`);
    console.log(`✅ Successful: ${successful}`);
    console.log(`⚠️  Skipped: ${skipped}`);
    console.log(`❌ Failed: ${failed}\n`);
    
    console.log('📊 Migration Details:');
    this.results.forEach(result => {
      const status = result.status === 'success' ? '✅' : 
                   result.status === 'skipped' ? '⚠️' : '❌';
      console.log(`${status} ${result.name}: ${result.message}`);
    });
    
    if (failed === 0) {
      console.log('\n🎉 Migration completed successfully!');
      console.log('🚀 Your feedback system is ready to use with Supabase!');
    } else {
      console.log('\n⚠️  Some migrations failed. Please check the errors above.');
    }
  }
}

// Run the migration
const automator = new FeedbackMigrationAutomator();
automator.runMigrations().catch(console.error);
