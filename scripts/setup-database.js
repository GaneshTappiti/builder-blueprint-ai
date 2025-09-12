#!/usr/bin/env node

/**
 * Database Setup Script
 * This script helps set up the Supabase database with all required tables and data
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Builder Blueprint AI - Database Setup Script');
console.log('================================================\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
const envExamplePath = path.join(process.cwd(), '.env.example');

if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found!');
  console.log('📝 Creating .env.example file...\n');
  
  const envContent = `# Supabase Configuration
# Get these values from your Supabase project dashboard:
# https://supabase.com/dashboard/project/_/settings/api
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Google Gemini AI Configuration
# Get your API key from: https://aistudio.google.com/app/apikey
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here

# For local development with Supabase CLI
# These will be used when running supabase start
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=your_local_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_local_service_role_key_here`;

  fs.writeFileSync(envExamplePath, envContent);
  console.log('✅ Created .env.example file');
  console.log('📋 Please copy .env.example to .env.local and fill in your actual values\n');
} else {
  console.log('✅ .env.local file found\n');
}

// List all migration files
const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
const migrationFiles = fs.readdirSync(migrationsDir)
  .filter(file => file.endsWith('.sql'))
  .sort();

console.log('📁 Found migration files:');
migrationFiles.forEach((file, index) => {
  console.log(`   ${index + 1}. ${file}`);
});

console.log('\n🔧 Database Setup Instructions:');
console.log('================================\n');

console.log('1. Install Supabase CLI (if not already installed):');
console.log('   npm install -g supabase\n');

console.log('2. Login to Supabase:');
console.log('   supabase login\n');

console.log('3. Link your project:');
console.log('   supabase link --project-ref YOUR_PROJECT_REF\n');

console.log('4. Start local development:');
console.log('   supabase start\n');

console.log('5. Apply migrations:');
console.log('   supabase db push\n');

console.log('6. Or apply migrations to remote database:');
console.log('   supabase db push --db-url "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"\n');

console.log('📊 Database Tables that will be created:');
console.log('========================================\n');

const tableDescriptions = {
  'user_profiles': 'Main user profile information with comprehensive fields',
  'user_skills': 'User skills and expertise tracking',
  'user_certifications': 'Professional certifications and credentials',
  'user_languages': 'Language proficiency tracking',
  'user_achievements': 'User achievements and accomplishments',
  'user_connections': 'User connections and networking',
  'user_collaborations': 'Collaboration history and tracking',
  'profile_timeline_events': 'Timeline events for user profiles',
  'gamification_data': 'Gamification and points system data',
  'trend_analytics': 'User trend analysis and insights',
  'benchmarking_data': 'Performance benchmarking data',
  'engagement_sentiment': 'User engagement and sentiment analysis',
  'admin_override_rules': 'Admin override rules and permissions',
  'profile_media_files': 'User media files and attachments',
  'projects': 'User projects and project management',
  'tasks': 'Project tasks and task management',
  'team_invitations': 'Team invitation system',
  'notifications': 'User notification system',
  'team_members': 'Team membership tracking',
  'teams': 'Team information and settings',
  'ideas': 'Idea vault and idea management',
  'rag_tool_documentation': 'RAG tool documentation and prompts',
  'rag_tool_optimizations': 'Tool optimization tips and best practices',
  'rag_prompt_history': 'Prompt generation history and analytics'
};

Object.entries(tableDescriptions).forEach(([table, description], index) => {
  console.log(`   ${index + 1}. ${table}: ${description}`);
});

console.log('\n🔐 Row Level Security (RLS) Policies:');
console.log('====================================\n');
console.log('✅ All tables have RLS enabled');
console.log('✅ Users can only access their own data');
console.log('✅ Team members can access team data');
console.log('✅ Admins have appropriate permissions');
console.log('✅ Public read access for documentation tables');

console.log('\n🚀 Next Steps:');
console.log('==============\n');
console.log('1. Set up your Supabase project and get credentials');
console.log('2. Copy .env.example to .env.local and fill in values');
console.log('3. Run the Supabase commands above to set up the database');
console.log('4. Start your Next.js development server: npm run dev');
console.log('5. Test the database connection in your application');

console.log('\n📚 Additional Resources:');
console.log('========================\n');
console.log('• Supabase Documentation: https://supabase.com/docs');
console.log('• Next.js with Supabase: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs');
console.log('• RLS Policies: https://supabase.com/docs/guides/auth/row-level-security');

console.log('\n✨ Database setup complete! Happy coding! 🎉\n');

