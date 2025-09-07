"use client"

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, ArrowLeft, LogIn, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
  allowedRoles?: string[];
}

export default function AuthGuard({ 
  children, 
  fallback, 
  redirectTo = '/auth',
  requireAuth = true,
  allowedRoles = []
}: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Check if we're in development mode and should bypass auth
  const isDevelopmentMode = process.env.NODE_ENV === 'development' || 
                           process.env.NEXT_PUBLIC_DEVELOPMENT_MODE === 'true' ||
                           process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';

  // Get redirect URL from search params
  const redirectUrl = searchParams.get('redirectTo') || redirectTo;

  useEffect(() => {
    // Skip auth checks in development mode
    if (isDevelopmentMode) {
      return;
    }
    
    if (!loading && requireAuth && !user) {
      setIsRedirecting(true);
      // Small delay to show loading state
      setTimeout(() => {
        router.push(redirectUrl);
      }, 1000);
    }
  }, [user, loading, requireAuth, redirectUrl, router, isDevelopmentMode]);

  // Show loading while checking auth (skip in development mode)
  if (loading && !isDevelopmentMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-green-900/20">
        <LoadingSpinner size="lg" text="Checking authentication..." />
      </div>
    );
  }

  // Show redirecting state (skip in development mode)
  if (isRedirecting && !isDevelopmentMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-green-900/20">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" text="Redirecting to login..." />
          <p className="text-gray-400">Please sign in to access this feature</p>
        </div>
      </div>
    );
  }

  // If auth is required and user is not logged in, show fallback or redirect (skip in development mode)
  if (requireAuth && !user && !isDevelopmentMode) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-green-900/20">
        <Card className="w-full max-w-md mx-4 workspace-card">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-red-500/20 rounded-full border border-red-500/30">
                <Shield className="h-8 w-8 text-red-400" />
              </div>
            </div>
            <CardTitle className="text-2xl text-white">Authentication Required</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-gray-400">
                You need to be signed in to access this feature.
              </p>
              <p className="text-sm text-gray-500">
                Please sign in to your account to continue.
              </p>
            </div>

            <div className="space-y-3">
              <Button asChild className="w-full workspace-button">
                <Link href={`/auth?redirectTo=${encodeURIComponent(window.location.pathname)}`}>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full workspace-button-secondary">
                <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check role-based access if specified (skip in development mode)
  if (requireAuth && user && allowedRoles.length > 0 && !isDevelopmentMode) {
    const userRole = user.role || 'user'; // Assuming role is stored in user object
    if (!allowedRoles.includes(userRole)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-green-900/20">
          <Card className="w-full max-w-md mx-4 workspace-card">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-orange-500/20 rounded-full border border-orange-500/30">
                  <AlertCircle className="h-8 w-8 text-orange-400" />
                </div>
              </div>
              <CardTitle className="text-2xl text-white">Access Denied</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-2">
                <p className="text-gray-400">
                  You don't have permission to access this feature.
                </p>
                <p className="text-sm text-gray-500">
                  Required roles: {allowedRoles.join(', ')}
                </p>
              </div>

              <div className="space-y-3">
                <Button asChild className="w-full workspace-button">
                  <Link href="/workspace">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Workspace
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  // If we reach here, user is authenticated and authorized
  return <>{children}</>;
}
