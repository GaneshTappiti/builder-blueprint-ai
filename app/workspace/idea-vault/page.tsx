"use client";

import React, { useState, useEffect } from "react";
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
  const [activeIdea, setActiveIdea] = useState<ActiveIdea | null>(null);
  const [hasActiveIdea, setHasActiveIdea] = useState(false);

  const router = useRouter();
  const { toast } = useToast();

  // Mock subscription data for demonstration
  const isFreeTier = true;
  const usage = { ideasCreated: 1 };
  const currentPlan = { limits: { ideas: 1 } };

  // Mock data for demonstration - in real app this would come from database/store
  useEffect(() => {
    // Simulate loading active idea
    setIsLoading(true);
    setTimeout(() => {
      // Mock active idea data
      const mockIdea: ActiveIdea = {
        id: "1",
        title: "AI-Powered Fitness Coach",
        description: "A personalized fitness coaching app that uses AI to create custom workout plans and provide real-time form feedback through computer vision.",
        status: "validated",
        category: "health-tech",
        tags: ["ai", "fitness", "mobile-app", "computer-vision"],
        validation_score: 85,
        market_opportunity: "The global fitness app market is valued at $4.4 billion and growing at 14.7% CAGR",
        risk_assessment: "High competition from established players like Nike Training Club and Peloton",
        monetization_strategy: "Freemium model with premium subscription for advanced AI features",
        key_features: ["AI workout generation", "Form analysis", "Progress tracking", "Social features"],
        next_steps: ["Market research", "MVP development", "User testing"],
        competitor_analysis: "Direct competitors include Freeletics, Fitbod, and Nike Training Club",
        target_market: "Health-conscious millennials and Gen Z users aged 25-40",
        problem_statement: "Many people struggle with proper form and personalized workout plans",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setActiveIdea(mockIdea);
      setHasActiveIdea(true);
      setIsLoading(false);
    }, 1000);
  }, []);

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

  const archiveIdea = async () => {
    if (!activeIdea) return;

    try {
      // In real app, update idea status to archived in database
      setActiveIdea(null);
      setHasActiveIdea(false);

      toast({
        title: "Idea Archived",
        description: "Your idea has been archived. You can now create a new one!",
      });

      // Navigate back to workshop
      router.push('/workspace/workshop');
      
    } catch (error) {
      console.error('Error archiving idea:', error);
      toast({
        title: "Archive Failed",
        description: "Could not archive idea. Please try again.",
        variant: "destructive"
      });
    }
  };

  const startNewIdea = () => {
    router.push('/workspace/workshop');
  };

  const getValidationColor = (score?: number) => {
    if (!score) return "text-gray-400";
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getValidationBadge = (score?: number) => {
    if (!score) return { text: "Not Validated", color: "bg-gray-600/20 text-gray-400" };
    if (score >= 80) return { text: "High Potential", color: "bg-green-600/20 text-green-400" };
    if (score >= 60) return { text: "Moderate Potential", color: "bg-yellow-600/20 text-yellow-400" };
    return { text: "Needs Refinement", color: "bg-red-600/20 text-red-400" };
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
              </div>
              {!activeIdea && (
                <Button
                  onClick={startNewIdea}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create New Idea
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6 py-8 max-w-4xl mx-auto workspace-content-spacing">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-green-600/20 rounded-full">
                <Lightbulb className="h-8 w-8 text-green-400" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Idea Vault</h1>
            </div>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              {isFreeTier
                ? "Your startup idea repository. Free plan allows 1 active idea - upgrade to Pro for unlimited ideas."
                : "Your unlimited startup idea repository. Create and manage as many ideas as you want."
              }
            </p>

            {/* Usage Stats for Free Tier */}
            {isFreeTier && usage && currentPlan && (
              <div className="mt-4 max-w-md mx-auto">
                <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Ideas Created</span>
                    <span className="text-sm text-white">
                      {usage.ideasCreated} / {currentPlan.limits.ideas}
                    </span>
                  </div>
                  <Progress
                    value={(usage.ideasCreated / (currentPlan.limits.ideas as number)) * 100}
                    className="h-2"
                  />
                  {usage.ideasCreated >= (currentPlan.limits.ideas as number) && (
                    <p className="text-xs text-yellow-400 mt-2">
                      You've reached your idea limit. Upgrade to Pro for unlimited ideas.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Active Idea Display */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-green-400" />
            </div>
          ) : !activeIdea ? (
            /* Empty State */
            <Card className="bg-black/40 backdrop-blur-sm border-white/10 text-center py-12">
              <CardContent>
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 bg-gray-600/20 rounded-full">
                    <Lightbulb className="h-12 w-12 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">No Active Idea</h3>
                    <p className="text-gray-400 mb-6 max-w-md">
                      Start your startup journey by creating and validating an idea in the Workshop.
                    </p>
                    <Button
                      onClick={startNewIdea}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Go to Workshop
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Active Idea Card */
            <div className="space-y-6">
              {/* Main Idea Card */}
              <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-2xl text-white">{activeIdea.title}</CardTitle>
                        <Badge className={getStatusBadge(activeIdea.status).color}>
                          {getStatusBadge(activeIdea.status).text}
                        </Badge>
                      </div>
                      <p className="text-gray-300 text-lg leading-relaxed">
                        {activeIdea.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                  <CardContent>
                    {/* Validation Score */}
                    {activeIdea.validation_score && (
                      <div className="flex items-center gap-4 mb-6">
                        <div className="text-2xl font-bold text-white">
                          <span className={getValidationColor(activeIdea.validation_score)}>
                            {activeIdea.validation_score}
                          </span>
                          <span className="text-gray-400 text-lg">/100</span>
                        </div>
                        <div className="flex-1">
                          <Progress value={activeIdea.validation_score} className="h-3" />
                        </div>
                        <Badge className={getValidationBadge(activeIdea.validation_score).color}>
                          {getValidationBadge(activeIdea.validation_score).text}
                        </Badge>
                      </div>
                    )}

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
