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
  const { setHasActiveIdea } = useIdeaContext();

  // Mock subscription data for demonstration
  const isFreeTier = true;
  const usage = { ideasCreated: 1 };
  const currentPlan = { limits: { ideas: 1 } };

  // Mock data for demonstration - in real app this would come from database/store
  const loadIdeas = useCallback(async () => {
    setIsLoading(true);
    try {
      await fetchUserIdeas();
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  }, [fetchUserIdeas]);

  useEffect(() => {
    loadIdeas();
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
          ) : !activeIdea ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
              <Lightbulb className="h-16 w-16 text-gray-700 mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No active idea</h2>
              <p className="text-gray-400 max-w-md mb-8">Start your startup journey by creating and validating an idea in the Workshop.</p>
              <Button onClick={startNewIdea} size="lg">
                <Sparkles className="h-5 w-5 mr-2" />
                Start New Idea
              </Button>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">Active Idea</h2>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">Edit</Button>
                  <Button variant="ghost" size="sm">Archive</Button>
                </div>
              </div>

              {/* Active Idea Display */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl text-white mb-2">{activeIdea.title}</CardTitle>
                      <p className="text-gray-400">{activeIdea.description}</p>
                    </div>
                    <Badge className={getStatusBadge(activeIdea.status).color}>
                      {getStatusBadge(activeIdea.status).text}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Tags */}
                  {activeIdea.tags && activeIdea.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {activeIdea.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="border-gray-600 text-gray-300">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Key Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {activeIdea.market_opportunity && (
                      <div className="bg-black/20 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-green-400 mb-2">Market Opportunity</h4>
                        <p className="text-gray-300 text-sm">{activeIdea.market_opportunity}</p>
                      </div>
                    )}
                    {activeIdea.target_market && (
                      <div className="bg-black/20 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-blue-400 mb-2">Target Market</h4>
                        <p className="text-gray-300 text-sm">{activeIdea.target_market}</p>
                      </div>
                    )}
                    {activeIdea.monetization_strategy && (
                      <div className="bg-black/20 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-yellow-400 mb-2">Monetization</h4>
                        <p className="text-gray-300 text-sm">{activeIdea.monetization_strategy}</p>
                      </div>
                    )}
                    {activeIdea.risk_assessment && (
                      <div className="bg-black/20 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-red-400 mb-2">Risk Assessment</h4>
                        <p className="text-gray-300 text-sm">{activeIdea.risk_assessment}</p>
                      </div>
                    )}
                  </div>

                  {/* Key Features */}
                  {activeIdea.key_features && activeIdea.key_features.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-white mb-3">Key Features</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {activeIdea.key_features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-gray-300 text-sm">
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Next Steps */}
                  {activeIdea.next_steps && activeIdea.next_steps.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-white mb-3">Next Steps</h4>
                      <div className="space-y-2">
                        {activeIdea.next_steps.map((step, index) => (
                          <div key={index} className="flex items-center gap-2 text-gray-300 text-sm">
                            <div className="w-5 h-5 bg-blue-600/20 rounded-full flex items-center justify-center text-xs text-blue-400 font-medium">
                              {index + 1}
                            </div>
                            {step}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      onClick={continueToIdeaForge}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Continue to IdeaForge
                    </Button>
                    <Button
                      onClick={archiveIdea}
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      Archive
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
