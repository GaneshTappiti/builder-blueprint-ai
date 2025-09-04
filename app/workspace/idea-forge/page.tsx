"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import WorkspaceSidebar from "@/components/WorkspaceSidebar";
import {
  PlusCircle,
  ChevronLeft,
  Lightbulb,
  BookOpen,
  Layers,
  GitBranch,
  MessageSquare,
  Rocket,
  FileText,
  Share2,
  Settings,
  Menu
} from "lucide-react";
import { IdeaInput } from "@/types/ideaforge";
import NewIdeaModal from "@/components/ideaforge/NewIdeaModal";
import IdeaEmptyState from "@/components/ideaforge/IdeaEmptyState";
import WikiView from "@/components/ideaforge/WikiView";
import BlueprintView from "@/components/ideaforge/BlueprintView";
import JourneyView from "@/components/ideaforge/JourneyView";
import FeedbackView from "@/components/ideaforge/FeedbackView";
import IdeaForgeStorage from "@/utils/ideaforge-storage";
import { StoredIdea } from "@/types/ideaforge";
import { ideaForgeHelpers } from "@/lib/supabase-connection-helpers";
import { useAuth } from "@/contexts/AuthContext";
import ShareIdeaModal from "@/components/ideaforge/ShareIdeaModal";
import IdeaSummaryModal from "@/components/ideaforge/IdeaSummaryModal";

// IdeaForge Types
type IdeaStatus = 'draft' | 'researching' | 'validated' | 'building';
type IdeaForgeTab = 'overview' | 'wiki' | 'blueprint' | 'journey' | 'feedback';

interface ExportData {
  idea?: {
    title?: string;
    description?: string;
    status?: string;
    tags?: string[];
    createdAt?: string;
  };
  wiki?: {
    content?: string;
    lastUpdated?: string;
  };
  blueprint?: {
    sections?: any[];
    lastUpdated?: string;
  };
  journey?: {
    milestones?: any[];
    currentPhase?: string;
  };
  feedback?: {
    entries?: any[];
    summary?: string;
  };
}

const IdeaForgePage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<IdeaForgeTab>('overview');
  const [ideas, setIdeas] = useState<StoredIdea[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<StoredIdea | null>(null);
  const [isNewIdeaModalOpen, setIsNewIdeaModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load ideas from database
  const loadIdeas = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await ideaForgeHelpers.getIdeas();

      if (error) throw error;

      const formattedIdeas = data?.map((idea: any) => ({
        id: idea.id,
        title: idea.title,
        description: idea.description,
        content: idea.description,
        status: idea.status as IdeaStatus,
        tags: idea.tags || [],
        favorited: false,
        createdAt: idea.created_at,
        updatedAt: idea.updated_at,
        progress: {
          wiki: 0,
          blueprint: 0,
          journey: 0,
          feedback: 0
        }
      })) || [];

      setIdeas(formattedIdeas);
      
      // Select first idea if none selected
      if (formattedIdeas.length > 0 && !selectedIdea) {
        setSelectedIdea(formattedIdeas[0]);
      }
    } catch (error: unknown) {
      console.error('Error loading ideas:', error);
      toast({
        title: "Error Loading Ideas",
        description: "Failed to load your ideas. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadIdeas();
    }
  }, [user]);

  const handleCreateIdea = async (ideaData: IdeaInput) => {
    if (!user) return;

    try {
      const { data, error } = await ideaForgeHelpers.createIdea({
        ...ideaData,
        user_id: user.id,
        status: 'draft'
      });

      if (error) throw error;

      if (data) {
        const newIdea: StoredIdea = {
          id: data.id,
          title: data.title,
          description: data.description,
          content: data.description, // Use description as content
          status: data.status as IdeaStatus,
          tags: data.tags || [],
          favorited: false,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          progress: {
            wiki: 0,
            blueprint: 0,
            journey: 0,
            feedback: 0
          }
        };

        setIdeas(prev => [newIdea, ...prev]);
        setSelectedIdea(newIdea);
        setIsNewIdeaModalOpen(false);

        toast({
          title: "Idea Created",
          description: `"${ideaData.title}" has been added to your forge.`,
        });
      }
    } catch (error: unknown) {
      console.error('Error creating idea:', error);
      toast({
        title: "Error Creating Idea",
        description: "Failed to create idea. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateIdea = async (ideaId: string, updates: Partial<StoredIdea>) => {
    try {
      const { error } = await ideaForgeHelpers.updateIdea(ideaId, updates);

      if (error) throw error;

      setIdeas(prev => prev.map(idea => 
        idea.id === ideaId ? { ...idea, ...updates } : idea
      ));

      if (selectedIdea?.id === ideaId) {
        setSelectedIdea(prev => prev ? { ...prev, ...updates } : null);
      }

      toast({
        title: "Idea Updated",
        description: "Your changes have been saved.",
      });
    } catch (error: unknown) {
      console.error('Error updating idea:', error);
      toast({
        title: "Error Updating Idea",
        description: "Failed to save changes. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteIdea = async (ideaId: string) => {
    try {
      const { error } = await ideaForgeHelpers.deleteIdea(ideaId);

      if (error) throw error;

      setIdeas(prev => prev.filter(idea => idea.id !== ideaId));
      
      if (selectedIdea?.id === ideaId) {
        const remainingIdeas = ideas.filter(idea => idea.id !== ideaId);
        setSelectedIdea(remainingIdeas.length > 0 ? remainingIdeas[0] : null);
      }

      toast({
        title: "Idea Deleted",
        description: "The idea has been removed from your forge.",
      });
    } catch (error: unknown) {
      console.error('Error deleting idea:', error);
      toast({
        title: "Error Deleting Idea",
        description: "Failed to delete idea. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: IdeaStatus) => {
    switch (status) {
      case 'draft': return 'bg-gray-500/20 text-gray-300';
      case 'researching': return 'bg-blue-500/20 text-blue-300';
      case 'validated': return 'bg-green-500/20 text-green-300';
      case 'building': return 'bg-purple-500/20 text-purple-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getTabIcon = (tab: IdeaForgeTab) => {
    switch (tab) {
      case 'overview': return <Lightbulb className="h-4 w-4" />;
      case 'wiki': return <BookOpen className="h-4 w-4" />;
      case 'blueprint': return <Layers className="h-4 w-4" />;
      case 'journey': return <GitBranch className="h-4 w-4" />;
      case 'feedback': return <MessageSquare className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
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
                <Link
                  href="/workspace"
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Back to Workspace</span>
                </Link>
              </div>
              <Button
                onClick={() => setIsNewIdeaModalOpen(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                New Idea
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Rocket className="h-8 w-8 text-green-400" />
              <h1 className="text-3xl md:text-4xl font-bold text-white">Idea Forge</h1>
            </div>
            <p className="text-gray-400 text-lg">
              Transform your ideas into actionable startup plans
            </p>
          </div>

          {/* Main Content Container */}
          <div className="bg-black/40 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
            {ideas.length === 0 ? (
              <IdeaEmptyState onCreateClick={() => setIsNewIdeaModalOpen(true)} />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Ideas Sidebar */}
                <div className="lg:col-span-3">
                  <Card className="bg-black/80 backdrop-blur-xl border-white/10">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-white">Your Ideas</h3>
                        <Badge variant="secondary" className="bg-green-600/20 text-green-400 border-green-500/30">
                          {ideas.length}
                        </Badge>
                      </div>
                      <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                        {ideas.map((idea) => (
                          <div
                            key={idea.id}
                            className={`p-3 rounded-lg cursor-pointer transition-colors group ${
                              selectedIdea?.id === idea.id
                                ? "bg-green-600/20 border border-green-500/30"
                                : "bg-black/40 hover:bg-black/60"
                            }`}
                            onClick={() => setSelectedIdea(idea)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{idea.title}</p>
                                <p className="text-xs text-gray-400 line-clamp-2 mt-1">
                                  {idea.description}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ${getStatusColor(idea.status)} border-current`}
                                  >
                                    {idea.status}
                                  </Badge>
                                  {idea.tags.length > 0 && (
                                    <span className="text-xs text-gray-500">
                                      +{idea.tags.length} tags
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-9">
                  {selectedIdea && (
                    <Card className="bg-black/80 backdrop-blur-xl border-white/10">
                      <CardContent className="p-6">
                        {/* Idea Header */}
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex-1">
                            <h2 className="text-2xl font-bold text-white mb-2">{selectedIdea.title}</h2>
                            <p className="text-gray-400 mb-4">{selectedIdea.description}</p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge
                                variant="outline"
                                className={`${getStatusColor(selectedIdea.status)} border-current`}
                              >
                                {selectedIdea.status}
                              </Badge>
                              {selectedIdea.tags.map((tag, index) => (
                                <Badge key={index} variant="outline" className="bg-black/20 border-white/10 text-gray-300">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setIsShareModalOpen(true)}
                              className="border-white/20 bg-white/5 hover:bg-white/10 text-white hover:text-white"
                            >
                              <Share2 className="h-4 w-4 mr-1" />
                              Share
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setIsSummaryModalOpen(true)}
                              className="border-white/20 bg-white/5 hover:bg-white/10 text-white hover:text-white"
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              Summary
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-white/20 bg-white/5 hover:bg-white/10 text-white hover:text-white"
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Tab Navigation */}
                        <div className="border-b border-white/10 mb-6">
                          <div className="flex space-x-8">
                            {(['overview', 'wiki', 'blueprint', 'journey', 'feedback'] as IdeaForgeTab[]).map((tab) => (
                              <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                                  activeTab === tab
                                    ? 'border-green-500 text-green-400'
                                    : 'border-transparent text-gray-400 hover:text-white hover:border-gray-300'
                                }`}
                              >
                                {getTabIcon(tab)}
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Tab Content */}
                        <div className="min-h-[400px]">
                          {activeTab === 'overview' && (
                            <div className="space-y-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                                  <CardContent className="p-4">
                                    <h4 className="font-semibold text-white mb-2">Quick Stats</h4>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">Status:</span>
                                        <Badge className={getStatusColor(selectedIdea.status)}>
                                          {selectedIdea.status}
                                        </Badge>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">Created:</span>
                                        <span className="text-white">
                                          {new Date(selectedIdea.createdAt).toLocaleDateString()}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">Last Updated:</span>
                                        <span className="text-white">
                                          {new Date(selectedIdea.updatedAt).toLocaleDateString()}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">Tags:</span>
                                        <span className="text-white">{selectedIdea.tags.length}</span>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>

                                <Card className="bg-black/40 backdrop-blur-sm border-white/10">
                                  <CardContent className="p-4">
                                    <h4 className="font-semibold text-white mb-2">Quick Actions</h4>
                                    <div className="space-y-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full justify-start border-white/20 bg-white/5 hover:bg-white/10 text-white hover:text-white"
                                        onClick={() => setActiveTab('wiki')}
                                      >
                                        <BookOpen className="h-4 w-4 mr-2" />
                                        Edit Wiki
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full justify-start border-white/20 bg-white/5 hover:bg-white/10 text-white hover:text-white"
                                        onClick={() => setActiveTab('blueprint')}
                                      >
                                        <Layers className="h-4 w-4 mr-2" />
                                        View Blueprint
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full justify-start border-white/20 bg-white/5 hover:bg-white/10 text-white hover:text-white"
                                        onClick={() => setActiveTab('journey')}
                                      >
                                        <GitBranch className="h-4 w-4 mr-2" />
                                        Track Progress
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                            </div>
                          )}

                          {activeTab === 'wiki' && (
                            <WikiView
                              idea={selectedIdea}
                              onContentUpdate={(sectionId, content) => {
                                // Handle content update if needed
                                console.log('Content updated:', sectionId, content);
                              }}
                            />
                          )}

                          {activeTab === 'blueprint' && (
                            <BlueprintView
                              idea={selectedIdea}
                              onUpdate={(updates) => handleUpdateIdea(selectedIdea.id, updates)}
                            />
                          )}

                          {activeTab === 'journey' && (
                            <JourneyView
                              ideaContext={{
                                title: selectedIdea.title,
                                description: selectedIdea.description,
                                category: selectedIdea.tags[0] || 'General'
                              }}
                              onContentUpdate={(sectionId, content) => {
                                console.log('Journey content updated:', sectionId, content);
                              }}
                              onMilestoneUpdate={(milestone) => {
                                console.log('Milestone updated:', milestone);
                              }}
                            />
                          )}

                          {activeTab === 'feedback' && (
                            <FeedbackView
                              idea={selectedIdea}
                              onUpdate={(updates) => handleUpdateIdea(selectedIdea.id, updates)}
                            />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        <NewIdeaModal
          open={isNewIdeaModalOpen}
          onClose={() => setIsNewIdeaModalOpen(false)}
          onCreateIdea={handleCreateIdea}
        />

        {selectedIdea && (
          <>
            <ShareIdeaModal
              isOpen={isShareModalOpen}
              onClose={() => setIsShareModalOpen(false)}
              idea={selectedIdea}
            />

            <IdeaSummaryModal
              isOpen={isSummaryModalOpen}
              onClose={() => setIsSummaryModalOpen(false)}
              idea={selectedIdea}
            />
          </>
        )}
      </main>
    </div>
  );
};

export default IdeaForgePage;
