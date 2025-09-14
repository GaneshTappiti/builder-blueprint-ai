import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';
import { validateEnvironment, logEnvironmentStatus } from './env-validation';

// Validate environment variables
const envConfig = validateEnvironment();

// Log environment status for debugging
logEnvironmentStatus();

// Supabase client configuration
const supabaseUrl = envConfig.supabaseUrl;
const supabaseAnonKey = envConfig.supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', envConfig.missingVars);
  throw new Error(`Missing Supabase environment variables: ${envConfig.missingVars.join(', ')}`);
}

// Create Supabase client with proper configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  global: {
    headers: {
      'X-Client-Info': 'builder-blueprint-ai'
    }
  }
});

// Create browser client for SSR compatibility
export const createSupabaseClient = () => {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
};

// Helper function to get current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

// Helper function to check if user is authenticated
export const isAuthenticated = async () => {
  const user = await getCurrentUser();
  return !!user;
};