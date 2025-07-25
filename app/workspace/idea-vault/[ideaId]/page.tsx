"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThumbsUp, MessageSquare, Tag, ArrowLeft, Edit, Trash, Menu } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import WorkspaceSidebar from "@/components/WorkspaceSidebar";

interface IdeaComment {
  id: number;
  author: string;
  text: string;
  date: string;
}

interface IdeaDetailsData {
  id: string;
  title: string;
  longDescription: string;
  tags: string[];
  status: 'validated' | 'exploring' | 'draft';
  votes: number;
  comments: IdeaComment[];
  updatedAt: string;
}

export default function IdeaDetailsPage({ params }: { params: { ideaId: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // In production, this would load the idea from the database using params.ideaId
  const idea: IdeaDetailsData | null = null; // Will be loaded from user's actual idea data
  
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h1 className="text-3xl font-bold text-white">{idea.title}</h1>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="bg-black/20 border-white/10 hover:bg-black/30 text-white">
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
                <Button variant="outline" size="sm" className="text-red-400 border-red-400/30 hover:bg-red-400/10 bg-black/20">
                  <Trash className="mr-2 h-4 w-4" /> Delete
                </Button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4">
              {idea.tags.map((tag, index) => (
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
            
            <div className="flex items-center gap-4 mt-4 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <ThumbsUp 
                  className="h-4 w-4 cursor-pointer hover:text-green-400 transition-colors" 
                  onClick={handleVote}
                />
                <span>{idea.votes}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span>{idea.comments.length}</span>
              </div>
              <span>Updated {idea.updatedAt}</span>
            </div>
          </div>
          
          <Card className="mb-8 bg-black/40 backdrop-blur-sm border-white/10">
            <CardContent className="pt-6">
              <p className="whitespace-pre-line text-gray-300">{idea.longDescription}</p>
            </CardContent>
          </Card>
          
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-white">Comments</h2>
            
            <Card className="mb-4 bg-black/40 backdrop-blur-sm border-white/10">
              <CardContent className="pt-6">
                <form onSubmit={handleCommentSubmit} className="space-y-4">
                  <textarea 
                    name="comment" 
                    className="w-full p-3 rounded-md bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-green-500 text-white placeholder-gray-400"
                    placeholder="Add a comment..."
                    rows={3}
                  ></textarea>
                  <div className="flex justify-end">
                    <Button type="submit" className="bg-green-600 hover:bg-green-700">Post Comment</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
            
            {idea.comments.length > 0 ? (
              <div className="space-y-4">
                {idea.comments.map(comment => (
                  <Card key={comment.id} className="bg-black/40 backdrop-blur-sm border-white/10">
                    <CardContent className="pt-6">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium text-white">{comment.author}</span>
                        <span className="text-sm text-gray-400">{comment.date}</span>
                      </div>
                      <p className="text-gray-300">{comment.text}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No comments yet. Be the first to comment!</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
