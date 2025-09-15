"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AuthFlowManager } from '@/utils/authFlowManager';

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
          setMessage('Authentication successful! Analyzing user status...');
          
          // Use AuthFlowManager to analyze the auth event and determine next steps
          const authEventInfo = await AuthFlowManager.analyzeAuthEvent('SIGNED_IN', data.session);
          
          console.log('🔍 AuthCallback: Auth event analysis complete', authEventInfo);
          
          if (authEventInfo.isOAuthRefresh) {
            setMessage('Welcome back! Redirecting...');
          } else if (authEventInfo.needsProfileSetup) {
            setMessage('Setting up your profile...');
          } else {
            setMessage('Redirecting to workspace...');
          }
          
          // Get redirect URL from search params or use AuthFlowManager's recommendation
          const urlParams = new URLSearchParams(window.location.search);
          const defaultRedirect = urlParams.get('redirectTo') || '/workspace';
          const redirectPath = AuthFlowManager.getRedirectPath(authEventInfo, defaultRedirect);
          
          setTimeout(() => {
            router.push(redirectPath);
          }, 1500);
          
        } else {
          setStatus('error');
          setMessage('No session found. Please try again.');
          setTimeout(() => router.push('/auth'), 3000);
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        
        // Fallback: Force profile setup if there's any uncertainty
        if (error instanceof Error && error.message.includes('profile')) {
          setMessage('Setting up your profile due to authentication issue...');
          setTimeout(() => {
            router.push(AuthFlowManager.forceProfileSetup());
          }, 2000);
        } else {
          setMessage('An unexpected error occurred. Please try again.');
          setTimeout(() => router.push('/auth'), 3000);
        }
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
