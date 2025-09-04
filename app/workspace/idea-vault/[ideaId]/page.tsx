"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThumbsUp, MessageSquare, Tag, ArrowLeft, Edit, Trash, Menu, Loader2, ArrowRight, Star, TrendingUp, Shield, DollarSign, Users, Target, CheckCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import WorkspaceSidebar from "@/components/WorkspaceSidebar";
import { supabaseHelpers } from "@/lib/supabase-connection-helpers";

interface IdeaComment {
  id: number;
  author: string;
  text: string;
  date: string;
}

interface IdeaDetailsData {
  id: string;
  title: string;
  description: string;
  tags: string[];
  status: 'validated' | 'exploring' | 'draft' | 'archived';
  category: string;
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
  user_id?: string;
}

export default function IdeaDetailsPage({ params }: { params: { ideaId: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [idea, setIdea] = useState<IdeaDetailsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load the specific idea using the ideaId from params
  useEffect(() => {
    const loadIdea = async () => {
      try {
        console.log('🔄 Loading idea with ID:', params.ideaId);
        setIsLoading(true);
        
        // Load all ideas and find the one with matching ID
        const { data: ideas, error } = await supabaseHelpers.getIdeas();
        
        if (error) {
          console.error('Error loading ideas:', error);
          // Fallback to localStorage
          const storedIdeas = JSON.parse(localStorage.getItem('ideaVault') || '[]');
          const foundIdea = storedIdeas.find((idea: IdeaDetailsData) => idea.id === params.ideaId);
          setIdea(foundIdea || null);
        } else {
          const foundIdea = ideas?.find((idea: IdeaDetailsData) => idea.id === params.ideaId);
          setIdea(foundIdea || null);
        }
      } catch (error) {
        console.error('Error loading idea:', error);
        // Fallback to localStorage
        const storedIdeas = JSON.parse(localStorage.getItem('ideaVault') || '[]');
        const foundIdea = storedIdeas.find((idea: IdeaDetailsData) => idea.id === params.ideaId);
        setIdea(foundIdea || null);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.ideaId) {
      loadIdea();
    }
  }, [params.ideaId]);
  
  // Show loading state
  if (isLoading) {
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
                    onClick={() => router.push('/workspace/idea-vault')}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Idea Vault
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Loading Content */}
          <div className="px-6 py-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
              <Loader2 className="h-12 w-12 text-green-500 animate-spin" />
              <p className="mt-4 text-gray-400">Loading idea details...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show not found state
  if (!idea) {
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
                    onClick={() => router.push('/workspace/idea-vault')}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Idea Vault
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="px-6 py-8 max-w-4xl mx-auto">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white mb-4">Idea not found</h1>
              <p className="text-gray-400 mb-6">The idea you're looking for doesn't exist or has been removed.</p>
              <Button 
                className="bg-green-600 hover:bg-green-700" 
                onClick={() => router.push("/workspace/idea-vault")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Idea Vault
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  const handleVote = () => {
    toast({
      title: "Vote added!",
      description: "You've upvoted this idea.",
    });
  };
  
  const handleCommentSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const commentInput = form.elements.namedItem("comment") as HTMLTextAreaElement;
    
    if (commentInput.value.trim()) {
      toast({
        title: "Comment added!",
        description: "Your comment has been posted.",
      });
      commentInput.value = "";
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
                  onClick={() => router.push('/workspace/idea-vault')}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Idea Vault
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6 py-8 max-w-4xl mx-auto">
          <div className="mb-6">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-white mb-2">{idea.title}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>Updated {new Date(idea.updated_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>Created {new Date(idea.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold px-8 py-3 shadow-lg hover:shadow-green-500/25 transition-all duration-300"
                  onClick={() => {
                    // Set as active idea and continue to Idea Forge
                    router.push('/workspace/idea-forge');
                    toast({
                      title: "Moving to Idea Forge",
                      description: "Let's turn your idea into a structured plan!",
                    });
                  }}
                >
                  <ArrowRight className="mr-2 h-5 w-5" /> 
                  Continue to Idea Forge
                </Button>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="bg-black/20 border-white/10 hover:bg-black/30 text-white">
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-400 border-red-400/30 hover:bg-red-400/10 bg-black/20">
                    <Trash className="mr-2 h-4 w-4" /> Delete
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4">
              {idea.tags && idea.tags.map((tag, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-xs flex items-center text-gray-300">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </div>
              ))}
              <span className={`ml-2 px-3 py-1 rounded-full text-xs uppercase font-medium ${
                idea.status === 'validated' 
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                  : idea.status === 'exploring'
                    ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                    : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
              }`}>
                {idea.status}
              </span>
            </div>

            {/* Validation Score & Progress Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              {idea.validation_score && (
                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-lg border border-blue-500/20 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-5 w-5 text-blue-400" />
                    <span className="font-semibold text-white">Validation Score</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-bold text-blue-400">{idea.validation_score}%</div>
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${idea.validation_score}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-sm rounded-lg border border-green-500/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="font-semibold text-white">Progress</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Idea Validation</span>
                    <span className="text-green-400 font-medium">Complete</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Next: Idea Forge</span>
                    <span className="text-yellow-400 font-medium">Ready</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 backdrop-blur-sm rounded-lg border border-orange-500/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-orange-400" />
                  <span className="font-semibold text-white">Engagement</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <ThumbsUp 
                      className="h-4 w-4 cursor-pointer hover:text-green-400 transition-colors" 
                      onClick={handleVote}
                    />
                    <span className="text-gray-300">0</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-gray-300">0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <Card className="mb-8 bg-black/40 backdrop-blur-sm border-white/10">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
              <p className="whitespace-pre-line text-gray-300">{idea.description}</p>
            </CardContent>
          </Card>

          {/* Additional Idea Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {idea.problem_statement && (
              <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/10 backdrop-blur-sm border-red-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="h-5 w-5 text-red-400" />
                    <h3 className="text-lg font-semibold text-white">Problem Statement</h3>
                  </div>
                  <p className="text-gray-300">{idea.problem_statement}</p>
                </CardContent>
              </Card>
            )}

            {idea.target_market && (
              <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-sm border-blue-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-5 w-5 text-blue-400" />
                    <h3 className="text-lg font-semibold text-white">Target Market</h3>
                  </div>
                  <p className="text-gray-300">{idea.target_market}</p>
                </CardContent>
              </Card>
            )}

            {idea.market_opportunity && (
              <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-sm border-green-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="h-5 w-5 text-green-400" />
                    <h3 className="text-lg font-semibold text-white">Market Opportunity</h3>
                  </div>
                  <p className="text-gray-300">{idea.market_opportunity}</p>
                </CardContent>
              </Card>
            )}

            {idea.risk_assessment && (
              <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-sm border-yellow-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-5 w-5 text-yellow-400" />
                    <h3 className="text-lg font-semibold text-white">Risk Assessment</h3>
                  </div>
                  <p className="text-gray-300">{idea.risk_assessment}</p>
                </CardContent>
              </Card>
            )}

            {idea.monetization_strategy && (
              <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm border-purple-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="h-5 w-5 text-purple-400" />
                    <h3 className="text-lg font-semibold text-white">Monetization Strategy</h3>
                  </div>
                  <p className="text-gray-300">{idea.monetization_strategy}</p>
                </CardContent>
              </Card>
            )}

            {idea.competitor_analysis && (
              <Card className="bg-gradient-to-br from-indigo-500/10 to-blue-500/10 backdrop-blur-sm border-indigo-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="h-5 w-5 text-indigo-400" />
                    <h3 className="text-lg font-semibold text-white">Competitor Analysis</h3>
                  </div>
                  <p className="text-gray-300">{idea.competitor_analysis}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {idea.key_features && idea.key_features.length > 0 && (
            <Card className="mb-8 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-sm border-cyan-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="h-5 w-5 text-cyan-400" />
                  <h3 className="text-lg font-semibold text-white">Key Features</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {idea.key_features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-white/5 rounded-lg border border-white/10">
                      <CheckCircle className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {idea.next_steps && idea.next_steps.length > 0 && (
            <Card className="mb-8 bg-gradient-to-br from-emerald-500/10 to-green-500/10 backdrop-blur-sm border-emerald-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <ArrowRight className="h-5 w-5 text-emerald-400" />
                  <h3 className="text-lg font-semibold text-white">Next Steps</h3>
                </div>
                <div className="space-y-3">
                  {idea.next_steps.map((step, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex-shrink-0 w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 text-sm font-medium">
                        {index + 1}
                      </div>
                      <span className="text-gray-300 text-sm">{step}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Comments & Discussion</h2>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <MessageSquare className="h-4 w-4" />
                <span>0 comments</span>
              </div>
            </div>
            
            <Card className="mb-6 bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl">
              <CardContent className="pt-6">
                <form onSubmit={handleCommentSubmit} className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      U
                    </div>
                    <div className="flex-1">
                      <textarea 
                        name="comment" 
                        className="w-full p-4 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-green-500 text-white placeholder-gray-400 resize-none"
                        placeholder="Share your thoughts on this idea..."
                        rows={4}
                      ></textarea>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span>Press Ctrl+Enter to submit</span>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            className="bg-white/5 border-white/10 hover:bg-white/10 text-gray-300"
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="submit" 
                            className="bg-green-600 hover:bg-green-700 text-white font-medium px-6"
                          >
                            Post Comment
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
            
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-r from-gray-600/20 to-gray-700/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No comments yet</h3>
              <p className="text-gray-400 mb-4">Be the first to share your thoughts on this idea!</p>
              <Button 
                variant="outline" 
                className="bg-white/5 border-white/10 hover:bg-white/10 text-gray-300"
                onClick={() => {
                  const textarea = document.querySelector('textarea[name="comment"]') as HTMLTextAreaElement;
                  textarea?.focus();
                }}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Start Discussion
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

