// Environment variable validation for authentication setup

interface EnvConfig {
  supabaseUrl: string | undefined;
  supabaseAnonKey: string | undefined;
  isSupabaseConfigured: boolean;
  missingVars: string[];
}

export function validateEnvironment(): EnvConfig {
  // Only run on client side to avoid SSR issues
  if (typeof window === 'undefined') {
    return {
      supabaseUrl: undefined,
      supabaseAnonKey: undefined,
      isSupabaseConfigured: false,
      missingVars: ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY']
    };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  const missingVars: string[] = [];
  
  if (!supabaseUrl) {
    missingVars.push('NEXT_PUBLIC_SUPABASE_URL');
  }
  
  if (!supabaseAnonKey) {
    missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
  
  const isSupabaseConfigured = missingVars.length === 0 && 
    supabaseUrl !== 'https://placeholder.supabase.co' && 
    supabaseAnonKey !== 'placeholder-key';
  
  return {
    supabaseUrl,
    supabaseAnonKey,
    isSupabaseConfigured,
    missingVars
  };
}

export function getSetupInstructions(): string {
  return `
To enable authentication, please create a .env.local file in your project root with the following variables:

# Supabase Configuration
# Get these values from your Supabase project dashboard:
# https://supabase.com/dashboard/project/_/settings/api
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Google Gemini AI Configuration (optional)
# Get your API key from: https://aistudio.google.com/app/apikey
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here

After adding these variables, restart your development server.
  `.trim();
}

export function logEnvironmentStatus(): void {
  // Only log on client side to avoid SSR issues
  if (typeof window === 'undefined') {
    return;
  }

  const config = validateEnvironment();
  
  if (config.isSupabaseConfigured) {
    console.log('✅ Supabase authentication is properly configured');
  } else {
    console.warn('⚠️ Supabase authentication is not configured');
    console.warn('Missing environment variables:', config.missingVars.join(', '));
    console.warn('Setup instructions:');
    console.warn(getSetupInstructions());
  }
}

export function getGeminiApiKey(): string | undefined {
  return process.env.GOOGLE_GEMINI_API_KEY;
}