"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, ExternalLink, Share2, Copy, CheckCircle, MessageSquare } from "lucide-react";
import Link from "next/link";
import PublicFeedbackView from "@/components/ideaforge/PublicFeedbackView";
import { FeedbackAnalytics } from "@/components/ideaforge/FeedbackAnalytics";
import { usePublicFeedbackOnly } from "@/hooks/usePublicFeedbackOnly";
import { createTestIdeaWithFeedback } from "@/utils/create-test-idea";
import { publicFeedbackPersistence } from "@/utils/public-feedback-persistence";
import { useToast } from "@/hooks/use-toast";

export default function FeedbackPage() {
  const params = useParams();
  const ideaId = params.id as string;
  const [publicLink, setPublicLink] = useState<string>('');
  const [linkCopied, setLinkCopied] = useState(false);
  const { toast } = useToast();
  
  // Use the public feedback hook
  const { idea, feedback, loading, error } = usePublicFeedbackOnly(ideaId);

  useEffect(() => {
    // Generate public link
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    setPublicLink(`${baseUrl}/feedback/${ideaId}`);
    
    // Create a test idea if it doesn't exist (for demo purposes)
    if (ideaId && typeof window !== 'undefined') {
      const checkAndCreateIdea = async () => {
        try {
          const isPublic = await publicFeedbackPersistence.isPublicIdea(ideaId);
          if (!isPublic) {
            console.log('Creating test idea with feedback for ID:', ideaId);
            createTestIdeaWithFeedback(ideaId);
            
            // Show a toast to inform the user
            toast({
              title: "Demo Idea Created",
              description: "A demo idea has been created for testing the feedback system.",
              duration: 3000,
            });
          }
        } catch (error) {
          console.error('Error creating test idea:', error);
          toast({
            title: "Error",
            description: "Failed to create demo idea. Please try again.",
            variant: "destructive",
          });
        }
      };
      
      checkAndCreateIdea();
    }
  }, [ideaId, toast]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(publicLink);
      setLinkCopied(true);
      toast({
        title: "Link copied!",
        description: "The feedback link has been copied to your clipboard.",
      });
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy the link to clipboard.",
        variant: "destructive",
      });
    }
  };

  const shareFeedback = () => {
    if (navigator.share) {
      navigator.share({
        title: `Feedback for: ${idea?.title || 'Idea'}`,
        text: `Please provide feedback on this idea: ${idea?.title || 'Idea'}`,
        url: publicLink,
      });
    } else {
      copyToClipboard();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <Skeleton className="h-8 w-48 mb-4" />
              <Skeleton className="h-4 w-96" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-64" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div>
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <Link 
                href="/workspace/ideaforge" 
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Idea Forge
              </Link>
            </div>
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <Link 
                href="/workspace/ideaforge" 
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Idea Forge
              </Link>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Idea Not Found
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  The idea with ID "{ideaId}" was not found. This could happen if:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                  <li>The idea hasn't been shared publicly yet</li>
                  <li>The idea ID is incorrect</li>
                  <li>The idea was deleted or moved</li>
                </ul>
                <div className="flex gap-2">
                  <Button onClick={() => window.location.reload()}>
                    Try Again
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/workspace/ideaforge">
                      Go to Idea Forge
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6 lg:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <Link 
                href="/workspace/ideaforge" 
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Idea Forge
              </Link>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  className="flex items-center gap-2"
                >
                  {linkCopied ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">
                    {linkCopied ? 'Copied!' : 'Copy Link'}
                  </span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={shareFeedback}
                  className="flex items-center gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Share</span>
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Public Feedback
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Share this page to collect valuable feedback on your idea from others.
              </p>
            </div>
          </div>

          {/* Idea Context Section - Full Width at Top */}
          <div className="mb-8">
            <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
              <CardContent className="p-8">
                {/* Idea Summary */}
                <div className="mb-8">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                    <div className="flex-1">
                      <h2 className="text-3xl font-bold text-foreground mb-3">
                        {idea ? idea.title : 'Loading...'}
                      </h2>
                      <p className="text-xl text-muted-foreground mb-4">
                        {idea?.description || 'Loading description...'}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {idea?.tags && idea.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-sm px-3 py-1">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Created: {idea ? new Date(idea.createdAt).toLocaleDateString() : 'Loading...'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Problem → Solution Block */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-red-600 mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        The Problem
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {idea?.description || 'Problem statement not available.'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-green-600 mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Our Solution
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {idea?.description || 'Solution details not available.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Key Features */}
                {idea?.tags && idea.tags.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      Key Features
                    </h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {idea.tags.map((tag, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-background/50 rounded-lg border">
                          <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs text-green-600 font-bold">✓</span>
                          </div>
                          <span className="text-sm text-foreground">{tag}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Target Audience & Market */}
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Target Audience</h4>
                    <p className="text-sm text-muted-foreground">General users and businesses</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Market Opportunity</h4>
                    <p className="text-sm text-muted-foreground">Growing market opportunity</p>
                  </div>
                </div>

                {/* Feedback Guidance */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Help Us Improve This Idea
                  </h3>
                  <p className="text-blue-800 dark:text-blue-200 mb-4">
                    We'd love your thoughts! Please tell us:
                  </p>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 mb-4">
                    <li>• Does this solve a real problem you've experienced?</li>
                    <li>• Would you use this product? Why or why not?</li>
                    <li>• What features would make this more valuable?</li>
                    <li>• What concerns or suggestions do you have?</li>
                  </ul>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    Your feedback helps us build something truly useful for small business owners.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
            {/* Feedback Component - Takes up 2/3 of the width on desktop */}
            <div className="xl:col-span-2 order-2 xl:order-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ExternalLink className="h-5 w-5" />
                    Feedback & Discussion
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PublicFeedbackView ideaId={ideaId} />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar with Analytics and Actions - Shows first on mobile */}
            <div className="space-y-4 lg:space-y-6 order-1 xl:order-2">
              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Feedback</span>
                      <span className="font-semibold">{feedback?.length || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Avg Rating</span>
                      <span className="font-semibold">
                        {feedback && feedback.length > 0 
                          ? (feedback.reduce((sum, f) => sum + (f.rating || 0), 0) / feedback.filter(f => f.rating).length).toFixed(1)
                          : 'N/A'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Engagement</span>
                      <span className="font-semibold">
                        {feedback ? feedback.reduce((sum, f) => sum + f.likes, 0) : 0} likes
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Analytics */}
              {idea && (
                <FeedbackAnalytics 
                  feedback={feedback} 
                  ideaTitle={idea.title} 
                />
              )}

              {/* Share Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Share This Idea</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Help us gather more feedback by sharing this page.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyToClipboard}
                        className="flex-1"
                      >
                        {linkCopied ? 'Copied!' : 'Copy Link'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={shareFeedback}
                        className="flex-1"
                      >
                        Share
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
