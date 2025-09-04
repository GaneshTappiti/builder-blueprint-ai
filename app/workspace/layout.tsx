"use client";

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/auth/AuthGuard';
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
      {children}
    </AuthGuard>
  );
}
