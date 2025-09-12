"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
// import type { User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
  // Enhanced profile fields
  firstName?: string;
  lastName?: string;
  displayName?: string;
  bio?: string;
  phone?: string;
  location?: string;
  timezone?: string;
  jobTitle?: string;
  department?: string;
  status?: 'online' | 'offline' | 'busy' | 'away';
  profileCompletion?: number;
  lastLogin?: string;
}

interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signInWithProvider: (provider: 'google' | 'github' | 'gmail') => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check if we're in development mode and should bypass auth
  // Only bypass if explicitly enabled AND Supabase is not configured
  const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                              process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
                              process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co' &&
                              process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'placeholder-key';
  
  const isDevelopmentMode = (process.env.NODE_ENV === 'development' || 
                           process.env.NEXT_PUBLIC_DEVELOPMENT_MODE === 'true' ||
                           process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true') && !isSupabaseConfigured;

  // Initialize auth state and listen for changes
  useEffect(() => {
    // Debug logging
    console.log('🔧 AuthContext: Initializing...', {
      isDevelopmentMode,
      isSupabaseConfigured,
      nodeEnv: process.env.NODE_ENV
    });

    // If in development mode, set a mock user and skip auth
    if (isDevelopmentMode) {
      console.log('🔧 Development mode: Bypassing authentication');
      setUser({
        id: 'dev-user-123',
        email: 'dev@example.com',
        name: 'Development User',
        avatar_url: undefined,
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      setLoading(false);
      return;
    }

    // If Supabase is configured, use real authentication
    if (isSupabaseConfigured) {
      console.log('✅ Supabase configured: Using real authentication');
    }

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
          setError('Failed to get session. Please try again.');
        } else if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'User',
            avatar_url: session.user.user_metadata?.avatar_url,
            role: session.user.user_metadata?.role || 'user',
            created_at: session.user.created_at,
            updated_at: session.user.updated_at
          });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setError('Failed to initialize authentication. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes (only if not in development mode)
    if (!isDevelopmentMode) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event: any, session: any) => {
          if (session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'User',
              avatar_url: session.user.user_metadata?.avatar_url,
              role: session.user.user_metadata?.role || 'user',
              created_at: session.user.created_at,
              updated_at: session.user.updated_at
            });
            
            // Redirect to workspace after successful authentication
            if (event === 'SIGNED_IN' && typeof window !== 'undefined') {
              const urlParams = new URLSearchParams(window.location.search);
              const redirectTo = urlParams.get('redirectTo') || '/workspace';
              
              // Check if this is a new user signup and redirect to profile setup
              if (event === 'SIGNED_IN' && session?.user?.created_at) {
                const userCreatedAt = new Date(session.user.created_at);
                const now = new Date();
                const isNewUser = (now.getTime() - userCreatedAt.getTime()) < 60000; // Less than 1 minute old
                
                if (isNewUser) {
                  router.push('/profile/setup');
                  return;
                }
              }
              
              router.push(redirectTo);
            }
          } else {
            setUser(null);
          }
          setLoading(false);
          setError(null); // Clear any previous errors on successful auth change
        }
      );

      return () => subscription.unsubscribe();
    }
    
    // Return cleanup function for development mode
    return () => {};
  }, []);

  const signIn = async (email: string, password: string) => {
    if (isDevelopmentMode) {
      console.log('🔧 Development mode: Sign in bypassed');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        setError(error.message);
        throw error;
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    if (isDevelopmentMode) {
      console.log('🔧 Development mode: Sign out bypassed');
      setUser(null);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setError(error.message);
        throw error;
      }
      // Redirect to auth page after sign out
      router.push('/auth');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            name: name,
            role: 'user'
          }
        }
      });
      
      if (error) {
        setError(error.message);
        throw error;
      }
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithProvider = async (provider: 'google' | 'github' | 'gmail') => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider === 'gmail' ? 'google' : provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: provider === 'gmail' ? {
            access_type: 'offline',
            prompt: 'consent',
            scope: 'openid email profile https://www.googleapis.com/auth/gmail.readonly'
          } : undefined
        }
      });
      
      if (error) {
        setError(error.message);
        throw error;
      }
    } catch (error) {
      console.error('OAuth sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?mode=reset-password`,
      });
      
      if (error) {
        setError(error.message);
        throw error;
      }
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (newPassword: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        setError(error.message);
        throw error;
      }
    } catch (error) {
      console.error('Update password error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    signIn,
    signOut,
    signUp,
    signInWithProvider,
    resetPassword,
    updatePassword,
    loading,
    error,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
