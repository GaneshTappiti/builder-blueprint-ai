"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Completing authentication...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session from the URL hash
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          setStatus('error');
          setMessage(`Authentication failed: ${error.message}`);
          setTimeout(() => router.push('/auth'), 3000);
          return;
        }

        if (data.session) {
          setStatus('success');
          setMessage('Authentication successful! Checking profile...');
          
          // Check if this is a new user and if they need onboarding
          const user = data.session.user;
          if (user?.created_at) {
            const userCreatedAt = new Date(user.created_at);
            const now = new Date();
            const isNewUser = (now.getTime() - userCreatedAt.getTime()) < 300000; // Less than 5 minutes old
            
            console.log('🔍 AuthCallback: Checking new user status', {
              userCreatedAt: userCreatedAt.toISOString(),
              now: now.toISOString(),
              timeDiff: now.getTime() - userCreatedAt.getTime(),
              isNewUser,
              userEmail: user.email
            });
            
            if (isNewUser) {
              // Check if user has completed onboarding by looking at their profile
              try {
                const { data: profileData, error: profileError } = await supabase
                  .from('user_profiles')
                  .select('onboardingCompleted')
                  .eq('id', user.id)
                  .single();
                
                const needsOnboarding = !profileData?.onboardingCompleted;
                
                console.log('🔍 AuthCallback: Profile check result', {
                  profileData,
                  profileError,
                  needsOnboarding
                });
                
                if (needsOnboarding) {
                  console.log('🆕 AuthCallback: New user needs onboarding, redirecting to profile setup');
                  setMessage('New user detected! Setting up your profile...');
                  setTimeout(() => {
                    router.push('/profile/setup');
                  }, 1500);
                  return;
                } else {
                  console.log('✅ AuthCallback: User has completed onboarding');
                }
              } catch (profileCheckError) {
                console.warn('⚠️ AuthCallback: Could not check profile status, assuming needs onboarding', profileCheckError);
                // If we can't check the profile, assume they need onboarding
                setMessage('Setting up your profile...');
                setTimeout(() => {
                  router.push('/profile/setup');
                }, 1500);
                return;
              }
            }
          }
          
          // Get redirect URL from search params or default to workspace
          const urlParams = new URLSearchParams(window.location.search);
          const redirectTo = urlParams.get('redirectTo') || '/workspace';
          
          setMessage('Redirecting to workspace...');
          setTimeout(() => {
            router.push(redirectTo);
          }, 1500);
        } else {
          setStatus('error');
          setMessage('No session found. Please try again.');
          setTimeout(() => router.push('/auth'), 3000);
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred. Please try again.');
        setTimeout(() => router.push('/auth'), 3000);
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-glass">
      <div className="text-center workspace-card p-8">
        {status === 'loading' && (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-green-400 mx-auto mb-4" />
            <p className="text-gray-400">{message}</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-4" />
            <p className="text-green-400">{message}</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <XCircle className="h-8 w-8 text-red-400 mx-auto mb-4" />
            <p className="text-red-400">{message}</p>
          </>
        )}
      </div>
    </div>
  );
}
