"use client";

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/auth/AuthGuard';
import ProfileCompletionGuard from '@/components/auth/ProfileCompletionGuard';

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
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin h-8 w-8 border-2 border-green-400 border-t-transparent rounded-full"></div>
            <p className="text-gray-400">Loading workspace...</p>
          </div>
        </div>
      }
    >
      <ProfileCompletionGuard
        requireCompleteProfile={true}
        redirectTo="/profile/setup"
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-green-900/20">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin h-8 w-8 border-2 border-green-400 border-t-transparent rounded-full"></div>
              <p className="text-gray-400">Checking profile completion...</p>
            </div>
          </div>
        }
      >
        {children}
      </ProfileCompletionGuard>
    </AuthGuard>
  );
}
