"use client";

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/auth/AuthGuard';
import ProfileCompletionGuard from '@/components/auth/ProfileCompletionGuard';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface WorkspaceLayoutProps {
  children: React.ReactNode;
}

export default function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  return (
    <AuthGuard
      requireAuth={true}
      redirectTo="/auth?redirectTo=/workspace"
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-green-900/20">
          <LoadingSpinner size="lg" text="Loading workspace..." />
        </div>
      }
    >
      <ProfileCompletionGuard
        requireCompleteProfile={true}
        redirectTo="/profile/setup"
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-green-900/20">
            <LoadingSpinner size="lg" text="Checking profile completion..." />
          </div>
        }
      >
        {children}
      </ProfileCompletionGuard>
    </AuthGuard>
  );
}
