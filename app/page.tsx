"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // User is authenticated, redirect to workspace
        router.replace("/workspace");
      } else {
        // User is not authenticated, redirect to auth page
        router.replace("/auth");
      }
    }
  }, [user, loading, router]);

  // Show a loading state while checking authentication
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-400 border-t-transparent"></div>
        <p className="text-gray-300 text-sm">
          {loading ? "Checking authentication..." : "Redirecting..."}
        </p>
      </div>
    </div>
  );
}
