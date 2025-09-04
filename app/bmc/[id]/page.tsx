"use client"

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function BMCRedirectPage() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    // Redirect old BMC URLs to Idea Forge with BMC tab
    // First, try to find if there's an associated idea
    const bmcId = params.id as string;
    
    // Check if there's a saved BMC in localStorage
    const savedCanvas = localStorage.getItem(`bmc-${bmcId}`);
    const generalCanvas = localStorage.getItem('bmc-canvas');
    
    if (savedCanvas || generalCanvas) {
      // If we have a canvas, redirect to Idea Forge with BMC tab
      // For now, redirect to the general Idea Forge page
      router.push('/workspace/idea-forge?tab=bmc');
    } else {
      // If no canvas found, redirect to Idea Forge to create one
      router.push('/workspace/idea-forge?tab=bmc');
    }
  }, [params.id, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-900/20 flex items-center justify-center">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" text="Redirecting to Idea Forge..." />
        <p className="text-gray-400">Business Model Canvas is now integrated into Idea Forge</p>
      </div>
    </div>
  );
}