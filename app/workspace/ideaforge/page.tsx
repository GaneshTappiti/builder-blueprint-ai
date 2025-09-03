"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import WorkspaceSidebar from "@/components/WorkspaceSidebar";
import { MinimalHeader } from "@/components/MinimalHeader";
import {
  PlusCircle,
  ChevronLeft,
  Lightbulb,
  BookOpen,
  Layers,

  MessageSquare,
  Rocket,
  FileText,
  Share2,
  Settings,
  Menu
} from "lucide-react";
import { IdeaInput, StoredIdea, IdeaStatus, IdeaForgeTab, IdeaForgeSidebarItem } from "@/types/ideaforge";
import NewIdeaModal from "@/components/ideaforge/NewIdeaModal";
import IdeaEmptyState from "@/components/ideaforge/IdeaEmptyState";
import WikiView from "@/components/ideaforge/WikiView";
import BlueprintView from "@/components/ideaforge/BlueprintView";

import FeedbackView from "@/components/ideaforge/FeedbackView";
import IdeaOverview from "@/components/ideaforge/IdeaOverview";
import IdeaSummaryModal from "@/components/ideaforge/IdeaSummaryModal";
import ShareIdeaModal from "@/components/ideaforge/ShareIdeaModal";

export default function IdeaForgePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // State management
  const [ideas, setIdeas] = useState<StoredIdea[]>([]);
  const [currentIdea, setCurrentIdea] = useState<StoredIdea | null>(null);
  const [activeTab, setActiveTab] = useState<IdeaForgeTab>('overview');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showNewIdeaModal, setShowNewIdeaModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditingIdea, setIsEditingIdea] = useState(false);

  // Get ideaId from URL params
  const ideaId = searchParams?.get('id');

  // Mock data for demonstration
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const mockIdeas: StoredIdea[] = [
        {
          id: "1",
          title: "AI-Powered Fitness Coach",
          description: "A personalized fitness coaching app that uses AI to create custom workout plans and provide real-time form feedback through computer vision.",
          content: "",
          status: "researching",
          tags: ["ai", "fitness", "mobile-app"],
          coverImage: undefined,
          favorited: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          progress: {
            wiki: 75,
            blueprint: 60,
            journey: 40,
            feedback: 30
          }
        },
        {
          id: "2",
          title: "Smart Home Energy Manager",
          description: "IoT solution for optimizing home energy consumption using machine learning algorithms.",
          content: "",
          status: "draft",
          tags: ["iot", "energy", "smart-home"],
          coverImage: undefined,
          favorited: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          progress: {
            wiki: 25,
            blueprint: 10,
            journey: 5,
            feedback: 0
          }
        }
      ];

      setIdeas(mockIdeas);
      setLoading(false);
    }, 1000);
  }, []);

  // Handle URL params and set current idea
  useEffect(() => {
    if (ideaId && ideas.length > 0) {
      const idea = ideas.find(i => i.id === ideaId);
      if (idea) {
        setCurrentIdea(idea);
      } else {
        // Idea not found, redirect to main page
        router.push('/workspace/ideaforge');
      }
    } else if (ideas.length > 0 && !ideaId) {
      // No specific idea selected, show ideas list
      setCurrentIdea(null);
    }
  }, [ideaId, ideas, router]);

  // Reset modal states when currentIdea changes
  useEffect(() => {
    setShowSummaryModal(false);
    setShowShareModal(false);
    setShowNewIdeaModal(false);
  }, [currentIdea]);

  // Sidebar configuration
  const sidebarItems: IdeaForgeSidebarItem[] = [
    { id: 'overview', label: 'Idea Overview', icon: Lightbulb },
    { id: 'wiki', label: 'Wiki', icon: BookOpen, progress: currentIdea?.progress?.wiki },
    { id: 'blueprint', label: 'Blueprint', icon: Layers, progress: currentIdea?.progress?.blueprint },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare, progress: currentIdea?.progress?.feedback },
  ];

  const handleCreateIdea = async (idea: IdeaInput) => {
    try {
      // Mock idea creation - in real app this would call API
      const newIdea: StoredIdea = {
        id: Date.now().toString(),
        title: idea.title,
        description: idea.description || "",
        content: "",
        status: "draft",
        tags: idea.tags || [],
        coverImage: undefined,
        favorited: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        progress: {
          wiki: 0,
          blueprint: 0,
          journey: 0,
          feedback: 0
        }
      };

      setIdeas(prev => [newIdea, ...prev]);
      setCurrentIdea(newIdea);
      setIsEditingIdea(false);
      setShowNewIdeaModal(false);

      // Update URL to show the new idea
      router.push(`/workspace/ideaforge?id=${newIdea.id}`);

      toast({
        title: "Idea Created!",
        description: `"${newIdea.title}" has been added to your IdeaForge.`,
      });
    } catch (error) {
      console.error('Error creating idea:', error);
      toast({
        title: "Error Creating Idea",
        description: "Failed to create idea. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleExport = (type: string) => {
    setShowSummaryModal(true);
  };

  const getStatusColor = (status: IdeaStatus) => {
    switch (status) {
      case 'draft': return 'bg-gray-600/20 text-gray-400';
      case 'researching': return 'bg-blue-600/20 text-blue-400';
      case 'validated': return 'bg-green-600/20 text-green-400';
      case 'building': return 'bg-purple-600/20 text-purple-400';
      default: return 'bg-gray-600/20 text-gray-400';
    }
  };

  const renderIdeasList = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
        </div>
      );
    }

    if (ideas.length === 0) {
      return <IdeaEmptyState onCreateClick={() => setIsEditingIdea(true)} />;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ideas.map((idea) => (
          <Card
            key={idea.id}
            className="bg-black/40 backdrop-blur-sm border-white/10 cursor-pointer hover:border-green-500/30 hover:bg-black/60 transition-all duration-300"
            onClick={() => {
              setCurrentIdea(idea);
              router.push(`/workspace/ideaforge?id=${idea.id}`);
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-white text-lg line-clamp-2">
                  {idea.title}
                </h3>
                <Badge className={getStatusColor(idea.status)}>
                  {idea.status}
                </Badge>
              </div>
              <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                {idea.description}
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Overall Progress</span>
                  <span className="text-gray-400">
                    {Math.round(((idea.progress?.wiki || 0) + (idea.progress?.blueprint || 0) + (idea.progress?.feedback || 0)) / 3)}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.round(((idea.progress?.wiki || 0) + (idea.progress?.blueprint || 0) + (idea.progress?.feedback || 0)) / 3)}%`
                    }}
                  ></div>
                </div>
              </div>
              {idea.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {idea.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs border-gray-600 text-gray-400">
                      {tag}
                    </Badge>
                  ))}
                  {idea.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                      +{idea.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="layout-container bg-gradient-to-br from-black via-gray-900 to-green-950">
      <WorkspaceSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="layout-main transition-all duration-300">
        {currentIdea ? (
          <>
            {/* Minimal Header */}
            <MinimalHeader 
              onToggleSidebar={() => setSidebarOpen(true)}
              backToPath="/workspace/ideaforge"
              backToLabel="Back to Ideas"
            />
            
            {/* Header & Status Section */}
            <div className="px-6 py-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/workspace/ideaforge')}
                    className="text-gray-400 hover:text-white hover:bg-black/60"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back to Ideas List
                  </Button>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowShareModal(true)}
                    className="bg-black/60 border-white/20 hover:bg-black/80 text-gray-300"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('summary')}
                    className="bg-black/60 border-white/20 hover:bg-black/80 text-gray-300"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="px-6 py-8">
              {/* Header Section */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <Lightbulb className="h-8 w-8 text-green-400" />
                  <h1 className="text-3xl md:text-4xl font-bold text-white">{currentIdea.title}</h1>
                  <Badge className={`${getStatusColor(currentIdea.status)} border-0 px-3 py-1 text-sm font-medium`}>
                    {currentIdea.status}
                  </Badge>
                </div>
                <p className="text-gray-400 text-lg max-w-2xl">
                  {currentIdea.description}
                </p>
              </div>

              {/* Tab Navigation */}
              <div className="bg-black/40 backdrop-blur-sm rounded-2xl border border-white/10 p-6 mb-8">
                <div className="flex items-center gap-1 overflow-x-auto">
                  {sidebarItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all relative whitespace-nowrap ${
                        activeTab === item.id
                          ? 'bg-green-600 text-white shadow-lg'
                          : 'text-gray-400 hover:text-white hover:bg-black/60'
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                      {item.progress !== undefined && (
                        <span className={`text-xs px-2 py-0.5 rounded-full transition-all ${
                          activeTab === item.id
                            ? 'bg-white/20 text-white font-medium'
                            : 'bg-gray-600 text-gray-300'
                        }`}>
                          {item.progress}%
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="animate-in fade-in-50 duration-300">
                {activeTab === 'overview' && currentIdea && (
                  <IdeaOverview
                    idea={currentIdea}
                    onUpdate={(updates) => {
                      setIdeas(prev => prev.map(i => 
                        i.id === currentIdea.id ? { ...i, ...updates } : i
                      ));
                      setCurrentIdea(prev => prev ? { ...prev, ...updates } : null);
                    }}
                    onNavigateToTab={(tab) => setActiveTab(tab as IdeaForgeTab)}
                    onAddNote={() => {
                      toast({
                        title: "Add Note",
                        description: "Note feature coming soon!",
                      });
                    }}
                    onShare={() => setShowShareModal(true)}
                    onExport={() => handleExport('summary')}
                  />
                )}
                {activeTab === 'wiki' && currentIdea && (
                  <WikiView 
                    idea={currentIdea} 
                    onContentUpdate={(sectionId, content) => {
                      // Handle content updates if needed
                      console.log('Wiki content updated:', sectionId, content);
                    }}
                  />
                )}
                {activeTab === 'blueprint' && currentIdea && <BlueprintView idea={currentIdea} />}

                {activeTab === 'feedback' && currentIdea && <FeedbackView idea={currentIdea} />}
              </div>
            </div>
          </>
        ) : (
          <>
                         {/* Minimal Header */}
                     <MinimalHeader 
          onToggleSidebar={() => setSidebarOpen(true)}
          backToPath="/workspace"
          backToLabel="Back to Workspace"
        />
             
             {/* New Idea Button */}
             <div className="px-6 py-4 flex justify-end">
               <Button 
                 className="bg-green-600 hover:bg-green-700"
                 onClick={() => setShowNewIdeaModal(true)}
               >
                 <PlusCircle className="h-4 w-4 mr-2" />
                 New Idea
               </Button>
             </div>

            {/* Main Content */}
            <div className="px-6 py-8">
              {/* Header Section */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-green-600/20 rounded-full">
                    <Lightbulb className="h-8 w-8 text-green-400" />
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white">IdeaForge</h1>
                </div>
                <p className="text-gray-400 text-lg">
                  Transform your ideas into structured plans with AI-powered insights
                </p>
              </div>

              {/* Ideas List */}
              <div className="bg-black/40 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                {renderIdeasList()}
              </div>
            </div>
          </>
        )}

        {/* Modals - Always render but control with open state */}
        <NewIdeaModal
          open={showNewIdeaModal}
          onClose={() => setShowNewIdeaModal(false)}
          onCreateIdea={handleCreateIdea}
        />
        
        {currentIdea && (
          <>
            <IdeaSummaryModal
              isOpen={showSummaryModal}
              onClose={() => setShowSummaryModal(false)}
              idea={currentIdea}
              wikiContent={{}}
              blueprintContent={{
                features: [],
                techStack: [],
                mvpPhases: []
              }}
              feedbackContent={{
                feedback: [],
                aiSummary: ''
              }}
            />
            <ShareIdeaModal
              isOpen={showShareModal}
              onClose={() => setShowShareModal(false)}
              idea={currentIdea}
            />
          </>
        )}
      </main>
    </div>
  );
}
