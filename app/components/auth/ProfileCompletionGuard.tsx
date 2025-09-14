"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, User, ArrowRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface ProfileCompletionGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
  requireCompleteProfile?: boolean;
  minCompletionPercentage?: number;
}

export default function ProfileCompletionGuard({ 
  children, 
  fallback,
  redirectTo = '/profile/setup',
  requireCompleteProfile = true,
  minCompletionPercentage = 80
}: ProfileCompletionGuardProps) {
  const [isChecking, setIsChecking] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, getProfileCompletion, isProfileComplete } = useProfile();
  const router = useRouter();

  // Development mode bypass removed - profile completion always enforced

  useEffect(() => {
    // Wait for auth and profile to load
    if (authLoading || profileLoading) {
      return;
    }

    // If no user, let AuthGuard handle it
    if (!user) {
      setIsChecking(false);
      return;
    }

    // If profile is not loaded yet, wait
    if (!profile) {
      setIsChecking(false);
      return;
    }

    // Check profile completion
    const completionPercentage = getProfileCompletion();
    const isComplete = isProfileComplete();

    console.log('🔍 ProfileCompletionGuard: Checking profile completion', {
      profileId: profile?.id,
      onboardingCompleted: profile?.onboardingCompleted,
      completionPercentage,
      isComplete,
      requireCompleteProfile,
      profileData: {
        firstName: profile?.firstName,
        lastName: profile?.lastName,
        bio: profile?.bio,
        jobTitle: profile?.jobTitle,
        skills: profile?.skills?.length || 0,
        location: profile?.location,
        timezone: profile?.timezone
      }
    });

    if (requireCompleteProfile && !isComplete) {
      console.log('⚠️ ProfileCompletionGuard: Profile incomplete, redirecting to setup');
      setIsRedirecting(true);
      setTimeout(() => {
        router.push(redirectTo);
      }, 1000);
    } else {
      console.log('✅ ProfileCompletionGuard: Profile complete, allowing access');
      setIsChecking(false);
    }
  }, [user, profile, authLoading, profileLoading, requireCompleteProfile, isProfileComplete, getProfileCompletion, redirectTo, router]);

  // Show loading while checking profile completion
  if (isChecking || authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-green-900/20">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-8 w-8 border-2 border-green-400 border-t-transparent rounded-full"></div>
          <p className="text-gray-400">Checking profile completion...</p>
        </div>
      </div>
    );
  }

  // Show redirecting state
  if (isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-green-900/20">
        <div className="text-center space-y-4">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin h-8 w-8 border-2 border-green-400 border-t-transparent rounded-full"></div>
            <p className="text-gray-400">Redirecting to profile setup...</p>
          </div>
          <p className="text-gray-400">Please complete your profile to continue</p>
        </div>
      </div>
    );
  }

  // If profile completion is required but not met, show fallback or redirect
  if (requireCompleteProfile && profile && !isProfileComplete()) {
    if (fallback) {
      return <>{fallback}</>;
    }

    const completionPercentage = getProfileCompletion();
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-green-900/20">
        <Card className="w-full max-w-md mx-4 workspace-card">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-orange-500/20 rounded-full border border-orange-500/30">
                <User className="h-8 w-8 text-orange-400" />
              </div>
            </div>
            <CardTitle className="text-2xl text-white">Complete Your Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-gray-400">
                Your profile is {completionPercentage}% complete. Complete your profile to access all features.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Profile Completion</span>
                  <span>{completionPercentage}%</span>
                </div>
                <Progress value={completionPercentage} className="h-2" />
              </div>
              <p className="text-sm text-gray-500">
                Team invitations, idea vault, and other features require a complete profile.
              </p>
            </div>

            <div className="space-y-3">
              <Button asChild className="w-full workspace-button">
                <Link href={redirectTo}>
                  <User className="mr-2 h-4 w-4" />
                  Complete Profile
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full workspace-button-secondary">
                <Link href="/workspace">
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Continue with Limited Access
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If we reach here, profile is complete or not required
  return <>{children}</>;
}
