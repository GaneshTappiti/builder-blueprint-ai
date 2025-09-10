"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, ExternalLink, Share2, Star, Heart, Users, BarChart3 } from "lucide-react";
import Link from "next/link";
import { createTestIdeaWithFeedback } from "@/utils/create-test-idea";

export default function FeedbackLandingPage() {
  const [ideaId, setIdeaId] = useState('1756886653521');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateTestIdea = async () => {
    setIsCreating(true);
    try {
      createTestIdeaWithFeedback(ideaId);
      // Redirect to the feedback page
      window.location.href = `/feedback/${ideaId}`;
    } catch (error) {
      console.error('Error creating test idea:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Public Feedback System
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Collect feedback on your ideas from anyone, anywhere. No account required - 
              just share the link and start gathering valuable insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/feedback/1756886653521">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  View Demo Feedback
                </Link>
              </Button>
              <Button variant="outline" size="lg" onClick={handleCreateTestIdea} disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create Test Idea'}
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  Public Access
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Anyone can access and provide feedback using just the link. No registration or login required.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Rich Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Collect star ratings, emoji reactions, written feedback, and threaded discussions.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-500" />
                  Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Get insights with sentiment analysis, rating distributions, and engagement metrics.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* How it works */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Share Your Idea</h3>
                <p className="text-muted-foreground">
                  Create an idea and get a unique feedback URL to share with others.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Collect Feedback</h3>
                <p className="text-muted-foreground">
                  People can provide ratings, reactions, and detailed feedback without creating accounts.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-600">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Analyze Results</h3>
                <p className="text-muted-foreground">
                  View comprehensive analytics and insights to improve your idea.
                </p>
              </div>
            </div>
          </div>

          {/* Demo Section */}
          <Card className="mb-16">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                Try the Demo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Test the feedback system with our demo idea. You can provide feedback, see ratings, 
                  and explore the analytics without any setup.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Input
                    placeholder="Enter idea ID (e.g., 1756886653521)"
                    value={ideaId}
                    onChange={(e) => setIdeaId(e.target.value)}
                    className="flex-1"
                  />
                  <Button asChild>
                    <Link href={`/feedback/${ideaId}`}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      View Feedback
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features List */}
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Feedback Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>1-5 Star Rating System</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span>Emoji Reactions (❤️ 😊 😐 👎 😡)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-500" />
                    <span>Written Feedback & Comments</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Share2 className="h-4 w-4 text-green-500" />
                    <span>Threaded Replies & Discussions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-500" />
                    <span>Anonymous Participation</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Analytics & Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-blue-500" />
                    <span>Rating Distribution Charts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span>Emoji Reaction Breakdown</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-green-500" />
                    <span>Sentiment Analysis</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-500" />
                    <span>Engagement Metrics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>Top Keywords & Themes</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
