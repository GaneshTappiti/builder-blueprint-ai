"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useActiveIdea, useIdeaContext } from '@/stores/ideaStore';
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Lightbulb,
  ChevronLeft,
  Sparkles,
  ArrowRight,
  Loader2,
  PlusCircle,
  Menu
} from "lucide-react";
import WorkspaceSidebar from "@/components/WorkspaceSidebar";
import { useToast } from "@/hooks/use-toast";
import { supabaseHelpers } from "@/lib/supabase-connection-helpers";

// Define IdeaProps interface for export
export interface IdeaProps {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  tags: string[];
  votes: number;
  comments: number;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface ActiveIdea {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'validated' | 'exploring' | 'archived';
  category: string;
  tags: string[];
  validation_score?: number;
  market_opportunity?: string;
  risk_assessment?: string;
  monetization_strategy?: string;
  key_features?: string[];
  next_steps?: string[];
  competitor_analysis?: string;
  target_market?: string;
  problem_statement?: string;
  created_at: string;
  updated_at: string;
}

export default function IdeaVaultPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [ideas, setIdeas] = useState<ActiveIdea[]>([]);

  const router = useRouter();
  const { toast } = useToast();
  const { activeIdea, fetchUserIdeas } = useActiveIdea();
  const { setHasActiveIdea, setActiveIdea, setCurrentStep } = useIdeaContext();

  // Mock subscription data for demonstration
  const isFreeTier = true;
  const usage = { ideasCreated: 1 };
  const currentPlan = { limits: { ideas: 1 } };

  // Load ideas using supabaseHelpers
  const loadIdeas = useCallback(async () => {
    console.log('🔄 Loading ideas in Idea Vault...');
    setIsLoading(true);
    try {
      // Load ideas using the same helper that saves them
      const { data: ideas, error } = await supabaseHelpers.getIdeas();
      console.log('📊 Ideas loaded:', { ideas, error });
      
      if (error) {
        console.error('Error loading ideas:', error);
        // Fallback to localStorage if supabaseHelpers fails
        const storedIdeas = JSON.parse(localStorage.getItem('ideaVault') || '[]');
        console.log('🔄 Fallback to localStorage:', storedIdeas);
        setIdeas(storedIdeas);
      } else {
        console.log('✅ Ideas set from supabaseHelpers:', ideas);
        setIdeas(ideas || []);
      }
      await fetchUserIdeas();
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading ideas:', error);
      // Fallback to localStorage
      const storedIdeas = JSON.parse(localStorage.getItem('ideaVault') || '[]');
      console.log('🔄 Fallback to localStorage (catch):', storedIdeas);
      setIdeas(storedIdeas);
      setIsLoading(false);
    }
  }, [fetchUserIdeas]);

  useEffect(() => {
    loadIdeas();
  }, [loadIdeas]);

  // Refresh ideas when the page becomes visible (e.g., when navigating back from workshop)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadIdeas();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [loadIdeas]);

  const continueToIdeaForge = () => {
    if (!activeIdea) {
      toast({
        title: "No Active Idea",
        description: "Please create an idea in Workshop first.",
        variant: "destructive"
      });
      return;
    }

    router.push('/workspace/ideaforge');
    
    toast({
      title: "Moving to IdeaForge",
      description: "Let's turn your idea into a structured plan!",
    });
  };

  const startNewIdea = () => {
    router.push('/workspace');
  };

  const archiveIdea = () => {
    // Add archive functionality here
    toast({
      title: "Feature Coming Soon",
      description: "Archive functionality will be available in the next update.",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'validated':
        return { text: "Validated", color: "bg-green-600/20 text-green-400" };
      case 'exploring':
        return { text: "Exploring", color: "bg-blue-600/20 text-blue-400" };
      case 'draft':
        return { text: "Draft", color: "bg-gray-600/20 text-gray-400" };
      default:
        return { text: status, color: "bg-gray-600/20 text-gray-400" };
    }
  };

  const getValidationColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="layout-container bg-gradient-to-br from-black via-gray-900 to-green-950">
      <WorkspaceSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="layout-main transition-all duration-300">
        {/* Top Navigation Bar */}
        <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-white/10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-white hover:bg-black/30"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                  onClick={() => router.push('/workspace')}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back to Workspace
                </Button>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">Idea Vault</h1>
              </div>
              <Button onClick={startNewIdea} disabled={isLoading}>
                <PlusCircle className="h-4 w-4 mr-2" />
                New Idea
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6 py-8 max-w-7xl mx-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
              <Loader2 className="h-12 w-12 text-green-500 animate-spin" />
              <p className="mt-4 text-gray-400">Loading your ideas...</p>
            </div>
          ) : ideas.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
              <Lightbulb className="h-16 w-16 text-gray-700 mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No ideas yet</h2>
              <p className="text-gray-400 max-w-md mb-8">Start your startup journey by creating and validating an idea in the Workshop.</p>
              <Button onClick={startNewIdea} size="lg">
                <Sparkles className="h-5 w-5 mr-2" />
                Start New Idea
              </Button>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">Your Ideas ({ideas.length})</h2>
                <Button onClick={startNewIdea} size="sm">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  New Idea
                </Button>
              </div>

              {/* Ideas Grid */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {ideas.map((idea) => (
                  <Card key={idea.id} className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg text-white mb-2 line-clamp-2">{idea.title}</CardTitle>
                          <p className="text-gray-400 text-sm line-clamp-3">{idea.description}</p>
                        </div>
                        <Badge className={getStatusBadge(idea.status).color}>
                          {getStatusBadge(idea.status).text}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Tags */}
                      {idea.tags && idea.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {idea.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" className="border-gray-600 text-gray-300 text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {idea.tags.length > 3 && (
                            <Badge variant="outline" className="border-gray-600 text-gray-300 text-xs">
                              +{idea.tags.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-4">
                        <Button 
                          size="sm" 
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                          onClick={() => {
                            // Set as active idea and continue to next step
                            setActiveIdea({
                              ...idea,
                              user_id: 'mock-user-id' // Add missing user_id field
                            });
                            setHasActiveIdea(true);
                            setCurrentStep('vault');
                            router.push('/workspace/idea-forge');
                          }}
                        >
                          <ArrowRight className="h-4 w-4 mr-2" />
                          Continue
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:bg-gray-800"
                          onClick={() => {
                            // View idea details
                            router.push(`/workspace/idea-vault/${idea.id}`);
                          }}
                        >
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
