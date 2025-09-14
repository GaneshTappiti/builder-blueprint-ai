"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useActiveIdea, useIdeaContext } from '@/stores/ideaStore';
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Lightbulb,
  ChevronLeft,
  Sparkles,
  ArrowRight,
  Loader2,
  PlusCircle,
  Menu,
  Lock,
  Users,
  MessageSquare,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import WorkspaceSidebar from "@/components/WorkspaceSidebar";
import { useToast } from "@/hooks/use-toast";
import { supabaseHelpers } from "@/lib/supabase-connection-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";

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
  status: string; // Changed from specific union type to string to match IdeaVaultData
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
  // Privacy and team settings
  isPrivate: boolean;
  teamId?: string;
  visibility: 'private' | 'team';
  // Team collaboration features
  teamComments?: Array<{
    id: string;
    userId: string;
    userName: string;
    content: string;
    created_at: string;
    updated_at: string;
  }>;
  teamSuggestions?: Array<{
    id: string;
    userId: string;
    userName: string;
    field: string;
    originalValue: string;
    suggestedValue: string;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
    updated_at: string;
  }>;
  teamStatus?: 'under_review' | 'in_progress' | 'approved' | 'rejected';
  lastModifiedBy?: string;
  user_id?: string;
}

export default function IdeaVaultPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [ideas, setIdeas] = useState<ActiveIdea[]>([]);

  const router = useRouter();
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const { activeIdea, fetchUserIdeas } = useActiveIdea();
  const { setHasActiveIdea, setActiveIdea, setCurrentStep } = useIdeaContext();
  const { triggerIdeaShared } = useRealtimeNotifications();

  // Mock subscription data for demonstration
  const isFreeTier = true;
  const usage = { ideasCreated: 1 };
  const currentPlan = { limits: { ideas: 1 } };

  // Load ideas using supabaseHelpers with security
  const loadIdeas = useCallback(async () => {
    console.log('🔄 Loading ideas in Idea Vault...');
    setIsLoading(true);
    try {
      // Load ideas using the same helper that saves them
      const { data: ideas, error } = await supabaseHelpers.getIdeas();
      console.log('📊 Ideas loaded:', { ideas, error });
      
      if (error) {
        console.error('Error loading ideas:', error);
        // Fallback to localStorage with security checks
        const { IdeaVaultHelpers } = await import('@/utils/idea-vault-helpers');
        const helpers = new IdeaVaultHelpers();
        const secureIdeas = helpers.getIdeasForUser(user?.id);
        console.log('🔄 Fallback to localStorage with security:', secureIdeas);
        // Ensure all ideas have the new privacy fields
        const ideasWithDefaults = secureIdeas.map(idea => ({
          ...idea,
          isPrivate: idea.isPrivate !== undefined ? idea.isPrivate : true,
          visibility: idea.visibility || 'private',
          teamComments: idea.teamComments || [],
          teamSuggestions: idea.teamSuggestions || [],
          teamStatus: idea.teamStatus || 'under_review',
          user_id: idea.user_id || user?.id || 'unknown'
        }));
        setIdeas(ideasWithDefaults);
      } else {
        console.log('✅ Ideas set from supabaseHelpers:', ideas);
        // Ensure all ideas have the new privacy fields
        const ideasWithDefaults = (ideas || []).map((idea: any) => ({
          ...idea,
          isPrivate: idea.isPrivate !== undefined ? idea.isPrivate : true,
          visibility: idea.visibility || 'private',
          teamComments: idea.teamComments || [],
          teamSuggestions: idea.teamSuggestions || [],
          teamStatus: idea.teamStatus || 'under_review',
          user_id: idea.user_id || user?.id || 'unknown'
        }));
        setIdeas(ideasWithDefaults);
      }
      await fetchUserIdeas();
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading ideas:', error);
      // Fallback to localStorage with security checks
      try {
        const { IdeaVaultHelpers } = await import('@/utils/idea-vault-helpers');
        const helpers = new IdeaVaultHelpers();
        const secureIdeas = helpers.getIdeasForUser(user?.id);
        console.log('🔄 Fallback to localStorage with security (catch):', secureIdeas);
        // Ensure all ideas have the new privacy fields
        const ideasWithDefaults = secureIdeas.map(idea => ({
          ...idea,
          isPrivate: idea.isPrivate !== undefined ? idea.isPrivate : true,
          visibility: idea.visibility || 'private',
          teamComments: idea.teamComments || [],
          teamSuggestions: idea.teamSuggestions || [],
          teamStatus: idea.teamStatus || 'under_review',
          user_id: idea.user_id || user?.id || 'unknown'
        }));
        setIdeas(ideasWithDefaults);
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        setIdeas([]);
      }
      setIsLoading(false);
    }
  }, [fetchUserIdeas, user?.id]);

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

    router.push('/workspace/idea-forge');
    
    toast({
      title: "Moving to IdeaForge",
      description: "Let's turn your idea into a structured plan!",
    });
  };

  const startNewIdea = () => {
    router.push('/workspace');
  };

  const createTestIdea = async () => {
    try {
      console.log('🔄 Creating test idea for user:', user?.id);
      
      const { IdeaVaultHelpers } = await import('@/utils/idea-vault-helpers');
      const helpers = new IdeaVaultHelpers();
      
      const testIdea = helpers.createTestIdea();
      testIdea.user_id = user?.id || 'test-user';
      testIdea.isPrivate = true;
      testIdea.visibility = 'private';
      testIdea.teamComments = [];
      testIdea.teamSuggestions = [];
      testIdea.teamStatus = 'under_review';
      
      console.log('📝 Test idea before save:', testIdea);
      
      const savedIdea = helpers.saveIdea(testIdea);
      console.log('💾 Saved idea:', savedIdea);
      
      setIdeas(prevIdeas => [savedIdea, ...prevIdeas]);
      
      toast({
        title: "Test Idea Created",
        description: "A test idea has been added to your vault.",
      });
    } catch (error) {
      console.error('Error creating test idea:', error);
      toast({
        title: "Error",
        description: "Failed to create test idea.",
        variant: "destructive"
      });
    }
  };

  const archiveIdea = () => {
    // Add archive functionality here
    toast({
      title: "Feature Coming Soon",
      description: "Archive functionality will be available in the next update.",
    });
  };

  const toggleIdeaPrivacy = async (ideaId: string) => {
    try {
      console.log('🔄 Toggling privacy for idea:', ideaId, 'User ID:', user?.id);
      
      // Import the helper
      const { IdeaVaultHelpers } = await import('@/utils/idea-vault-helpers');
      const helpers = new IdeaVaultHelpers();
      
      const updatedIdea = helpers.toggleIdeaPrivacy(ideaId, user?.id);
      console.log('✅ Toggle result:', updatedIdea);
      
      if (updatedIdea) {
        // Update the local state
        setIdeas(prevIdeas => 
          prevIdeas.map(idea => 
            idea.id === ideaId 
              ? { ...idea, isPrivate: updatedIdea.isPrivate, visibility: updatedIdea.visibility }
              : idea
          )
        );
        
        // Trigger notification when idea is shared with team
        if (!updatedIdea.isPrivate && updatedIdea.visibility === 'team') {
          const userName = user?.email || 'Someone';
          triggerIdeaShared(userName, updatedIdea.title, updatedIdea.id);
        }
        
        toast({
          title: updatedIdea.isPrivate ? "Made Private" : "Shared with Team",
          description: updatedIdea.isPrivate 
            ? "This idea is now private and only visible to you."
            : "This idea is now shared with your team and visible to everyone.",
        });
      } else {
        // Handle case where toggle failed
        toast({
          title: "Unable to Update",
          description: "Could not update idea privacy. You may not have permission or the idea was not found.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error toggling privacy:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }
  };

  const editIdea = (ideaId: string) => {
    // Navigate to edit page or open edit modal
    router.push(`/workspace/idea-vault/${ideaId}/edit`);
  };

  const deleteIdea = async (ideaId: string) => {
    if (!confirm('Are you sure you want to delete this idea? This action cannot be undone.')) {
      return;
    }

    try {
      // Try Supabase first
      const { error } = await supabaseHelpers.deleteIdea(ideaId);
      
      if (error) {
        console.error('Supabase delete error:', error);
        // Fallback to localStorage
        const { IdeaVaultHelpers } = await import('@/utils/idea-vault-helpers');
        const helpers = new IdeaVaultHelpers();
        const ideas = helpers.getAllIdeas();
        const filteredIdeas = ideas.filter(idea => idea.id !== ideaId);
        localStorage.setItem('ideaVault', JSON.stringify(filteredIdeas));
      }

      // Update local state
      setIdeas(prevIdeas => prevIdeas.filter(idea => idea.id !== ideaId));
      
      toast({
        title: "Idea Deleted",
        description: "The idea has been successfully deleted.",
      });
    } catch (error) {
      console.error('Error deleting idea:', error);
      toast({
        title: "Error",
        description: "Failed to delete idea. Please try again.",
        variant: "destructive"
      });
    }
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

  const getPrivacyBadge = (isPrivate: boolean) => {
    if (isPrivate) {
      return { 
        text: "Private", 
        color: "bg-gray-600/20 text-gray-400 border-gray-600",
        icon: Lock
      };
    } else {
      return { 
        text: "Team", 
        color: "bg-blue-600/20 text-blue-400 border-blue-600",
        icon: Users
      };
    }
  };

  const getTeamStatusBadge = (teamStatus?: string) => {
    switch (teamStatus) {
      case 'under_review':
        return { text: "Under Review", color: "bg-yellow-600/20 text-yellow-400" };
      case 'in_progress':
        return { text: "In Progress", color: "bg-blue-600/20 text-blue-400" };
      case 'approved':
        return { text: "Approved", color: "bg-green-600/20 text-green-400" };
      case 'rejected':
        return { text: "Rejected", color: "bg-red-600/20 text-red-400" };
      default:
        return null;
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
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">Idea Vault</h1>
              </div>
              <div className="flex gap-2">
                <Button onClick={startNewIdea} disabled={isLoading}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  New Idea
                </Button>
                <Button onClick={createTestIdea} disabled={isLoading} variant="outline">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Test Idea
                </Button>
              </div>
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
              <div className="flex gap-4">
                <Button onClick={startNewIdea} size="lg">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Start New Idea
                </Button>
                <Button onClick={createTestIdea} size="lg" variant="outline">
                  <Lightbulb className="h-5 w-5 mr-2" />
                  Create Test Idea
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-8">
                <h2 className="text-2xl font-bold">Your Ideas ({ideas.length})</h2>
              </div>

              {/* Ideas Grid */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {ideas.map((idea) => {
                  const privacyBadge = getPrivacyBadge(idea.isPrivate);
                  const teamStatusBadge = getTeamStatusBadge(idea.teamStatus);
                  const PrivacyIcon = privacyBadge.icon;
                  
                  return (
                    <Card key={idea.id} className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors">
                      <CardHeader>
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <CardTitle className="text-lg text-white mb-2 line-clamp-2">{idea.title}</CardTitle>
                            <p className="text-gray-400 text-sm line-clamp-3">{idea.description}</p>
                          </div>
                          <div className="flex flex-col gap-2 items-end">
                            <Badge className={getStatusBadge(idea.status).color}>
                              {getStatusBadge(idea.status).text}
                            </Badge>
                            {teamStatusBadge && (
                              <Badge className={teamStatusBadge.color}>
                                {teamStatusBadge.text}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {/* Privacy Badge and Toggle */}
                        <div className="flex items-center justify-between">
                          <Badge 
                            variant="outline" 
                            className={`${privacyBadge.color} flex items-center gap-1`}
                          >
                            <PrivacyIcon className="h-3 w-3" />
                            {privacyBadge.text}
                          </Badge>
                          
                          {/* Privacy Toggle - Only show for idea creator */}
                          {idea.user_id === user?.id && (
                            <div className="flex items-center gap-2">
                              <Label htmlFor={`privacy-${idea.id}`} className="text-xs text-gray-400">
                                {idea.isPrivate ? 'Private' : 'Team'}
                              </Label>
                              <Switch
                                id={`privacy-${idea.id}`}
                                checked={!idea.isPrivate}
                                onCheckedChange={() => toggleIdeaPrivacy(idea.id)}
                                className="data-[state=checked]:bg-blue-600"
                              />
                            </div>
                          )}
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

                        {/* Team Collaboration Info */}
                        {!idea.isPrivate && (
                          <div className="flex items-center gap-4 mb-4 text-xs text-gray-400">
                            {idea.teamComments && idea.teamComments.length > 0 && (
                              <div className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                {idea.teamComments.length} comments
                              </div>
                            )}
                            {idea.lastModifiedBy && idea.lastModifiedBy !== idea.user_id && (
                              <div className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                Modified by team
                              </div>
                            )}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2 mt-4">
                          <Button 
                            size="sm" 
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                            onClick={() => {
                              // View idea details
                              router.push(`/workspace/idea-vault/${idea.id}`);
                            }}
                          >
                            <ArrowRight className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          
                          {/* Edit and Delete buttons - only show for idea creator */}
                          {idea.user_id === user?.id && (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="border-gray-600 text-gray-300 hover:bg-gray-800"
                                onClick={() => editIdea(idea.id)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="border-red-600 text-red-400 hover:bg-red-900/20"
                                onClick={() => deleteIdea(idea.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
