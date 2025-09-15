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

  // Development mode bypass removed - onboarding will always work

  // Initialize auth state and listen for changes
  useEffect(() => {
    // Debug logging
    console.log('🔧 AuthContext: Initializing...', {
      nodeEnv: process.env.NODE_ENV
    });

    // Use real authentication with Supabase
    console.log('✅ Using Supabase authentication');

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

    // Listen for auth changes
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
            
            // Note: OAuth redirects are handled by AuthCallback page
            // This context mainly handles programmatic auth changes
            if (event === 'SIGNED_IN' && typeof window !== 'undefined') {
              // Only redirect if we're not on the callback page (to avoid conflicts)
              // AND we're not already on a workspace page (to prevent redirect loops)
              if (!window.location.pathname.includes('/auth/callback') && 
                  !window.location.pathname.startsWith('/workspace')) {
                const urlParams = new URLSearchParams(window.location.search);
                const redirectTo = urlParams.get('redirectTo') || '/workspace';
                router.push(redirectTo);
              }
            }
          } else {
            setUser(null);
          }
          setLoading(false);
          setError(null); // Clear any previous errors on successful auth change
        }
      );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
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
    console.log('🔓 AuthContext: Starting sign out process...');
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ AuthContext: Sign out error:', error);
        setError(error.message);
        throw error;
      }
      console.log('✅ AuthContext: Successfully signed out from Supabase');
      
      // Clear user state
      setUser(null);
      console.log('✅ AuthContext: User state cleared');
      
      // Redirect to auth page after sign out
      console.log('🔄 AuthContext: Redirecting to auth page...');
      router.push('/auth');
    } catch (error) {
      console.error('❌ AuthContext: Sign out error:', error);
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
